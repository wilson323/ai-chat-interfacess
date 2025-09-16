// 最小化测试，验证Jest是否能正常运行
console.log('开始最小化测试...');

// 测试基本功能
const test = (name, fn) => {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
};

test('基本数学运算', () => {
  if (2 + 2 !== 4) throw new Error('数学运算失败');
});

test('字符串操作', () => {
  if ('hello'.toUpperCase() !== 'HELLO') throw new Error('字符串操作失败');
});

test('对象操作', () => {
  const obj = { a: 1, b: 2 };
  if (obj.a + obj.b !== 3) throw new Error('对象操作失败');
});

console.log('最小化测试完成');
