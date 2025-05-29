# 语音输入功能完全重构开发计划

## 项目概述

### 重构目标
- 🎯 **完全重构**：抛弃现有语音功能，基于Next.js 15最新特性重新开发
- 🔧 **现代化架构**：使用React 18、TypeScript 5、Tailwind CSS最新特性
- 🌐 **统一API**：使用OpenAI兼容接口 `http://112.48.22.44:38082/v1/audio/transcriptions`
- 📱 **全平台支持**：桌面端、移动端、平板端完美适配
- 🎨 **UI/UX优化**：现代化设计，流畅动画，直观交互

### 技术栈
- **前端**: Next.js 15.2.4 + React 18 + TypeScript 5
- **UI库**: Radix UI + Tailwind CSS + Lucide Icons
- **状态管理**: React Hooks + Context API
- **音频处理**: Web Audio API + MediaRecorder API
- **后端**: Next.js API Routes
- **语音识别**: OpenAI Whisper兼容接口

## 架构设计

### 1. 核心组件架构
```
components/voice/
├── VoiceInput.tsx           # 主语音输入组件
├── VoiceRecorder.tsx        # 录音核心组件
├── VoiceButton.tsx          # 语音按钮组件
├── VoiceWaveform.tsx        # 音频波形可视化
├── VoiceStatus.tsx          # 录音状态显示
├── VoicePermission.tsx      # 权限请求组件
└── hooks/
    ├── useVoiceRecorder.ts  # 录音逻辑Hook
    ├── useVoicePermission.ts # 权限管理Hook
    ├── useAudioVisualization.ts # 音频可视化Hook
    └── useVoiceConfig.ts    # 配置管理Hook
```

### 2. API架构
```
app/api/voice/
├── transcribe/route.ts      # 语音转文字主接口
├── config/route.ts          # 语音配置接口
└── health/route.ts          # 服务健康检查
```

### 3. 状态管理架构
```typescript
interface VoiceState {
  isRecording: boolean
  isProcessing: boolean
  isEnabled: boolean
  permission: 'granted' | 'denied' | 'prompt'
  error: string | null
  audioLevel: number
  duration: number
  transcript: string | null
}
```

## 详细开发计划

### 阶段一：基础架构搭建 (1-2天)

#### 1.1 清理旧代码
- [ ] 删除 `components/ui/voice-recorder.tsx`
- [ ] 删除 `app/api/voice-test/route.ts`
- [ ] 清理 `components/chat-input.tsx` 中的旧语音代码
- [ ] 清理 `components/input-area.tsx` 中的旧语音代码
- [ ] 清理 `components/chat-container.tsx` 中的旧语音代码
- [ ] 移除 `components/settings-dialog.tsx` 中的过时配置

#### 1.2 创建新的目录结构
```bash
mkdir -p components/voice/hooks
mkdir -p app/api/voice
mkdir -p lib/voice
mkdir -p types/voice
```

#### 1.3 定义TypeScript类型
**文件**: `types/voice/index.ts`
```typescript
export interface VoiceConfig {
  apiUrl: string
  apiKey: string
  maxDuration: number
  sampleRate: number
  language: string
}

export interface VoiceRecordingState {
  isRecording: boolean
  isProcessing: boolean
  duration: number
  audioLevel: number
  error: string | null
}

export interface VoiceTranscriptionResult {
  text: string
  confidence: number
  duration: number
  language: string
}
```

### 阶段二：核心Hook开发 (2-3天)

#### 2.1 权限管理Hook
**文件**: `components/voice/hooks/useVoicePermission.ts`
```typescript
export function useVoicePermission() {
  const [permission, setPermission] = useState<PermissionState>('prompt')
  const [isSupported, setIsSupported] = useState(false)

  const requestPermission = async () => {
    // 现代化权限请求逻辑
  }

  return { permission, isSupported, requestPermission }
}
```

#### 2.2 录音核心Hook
**文件**: `components/voice/hooks/useVoiceRecorder.ts`
```typescript
export function useVoiceRecorder(config: VoiceConfig) {
  const [state, setState] = useState<VoiceRecordingState>()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const startRecording = async () => {
    // 高质量录音逻辑
  }

  const stopRecording = async (): Promise<Blob> => {
    // 停止录音并返回音频数据
  }

  return { state, startRecording, stopRecording }
}
```

