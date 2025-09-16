#!/usr/bin/env node

/**
 * 修复剩余类型错误脚本
 * 专门处理API路由、组件和其他文件的类型问题
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 修复API路由中的类型问题
function fixApiRouteTypes() {
  log('🔧 修复API路由类型问题...', 'cyan');

  const apiFiles = [
    'app/api/admin/agent-config/route.ts',
    'app/api/admin/analytics/advanced/route.ts',
    'app/api/admin/analytics/export/route.ts',
    'app/api/admin/cad-history/export-single/route.ts',
    'app/api/admin/cad-history/export/route.ts',
    'app/api/admin/custom-agent-storage/clear/route.ts',
    'app/api/admin/custom-agent-storage/export/route.ts',
    'app/api/admin/custom-agent-storage/stats/route.ts',
    'app/api/admin/db-schema/approval/route.ts',
    'app/api/admin/db-schema/preview/route.ts',
    'app/api/admin/db-schema/route.ts',
    'app/api/admin/db-schema/tables/route.ts',
    'app/api/admin/db/init-data/route.ts',
    'app/api/admin/errors/route.ts',
    'app/api/admin/heatmap/data/route.ts',
    'app/api/admin/heatmap/export/route.ts',
    'app/api/admin/heatmap/realtime/route.ts',
    'app/api/admin/heatmap/route.ts',
    'app/api/admin/image-editor-config/route.ts',
    'app/api/admin/image-editor-history/[id]/route.ts',
    'app/api/admin/image-editor-history/route.ts',
    'app/api/admin/login/route.ts',
    'app/api/admin/model-config/route.ts',
    'app/api/admin/redis/health/route.ts',
    'app/api/admin/redis/stats/route.ts',
    'app/api/admin/reset-password/route.ts',
    'app/api/admin/security/scan/route.ts',
    'app/api/admin/system/config/route.ts',
    'app/api/admin/users/[id]/route.ts',
    'app/api/admin/users/bulk/route.ts',
    'app/api/admin/users/route.ts',
    'app/api/agent-config/route.ts',
    'app/api/agent-sync/route.ts',
    'app/api/analytics/agent-usage/route.ts',
    'app/api/analytics/comparison/route.ts',
    'app/api/analytics/export/route.ts',
    'app/api/analytics/line-chart/route.ts',
    'app/api/analytics/real-time/route.ts',
    'app/api/cad-analyzer/analyze/route.ts',
    'app/api/cad-analyzer/history/route.ts',
    'app/api/chat-history/route.ts',
    'app/api/chat-proxy/route.ts',
    'app/api/example/route.ts',
    'app/api/fastgpt-multi-agent/route.ts',
    'app/api/fastgpt/suggestions/route.ts',
    'app/api/get-config/route.ts',
    'app/api/health/route.ts',
    'app/api/image-proxy/route.ts',
    'app/api/log-transcription/route.ts',
    'app/api/message-feedback/route.ts',
    'app/api/voice/xunfei-token/route.ts'
  ];

  let fixedFiles = 0;

  apiFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;

        // 修复常见的类型问题
        // 1. 修复 any 类型使用
        if (content.includes(': any')) {
          newContent = newContent.replace(/: any/g, ': unknown');
          modified = true;
        }

        // 2. 修复未使用的变量
        if (content.includes('const data =') && !content.includes('data.')) {
          newContent = newContent.replace(/const data = [^;]+;/g, '// const data = ...; // 未使用');
          modified = true;
        }

        // 3. 修复未使用的参数
        if (content.includes('async (data:') && !content.includes('data.')) {
          newContent = newContent.replace(/async \(data:/g, 'async (_data:');
          modified = true;
        }

        // 4. 修复未使用的 id 参数
        if (content.includes('async (id:') && !content.includes('id.')) {
          newContent = newContent.replace(/async \(id:/g, 'async (_id:');
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(filePath, newContent);
          log(`  ✅ 修复: ${filePath}`, 'green');
          fixedFiles++;
        }
      } catch (error) {
        log(`  ❌ 处理失败: ${filePath} - ${error.message}`, 'red');
      }
    }
  });

  log(`  📊 修复了 ${fixedFiles} 个API文件`, 'blue');
  return fixedFiles;
}

// 修复组件中的类型问题
function fixComponentTypes() {
  log('🎨 修复组件类型问题...', 'cyan');

  const componentFiles = [
    'components/admin/agent-form.tsx',
    'components/admin/agent-list.tsx',
    'components/admin/analytics/AgentPerformanceAnalytics.tsx',
    'components/admin/analytics/ChartGrid.tsx',
    'components/admin/analytics/ConversationBusinessAnalytics.tsx',
    'components/admin/analytics/PredictionDashboard.tsx',
    'components/admin/analytics/UserBehaviorAnalytics.tsx',
    'components/admin/db-admin-panel.tsx',
    'components/admin/db-schema/ExportActions.tsx',
    'components/admin/debug-panel.tsx',
    'components/admin/model-config/ModelConfigForm.tsx',
    'components/admin/model-config/ModelMonitor.tsx',
    'components/admin/performance/BenchmarkCharts.tsx',
    'components/admin/performance/BenchmarkTool.tsx',
    'components/admin/performance/MobilePerformance.tsx',
    'components/admin/performance/OptimizationEngine.tsx',
    'components/admin/performance/OptimizationList.tsx',
    'components/admin/performance/OptimizationOverview.tsx',
    'components/admin/performance/PerformanceAlerts.tsx',
    'components/admin/performance/PerformanceDashboard.tsx',
    'components/admin/performance/RealtimeCharts.tsx',
    'components/admin/user-management/user-detail.tsx',
    'components/admin/user-management/user-form.tsx',
    'components/admin/user-management/user-list.tsx',
    'components/agent-dialog.tsx',
    'components/analytics/AgentUsageChart.tsx',
    'components/analytics/ComparisonChart.tsx',
    'components/analytics/DataExport.tsx',
    'components/analytics/LineChart.tsx',
    'components/analytics/RealTimeMonitor.tsx',
    'components/business/AgentCard.tsx',
    'components/business/MessageCard.tsx',
    'components/cad-analyzer/cad-analyzer-container.tsx',
    'components/chat-history.tsx',
    'components/chat-message.tsx',
    'components/chat/ChatMessages.tsx',
    // 'components/chat/MultiAgentChatContainer.tsx', // deprecated, do not auto-fix
    'components/chat/unified-chat-container.tsx',
    'components/chat/unified-file-upload.tsx',
    'components/chat/unified-input.tsx',
    'components/chat/unified-markdown.tsx',
    'components/chat/unified-message-list.tsx',
    'components/chat/VoiceChatInput.tsx',
    'components/cross-platform/adaptive-layout.tsx',
    'components/cross-platform/cross-platform-provider.tsx',
    'components/cross-platform/responsive-layout.tsx',
    'components/cross-platform/responsive-media.tsx',
    'components/cross-platform/touch-gestures.tsx',
    'components/file-uploader.tsx',
    'components/global-variables-form.tsx',
    'components/header.tsx',
    'components/history-manager.tsx',
    'components/history-sidebar.tsx',
    'components/history/history-list.tsx',
    'components/image-editor/image-editor-container.tsx',
    'components/image-editor/image-editor.tsx',
    'components/inline-bubble-interactive.tsx',
    'components/input-area.tsx',
    'components/intermediate-values-display.tsx',
    'components/layout.tsx',
    'components/lazy-image.tsx',
    'components/markdown-message.tsx',
    'components/mobile-nav.tsx',
    'components/modern-ux/enhanced-user-experience.tsx',
    'components/settings-dialog.tsx',
    'components/shared/data-card.tsx',
    'components/shared/file-upload.tsx',
    'components/shared/types.ts',
    'components/theme/theme-card.tsx',
    'components/theme/theme-selector.tsx',
    'components/ui/calendar.tsx',
    'components/virtualized-message-list.tsx',
    'components/voice/VoicePlayer.tsx',
    'components/voice/VoiceRecorder.tsx',
    'components/voice/VoiceSettings.tsx',
    'components/welcome-message.tsx'
  ];

  let fixedFiles = 0;

  componentFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;

        // 修复常见的组件类型问题
        // 1. 修复未使用的导入
        if (content.includes('import React, { useState, useEffect, createElement } from \'react\';')) {
          const reactHooksUsage = content.match(/(useState|useEffect|createElement)/g);
          if (!reactHooksUsage || reactHooksUsage.length === 0) {
            newContent = newContent.replace(
              'import React, { useState, useEffect, createElement } from \'react\';',
              'import React from \'react\';'
            );
            modified = true;
          }
        }

        // 2. 修复未使用的变量
        if (content.includes('const data =') && !content.includes('data.')) {
          newContent = newContent.replace(/const data = [^;]+;/g, '// const data = ...; // 未使用');
          modified = true;
        }

        // 3. 修复未使用的参数
        if (content.includes('(data:') && !content.includes('data.')) {
          newContent = newContent.replace(/\(data:/g, '(_data:');
          modified = true;
        }

        // 4. 修复未使用的 id 参数
        if (content.includes('(id:') && !content.includes('id.')) {
          newContent = newContent.replace(/\(id:/g, '(_id:');
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(filePath, newContent);
          log(`  ✅ 修复: ${filePath}`, 'green');
          fixedFiles++;
        }
      } catch (error) {
        log(`  ❌ 处理失败: ${filePath} - ${error.message}`, 'red');
      }
    }
  });

  log(`  📊 修复了 ${fixedFiles} 个组件文件`, 'blue');
  return fixedFiles;
}

// 修复数据库模型类型问题
function fixDatabaseModelTypes() {
  log('🗄️ 修复数据库模型类型问题...', 'cyan');

  const modelFiles = [
    'lib/db/models/agent-config.ts',
    'lib/db/models/agent-usage.ts',
    'lib/db/models/db-schema.ts',
    'lib/db/models/operation-log.ts',
    'lib/db/models/user-geo.ts',
    'lib/db/models/user.ts',
    'lib/db/models/UserGeo.ts'
  ];

  let fixedFiles = 0;

  modelFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;

        // 修复类型导出问题
        if (content.includes('export {') && content.includes('export type')) {
          // 将普通导出改为类型导出
          newContent = newContent.replace(
            /export\s*{\s*(\w+),\s*(\w+),\s*(\w+)\s*};/g,
            'export type { $1, $2, $3 };'
          );
          modified = true;
        }

        // 修复未使用的导入
        if (content.includes('import { DataTypes, Model, Optional } from \'sequelize\';')) {
          const optionalUsage = content.match(/Optional</g);
          if (!optionalUsage || optionalUsage.length === 0) {
            newContent = newContent.replace(
              'import { DataTypes, Model, Optional } from \'sequelize\';',
              'import { DataTypes, Model } from \'sequelize\';'
            );
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, newContent);
          log(`  ✅ 修复: ${filePath}`, 'green');
          fixedFiles++;
        }
      } catch (error) {
        log(`  ❌ 处理失败: ${filePath} - ${error.message}`, 'red');
      }
    }
  });

  log(`  📊 修复了 ${fixedFiles} 个模型文件`, 'blue');
  return fixedFiles;
}

// 主函数
function main() {
  log('🔧 开始修复剩余类型错误...', 'bold');
  log('=' .repeat(50), 'blue');

  let totalFixed = 0;

  // 修复API路由类型问题
  const apiFixed = fixApiRouteTypes();
  totalFixed += apiFixed;

  // 修复组件类型问题
  const componentFixed = fixComponentTypes();
  totalFixed += componentFixed;

  // 修复数据库模型类型问题
  const modelFixed = fixDatabaseModelTypes();
  totalFixed += modelFixed;

  log('\n' + '=' .repeat(50), 'blue');
  log(`🎉 修复完成！共修复了 ${totalFixed} 个文件`, 'green');

  if (totalFixed > 0) {
    log('💡 建议运行 npm run type-check 验证修复结果', 'yellow');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  fixApiRouteTypes,
  fixComponentTypes,
  fixDatabaseModelTypes
};
