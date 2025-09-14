import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 移动端测试全局清理开始...');

  // 清理测试数据
  try {
    // 这里可以添加清理逻辑，比如清理测试文件、重置数据库等
    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.log('⚠️ 测试数据清理失败:', error);
  }

  console.log('✅ 移动端测试全局清理完成');
}

export default globalTeardown;
