/**
 * 共享组件类型定义
 * 统一的类型定义，确保组件接口一致性
 */

import { ReactNode, CSSProperties, HTMLAttributes } from 'react'

// 基础组件属性
export interface BaseComponentProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode
  id?: string
  'data-testid'?: string
}

// 尺寸变体
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

// 布局组件属性
export interface LayoutProps extends BaseComponentProps {
  direction?: 'row' | 'column'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: number | string
  padding?: number | string
  margin?: number | string
}

export interface ContainerProps extends BaseComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  centered?: boolean
  fluid?: boolean
}

export interface SectionProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export interface GridProps extends BaseComponentProps {
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  gap?: number | string
  responsive?: boolean
}

export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse'
  gap?: number | string
  grow?: boolean | number
  shrink?: boolean | number
  basis?: string | number
}

// 表单组件属性
export interface FormProps extends BaseComponentProps {
  onSubmit?: (data: any) => void | Promise<void>
  onReset?: () => void
  initialValues?: Record<string, any>
  validationSchema?: any
  disabled?: boolean
  loading?: boolean
}

export interface FormFieldProps extends BaseComponentProps {
  name: string
  label?: string
  required?: boolean
  error?: string
  help?: string
  disabled?: boolean
  placeholder?: string
}

export interface FormGroupProps extends BaseComponentProps {
  label?: string
  required?: boolean
  error?: string
  help?: string
  disabled?: boolean
}

export interface AutoResizeTextareaProps extends Omit<HTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  minRows?: number
  maxRows?: number
  disabled?: boolean
  placeholder?: string
  error?: string
}

export interface SearchInputProps extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  clearable?: boolean
  debounceMs?: number
}

export interface FileUploadProps extends BaseComponentProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  loading?: boolean
  onUpload?: (files: File[]) => void | Promise<void>
  onError?: (error: string) => void
  preview?: boolean
  dragAndDrop?: boolean
}

// 数据展示组件属性
export interface DataTableProps<T = any> extends BaseComponentProps {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  pagination?: PaginationProps
  sorting?: SortingProps
  filtering?: FilteringProps
  selection?: SelectionProps
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
}

export interface ColumnDef<T = any> {
  key: string
  title: string
  dataIndex?: keyof T
  render?: (value: any, record: T, index: number) => ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  fixed?: 'left' | 'right'
}

export interface PaginationProps {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => ReactNode
  onChange?: (page: number, pageSize: number) => void
}

export interface SortingProps {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export interface FilteringProps {
  filters?: Record<string, any>
  onFilter?: (filters: Record<string, any>) => void
}

export interface SelectionProps {
  selectedRowKeys?: (string | number)[]
  onSelectionChange?: (selectedRowKeys: (string | number)[]) => void
  rowSelection?: {
    type?: 'checkbox' | 'radio'
    selectedRowKeys?: (string | number)[]
    onChange?: (selectedRowKeys: (string | number)[]) => void
  }
}

export interface DataCardProps<T = any> extends BaseComponentProps {
  data: T
  title?: string | ((record: T) => string)
  description?: string | ((record: T) => string)
  image?: string | ((record: T) => string)
  actions?: ReactNode | ((record: T) => ReactNode)
  onClick?: (record: T) => void
  loading?: boolean
  hoverable?: boolean
}

export interface DataListProps<T = any> extends BaseComponentProps {
  data: T[]
  renderItem: (item: T, index: number) => ReactNode
  loading?: boolean
  empty?: ReactNode
  pagination?: PaginationProps
  onLoadMore?: () => void
  hasMore?: boolean
}

export interface DataGridProps<T = any> extends BaseComponentProps {
  data: T[]
  columns: number
  gap?: number | string
  renderItem: (item: T, index: number) => ReactNode
  loading?: boolean
  empty?: ReactNode
  pagination?: PaginationProps
}

export interface StatCardProps extends BaseComponentProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  icon?: ReactNode
  loading?: boolean
  onClick?: () => void
}

export interface ProgressBarProps extends BaseComponentProps {
  value: number
  max?: number
  size?: Size
  variant?: Variant
  showValue?: boolean
  animated?: boolean
  striped?: boolean
}

export interface StatusBadgeProps extends BaseComponentProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'default'
  text?: string
  size?: Size
  dot?: boolean
}

// 交互组件属性
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  footer?: ReactNode
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  size?: Size
  loading?: boolean
  destroyOnClose?: boolean
}

export interface DrawerProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  footer?: ReactNode
  placement?: 'top' | 'right' | 'bottom' | 'left'
  size?: Size
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
}

export interface PopoverProps extends BaseComponentProps {
  content: ReactNode
  title?: string
  trigger?: 'hover' | 'click' | 'focus'
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  arrow?: boolean
}

export interface TooltipProps extends BaseComponentProps {
  content: ReactNode
  title?: string
  trigger?: 'hover' | 'click' | 'focus'
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  arrow?: boolean
}

