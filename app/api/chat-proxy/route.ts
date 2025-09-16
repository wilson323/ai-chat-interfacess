import { NextResponse } from 'next/server';
// Removed invalid typescript import
import {
  createCrossPlatformTextDecoder,
  createCrossPlatformTextEncoder,
  isStreamingContentType,
  processStreamLines,
  categorizeStreamError,
  safeCrossPlatformLog,
} from '../../../lib/cross-platform-utils';

// 辅助函数，验证 URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// 标准化错误响应
function createErrorResponse(message: string, status = 200, fallback = true) {
  return NextResponse.json(
    {
      status: status,
      message: message,
      fallback: fallback,
      data: {
        choices: [
          {
            message: {
              content:
                '抱歉，连接服务器时出现问题。请检查您的网络连接或API配置，然后重试。',
            },
          },
        ],
      },
    },
    { status: 200 } // 始终返回200状态码，让客户端能正常处理
  );
}

// 处理 GET 请求
export async function GET(request: Request) {
  try {
    // 从查询参数中提取目标 URL
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('targetUrl');

    if (!targetUrl) {
      return createErrorResponse('缺少 targetUrl 参数', 400);
    }

    // 验证 URL 格式
    if (!isValidUrl(targetUrl)) {
      console.error(`无效的 URL 格式: ${targetUrl}`);
      return createErrorResponse('无效的 URL 格式', 400);
    }

    // 获取原始请求的头信息
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // 跳过 host 头以避免冲突
      if (key.toLowerCase() !== 'host') {
        headers[key] = value;
      }
    });

    // 添加超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('GET 请求超时');
    }, 15000); // 15 秒超时

    try {
      console.log(`转发 GET 请求到: ${targetUrl}`);

      // 添加重试逻辑
      let retryCount = 0;
      const maxRetries = 2; // 适中的重试次数
      let response;

      while (retryCount <= maxRetries) {
        try {
          response = await fetch(targetUrl, {
            method: 'GET',
            headers,
            cache: 'no-store',
            signal: controller.signal,
          });

          // 如果请求成功，跳出重试循环
          break;
        } catch (error) {
          retryCount++;
          console.error(
            `GET Fetch 错误 (尝试 ${retryCount}/${maxRetries + 1}): ${error instanceof Error ? error.message : String(error)}`
          );

          // 如果已达到最大重试次数，抛出错误
          if (retryCount > maxRetries) {
            throw error;
          }

          // 等待一段时间后重试 (指数退避)
          const delay = Math.min(500 * Math.pow(1.5, retryCount - 1), 2000); // 优化延迟时间
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // 如果所有重试都失败，response 将是 undefined
      if (!response) {
        throw new Error('所有 GET 重试尝试均失败');
      }

      // 清除超时，因为我们已经收到响应
      clearTimeout(timeoutId);

      // 检查响应是否正常
      if (!response.ok) {
        console.error(`API 响应状态 ${response.status}`);

        // 尝试获取响应文本以便更好地诊断错误
        const errorText = await response.text().catch(() => '无法读取错误响应');
        console.error(
          `错误响应体(前 200 个字符): ${errorText.substring(0, 200)}`
        );

        return NextResponse.json(
          {
            status: 200,
            data: {
              message: '无法连接到服务器，请稍后再试。',
            },
          },
          { status: 200 }
        );
      }

      // 检查内容类型，确保是 JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`意外的内容类型: ${contentType}`);

        // 尝试获取响应文本以便更好地诊断错误
        const text = await response.text();
        console.error(`响应体(前 200 个字符): ${text.substring(0, 200)}`);

        return NextResponse.json(
          {
            status: 415,
            message: `API 返回非 JSON 响应: ${contentType || '未知内容类型'}`,
            fallback: true,
          },
          { status: 200 } // 使用200状态码
        );
      }

      // 解析 JSON 响应
      const data = await response.json().catch(error => {
        console.error('解析 JSON 响应时出错:', error);
        return { error: '无效的 JSON 响应' };
      });

      // 返回响应数据
      return NextResponse.json({ status: 200, data });
    } catch (fetchError) {
      // 出错时清除超时
      clearTimeout(timeoutId);

      console.error('GET fetch 错误:', fetchError);
      return createErrorResponse(
        fetchError instanceof Error ? fetchError.message : 'Fetch 失败',
        500
      );
    }
  } catch (error) {
    console.error('代理 GET 错误:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : '内部服务器错误',
      500
    );
  }
}

