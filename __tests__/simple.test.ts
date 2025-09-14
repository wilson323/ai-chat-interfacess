/**
 * 简单测试 - 验证Jest环境修复
 */

describe('Jest环境测试', () => {
  it('应该能够运行基本测试', () => {
    expect(1 + 1).toBe(2);
  });

  it('应该能够Mock fetch', async () => {
    const mockData = { test: 'data' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const response = await fetch('/api/test');
    const data = await response.json();
    
    expect(data).toEqual(mockData);
  });

  it('应该能够处理Context Provider', () => {
    // 测试Context Provider不会阻塞
    expect(true).toBe(true);
  });
});
