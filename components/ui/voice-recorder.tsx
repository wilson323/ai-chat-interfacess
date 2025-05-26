import React, { useRef, useState, useEffect } from 'react'

interface VoiceRecorderProps {
  onResult: (text: string) => void
}

// 添加兼容性处理函数
const getMediaDevices = () => {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }

  // 标准API
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices;
  }

  // 创建一个兼容层
  const mediaDevices: any = {
    getUserMedia: async (constraints: MediaStreamConstraints) => {
      // 旧版API兼容
      const getUserMedia =
        navigator.getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia;

      if (getUserMedia) {
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }

      throw new Error('浏览器不支持麦克风访问');
    }
  };

  return mediaDevices;
};

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onResult }) => {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [browserSupport, setBrowserSupport] = useState<boolean | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  // 在组件加载时检查浏览器支持
  useEffect(() => {
    const checkBrowserSupport = () => {
      const mediaDevices = getMediaDevices();
      const hasMediaRecorder = typeof window !== 'undefined' && 'MediaRecorder' in window;
      setBrowserSupport(!!mediaDevices && hasMediaRecorder);
    };

    checkBrowserSupport();
  }, []);

  const startRecording = async () => {
    setError(null)

    // 检查浏览器是否支持麦克风API
    if (typeof navigator === 'undefined') {
      setError('浏览器环境不可用，请刷新页面重试')
      return
    }

    // 获取媒体设备API（可能是兼容层）
    const mediaDevices = getMediaDevices();
    if (!mediaDevices) {
      // 检查是否为移动设备
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      if (isMobile) {
        setError('您的移动浏览器可能不支持麦克风访问，请尝试使用Chrome或Safari最新版本')
      } else {
        setError('您的浏览器不支持麦克风访问，请使用Chrome、Firefox或Edge浏览器')
      }
      return
    }

    try {
      // 使用我们的兼容层获取媒体流
      const stream = await mediaDevices.getUserMedia({ audio: true })

      // 检查MediaRecorder是否可用
      if (typeof window === 'undefined' || !window.MediaRecorder) {
        setError('您的浏览器不支持录音功能，请使用最新版本的Chrome、Firefox或Edge浏览器')
        return
      }

      // 尝试创建MediaRecorder实例
      let mediaRecorder;
      try {
        mediaRecorder = new window.MediaRecorder(stream);
      } catch (err) {
        // 某些移动浏览器可能支持getUserMedia但不完全支持MediaRecorder
        console.warn('创建MediaRecorder失败:', err);
        stream.getTracks().forEach(track => track.stop()); // 释放麦克风

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          setError('您的移动浏览器不完全支持录音功能，请尝试使用Chrome或Safari最新版本');
        } else {
          setError('您的浏览器不完全支持录音功能，请使用最新版本的Chrome、Firefox或Edge浏览器');
        }
        return;
      }

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

        // 检查是否有录音数据
        if (chunks.current.length === 0) {
          setError('未捕获到录音数据，请重试');
          return;
        }

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
      // 减少控制台错误输出，改为警告
      console.warn('麦克风访问问题:', err)

      // 检查是否为移动设备
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      // 根据错误类型提供更具体的错误信息
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          if (isMobile) {
            setError('麦克风访问被拒绝，请在浏览器设置中允许访问麦克风，或尝试使用其他浏览器')
          } else {
            setError('麦克风访问被拒绝，请在浏览器设置中允许访问麦克风')
          }
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
        } else if (err.name === 'TypeError') {
          // 在某些移动浏览器中可能出现的TypeError
          if (isMobile) {
            setError('您的移动浏览器可能不完全支持语音输入功能，请尝试使用Chrome或Safari最新版本')
          } else {
            setError('浏览器出现兼容性问题，请尝试使用Chrome、Firefox或Edge最新版本')
          }
        } else {
          // 其他DOMException错误
          if (isMobile) {
            setError('您的移动浏览器可能不完全支持语音输入功能，请尝试使用Chrome或Safari最新版本')
          } else {
            setError(`无法访问麦克风: ${err.name}`)
          }
        }
      } else {
        // 非DOMException错误
        if (isMobile) {
          setError('无法访问麦克风，您的移动浏览器可能不完全支持此功能，请尝试使用其他浏览器')
        } else {
          setError('无法访问麦克风，请检查浏览器权限设置')
        }
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
      {browserSupport === false ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md p-2 w-full mb-2">
          <div className="text-amber-600 dark:text-amber-400 text-sm font-medium">
            您的浏览器可能不支持语音输入功能
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            请尝试使用Chrome、Safari或Edge最新版本
          </div>
        </div>
      ) : null}
      <button
        className={`px-4 py-2 rounded-md text-white transition-colors ${recording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-60`}
        onClick={recording ? stopRecording : startRecording}
        disabled={loading || browserSupport === false}
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
              {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? (
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>点击浏览器底部的设置或菜单按钮</li>
                  <li>找到"网站设置"或"权限"选项</li>
                  <li>找到麦克风权限并允许访问</li>
                  <li>如果仍然无法使用，请尝试使用Chrome或Safari最新版本</li>
                </ol>
              ) : (
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>点击浏览器地址栏左侧的锁定/信息图标</li>
                  <li>找到"麦克风"或"权限"选项</li>
                  <li>将麦克风权限设置为"允许"</li>
                  <li>刷新页面后重试</li>
                </ol>
              )}
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
                <li>检查浏览器是否已更新到最新版本</li>
                <li>尝试关闭并重新打开浏览器</li>
              </ol>
            </div>
          )}
          {(error.includes('不支持麦克风访问') || error.includes('不支持mediaDevices API') || error.includes('不完全支持语音输入功能')) && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <p>浏览器兼容性问题。请尝试：</p>
              {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? (
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>使用Chrome或Safari最新版本</li>
                  <li>确保浏览器已授予麦克风访问权限</li>
                  <li>检查系统设置中的麦克风权限</li>
                  <li>如果使用的是第三方浏览器，请尝试使用系统默认浏览器</li>
                </ol>
              ) : (
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>确认浏览器已更新到最新版本</li>
                  <li>在Firefox中，在地址栏输入 about:config，搜索 media.navigator.enabled 并确保其值为 true</li>
                  <li>检查是否启用了隐私保护模式或插件阻止了麦克风访问</li>
                </ol>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder