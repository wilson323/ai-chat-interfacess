import React, { useRef, useState } from 'react'

interface VoiceRecorderProps {
  onResult: (text: string) => void
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onResult }) => {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new window.MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunks.current = []
      mediaRecorder.start()
      setRecording(true)
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/wav' })
        setAudioUrl(URL.createObjectURL(blob))
        setLoading(true)
        try {
          const formData = new FormData()
          formData.append('file', blob, 'audio.wav')
          const res = await fetch('/api/voice-to-text', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.text) {
            onResult(data.text)
          } else {
            setError(data.error || '识别失败')
          }
        } catch (err) {
          setError('上传或识别失败')
        } finally {
          setLoading(false)
        }
      }
    } catch (err) {
      setError('无法访问麦克风')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      <button
        className={`px-4 py-2 rounded-md text-white transition-colors ${recording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-60`}
        onClick={recording ? stopRecording : startRecording}
        disabled={loading}
      >
        {loading ? '识别中...' : recording ? '停止录音' : '语音输入'}
      </button>
      {audioUrl && (
        <audio src={audioUrl} controls className="w-full mt-2" />
      )}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  )
}

export default VoiceRecorder 