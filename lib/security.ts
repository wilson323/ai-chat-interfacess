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
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
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
  ]

  return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * 增强的输入验证函数
 */
export function validateInput(input: string): boolean {
  // 检查是否为空
  if (!input || input.trim() === "") return false

  // 检查长度限制
  if (input.length > 10000) return false

  // 检查XSS攻击
  if (detectXSSAttempt(input)) return false

  // 检查SQL注入
  if (detectSQLInjection(input)) return false

  return true
}

/**
 * 增强的输入过滤函数
 */
export function sanitizeInput(input: string): string {
  // 移除HTML标签
  let sanitized = input.replace(/<[^>]*>/g, "")

  // 移除JavaScript代码
  sanitized = sanitized.replace(/javascript:[\s\S]*?;/gi, "")

  // 移除其他潜在的恶意代码
  sanitized = sanitized.replace(/vbscript:[\s\S]*?;/gi, "")

  return sanitized
}

/**
 * 增强的API密钥保护
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return ""
  if (apiKey.length <= 8) return "****" + apiKey.slice(-4)

  // 只显示前4位和后4位
  return apiKey.slice(0, 4) + "****" + apiKey.slice(-4)
}

/**
 * 安全地存储敏感信息
 */
export function secureStore(key: string, value: string): void {
  try {
    // 在实际应用中，可以考虑使用加密库对敏感信息进行加密
    // 这里使用简单的Base64编码作为示例
    const encodedValue = btoa(value)
    localStorage.setItem(`secure_${key}`, encodedValue)
  } catch (error) {
    console.error("Failed to store data securely:", error)
  }
}

/**
 * 安全地检索敏感信息
 */
export function secureRetrieve(key: string): string | null {
  try {
    const encodedValue = localStorage.getItem(`secure_${key}`)
    if (!encodedValue) return null

    // 解码
    return atob(encodedValue)
  } catch (error) {
    console.error("Failed to retrieve data securely:", error)
    return null
  }
}

// Add these validation functions that are being imported in settings-dialog.tsx

/**
 * 验证API端点URL
 */
export function validateApiEndpoint(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === "https:" // 只允许HTTPS
  } catch (error) {
    return false
  }
}

/**
 * 验证API密钥格式
 */
export function validateApiKey(apiKey: string): boolean {
  // 简单的格式验证，实际应用中可能需要更复杂的验证
  return /^[a-zA-Z0-9_-]{10,}$/.test(apiKey)
}

/**
 * 验证AppID格式
 */
export function validateAppId(appId: string): boolean {
  // 简单的格式验证，实际应用中可能需要更复杂的验证
  return /^[a-zA-Z0-9_-]{5,}$/.test(appId)
}

import crypto from 'crypto'

const AES_SECRET_RAW = process.env.AES_SECRET || 'neuroglass_default_secret_32bytes!'
// 兼容任意长度密钥，自动 hash 成 32 字节
const AES_SECRET = crypto.createHash('sha256').update(AES_SECRET_RAW).digest()

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', AES_SECRET, iv)
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return iv.toString('base64') + ':' + encrypted
}

export function decrypt(data: string): string {
  const [ivStr, encrypted] = data.split(':')
  const iv = Buffer.from(ivStr, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-cbc', AES_SECRET, iv)
  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
