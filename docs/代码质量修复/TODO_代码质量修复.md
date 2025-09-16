# TODO清单 - 代码质量修复

## 🎯 核心任务待办

### 1. any类型修复 (剩余约540个)

**优先级**: 🔴 高
**预估工作量**: 2-3周

#### 核心文件待修复:

- `lib/services/advanced-analytics.ts` (剩余约20个)
- `lib/api/fastgpt/index.ts` (约17个)
- `lib/api/fastgpt/intelligent-client.ts` (约8个)
- `lib/api/fastgpt/multi-agent-manager.ts` (约3个)
- `lib/debug-utils.ts` (约7个)
- `lib/errors/global-error-handler.ts` (约10个)
- `lib/cross-platform-utils.ts` (约6个)
- `lib/utils/logger.ts` (约6个)
- `lib/utils/index.ts` (约4个)

#### API路由文件:

- `app/api/analytics/export/route.ts` (约6个)
- `app/api/analytics/comparison/route.ts` (约4个)
- `app/api/analytics/agent-usage/route.ts` (约7个)
- `app/api/analytics/line-chart/route.ts` (约8个)
- `app/api/admin/analytics/export/route.ts` (约5个)

### 2. Function类型修复 (剩余约26个)

**优先级**: 🟡 中
**预估工作量**: 1周

#### 待修复文件:

- `app/api/admin/performance/route.ts` (1个)
- 其他中间件和回调函数文件

### 3. require导入转换 (剩余约162个)

**优先级**: 🟡 中
**预估工作量**: 1-2周

#### 测试文件:

- `__tests__/core-functionality.test.ts` (约22个)
- `__tests__/functionality.test.ts` (约12个)
- `__tests__/api/unit/cad-analyzer.test.ts` (约20个)
- `__tests__/api/unit/chat-history.test.ts` (约6个)

#### 脚本文件:

- `scripts/` 目录下的多个文件

### 4. 未使用变量清理 (约50+个)

**优先级**: 🟢 低
**预估工作量**: 3-5天

#### 主要问题:

- 未使用的导入语句
- 声明但未使用的变量
- 未使用的函数参数

### 5. 匿名导出修复 (约20+个)

**优先级**: 🟢 低
**预估工作量**: 2-3天

#### 主要问题:

- 匿名默认导出
- 缺少命名的导出

### 6. React Hook依赖修复 (约10+个)

**优先级**: 🟢 低
**预估工作量**: 2-3天

#### 主要问题:

- useEffect依赖数组不完整
- useCallback依赖缺失

## 🛠️ 工具和配置

### 需要安装的依赖

```bash
# 修复ESLint依赖问题
npm install @eslint/eslintrc --save-dev

# 安装缺失的依赖包
npm install jszip jspdf xlsx --save
```

### ESLint配置优化

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-function-type": "error",
    "@typescript-eslint/no-require-imports": "error"
  }
}
```

## 📋 执行计划

### 第1周

- [ ] 修复`lib/services/advanced-analytics.ts`中剩余的any类型
- [ ] 修复`lib/api/fastgpt/`目录下的any类型
- [ ] 修复核心API路由中的any类型

### 第2周

- [ ] 修复`lib/debug-utils.ts`和`lib/errors/`目录
- [ ] 修复`lib/utils/`目录下的类型问题
- [ ] 修复`app/api/analytics/`目录下的类型问题

### 第3周

- [ ] 完成剩余的Function类型修复
- [ ] 开始require导入转换工作
- [ ] 修复测试文件中的require导入

### 第4周

- [ ] 完成require导入转换
- [ ] 清理未使用的变量
- [ ] 修复匿名导出问题

### 第5周

- [ ] 修复React Hook依赖问题
- [ ] 代码格式化优化
- [ ] 最终验证和测试

## 🔍 质量检查清单

### 每个修复任务完成后检查:

- [ ] TypeScript编译通过 (`npx tsc --noEmit`)
- [ ] ESLint检查通过 (`npm run lint`)
- [ ] 功能测试通过
- [ ] 类型覆盖率提升

### 最终验收标准:

- [ ] 所有any类型已修复
- [ ] 所有Function类型已修复
- [ ] 所有require导入已转换
- [ ] 未使用变量已清理
- [ ] 匿名导出已修复
- [ ] Hook依赖已修复
- [ ] 代码覆盖率 > 80%
- [ ] 性能无显著下降

## 📚 参考资料

### 类型定义文件

- `types/index.ts` - 统一类型导出中心
- `types/api/fastgpt.d.ts` - FastGPT API类型
- `types/admin.ts` - 管理后台类型
- `types/message.ts` - 消息类型
- `types/voice/index.ts` - 语音功能类型

### 编码规范文档

- `docs/TypeScript类型安全规范.md`
- `docs/代码规范/代码开发规范与流程文档.md`
- `.cursor/rules/typescript-type-safety.mdc`

### 工具和脚本

- `scripts/check-code-standards.ts` - 代码标准检查
- `scripts/check-type-safety.ts` - 类型安全检查
- `scripts/code-quality-check.js` - 代码质量检查
