// 添加这些函数来增强安全性

/**
 * 检测并阻止潜在的XSS攻击
 */
export function detectXSSAttempt(input: string): boolean {
  // 检测常见的XSS攻击模式
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi,
    /\bdata\s*:/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * 检测并阻止潜在的SQL注入攻击
 */
export function detectSQLInjection(input: string): boolean {
  // 检测常见的SQL注入模式
  const sqlPatterns = [
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /'\s*OR\s*1\s*=\s*1/i,
    /'\s*;\s*DROP\s+TABLE/i,
    /'\s*;\s*DELETE\s+FROM/i,
    /'\s*UNION\s+SELECT/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * 增强的输入验证函数
 */
export function validateInput(input: string): boolean {
  // 检查是否为空
  if (!input || input.trim() === '') return false;

  // 检查长度限制
  if (input.length > 10000) return false;

  // 检查XSS攻击
  if (detectXSSAttempt(input)) return false;

  // 检查SQL注入
  if (detectSQLInjection(input)) return false;

  return true;
}

/**
 * 增强的输入过滤函数
 */
export function sanitizeInput(input: string): string {
  // 移除HTML标签
  let sanitized = input.replace(/<[^>]*>/g, '');

  // 移除JavaScript代码
  sanitized = sanitized.replace(/javascript:[\s\S]*?;/gi, '');

  // 移除其他潜在的恶意代码
  sanitized = sanitized.replace(/vbscript:[\s\S]*?;/gi, '');

  // 移除SQL注入字符
  sanitized = sanitized
    .replace(/'/g, '') // 移除单引号
    .replace(/;/g, '') // 移除分号
    .replace(/--/g, '') // 移除SQL注释
    .replace(/\/\*|\*\//g, '') // 移除块注释
    .replace(/#/g, ''); // 移除井号注释

  return sanitized.trim();
}

/**
 * SQL注入防护 - 清理用户输入
 */
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/'/g, "''") // 正确转义单引号 - 用两个单引号替换一个
    .replace(/;/g, '') // 移除分号
    .replace(/--/g, '') // 移除SQL注释
    .replace(/\/\*|\*\//g, '') // 移除块注释
    .replace(/#/g, '') // 移除井号注释
    .trim();
}

/**
 * 检测路径遍历攻击
 */
export function detectPathTraversal(path: string): boolean {
  const pathTraversalPatterns = [
    /\.\.\//, // ../
    /\.\.\\/, // ..\
    /%2e%2e%2f/i, // URL编码的 ../
    /%2e%2e\\/i, // URL编码的 ..\
    /~/, // ~ 符号
    /%7e/i, // URL编码的 ~
    /\.\.%2f/i, // 混合编码 ../
    /\.\.%5c/i, // 混合编码 ..\
    /%00/i, // 空字节攻击
  ];

  return pathTraversalPatterns.some(pattern => pattern.test(path));
}

/**
 * 路径遍历防护 - 清理文件路径
 */
export function sanitizePath(path: string): string {
  return path
    .replace(/\.+\.+\//g, '') // 移除任何数量的点后跟 ../
    .replace(/\.+\.+\\/g, '') // 移除任何数量的点后跟 ..\
    .replace(/\.\.\//g, '') // 移除 ../
    .replace(/\.\.\\/g, '') // 移除 ..\
    .replace(/\.\.%2f/gi, '') // 移除 URL编码的 ../
    .replace(/\.\.%5c/gi, '') // 移除 URL编码的 ..\
    .replace(/~\//g, '') // 移除 ~/
    .replace(/~/g, '') // 移除单独的 ~
    .replace(/%00/g, '') // 移除空字节
    .replace(/[^a-zA-Z0-9\-_\.\/]/g, '') // 只保留安全字符
    .replace(/^\.+/, '') // 移除开头的点
    .replace(/\/\.+$/, '') // 移除结尾的 /.
    .replace(/\/+/g, '/'); // 合并多个斜杠
}

/**
 * HTML编码 - 防止XSS攻击
 */
export function encodeHtml(input: string): string {
  return input
    .replace(/onerror=/gi, 'data-onerror=') // 先处理事件处理器
    .replace(/onclick=/gi, 'data-onclick=')
    .replace(/onload=/gi, 'data-onload=')
    .replace(/onmouseover=/gi, 'data-onmouseover=')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * JSON安全编码 - 使用Unicode转义
 */
export function encodeJsonSafely(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/"/g, '\\u0022');
}

/**
 * 速率限制验证
 */
export function validateRateLimit(requestCount: number, windowStart: number, config = { windowMs: 15 * 60 * 1000, max: 100 }): boolean {
  const now = Date.now();
  const windowElapsed = now - windowStart;

  // 如果时间窗口还没有完全过去，按比例计算允许的请求数
  if (windowElapsed < config.windowMs) {
    const windowProgress = windowElapsed / config.windowMs;
    const allowedRequests = Math.floor(config.max * windowProgress);
    return requestCount <= Math.max(1, allowedRequests); // 至少允许1个请求
  }

  // 如果时间窗口已经过去，检查是否超过最大限制
  return requestCount <= config.max;
}

/**
 * 增强的API密钥保护
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '****' + apiKey.slice(-4);

  // 只显示前4位和后4位
  return apiKey.slice(0, 4) + '****' + apiKey.slice(-4);
}

/**
 * 安全地存储敏感信息
 */
export function secureStore(key: string, value: string): void {
  try {
    // 在实际应用中，可以考虑使用加密库对敏感信息进行加密
    // 这里使用简单的Base64编码作为示例
    const encodedValue = btoa(value);
    localStorage.setItem(`secure_${key}`, encodedValue);
  } catch (error) {
    console.error('Failed to store data securely:', error);
  }
}

/**
 * 安全地检索敏感信息
 */
export function secureRetrieve(key: string): string | null {
  try {
    const encodedValue = localStorage.getItem(`secure_${key}`);
    if (!encodedValue) return null;

    // 解码
    return atob(encodedValue);
  } catch (error) {
    console.error('Failed to retrieve data securely:', error);
    return null;
  }
}

// Add these validation functions that are being imported in settings-dialog.tsx

/**
 * 验证API端点URL
 */
export function validateApiEndpoint(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:'; // 只允许HTTPS
  } catch (error) {
    return false;
  }
}

/**
 * 验证API密钥格式
 */
export function validateApiKey(apiKey: string): boolean {
  // 简单的格式验证，实际应用中可能需要更复杂的验证
  return /^[a-zA-Z0-9_-]{10,}$/.test(apiKey);
}

/**
 * 验证AppID格式
 */
export function validateAppId(appId: string): boolean {
  // 简单的格式验证，实际应用中可能需要更复杂的验证
  return /^[a-zA-Z0-9_-]{5,}$/.test(appId);
}

import crypto from 'crypto';

const AES_SECRET_RAW =
  process.env.AES_SECRET || 'neuroglass_default_secret_32bytes!';
// 兼容任意长度密钥，自动 hash 成 32 字节
const AES_SECRET = crypto.createHash('sha256').update(AES_SECRET_RAW).digest();

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', AES_SECRET, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

export function decrypt(data: string): string {
  const [ivStr, encrypted] = data.split(':');
  const iv = Buffer.from(ivStr, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', AES_SECRET, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
