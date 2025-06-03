import type { NextApiRequest, NextApiResponse } from 'next';
import WebSocket, { RawData } from 'ws';
import formidable, { File, Fields } from 'formidable';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import os from 'os';

// 辅助函数：Promise化 formidable 解析
const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: formidable.Files }> => {
    const form = formidable({
        multiples: false, // 只处理单个文件
        keepExtensions: true, // 保留文件扩展名
        // formidable 默认会将文件保存在临时目录，例如 os.tmpdir()
        // 您可以指定 uploadDir 如果需要
    });
    return new Promise((resolve, reject) => {
        form.parse(req, (err: Error | null, fields: Fields, files: formidable.Files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ fields, files });
        });
    });
};

// Next.js API route 配置，禁用默认的 bodyParser，因为 formidable 会处理它
export const config = {
    api: {
        bodyParser: false,
    },
};

interface DashScopeResponseHeader {
    event?: string;
    task_id?: string;
    status_code?: number; // 根据实际文档，可能是 status_code 或 error_code
    message?: string; // 根据实际文档，可能是 message 或 error_message
    error_code?: number;
    error_message?: string;
}

interface DashScopeResponsePayload {
    output?: {
        sentence?: {
            text?: string;
            begin_time?: number;
            end_time?: number;
        };
    };
}

interface DashScopeResponse {
    header?: DashScopeResponseHeader;
    payload?: DashScopeResponsePayload;
}