#### 2.3 音频可视化Hook
**文件**: `components/voice/hooks/useAudioVisualization.ts`
```typescript
export function useAudioVisualization(stream: MediaStream | null) {
  const [audioLevel, setAudioLevel] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>([])

  // 实时音频分析和可视化
  return { audioLevel, waveformData }
}
```

### 阶段三：UI组件开发 (3-4天)

#### 3.1 语音按钮组件
**文件**: `components/voice/VoiceButton.tsx`
```typescript
interface VoiceButtonProps {
  isRecording: boolean
  isProcessing: boolean
  isEnabled: boolean
  onToggle: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal'
}

export function VoiceButton({ ... }: VoiceButtonProps) {
  return (
    <Button
      className={cn(
        "relative transition-all duration-200",
        isRecording && "animate-pulse bg-red-500",
        isProcessing && "animate-spin"
      )}
      onClick={onToggle}
    >
      <Mic className="h-4 w-4" />
      {isRecording && (
        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
      )}
    </Button>
  )
}
```

#### 3.2 录音状态组件
**文件**: `components/voice/VoiceStatus.tsx`
```typescript
export function VoiceStatus({
  isRecording,
  duration,
  audioLevel,
  error
}: VoiceStatusProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-background/80 backdrop-blur rounded-lg">
      {isRecording && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              {formatDuration(duration)}
            </span>
          </div>
          <VoiceWaveform audioLevel={audioLevel} />
        </>
      )}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  )
}
```

#### 3.3 音频波形组件
**文件**: `components/voice/VoiceWaveform.tsx`
```typescript
export function VoiceWaveform({ audioLevel }: { audioLevel: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-1 bg-blue-500 rounded-full transition-all duration-100"
          style={{
            height: `${Math.max(4, audioLevel * 20 * (1 + i * 0.2))}px`
          }}
        />
      ))}
    </div>
  )
}
```

### 阶段四：API接口开发 (1-2天)

#### 4.1 语音转文字接口
**文件**: `app/api/voice/transcribe/route.ts`
```typescript
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    // 文件验证
    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // 调用OpenAI兼容接口
    const transcription = await transcribeAudio(audioFile)

    return NextResponse.json({
      text: transcription.text,
      confidence: transcription.confidence,
      duration: transcription.duration,
      language: transcription.language
    })
  } catch (error) {
    return handleVoiceError(error)
  }
}

async function transcribeAudio(file: File): Promise<VoiceTranscriptionResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('model', 'whisper-1')
  formData.append('language', 'zh')
  formData.append('response_format', 'verbose_json')

  const response = await fetch(process.env.OPENAI_AUDIO_API_URL!, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_AUDIO_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Transcription failed: ${response.statusText}`)
  }

  const result = await response.json()
  return {
    text: result.text,
    confidence: result.confidence || 0.9,
    duration: result.duration,
    language: result.language || 'zh'
  }
}
```

#### 4.2 配置管理接口
**文件**: `app/api/voice/config/route.ts`
```typescript
export async function GET() {
  return NextResponse.json({
    isEnabled: true,
    maxDuration: 60,
    supportedFormats: ['audio/wav', 'audio/webm', 'audio/mp4'],
    sampleRate: 16000,
    language: 'zh'
  })
}

