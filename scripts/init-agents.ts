import { sequelizeInitPromise } from '../lib/db/sequelize';
import AgentConfig from '../lib/db/models/agent-config';
import { DEFAULT_AGENTS } from '../config/default-agents';

// 将默认智能体配置转换为数据库模型格式
const defaultAgentsForDb = DEFAULT_AGENTS.map(agent => ({
  name: agent.name,
  type: agent.type,
  apiKey: agent.apiKey || '',
  appId: agent.appId || '',
  systemPrompt: agent.systemPrompt || '',
  temperature: agent.temperature || 0.7,
  maxTokens: agent.maxTokens || 2000,
  multimodalModel: agent.multimodalModel || '',
  isPublished: true, // 确保所有默认智能体都是已发布状态
  description: agent.description || '',
  order: 100, // 默认排序
}));

(async () => {
  try {
    // 等待数据库连接初始化
    await sequelizeInitPromise;
    console.log('数据库连接成功，开始初始化智能体...');

    // 检查数据库中是否已有智能体
    const existingAgents = await AgentConfig.findAll();
    console.log(`当前数据库中有 ${existingAgents.length} 个智能体`);

    if (existingAgents.length === 0) {
      // 如果没有智能体，则创建默认智能体
      console.log('数据库中没有智能体，创建默认智能体...');
      for (const agent of defaultAgentsForDb) {
        await AgentConfig.create(agent);
        console.log(`已创建智能体: ${agent.name}`);
      }
      console.log('默认智能体创建完成');
    } else {
      // 如果已有智能体，检查是否有已发布的智能体
      const publishedAgents = existingAgents.filter(agent => agent.isPublished);
      console.log(`当前数据库中有 ${publishedAgents.length} 个已发布的智能体`);

      if (publishedAgents.length === 0) {
        // 如果没有已发布的智能体，将第一个智能体设置为已发布
        console.log('没有已发布的智能体，将第一个智能体设置为已发布...');
        const firstAgent = existingAgents[0];
        firstAgent.isPublished = true;
        await firstAgent.save();
        console.log(`已将智能体 ${firstAgent.name} 设置为已发布`);
      }
    }

    console.log('智能体初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('初始化智能体时出错:', error);
    process.exit(1);
  }
})();
