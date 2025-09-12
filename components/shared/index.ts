/**
 * 共享组件库
 * 提供可复用的通用组件，消除代码重复
 */

// 布局组件
export { default as Layout } from './layout'
export { default as Container } from './container'
export { default as Section } from './section'
export { default as Grid } from './grid'
export { default as Flex } from './flex'

// 表单组件
export { default as Form } from './form'
export { default as FormField } from './form-field'
export { default as FormGroup } from './form-group'
export { default as AutoResizeTextarea } from './auto-resize-textarea'
export { default as SearchInput } from './search-input'
export { default as FileUpload } from './file-upload'

// 数据展示组件
export { default as DataTable } from './data-table'
export { default as DataCard } from './data-card'
export { default as DataList } from './data-list'
export { default as DataGrid } from './data-grid'
export { default as StatCard } from './stat-card'
export { default as ProgressBar } from './progress-bar'
export { default as StatusBadge } from './status-badge'

// 交互组件 - 基于成熟库的包装组件
export { default as ConfirmDialog } from './confirm-dialog'

// 反馈组件 - 基于成熟库的包装组件
export { default as LoadingState } from './loading-state'
export { default as EmptyState } from './empty-state'

// 导航组件 - 基于成熟库的包装组件
export { default as Pagination } from './pagination'

// 媒体组件
export { default as Image } from './image'
export { default as Video } from './video'
export { default as Audio } from './audio'
export { default as Gallery } from './gallery'
export { default as MediaViewer } from './media-viewer'

// 业务组件
export { default as ChatMessage } from './chat-message'
export { default as MessageList } from './message-list'
export { default as MessageInput } from './message-input'
export { default as AgentCard } from './agent-card'
export { default as AgentList } from './agent-list'
export { default as HistoryItem } from './history-item'
export { default as HistoryList } from './history-list'

// 工具组件
export { default as CopyButton } from './copy-button'
export { default as DownloadButton } from './download-button'
export { default as ShareButton } from './share-button'
export { default as PrintButton } from './print-button'
export { default as RefreshButton } from './refresh-button'
export { default as BackButton } from './back-button'

// 复合组件
export { default as PageHeader } from './page-header'
export { default as PageContent } from './page-content'
export { default as PageFooter } from './page-footer'
export { default as Card } from './card'
export { default as Panel } from './panel'
export { default as Widget } from './widget'

// 类型定义
export type * from './types'
