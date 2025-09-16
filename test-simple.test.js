// 简单测试文件
describe('Simple Test', () => {
  test('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle async', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