export interface DropdownProps extends BaseComponentProps {
  items: DropdownItem[]
  trigger?: 'hover' | 'click' | 'focus'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  disabled?: boolean
}

export interface DropdownItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  divider?: boolean
  onClick?: () => void
  children?: DropdownItem[]
}

export interface TabsProps extends BaseComponentProps {
  items: TabItem[]
  activeKey?: string
  onChange?: (activeKey: string) => void
  type?: 'line' | 'card' | 'editable-card'
  size?: Size
  centered?: boolean
  animated?: boolean
}

export interface TabItem {
  key: string
  label: ReactNode
  children: ReactNode
  disabled?: boolean
  closable?: boolean
  icon?: ReactNode
}

export interface AccordionProps extends BaseComponentProps {
  items: AccordionItem[]
  activeKey?: string | string[]
  onChange?: (activeKey: string | string[]) => void
  multiple?: boolean
  collapsible?: boolean
  ghost?: boolean
}

export interface AccordionItem {
  key: string
  label: ReactNode
  children: ReactNode
  disabled?: boolean
  icon?: ReactNode
}

export interface CarouselProps extends BaseComponentProps {
  items: ReactNode[]
  autoplay?: boolean
  autoplaySpeed?: number
  dots?: boolean
  arrows?: boolean
  infinite?: boolean
  speed?: number
  easing?: string
  beforeChange?: (from: number, to: number) => void
  afterChange?: (current: number) => void
}

// 反馈组件属性
export interface AlertProps extends BaseComponentProps {
  type?: 'success' | 'info' | 'warning' | 'error'
  message: ReactNode
  description?: ReactNode
  showIcon?: boolean
  closable?: boolean
  onClose?: () => void
  banner?: boolean
}

export interface ToastProps extends BaseComponentProps {
  type?: 'success' | 'info' | 'warning' | 'error'
  message: ReactNode
  description?: ReactNode
  duration?: number
  closable?: boolean
  onClose?: () => void
}

export interface LoadingProps extends BaseComponentProps {
  size?: Size
  text?: string
  spinning?: boolean
  tip?: string
}

export interface EmptyProps extends BaseComponentProps {
  image?: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export interface SkeletonProps extends BaseComponentProps {
  active?: boolean
  loading?: boolean
  avatar?: boolean | SkeletonAvatarProps
  title?: boolean | SkeletonTitleProps
  paragraph?: boolean | SkeletonParagraphProps
}

export interface SkeletonAvatarProps {
  size?: Size | number
  shape?: 'circle' | 'square'
}

export interface SkeletonTitleProps {
  width?: number | string
}

export interface SkeletonParagraphProps {
  rows?: number
  width?: number | string | (number | string)[]
}

// 导航组件属性
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  maxItems?: number
  overflowedIndicator?: ReactNode
}

export interface BreadcrumbItem {
  title: ReactNode
  href?: string
  onClick?: () => void
  icon?: ReactNode
}

export interface StepperProps extends BaseComponentProps {
  current: number
  items: StepperItem[]
  direction?: 'horizontal' | 'vertical'
  size?: Size
  status?: 'wait' | 'process' | 'finish' | 'error'
  onChange?: (current: number) => void
}

export interface StepperItem {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  status?: 'wait' | 'process' | 'finish' | 'error'
}

export interface MenuProps extends BaseComponentProps {
  items: MenuItem[]
  mode?: 'horizontal' | 'vertical' | 'inline'
  theme?: 'light' | 'dark'
  selectedKeys?: string[]
  openKeys?: string[]
  onSelect?: (selectedKeys: string[]) => void
  onOpenChange?: (openKeys: string[]) => void
}

export interface MenuItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  children?: MenuItem[]
  onClick?: () => void
}

// 媒体组件属性
export interface ImageProps extends BaseComponentProps {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  placeholder?: ReactNode
  fallback?: ReactNode
  onLoad?: () => void
  onError?: () => void
}

export interface VideoProps extends BaseComponentProps {
  src: string
  poster?: string
  width?: number | string
  height?: number | string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  onLoad?: () => void
  onError?: () => void
}

export interface AudioProps extends BaseComponentProps {
  src: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  onLoad?: () => void
  onError?: () => void
}

export interface GalleryProps extends BaseComponentProps {
  items: GalleryItem[]
  current?: number
  onChange?: (current: number) => void
  onClose?: () => void
  visible?: boolean
  preview?: boolean
  thumbnails?: boolean
}

export interface GalleryItem {
  src: string
  alt?: string
  title?: string
  description?: string
}

export interface MediaViewerProps extends BaseComponentProps {
  type: 'image' | 'video' | 'audio'
  src: string
  visible?: boolean
  onClose?: () => void
  title?: string
  description?: string
}

// 业务组件属性
export interface ChatMessageProps extends BaseComponentProps {
  message: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    status?: 'sending' | 'sent' | 'failed'
    metadata?: Record<string, any>
  }
  onRegenerate?: () => void
  onCopy?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onRetry?: () => void
  loading?: boolean
  streaming?: boolean
}

