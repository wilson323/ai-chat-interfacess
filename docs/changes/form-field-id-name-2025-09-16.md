# 变更说明：表单字段 id/name 与可访问性改进（2025-09-16）

## 背景
部分原生表单控件缺少 `id` 或 `name`，可能影响浏览器自动填充与可访问性（label 绑定、可聚焦性等）。此外，封装的 `Input`、`Textarea` 组件未在未传入 `id` 时自动提供稳定标识。

## 改动内容
- `components/ui/input.tsx`：
  - 引入 `React.useId()`，在未显式传入 `id`/`name` 时自动生成并回退；
  - 保持显式传入的 `id`/`name` 优先级最高；
  - 不改变现有使用处的传参与行为。
- `components/ui/textarea.tsx`：同上，提供 `id`/`name` 的自动回退能力。
- `components/chat/unified-file-upload.tsx`：隐藏文件输入补充 `aria-label` 与 `autoComplete='off'`。
- `components/shared/file-upload.tsx`：隐藏文件输入补充 `id`/`name`、`aria-label` 与 `autoComplete='off'`。
- `components/chat/VoiceChatInput.tsx`：隐藏文件输入补充 `id`/`name`、`aria-label` 与 `autoComplete='off'`。

## 影响评估
- 向下兼容：
  - 显式传入 `id`/`name` 的场景不受影响；
  - 未传入时将获得稳定的 `id` 与 `name`，提升自动填充与无障碍支持。
- 标签绑定：
  - `label` 的 `htmlFor` 应继续与控件 `id` 一致；
  - 对已有明确 `id` 的使用处不产生变化。

## 验证建议
1. 全局类型检查与 Lint：`npm run type-check:strict`、`npm run lint`。
2. 运行测试用例：`npm run test` 或最小集 `npm run test:simple`。
3. 关键页面手测：
   - 管理端用户列表、数据导出、各分析图表筛选区；
   - 聊天输入、语音聊天输入、统一文件上传；
   - 主题演示页交互区域（输入、选择、复选框等）。

## 回滚策略
如出现异常，可回滚上述文件到变更前版本，或在局部显式设置 `id`/`name` 来覆盖默认行为。
