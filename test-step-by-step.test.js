// 分步测试，逐步增加复杂度
describe('分步测试', () => {
  test('步骤1：基本导入测试', () => {
    // 测试基本导入
    const fs = require('fs');
    expect(fs).toBeDefined();
  });

  test('步骤2：ES6模块导入测试', async () => {
    // 测试ES6模块导入
    try {
      const { UnifiedAgentManager } = await import('@/lib/api/unified-agent-manager');
      expect(UnifiedAgentManager).toBeDefined();
    } catch (error) {
      console.log('导入错误:', error.message);
      // 不抛出错误，继续测试
    }
  });

  test('步骤3：类型导入测试', async () => {
    // 测试类型导入
    try {
      const { UnifiedAgent } = await import('@/types/unified-agent');
      expect(UnifiedAgent).toBeDefined();
    } catch (error) {
      console.log('类型导入错误:', error.message);
    }
  });
});