export interface MessageListProps extends BaseComponentProps {
  messages: ChatMessageProps['message'][]
  loading?: boolean
  streaming?: boolean
  onRegenerate?: (messageId: string) => void
  onCopy?: (messageId: string) => void
  onEdit?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onRetry?: (messageId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export interface MessageInputProps extends BaseComponentProps {
  value?: string
  onChange?: (value: string) => void
  onSend?: (message: string) => void
  onFileUpload?: (files: File[]) => void
  onVoiceRecord?: () => void
  onVoiceStop?: () => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  maxLength?: number
  showFileUpload?: boolean
  showVoiceInput?: boolean
  showSendButton?: boolean
  autoFocus?: boolean
  autoResize?: boolean
}

export interface AgentCardProps extends BaseComponentProps {
  agent: {
    id: string
    name: string
    description?: string
    type: string
    status: 'active' | 'inactive' | 'error'
    avatar?: string
    metadata?: Record<string, any>
  }
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggle?: () => void
  selected?: boolean
  loading?: boolean
}

export interface AgentListProps extends BaseComponentProps {
  agents: AgentCardProps['agent'][]
  loading?: boolean
  onSelect?: (agentId: string) => void
  onEdit?: (agentId: string) => void
  onDelete?: (agentId: string) => void
  onToggle?: (agentId: string) => void
  selectedAgentId?: string
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
}

export interface HistoryItemProps extends BaseComponentProps {
  history: {
    id: string
    title: string
    timestamp: Date
    messageCount: number
    agentId?: string
    agentName?: string
    metadata?: Record<string, any>
  }
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onRename?: (newTitle: string) => void
  selected?: boolean
  loading?: boolean
}

export interface HistoryListProps extends BaseComponentProps {
  histories: HistoryItemProps['history'][]
  loading?: boolean
  onSelect?: (historyId: string) => void
  onEdit?: (historyId: string) => void
  onDelete?: (historyId: string) => void
  onRename?: (historyId: string, newTitle: string) => void
  selectedHistoryId?: string
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  pagination?: PaginationProps
}

// 工具组件属性
export interface CopyButtonProps extends BaseComponentProps {
  text: string
  onCopy?: (text: string) => void
  onError?: (error: Error) => void
  successText?: string
  duration?: number
  disabled?: boolean
  loading?: boolean
}

export interface DownloadButtonProps extends BaseComponentProps {
  url?: string
  filename?: string
  data?: Blob | string
  onDownload?: () => void
  onError?: (error: Error) => void
  disabled?: boolean
  loading?: boolean
}

export interface ShareButtonProps extends BaseComponentProps {
  url?: string
  title?: string
  text?: string
  onShare?: () => void
  onError?: (error: Error) => void
  disabled?: boolean
  loading?: boolean
}

export interface PrintButtonProps extends BaseComponentProps {
  content?: ReactNode
  onPrint?: () => void
  onError?: (error: Error) => void
  disabled?: boolean
  loading?: boolean
}

export interface RefreshButtonProps extends BaseComponentProps {
  onRefresh?: () => void
  disabled?: boolean
  loading?: boolean
  interval?: number
  autoRefresh?: boolean
}

export interface BackButtonProps extends BaseComponentProps {
  onBack?: () => void
  disabled?: boolean
  loading?: boolean
  fallbackUrl?: string
}

// 复合组件属性
export interface PageHeaderProps extends BaseComponentProps {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
  actions?: ReactNode
  backButton?: boolean
  onBack?: () => void
}

export interface PageContentProps extends BaseComponentProps {
  loading?: boolean
  error?: string
  empty?: boolean
  emptyText?: string
  onRetry?: () => void
}

export interface PageFooterProps extends BaseComponentProps {
  copyright?: string
  links?: Array<{
    label: string
    href: string
    external?: boolean
  }>
}

export interface CardProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  loading?: boolean
  hoverable?: boolean
  bordered?: boolean
  shadow?: boolean
  onClick?: () => void
}

export interface PanelProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  loading?: boolean
  bordered?: boolean
  shadow?: boolean
}

export interface WidgetProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  loading?: boolean
  error?: string
  onRetry?: () => void
  size?: Size
  variant?: Variant
}

// 确认对话框组件类型
export interface ConfirmDialogProps extends BaseComponentProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  loading?: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

// 加载状态组件类型
export interface LoadingStateProps extends BaseComponentProps {
  type?: 'skeleton' | 'spinner' | 'dots' | 'progress'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  text?: string
  progress?: number
}

// 空状态组件类型
export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode | string
  title?: string
  description?: string
  action?: ReactNode
  actionText?: string
  onAction?: () => void
  size?: 'sm' | 'default' | 'lg' | 'xl'
}

// 分页组件类型（更新）
export interface PaginationProps extends BaseComponentProps {
  currentPage?: number
  totalPages?: number
  totalItems?: number
  itemsPerPage?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  pageSizeOptions?: number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  disabled?: boolean
}