export async function POST(request: Request) {
  const config = await request.json()
  // 保存配置逻辑
  return NextResponse.json({ success: true })
}
```

### 阶段五：主组件集成 (2-3天)

#### 5.1 主语音输入组件
**文件**: `components/voice/VoiceInput.tsx`
```typescript
interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceInput({ onTranscript, disabled, className }: VoiceInputProps) {
  const { permission, requestPermission } = useVoicePermission()
  const { state, startRecording, stopRecording } = useVoiceRecorder(config)
  const { audioLevel } = useAudioVisualization(stream)

  const handleToggle = async () => {
    if (state.isRecording) {
      const audioBlob = await stopRecording()
      await transcribeAudio(audioBlob)
    } else {
      await startRecording()
    }
  }

  return (
    <div className={cn("relative", className)}>
      <VoiceButton
        isRecording={state.isRecording}
        isProcessing={state.isProcessing}
        isEnabled={!disabled && permission === 'granted'}
        onToggle={handleToggle}
      />

      {state.isRecording && (
        <VoiceStatus
          isRecording={state.isRecording}
          duration={state.duration}
          audioLevel={audioLevel}
          error={state.error}
        />
      )}

      {permission !== 'granted' && (
        <VoicePermission onRequest={requestPermission} />
      )}
    </div>
  )
}
```

### 阶段六：集成到现有组件 (1-2天)

#### 6.1 更新ChatInput组件
**文件**: `components/chat-input.tsx`
```typescript
import { VoiceInput } from '@/components/voice/VoiceInput'

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleVoiceTranscript = (text: string) => {
    setMessage(prev => prev + text)
  }

  return (
    <div className="relative flex items-end gap-2 p-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />

      <div className="flex gap-2">
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          disabled={isLoading}
        />
        <Button onClick={() => onSend(message)} disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

#### 6.2 更新InputArea组件
**文件**: `components/input-area.tsx`
```typescript
import { VoiceInput } from '@/components/voice/VoiceInput'

export default function InputArea() {
  const [message, setMessage] = useState("")

  return (
    <div className="p-4 border-t">
      <div className="flex items-end gap-2">
        <TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />

        <div className="flex gap-2">
          <VoiceInput onTranscript={setMessage} />
          <Button onClick={handleSend}>
            <SendOutlined />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 阶段七：配置和优化 (1-2天)

#### 7.1 环境变量配置
**文件**: `.env.example`
```bash
# 语音识别配置
OPENAI_AUDIO_API_URL=http://112.48.22.44:38082/v1/audio/transcriptions
OPENAI_AUDIO_API_KEY=sk-xx

# 语音功能配置
VOICE_MAX_DURATION=60
VOICE_SAMPLE_RATE=16000
VOICE_DEFAULT_LANGUAGE=zh
```

#### 7.2 性能优化
- [ ] 音频数据压缩
- [ ] 请求防抖处理
- [ ] 内存泄漏防护
- [ ] 错误重试机制

#### 7.3 移动端优化
- [ ] 触摸交互优化
- [ ] 屏幕适配
- [ ] 性能优化
- [ ] 电池使用优化

### 阶段八：测试和文档 (1-2天)

#### 8.1 功能测试
- [ ] 桌面端浏览器测试 (Chrome, Firefox, Safari, Edge)
- [ ] 移动端浏览器测试 (iOS Safari, Android Chrome)
- [ ] 权限处理测试
- [ ] 错误场景测试
- [ ] 网络异常测试

#### 8.2 性能测试
- [ ] 录音质量测试
- [ ] 识别准确率测试
- [ ] 响应时间测试
- [ ] 内存使用测试

#### 8.3 文档更新
- [ ] 更新 README.md
- [ ] 创建 API 文档
- [ ] 创建用户使用指南
- [ ] 创建开发者文档

## 技术特性

### 现代化特性
- ✨ **React 18 Concurrent Features**: 使用 Suspense 和 Transitions
- 🎨 **CSS-in-JS**: Tailwind CSS + CSS Variables
- 📱 **响应式设计**: 移动优先的设计理念
- 🔄 **实时反馈**: 音频可视化和状态反馈
- 🛡️ **类型安全**: 完整的 TypeScript 类型定义

### 用户体验优化
- 🎯 **一键录音**: 点击即录，再次点击停止
- 📊 **实时可视化**: 音频波形和音量显示
- ⚡ **快速响应**: 优化的网络请求和缓存
- 🔔 **智能提示**: 详细的错误信息和解决方案
- 🎨 **主题适配**: 支持亮色/暗色主题

### 开发体验优化
- 🧩 **模块化设计**: 可复用的组件和 Hook
- 🔧 **配置灵活**: 环境变量和运行时配置
- 📝 **类型完整**: 完整的 TypeScript 支持
- 🧪 **易于测试**: 清晰的组件边界和依赖注入

## 风险评估和缓解

### 技术风险
1. **浏览器兼容性**: 使用 feature detection 和 polyfill
2. **权限被拒绝**: 提供清晰的权限请求流程
3. **网络异常**: 实现重试机制和离线提示
4. **音频质量**: 多种音频格式支持和质量检测

### 用户体验风险
1. **首次使用困惑**: 提供引导和帮助文档
2. **录音时长过长**: 实现时长限制和提醒
3. **识别准确率**: 提供编辑和重录功能
4. **移动端体验**: 专门的移动端优化

## 成功标准

### 功能标准
- ✅ 支持所有主流浏览器
- ✅ 移动端和桌面端完美适配
- ✅ 语音识别准确率 > 90%
- ✅ 响应时间 < 3秒
- ✅ 错误率 < 1%

### 性能标准
- ✅ 首次加载时间 < 2秒
- ✅ 录音启动时间 < 500ms
- ✅ 内存使用 < 50MB
- ✅ CPU 使用率 < 10%

### 用户体验标准
- ✅ 操作直观，无需学习
- ✅ 错误信息清晰易懂
- ✅ 视觉反馈及时准确
- ✅ 支持键盘和触摸操作

## 项目时间线

| 阶段 | 时间 | 主要任务 | 交付物 |
|------|------|----------|--------|
| 阶段一 | 1-2天 | 基础架构搭建 | 目录结构、类型定义 |
| 阶段二 | 2-3天 | 核心Hook开发 | 录音、权限、可视化Hook |
| 阶段三 | 3-4天 | UI组件开发 | 按钮、状态、波形组件 |
| 阶段四 | 1-2天 | API接口开发 | 转录、配置接口 |
| 阶段五 | 2-3天 | 主组件集成 | VoiceInput主组件 |
| 阶段六 | 1-2天 | 现有组件集成 | ChatInput、InputArea更新 |
| 阶段七 | 1-2天 | 配置和优化 | 性能优化、移动端适配 |
| 阶段八 | 1-2天 | 测试和文档 | 测试报告、使用文档 |

**总计**: 12-20天 (约2-3周)

## 开发进度跟踪

### ✅ 已完成
- [x] 阶段一：基础架构搭建
  - [x] 创建新目录结构
  - [x] 定义TypeScript类型 (`types/voice/index.ts`)
  - [x] 创建配置管理工具 (`lib/voice/config.ts`)
  - [x] 创建错误处理工具 (`lib/voice/errors.ts`)
- [x] 阶段二：核心Hook开发
  - [x] 权限管理Hook (`useVoicePermission.ts`)
  - [x] 录音核心Hook (`useVoiceRecorder.ts`)
  - [x] 音频可视化Hook (`useAudioVisualization.ts`)
  - [x] 配置管理Hook (`useVoiceConfig.ts`)

- [x] 阶段三：UI组件开发
  - [x] 语音按钮组件 (`VoiceButton.tsx`)
  - [x] 音频波形组件 (`VoiceWaveform.tsx`)
  - [x] 语音状态组件 (`VoiceStatus.tsx`)
  - [x] 语音权限组件 (`VoicePermission.tsx`)
- [x] 阶段四：API接口开发
  - [x] 语音转文字接口 (`/api/voice/transcribe`)
  - [x] 配置管理接口 (`/api/voice/config`)
  - [x] 健康检查接口 (`/api/voice/health`)
- [x] 阶段五：主组件集成
  - [x] 主语音输入组件 (`VoiceInput.tsx`)
  - [x] 更新ChatInput组件集成
  - [x] 更新InputArea组件集成

- [x] 阶段六：现有组件集成完善
  - [x] 更新ChatContainer组件
  - [x] 清理旧的VoiceRecorder组件
  - [x] 删除旧的voice-test接口
  - [x] 确保所有引用都已更新

### ✅ 重构完成
**语音功能完全重构已完成！** 🎉

### 🔄 进行中
- [ ] 阶段七：测试和验证

### ⏳ 待开始
- [ ] 阶段八：文档更新和部署

## 下一步行动

1. **立即开始**: 阶段一的基础架构搭建
2. **并行开发**: Hook开发和UI组件可以并行进行
3. **持续测试**: 每个阶段完成后进行功能测试
4. **文档同步**: 开发过程中同步更新文档

---

*此计划基于Next.js 15最新特性和现代Web开发最佳实践制定，确保代码质量、用户体验和可维护性。*
