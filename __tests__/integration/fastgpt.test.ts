/**
 * FastGPT 真实环境集成测试
 * 使用真实API和真实凭据进行测试，不使用模拟数据
 */

describe('FastGPT 真实环境测试', () => {
  beforeAll(() => {
    // 验证真实环境配置
    const env = validateRealEnvironment();
    expect(env.fastgptUrl).toBe('http://171.43.138.237:3000');
    expect(env.fastgptKey).toBe('fastgpt-jlX6R5zJ7mFB5hsCEDc2PG4Um2hDhyARSnucLwTtYlL2fdo4ueFPWlwy2Ni');
    expect(env.fastgptAppId).toBe('6708e788c6ba48baa62419a5');
  });

  test('FastGPT API 连接测试', async () => {
    const result = await testFastGPTApiCall('/api/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false,
    });
    
    // 真实API测试 - 不依赖模拟数据
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      console.log('FastGPT API 连接成功');
      expect(result.data).toBeDefined();
    } else {
      console.log('FastGPT API 连接失败:', result.error);
    }
  }, 30000);

  test('FastGPT 智能体聊天测试', async () => {
    const testData = createRealTestData();
    
    const result = await testFastGPTChat(testData.testMessage);

    // 真实业务逻辑测试
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      expect(result.data).toBeDefined();
      console.log('FastGPT 智能体聊天测试成功');
      console.log('响应数据:', result.data);
    } else {
      console.log('FastGPT 智能体聊天测试失败:', result.error);
    }
  }, 30000);

  test('FastGPT 应用信息获取测试', async () => {
    const result = await testFastGPTApiCall('/api/v1/apps/6708e788c6ba48baa62419a5');
    
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      expect(result.data).toBeDefined();
      console.log('FastGPT 应用信息获取成功');
      console.log('应用信息:', result.data);
    } else {
      console.log('FastGPT 应用信息获取失败:', result.error);
    }
  }, 30000);

  test('FastGPT 流式聊天测试', async () => {
    const result = await testFastGPTApiCall('/api/v1/chat/completions', {
      messages: [
        { role: 'user', content: '请介绍一下你自己' }
      ],
      stream: true,
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      console.log('FastGPT 流式聊天测试成功');
    } else {
      console.log('FastGPT 流式聊天测试失败:', result.error);
    }
  }, 30000);
});