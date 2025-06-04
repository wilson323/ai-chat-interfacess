import { sequelizeInitPromise } from '../lib/db/sequelize';
import AgentConfig from '../lib/db/models/agent-config';

const agentsToEnsure = [
  {
    name: '默认智能体',
    type: 'fastgpt',
    apiKey: 'demo-key',
    appId: 'demo-app',
    systemPrompt: '你是一个专业的AI助手。',
    temperature: 0.7,
    maxTokens: 2000,
    isPublished: true,
    multimodalModel: '',
  },
  {
    name: 'NeuroGlass 助手',
    type: 'chat',
    apiKey: '',
    appId: '',
    systemPrompt: '你是一位专业、友好的AI助手，能够回答用户的各种问题并提供帮助。',
    temperature: 0.7,
    maxTokens: 2000,
    isPublished: true,
    multimodalModel: '',
  },
  {
    name: 'CAD解读智能体',
    type: 'cad-analyzer',
    apiKey: '',
    appId: '',
    systemPrompt: '你是一位专业的安防系统工程师和CAD图纸分析专家，能够分析CAD图纸并提供详细的安防设备分析报告。',
    temperature: 0.7,
    maxTokens: 4000,
    isPublished: true,
    multimodalModel: 'qwen-vl-max',
  },
  {
    name: '图像编辑器',
    type: 'image-editor',
    apiKey: '',
    appId: '',
    systemPrompt: '你是一位专业的图像编辑助手，能够帮助用户处理和编辑图像。',
    temperature: 0.7,
    maxTokens: 2000,
    isPublished: true,
    multimodalModel: 'qwen-vl-max',
  },
];

(async () => {
  console.log('开始数据库连接验证和数据初始化...');
  await sequelizeInitPromise;

  console.log('检查并初始化必要的智能体数据...');
  for (const agent of agentsToEnsure) {
    const exists = await AgentConfig.findOne({ where: { name: agent.name } });
    if (!exists) {
      await AgentConfig.create(agent);
      console.log(`已自动插入智能体: ${agent.name}`);
    } else {
      console.log(`智能体已存在: ${agent.name}`);
    }
  }

  console.log('数据库连接验证和数据初始化完成（生产环境模式）');
  console.log('注意：表结构同步已禁用，如需同步请使用管理员界面手动操作');
  process.exit(0);
})();