// 处理 POST 请求，更好地处理 FastGPT 的流式格式
export async function POST(request: Request) {
  try {
    // 获取请求体
    const body = await request.json();
    const {
      targetUrl,
      method = 'POST',
      headers = {},
      body: requestBody,
    } = body;

    if (!targetUrl) {
      return createErrorResponse('缺少 targetUrl 参数', 400);
    }

    // 验证 URL 格式
    if (!isValidUrl(targetUrl)) {
      console.error(`无效的 URL 格式: ${targetUrl}`);
      return createErrorResponse('无效的 URL 格式', 400);
    }

    // 确保 requestBody 不为 undefined
    const safeRequestBody = requestBody || {};

    // 🔥 增强流式请求检测逻辑
    const isStreaming =
      headers.Accept === 'text/event-stream' ||
      (safeRequestBody && safeRequestBody.stream === true) ||
      headers['Accept']?.includes('text/event-stream');

    if (isStreaming) {
      // 🔥 增强流式请求处理逻辑
      safeCrossPlatformLog('info', `开始处理流式请求`, {
        targetUrl,
        requestBodySize: JSON.stringify(safeRequestBody).length,
      });

      // 创建流式响应管道
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = createCrossPlatformTextEncoder();

      // 🔥 增强超时处理 - Linux环境可能需要更长时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('[流式代理] 请求超时');
      }, 45000); // 增加到45秒超时

      // 🔥 增强请求头处理
      const enhancedHeaders = {
        ...headers,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        // 添加用户代理以避免某些服务器拒绝请求
        'User-Agent': 'FastGPT-Proxy/1.0',
      };

      console.log(`[流式代理] 发送请求，头部:`, Object.keys(enhancedHeaders));

      // 向目标 URL 发出请求
      fetch(targetUrl, {
        method,
        headers: enhancedHeaders,
        body: JSON.stringify(safeRequestBody),
        cache: 'no-store',
        signal: controller.signal,
      })
        .then(async response => {
          // 清除超时，因为我们已经收到响应
          clearTimeout(timeoutId);

          console.log(`[流式代理] 响应状态: ${response.status}`);
          console.log(
            `[流式代理] 响应头:`,
            Object.fromEntries(response.headers.entries())
          );

          if (!response.ok) {
            const errorText = await response
              .text()
              .catch(() => '无法读取错误响应');
            console.error(
              `[流式代理] 请求失败: ${response.status} ${response.statusText} - ${errorText}`
            );
            throw new Error(
              `流式请求失败: ${response.status} ${response.statusText} - ${errorText}`
            );
          }

          // 🔥 使用跨平台兼容的内容类型检查
          const contentType = response.headers.get('content-type') || '';
          safeCrossPlatformLog('info', `响应内容类型检查`, { contentType });

          if (!isStreamingContentType(contentType)) {
            safeCrossPlatformLog('warn', `预期流式内容但收到非标准类型`, {
              contentType,
            });
            // 不抛出错误，继续处理，某些服务器可能返回不标准的内容类型
          }

          if (!response.body) {
            console.error('[流式代理] 响应体为空');
            throw new Error('响应体为空');
          }

          // 从响应体获取读取器
          const reader = response.body.getReader();

          // 🔥 使用跨平台兼容的流式数据读取逻辑
          try {
            let buffer = '';
            let lineCount = 0;
            const decoder = createCrossPlatformTextDecoder();

            safeCrossPlatformLog('info', `开始读取流式数据`);

            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                safeCrossPlatformLog('info', `流读取完成`, { lineCount });
                break;
              }

              // 🔥 使用跨平台兼容的解码处理
              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;

              // 🔥 使用跨平台兼容的行分割处理
              const { lines, remainingBuffer } = processStreamLines(buffer);
              buffer = remainingBuffer;

              for (const line of lines) {
                lineCount++;

                // 🔥 增强数据转发，确保格式正确
                const formattedLine = line.endsWith('\n') ? line : line + '\n';
                await writer.write(encoder.encode(formattedLine));

                // 每100行输出一次进度日志
                if (lineCount % 100 === 0) {
                  safeCrossPlatformLog('debug', `处理进度`, { lineCount });
                }
              }
            }

            // 🔥 处理缓冲区中的任何剩余数据
            if (buffer.trim() !== '') {
              safeCrossPlatformLog('debug', `处理剩余缓冲区数据`, {
                bufferLength: buffer.length,
              });
              await writer.write(encoder.encode(buffer + '\n'));
            }

            // 🔥 增强结束事件处理
            await writer.write(encoder.encode('data: [DONE]\n\n'));
            console.log('[流式代理] 向客户端发送 [DONE] 事件');
          } catch (readError) {
            console.error('[流式代理] 读取流时出错:', readError);
            // 🔥 增强错误处理，提供更详细的错误信息
            const errorMessage =
              readError instanceof Error
                ? readError.message
                : String(readError);
            const safeErrorMessage = errorMessage.replace(/"/g, '\"');
            await writer.write(
              encoder.encode(`data: {"error": "${safeErrorMessage}"}\n\n`)
            );
            await writer.write(encoder.encode('data: [DONE]\n\n'));
          }
        })
        .catch(async error => {
          // 出错时清除超时
          clearTimeout(timeoutId);

          // 🔥 使用跨平台兼容的错误分类
          const errorInfo = categorizeStreamError(error);
          safeCrossPlatformLog('error', `流式代理错误`, {
            errorType: errorInfo.type,
            errorMessage: errorInfo.message,
            shouldRetry: errorInfo.shouldRetry,
            originalError: error,
          });

          // 🔥 发送结构化的错误响应
          const safeErrorMessage = errorInfo.message.replace(/"/g, '\"');
          const retryHint = errorInfo.shouldRetry ? '，建议重试' : '';

          await writer.write(
            encoder.encode(
              `data: {"choices":[{"delta":{"content":"抱歉，连接服务器时遇到问题：${safeErrorMessage}${retryHint}。请检查网络连接或稍后再试。"}}]}\n\n`
            )
          );
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        })
        .finally(async () => {
          // 如果尚未清除，则清除超时
          clearTimeout(timeoutId);
          try {
            await writer.close();
            console.log('流写入器已关闭');
          } catch (closeError) {
            console.error('关闭写入器时出错:', closeError);
          }
        });

      // 🔥 增强响应头，确保跨平台兼容性
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
          'X-Accel-Buffering': 'no', // 禁用Nginx缓冲
          'Transfer-Encoding': 'chunked',
        },
      });
    } else {
      // 对于非流式请求，我们可以使用更简单的方法
      // 添加超时处理
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('非流式请求超时');
      }, 15000); // 15 秒超时

      try {
        // 添加更多错误处理和日志记录
        console.log(`发送非流式请求到: ${targetUrl}`);

        // 添加错误处理和重试逻辑
        let retryCount = 0;
        const maxRetries = 2; // 适中的重试次数
        let response;

        while (retryCount <= maxRetries) {
          try {
            response = await fetch(targetUrl, {
              method,
              headers: {
                ...headers,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(safeRequestBody),
              cache: 'no-store',
              signal: controller.signal,
            });

            // 如果请求成功，跳出重试循环
            break;
          } catch (fetchError) {
            retryCount++;
            console.error(
              `Fetch 错误 (尝试 ${retryCount}/${maxRetries + 1}): ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
            );

            // 如果已达到最大重试次数，抛出错误
            if (retryCount > maxRetries) {
              throw fetchError;
            }

            // 等待一段时间后重试 (指数退避)
            const delay = Math.min(500 * Math.pow(1.5, retryCount - 1), 2000); // 优化延迟时间
            console.log(`等待 ${delay}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

        // 如果所有重试都失败，response 将是 undefined
        if (!response) {
          throw new Error('所有重试尝试均失败');
        }

        // 清除超时，因为我们已经收到响应
        clearTimeout(timeoutId);

        console.log(`收到响应，状态: ${response.status}`);

        // 检查响应状态
        if (!response.ok) {
          const errorText = await response
            .text()
            .catch(() => '无法读取错误响应');
          console.error(`API 响应状态 ${response.status}: ${errorText}`);
          return createErrorResponse(`API 错误: ${response.statusText}`, 502);
        }

        // 检查内容类型，确保是 JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`意外的内容类型: ${contentType}`);

          // 尝试获取响应文本以便更好地诊断错误
          const text = await response.text();
          console.error(`响应体(前 200 个字符): ${text.substring(0, 200)}`);

          // 尝试将响应作为文本返回，而不是失败
          return NextResponse.json(
            {
              status: 200,
              data: {
                choices: [
                  {
                    message: {
                      content:
                        '收到非JSON响应。服务器可能暂时不可用，请稍后再试。',
                    },
                  },
                ],
              },
              originalContentType: contentType,
              fallback: true,
            },
            { status: 200 }
          );
        }

        // 获取响应数据
        const data = await response.json().catch(error => {
          console.error('解析 JSON 响应时出错:', error);
          return {
            choices: [
              {
                message: {
                  content: '解析响应时出错。服务器可能暂时不可用，请稍后再试。',
                },
              },
            ],
          };
        });

        // 返回响应数据
        return NextResponse.json({ status: 200, data });
      } catch (fetchError) {
        // 出错时清除超时
        clearTimeout(timeoutId);

        console.error('非流式 fetch 错误:', fetchError);

        // 返回一个友好的错误响应，包含回退内容
        return NextResponse.json(
          {
            status: 200, // 使用200状态码，让客户端能正常处理
            data: {
              choices: [
                {
                  message: {
                    content:
                      '抱歉，连接服务器时遇到网络问题。请检查您的网络连接或稍后再试。',
                  },
                },
              ],
            },
            error:
              fetchError instanceof Error ? fetchError.message : '网络连接失败',
            fallback: true, // 添加标志表示这是一个回退响应
          },
          { status: 200 } // 使用200状态码
        );
      }
    }
  } catch (error) {
    console.error('代理错误:', error);
    return NextResponse.json(
      {
        status: 500,
        message: error instanceof Error ? error.message : '内部服务器错误',
      },
      { status: 200 } // 使用200状态码，让客户端能正常处理
    );
  }
}
