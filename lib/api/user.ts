// 用户端统一API封装
export async function fetchUserChatHistory() {
  const res = await fetch('/api/chat-history')
  if (!res.ok) throw new Error('获取历史失败')
  return res.json()
}

export async function sendUserMessage(payload: { content: string, files?: any[] }) {
  const res = await fetch('/api/chat-proxy/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('发送失败')
  return res.json()
}

export async function saveEditedImage(blob: Blob, marks: {x: number, y: number}[]) {
  const formData = new FormData()
  formData.append('file', blob, 'edit.png')
  formData.append('marks', JSON.stringify(marks))
  const res = await fetch('/api/image-editor/save', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('保存失败')
  return res.json()
} 