// 新增：音频转换函数
const convertToWav = (inputPath: string, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // ffmpeg 命令参数：
        // -i inputPath: 指定输入文件
        // -ar 16000: 设置音频采样率为 16000 Hz
        // -ac 1: 设置音频通道为 1 (单声道)
        // -f wav: 强制输出格式为 WAV
        // outputPath: 指定输出文件
        const ffmpegProcess = execFile('ffmpeg', ['-i', inputPath, '-ar', '16000', '-ac', '1', '-f', 'wav', outputPath], (error, stdout, stderr) => {
            if (error) {
                console.error(`ffmpeg error: ${error.message}`);
                console.error(`ffmpeg stderr: ${stderr}`);
                return reject(new Error(`Failed to convert audio to WAV: ${error.message}`));
            }
            console.log(`ffmpeg stdout: ${stdout}`);
            console.log(`Backend: Successfully converted ${inputPath} to ${outputPath}`);
            resolve();
        });

        ffmpegProcess.on('close', (code) => {
            if (code !== 0 && code !== null) { // null check for already rejected/resolved cases
                 // Error might have been caught by the callback already
                if (!ffmpegProcess.killed) { // Avoid duplicate rejection if error callback already fired
                    console.error(`ffmpeg process exited with code ${code}`);
                    // reject(new Error(`ffmpeg process exited with code ${code}`));
                }
            }
        });
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
        console.error('DASHSCOPE_API_KEY is not set in environment variables.');
        return res.status(500).json({ success: false, error: 'Server configuration error: API key missing.' });
    }

    const websocketUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
    let originalTempFilePath: string | undefined;
    let convertedTempWavPath: string | undefined;
    let audioPathForStreaming: string | undefined;

    try {
        const { files } = await parseForm(req);
        
        const audioFileField = files.audio;

        if (!audioFileField) {
            console.error('Backend: "audio" field is missing in form-data.');
            return res.status(400).json({ success: false, error: '"audio" field missing.' });
        }

        let singleAudioFile: File;
        if (Array.isArray(audioFileField)) {
            if (audioFileField.length === 0) {
                console.error('Backend: "audio" field is an empty array.');
                return res.status(400).json({ success: false, error: '"audio" field is empty.' });
            }
            singleAudioFile = audioFileField[0];
        } else {
            singleAudioFile = audioFileField;
        }

        if (!singleAudioFile || !singleAudioFile.filepath) {
             console.error('Backend: No valid audio file found after processing.');
             return res.status(400).json({ success: false, error: 'No valid audio file processed.' });
        }
        
        originalTempFilePath = singleAudioFile.filepath;
        audioPathForStreaming = originalTempFilePath; // 默认使用原始文件路径

        console.log(`Backend: Received audio file: ${originalTempFilePath}, size: ${singleAudioFile.size} bytes, type: ${singleAudioFile.mimetype}`);

        // 检查文件类型，如果不是WAV，则尝试转换
        // DashScope 'wav' format expects PCM. 'audio/wav' or 'audio/x-wav' are typical.
        // 'audio/webm' and 'audio/opus' definitely need conversion.
        const mimeType = singleAudioFile.mimetype?.toLowerCase();
        if (mimeType && (mimeType.includes('webm') || mimeType.includes('opus'))) {
            console.log(`Backend: Audio type is ${mimeType}, attempting conversion to WAV.`);
            const tempDir = os.tmpdir();
            convertedTempWavPath = path.join(tempDir, `${path.basename(originalTempFilePath, path.extname(originalTempFilePath))}_converted.wav`);
            
            try {
                await convertToWav(originalTempFilePath, convertedTempWavPath);
                audioPathForStreaming = convertedTempWavPath; // 更新为转换后的文件路径
                console.log(`Backend: Using converted WAV file for streaming: ${audioPathForStreaming}`);
            } catch (conversionError: any) {
                console.error('Backend: Audio conversion failed.', conversionError.message);
                // 根据策略，可以选择是返回错误还是尝试使用原始文件（如果适用）
                // 这里我们选择返回错误，因为格式不匹配是主要问题
                return res.status(500).json({ success: false, error: `Audio conversion failed: ${conversionError.message}` });
            }
        } else if (mimeType && !mimeType.includes('wav')) {
            console.warn(`Backend: Received audio file with MIME type ${mimeType}, which is not explicitly WAV. Proceeding with original file, but conversion might be needed if issues persist.`);
        } else {
            console.log(`Backend: Audio type is ${mimeType || 'unknown (likely WAV)'}, using original file for streaming.`);
        }

        if (!audioPathForStreaming) { // 安全检查
            console.error('Backend: audioPathForStreaming is not defined before starting WebSocket.');
            return res.status(500).json({ success: false, error: 'Internal server error: audio path not set.' });
        }

        const generateTaskID = () => Array(32).fill(null).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const TASK_ID = generateTaskID();

        const ws = new WebSocket(websocketUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'X-DashScope-DataInspection': 'enable',
            }
        });

        let accumulatedTranscript = "";
        let taskSuccessfullyStarted = false;
        let transcriptionError: Error | null = null;
        let taskFinishedOrFailed = false;


        const transcriptionPromise = new Promise<string>((resolve, reject) => {
            ws.on('open', () => {
                console.log(`Backend (Task ID: ${TASK_ID}): Connected to DashScope WebSocket.`);
                const runTaskMessage = {
                    header: { action: 'run-task', task_id: TASK_ID, streaming: 'duplex' },
                    payload: {
                        task_group: 'audio',
                        task: 'asr',
                        function: 'recognition',
                        model: 'paraformer-realtime-v2',
                        parameters: {
                            sample_rate: 16000, // 确保前端发送兼容的音频
                            format: 'wav',      // 假设前端发送的是WAV格式的Blob
                                                // 如果是原始PCM，应为 'pcm'
                        },
                        input: {} // 音频数据将通过后续帧流式传输
                    }
                };
                ws.send(JSON.stringify(runTaskMessage));
                console.log(`Backend (Task ID: ${TASK_ID}): Sent run-task message.`);
            });

            ws.on('message', (data: RawData /*, isBinary: boolean */) => {
                if (taskFinishedOrFailed) return; // 如果任务已结束，忽略后续消息
                try {
                    const messageString = data.toString();
                    const message: DashScopeResponse = JSON.parse(messageString);
                    // console.log(`Backend (Task ID: ${TASK_ID}): Received message:`, JSON.stringify(message, null, 2));
                    console.log(`Backend (Task ID: ${TASK_ID}): Received raw message: ${messageString}`);
                    
                    const header = message.header;
                    if (header?.event === 'task-started') {
                        console.log(`Backend (Task ID: ${TASK_ID}): DashScope task started.`);
                        taskSuccessfullyStarted = true;
                        sendAudioStream(ws, audioPathForStreaming!, TASK_ID, (err) => { // 使用 audioPathForStreaming
                            if (!taskFinishedOrFailed) {
                                taskFinishedOrFailed = true;
                                if (!transcriptionError) transcriptionError = err; // Store error if not already set
                                ws.close(1011, "Audio stream error"); // 1011: Internal Error
                                reject(err);
                            }
                        });
                    } else if (header?.event === 'result-generated') {
                        const text = message.payload?.output?.sentence?.text;
                        console.log(`Backend (Task ID: ${TASK_ID}): result-generated event, text: "${text || ''}"`);
                        if (text) {
                            accumulatedTranscript += text + " ";
                        }
                    } else if (header?.event === 'task-finished') {
                        console.log(`Backend (Task ID: ${TASK_ID}): DashScope task finished.`);
                        taskFinishedOrFailed = true;
                        ws.close(); // DashScope will close, or we can close
                        resolve(accumulatedTranscript.trim());
                    } else if (header?.event === 'task-failed') {
                        const errMsg = header.error_message || header.message || 'Unknown task failure';
                        const errCode = header.error_code || header.status_code || 'N/A';
                        console.error(`Backend (Task ID: ${TASK_ID}): DashScope task failed. Code: ${errCode}, Message: ${errMsg}`);
                        transcriptionError = new Error(`DashScope Task Failed: ${errMsg} (Code: ${errCode})`);
                        taskFinishedOrFailed = true;
                        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                           ws.close(1011, "Task failed");
                        }
                        reject(transcriptionError);
                    }
                } catch (e: any) {
                    if (!taskFinishedOrFailed) {
                        console.error(`Backend (Task ID: ${TASK_ID}): Error parsing message from DashScope:`, e.message);
                        // Avoid rejecting here unless it's a critical parsing error for a final message
                    }
                }
            });

            ws.on('error', (error: Error) => {
                if (taskFinishedOrFailed) return;
                console.error(`Backend (Task ID: ${TASK_ID}): DashScope WebSocket error:`, error.message);
                transcriptionError = error;
                taskFinishedOrFailed = true;
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                    ws.close(1011, "WebSocket error"); // 1011: Internal Error
                }
                reject(error);
            });

            ws.on('close', (code: number, reason: Buffer) => {
                const reasonString = reason.toString();
                console.log(`Backend (Task ID: ${TASK_ID}): DashScope WebSocket closed. Code: ${code}, Reason: ${reasonString}`);
                if (!taskFinishedOrFailed) {
                    taskFinishedOrFailed = true;
                    if (transcriptionError) {
                        reject(transcriptionError);
                    } else if (!taskSuccessfullyStarted) {
                        reject(new Error('WebSocket closed before task could start.'));
                    } else {
                        // If task started but no explicit finish/fail, and no transcript, it's an issue.
                        // If there's a transcript, we might have resolved already or could resolve here.
                        // For simplicity, if not resolved, reject.
                        if (accumulatedTranscript.trim().length > 0 && !transcriptionError) {
                             console.warn(`Backend (Task ID: ${TASK_ID}): WebSocket closed with accumulated transcript but no explicit finish. Resolving with current transcript.`);
                             resolve(accumulatedTranscript.trim());
                        } else {
                             reject(new Error(`WebSocket closed unexpectedly. Code: ${code}, Reason: ${reasonString}`));
                        }
                    }
                }
            });
        });

        // 设置超时
        const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => {
                if (!taskFinishedOrFailed) {
                    taskFinishedOrFailed = true;
                    console.error(`Backend (Task ID: ${TASK_ID}): Transcription timed out.`);
                    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                       ws.close(1001, "Timeout"); // 1001: Going Away
                    }
                    reject(new Error('Transcription process timed out.'));
                }
            }, 60000); // 60秒超时
        });
        
        const finalTranscript = await Promise.race([transcriptionPromise, timeoutPromise]);
        res.status(200).json({ success: true, text: finalTranscript });

    } catch (error: any) {
        console.error('Backend: Error in /api/voice/dashscope-transcribe handler:', error.message);
        // Check if the error is due to ffmpeg not being found
        if (error.message && error.message.toLowerCase().includes('ffmpeg') && (error.code === 'ENOENT' || (error.spawnargs && error.spawnargs[0] === 'ffmpeg'))) {
             return res.status(500).json({ success: false, error: 'Internal server error: ffmpeg command not found. Please ensure ffmpeg is installed and in PATH.' });
        }
        res.status(500).json({ success: false, error: error.message || 'Internal server error during transcription.' });
    } finally {
        const cleanupFile = (filePath: string | undefined, fileNameForLog: string) => {
            if (filePath) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.warn(`Backend: Failed to delete temporary ${fileNameForLog} file ${filePath}:`, err?.message || err);
                    } else {
                        console.log(`Backend: Deleted temporary ${fileNameForLog} file ${filePath}`);
                    }
                });
            }
        };
        
        cleanupFile(originalTempFilePath, "original");
        if (convertedTempWavPath && convertedTempWavPath !== originalTempFilePath) { // 确保不重复删除
            cleanupFile(convertedTempWavPath, "converted WAV");
        }
    }
}

function sendAudioStream(ws: WebSocket, filePath: string, taskId: string, onError: (error: Error) => void) {
    const chunkSize = 3200; // Approx 100ms for 16kHz 16bit mono. Was 32 * 1024.
    console.log(`Backend (Task ID: ${taskId}): Starting audio stream from ${filePath} with chunk size ${chunkSize}`);
    const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
    let streamClosedOrErrored = false;

    const closeStreamAndNotifyError = (err: Error) => {
        if (!streamClosedOrErrored) {
            streamClosedOrErrored = true;
            if (!stream.destroyed) {
                stream.destroy();
            }
            onError(err);
            // WebSocket might be closed by other handlers already
        }
    };

    stream.on('data', (chunk: Buffer | string) => {
        if (streamClosedOrErrored) return;
        
        if (ws.readyState === WebSocket.OPEN) {
            if (Buffer.isBuffer(chunk)) {
                console.log(`Backend (Task ID: ${taskId}): Sending audio chunk, size: ${chunk.length} bytes`);
                ws.send(chunk);
                // Optional: Introduce a delay if strictly needed, though stream pacing might be enough
                // stream.pause();
                // setTimeout(() => {
                //   if (!streamClosedOrErrored && !stream.destroyed) stream.resume();
                // }, 50); // Adjust delay as needed, e.g., 50-100ms
            } else {
                const errMsg = `Backend (Task ID: ${taskId}): Received string data from audio stream, expected Buffer. Halting.`;
                console.error(errMsg);
                closeStreamAndNotifyError(new Error(errMsg));
            }
        } else {
            console.warn(`Backend (Task ID: ${taskId}): WebSocket not open while trying to send audio chunk. Stopping stream.`);
            closeStreamAndNotifyError(new Error('WebSocket closed during audio streaming.'));
        }
    });

    stream.on('end', () => {
        if (streamClosedOrErrored) return;
        streamClosedOrErrored = true; // Mark stream as normally ended
        console.log(`Backend (Task ID: ${taskId}): Audio file stream ended.`);
        if (ws.readyState === WebSocket.OPEN) {
            const finishTaskMessage = {
                header: { action: 'finish-task', task_id: taskId, streaming: 'duplex' },
                payload: { input: {} }
            };
            ws.send(JSON.stringify(finishTaskMessage));
            console.log(`Backend (Task ID: ${taskId}): Sent finish-task to DashScope.`);
        } else {
            console.warn(`Backend (Task ID: ${taskId}): WebSocket not open when trying to send finish-task.`);
            // Error might have been handled by ws.on('close') or other error handlers
        }
    });

    stream.on('error', (err: Error) => {
        console.error(`Backend (Task ID: ${taskId}): Error reading audio file stream:`, err.message);
        closeStreamAndNotifyError(new Error(`Error reading audio file: ${err.message}`));
    });

    // If WebSocket closes before the stream is done
    const onWsCloseEarly = () => {
        if (!streamClosedOrErrored) {
             console.log(`Backend (Task ID: ${taskId}): WebSocket closed prematurely during audio streaming. Destroying stream.`);
             // The main promise rejection will be handled by the ws.on('close') in the handler
             closeStreamAndNotifyError(new Error('WebSocket closed prematurely during audio streaming.')); // This calls onError
        }
        ws.removeListener('close', onWsCloseEarly); // Clean up listener
    };
    ws.on('close', onWsCloseEarly);

    // Ensure listener is removed when stream finishes normally or errors out
    stream.on('close', () => { // 'close' is emitted after 'end' or 'error'
        ws.removeListener('close', onWsCloseEarly);
    });
} 