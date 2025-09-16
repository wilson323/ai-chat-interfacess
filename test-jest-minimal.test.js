// Jest最小化测试
describe('Jest最小化测试', () => {
  test('基本测试功能', () => {
    expect(1 + 1).toBe(2);
  });

  test('字符串测试', () => {
    expect('hello').toBe('hello');
  });

  test('对象测试', () => {
    const obj = { name: 'test' };
    expect(obj.name).toBe('test');
  });
});
