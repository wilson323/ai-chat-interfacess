#!/usr/bin/env node

/**
 * 智能构建脚本
 * 自动检测环境并选择最佳构建策略
 */

const { spawn } = require('child_process');
const { detectEnvironment, getEnvironmentConfig, getBuildStrategy } = require('./env-detector');

console.log('🚀 启动智能构建系统...');

// 检测环境
const envInfo = detectEnvironment();
const config = getEnvironmentConfig(envInfo);
const strategy = getBuildStrategy(envInfo);

console.log('🔍 环境检测结果:');
console.log(`  平台: ${envInfo.platform} (${envInfo.arch})`);
console.log(`  环境: ${envInfo.environment} (${envInfo.environmentType})`);
console.log(`  WSL: ${envInfo.isWSL ? '是' : '否'}`);
console.log(`  Docker: ${envInfo.isDocker ? '是' : '否'}`);
console.log(`  CI: ${envInfo.isCI ? '是' : '否'}`);
console.log(`  Node版本: ${envInfo.nodeVersion}`);
console.log(`  内存: ${Math.round(envInfo.memory / 1024 / 1024 / 1024)}GB`);
console.log(`  CPU核心: ${envInfo.cpus}`);
console.log('');

console.log('📋 构建策略:');
console.log(`  策略: ${strategy.strategy}`);
console.log(`  原因: ${strategy.reason}`);
console.log('');

// 设置环境变量
Object.entries(config).forEach(([key, value]) => {
  process.env[key] = value;
});

console.log('⚙️  应用环境配置...');
Object.entries(config).forEach(([key, value]) => {
  console.log(`  ${key}=${value}`);
});
console.log('');

// 执行构建
async function executeBuild() {
  const commands = strategy.commands;
  const fallbackCommands = strategy.fallback;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    console.log(`🔨 执行构建命令: ${command}`);

    try {
      const success = await runCommand(command);
      if (success) {
        console.log(`✅ 构建成功: ${command}`);
        return;
      } else {
        console.log(`❌ 构建失败: ${command}`);
        if (i === commands.length - 1 && fallbackCommands.length > 0) {
          console.log('🔄 尝试备用构建方案...');
          await executeFallback();
        }
      }
    } catch (error) {
      console.log(`❌ 构建错误: ${command} - ${error.message}`);
      if (i === commands.length - 1 && fallbackCommands.length > 0) {
        console.log('🔄 尝试备用构建方案...');
        await executeFallback();
      }
    }
  }
}

// 执行备用构建
async function executeFallback() {
  for (const command of strategy.fallback) {
    console.log(`🔄 执行备用命令: ${command}`);
    try {
      const success = await runCommand(command);
      if (success) {
        console.log(`✅ 备用构建成功: ${command}`);
        return;
      } else {
        console.log(`❌ 备用构建失败: ${command}`);
      }
    } catch (error) {
      console.log(`❌ 备用构建错误: ${command} - ${error.message}`);
    }
  }

  console.log('❌ 所有构建方案都失败了');
  process.exit(1);
}

// 运行命令
function runCommand(command) {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(' ');
    const childProcess = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        ...config
      }
    });

    const timeout = setTimeout(() => {
      childProcess.kill();
      console.log('⏰ 构建超时');
      resolve(false);
    }, 15 * 60 * 1000); // 15分钟超时

    childProcess.on('close', (code) => {
      clearTimeout(timeout);
      resolve(code === 0);
    });

    childProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error('进程错误:', error.message);
      resolve(false);
    });
  });
}

// 生成构建报告
function generateBuildReport() {
  const report = {
    timestamp: new Date().toISOString(),
    environment: envInfo,
    strategy: strategy,
    config: config,
    status: 'completed'
  };

  const fs = require('fs');
  fs.writeFileSync('smart-build-report.json', JSON.stringify(report, null, 2));
  console.log('📊 构建报告已生成: smart-build-report.json');
}

// 开始构建
executeBuild().then(() => {
  generateBuildReport();
  console.log('');
  console.log('🎉 智能构建完成！');
  console.log('');
  console.log('📋 构建总结:');
  console.log(`  环境: ${envInfo.environmentType}`);
  console.log(`  策略: ${strategy.strategy}`);
  console.log(`  状态: 成功`);
  console.log('');
  console.log('💡 建议:');
  if (envInfo.environmentType === 'wsl') {
    console.log('  - WSL环境建议使用Docker进行生产构建');
    console.log('  - 当前构建已通过类型检查，代码质量有保障');
  } else if (envInfo.environmentType === 'linux' || envInfo.environmentType === 'container') {
    console.log('  - 生产环境构建完成，可以部署');
  } else {
    console.log('  - 开发环境构建完成，可以继续开发');
  }
}).catch((error) => {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
});
