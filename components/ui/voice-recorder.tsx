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

    // 检查浏览器是否支持麦克风API
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.error('浏览器不支持mediaDevices API')
      setError('您的浏览器不支持麦克风访问，请使用Chrome、Firefox或Edge浏览器')
      return
    }

    try {
      console.log('尝试获取麦克风权限...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('麦克风权限获取成功')

      // 检查MediaRecorder是否可用
      if (typeof window === 'undefined' || !window.MediaRecorder) {
        console.error('浏览器不支持MediaRecorder API')
        setError('您的浏览器不支持录音功能，请使用最新版本的Chrome、Firefox或Edge浏览器')
        return
      }

      const mediaRecorder = new window.MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunks.current = []
      mediaRecorder.start()
      setRecording(true)
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }
      mediaRecorder.onstop = async () => {
        // 停止所有音轨，释放麦克风
        stream.getTracks().forEach(track => track.stop())

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
      console.error('麦克风访问错误:', err)

      // 根据错误类型提供更具体的错误信息
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('麦克风访问被拒绝，请在浏览器设置中允许访问麦克风')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('未检测到麦克风设备，请确认麦克风已连接')
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('麦克风被其他应用占用，请关闭其他使用麦克风的应用后重试')
        } else if (err.name === 'AbortError') {
          // Firefox在某些情况下会抛出AbortError
          setError('麦克风访问请求被中断，请刷新页面后重试')
        } else if (err.name === 'SecurityError') {
          // 安全策略错误，通常是混合内容或非安全上下文
          setError('由于安全策略限制，无法访问麦克风。请确保网站使用HTTPS协议')
        } else {
          setError(`无法访问麦克风: ${err.name}`)
          console.error('详细错误信息:', err)
        }
      } else {
        setError('无法访问麦克风，请检查浏览器权限设置')
        console.error('非DOMException错误:', err)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
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
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md p-2 mt-2 w-full">
          <div className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>
          {error.includes('麦克风访问被拒绝') && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <p>解决方法：</p>
              <ol className="list-decimal pl-4 mt-1 space-y-1">
                <li>点击浏览器地址栏左侧的锁定/信息图标</li>
                <li>找到"麦克风"或"权限"选项</li>
                <li>将麦克风权限设置为"允许"</li>
                <li>刷新页面后重试</li>
              </ol>
            </div>
          )}
          {error.includes('未检测到麦克风设备') && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <p>解决方法：</p>
              <ol className="list-decimal pl-4 mt-1 space-y-1">
                <li>检查麦克风是否正确连接到设备</li>
                <li>在系统设置中确认麦克风是否被禁用</li>
                <li>尝试使用其他麦克风设备</li>
              </ol>
            </div>
          )}
          {error.includes('麦克风访问请求被中断') && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <p>解决方法：</p>
              <ol className="list-decimal pl-4 mt-1 space-y-1">
                <li>刷新页面后重试</li>
                <li>检查Firefox是否已更新到最新版本</li>
                <li>尝试关闭并重新打开浏览器</li>
              </ol>
            </div>
          )}
          {error.includes('不支持麦克风访问') && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <p>您正在使用Firefox浏览器，但可能遇到了兼容性问题。请尝试：</p>
              <ol className="list-decimal pl-4 mt-1 space-y-1">
                <li>确认Firefox已更新到最新版本</li>
                <li>在地址栏输入 about:config，搜索 media.navigator.enabled 并确保其值为 true</li>
                <li>检查是否启用了隐私保护模式或插件阻止了麦克风访问</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder