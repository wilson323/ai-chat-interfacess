import React, { useState } from 'react'
import ImageEditor from '@/components/image-editor/image-editor'

export default function ImageEditorPage() {
  const [referenceUrl, setReferenceUrl] = useState<string | undefined>()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-2xl font-bold mb-4">图像编辑器</h1>
      <div className="mb-4 flex gap-2 items-center">
        <label className="text-sm">参考图URL：</label>
        <input
          type="text"
          value={referenceUrl || ''}
          onChange={e => setReferenceUrl(e.target.value)}
          className="border rounded px-2 py-1 w-64"
          placeholder="可选，粘贴参考图片URL"
        />
      </div>
      <ImageEditor onSave={() => {}} referenceImageUrl={referenceUrl} />
    </div>
  )
} 