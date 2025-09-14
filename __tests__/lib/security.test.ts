/**
 * 安全模块测试
 * 测试安全扫描、输入验证、权限控制等功能
 */

import {
  validateInput,
  sanitizeInput,
  checkPermissions,
  generateSecureToken,
  hashPassword,
  verifyPassword,
  detectXSS,
  detectSQLInjection,
  validateFileUpload,
  encryptData,
  decryptData
} from '@/lib/security';

describe('安全模块测试', () => {
  describe('输入验证测试', () => {
    it('应该验证有效的输入', () => {
      const validInputs = [
        'Hello World',
        'user@example.com',
        '12345',
        'normal-text-123'
      ];

      validInputs.forEach(input => {
        expect(validateInput(input, 'text')).toBe(true);
      });
    });

    it('应该拒绝无效的输入', () => {
      const invalidInputs = [
        '', // 空字符串
        '   ', // 只有空格
        null,
        undefined
      ];

      invalidInputs.forEach(input => {
        expect(validateInput(input as any, 'text')).toBe(false);
      });
    });

    it('应该验证邮箱格式', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ];

      validEmails.forEach(email => {
        expect(validateInput(email, 'email')).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(validateInput(email, 'email')).toBe(false);
      });
    });

    it('应该验证URL格式', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://sub.domain.com/path?query=value'
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert("xss")'
      ];

      validUrls.forEach(url => {
        expect(validateInput(url, 'url')).toBe(true);
      });

      invalidUrls.forEach(url => {
        expect(validateInput(url, 'url')).toBe(false);
      });
    });
  });

  describe('输入清理测试', () => {
    it('应该清理HTML标签', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const cleaned = sanitizeInput(input, 'html');
      
      expect(cleaned).toBe('Hello World');
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('alert');
    });

    it('应该清理SQL注入字符', () => {
      const input = "'; DROP TABLE users; --";
      const cleaned = sanitizeInput(input, 'sql');
      
      expect(cleaned).not.toContain('DROP');
      expect(cleaned).not.toContain('--');
      expect(cleaned).not.toContain("'");
    });

    it('应该清理JavaScript代码', () => {
      const input = 'Hello <img src=x onerror=alert("xss")> World';
      const cleaned = sanitizeInput(input, 'js');
      
      expect(cleaned).toBe('Hello  World');
      expect(cleaned).not.toContain('<img');
      expect(cleaned).not.toContain('onerror');
    });

    it('应该保留安全的HTML标签', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const cleaned = sanitizeInput(input, 'html');
      
      expect(cleaned).toContain('<p>');
      expect(cleaned).toContain('<strong>');
      expect(cleaned).toContain('Hello');
      expect(cleaned).toContain('World');
    });
  });

  describe('权限控制测试', () => {
    const mockUser = {
      id: '1',
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    };

    const mockRegularUser = {
      id: '2',
      role: 'user',
      permissions: ['read']
    };

    it('应该允许有权限的用户访问', () => {
      expect(checkPermissions(mockUser, 'read')).toBe(true);
      expect(checkPermissions(mockUser, 'write')).toBe(true);
      expect(checkPermissions(mockUser, 'delete')).toBe(true);
    });

    it('应该拒绝没有权限的用户访问', () => {
      expect(checkPermissions(mockRegularUser, 'write')).toBe(false);
      expect(checkPermissions(mockRegularUser, 'delete')).toBe(false);
      expect(checkPermissions(mockRegularUser, 'admin')).toBe(false);
    });

    it('应该处理空用户对象', () => {
      expect(checkPermissions(null as any, 'read')).toBe(false);
      expect(checkPermissions(undefined as any, 'read')).toBe(false);
    });

    it('应该支持角色权限检查', () => {
      expect(checkPermissions(mockUser, 'admin_access')).toBe(true);
      expect(checkPermissions(mockRegularUser, 'admin_access')).toBe(false);
    });
  });

  describe('加密功能测试', () => {
    it('应该生成安全的令牌', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(20);
    });

    it('应该正确哈希密码', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('应该正确验证密码', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      const isInvalid = await verifyPassword('wrongpassword', hash);
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('应该加密和解密数据', () => {
      const originalData = { message: 'secret data', id: 123 };
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);
      
      expect(encrypted).not.toEqual(originalData);
      expect(decrypted).toEqual(originalData);
    });
  });

  describe('安全检测测试', () => {
    it('应该检测XSS攻击', () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<svg onload=alert("xss")>'
      ];

      xssPayloads.forEach(payload => {
        expect(detectXSS(payload)).toBe(true);
      });

      const safeInputs = [
        'Hello World',
        'Normal text with numbers 123',
        '<p>Safe HTML</p>'
      ];

      safeInputs.forEach(input => {
        expect(detectXSS(input)).toBe(false);
      });
    });

    it('应该检测SQL注入攻击', () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' UNION SELECT * FROM users --"
      ];

      sqlPayloads.forEach(payload => {
        expect(detectSQLInjection(payload)).toBe(true);
      });

      const safeInputs = [
        'normal search query',
        'user@example.com',
        'John Doe'
      ];

      safeInputs.forEach(input => {
        expect(detectSQLInjection(input)).toBe(false);
      });
    });
  });

  describe('文件上传验证测试', () => {
    const mockFile = {
      name: 'test.txt',
      size: 1024,
      type: 'text/plain'
    };

    const mockImageFile = {
      name: 'test.jpg',
      size: 2048,
      type: 'image/jpeg'
    };

    const mockLargeFile = {
      name: 'large.txt',
      size: 10 * 1024 * 1024, // 10MB
      type: 'text/plain'
    };

    const mockExecutableFile = {
      name: 'malware.exe',
      size: 1024,
      type: 'application/x-executable'
    };

    it('应该验证允许的文件类型', () => {
      const result1 = validateFileUpload(mockFile, {
        allowedTypes: ['text/plain', 'text/csv'],
        maxSize: 5 * 1024 * 1024
      });

      const result2 = validateFileUpload(mockImageFile, {
        allowedTypes: ['image/jpeg', 'image/png'],
        maxSize: 5 * 1024 * 1024
      });

      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });

    it('应该拒绝不允许的文件类型', () => {
      const result = validateFileUpload(mockExecutableFile, {
        allowedTypes: ['text/plain', 'image/jpeg'],
        maxSize: 5 * 1024 * 1024
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('应该拒绝过大的文件', () => {
      const result = validateFileUpload(mockLargeFile, {
        allowedTypes: ['text/plain'],
        maxSize: 1024 * 1024 // 1MB
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('应该验证文件扩展名', () => {
      const result = validateFileUpload(mockFile, {
        allowedExtensions: ['.txt', '.csv'],
        maxSize: 5 * 1024 * 1024
      });

      expect(result.isValid).toBe(true);
    });

    it('应该拒绝危险的文件扩展名', () => {
      const dangerousFile = {
        name: 'malware.exe',
        size: 1024,
        type: 'application/octet-stream'
      };

      const result = validateFileUpload(dangerousFile, {
        allowedExtensions: ['.txt', '.pdf'],
        maxSize: 5 * 1024 * 1024
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('dangerous');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空输入', () => {
      expect(validateInput('', 'text')).toBe(false);
      expect(sanitizeInput('', 'html')).toBe('');
      expect(checkPermissions(null as any, 'read')).toBe(false);
    });

    it('应该处理特殊字符', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      expect(validateInput(specialChars, 'text')).toBe(true);
      expect(sanitizeInput(specialChars, 'html')).toBe(specialChars);
    });

    it('应该处理Unicode字符', () => {
      const unicodeText = 'Hello 世界 🌍';
      expect(validateInput(unicodeText, 'text')).toBe(true);
      expect(sanitizeInput(unicodeText, 'html')).toBe(unicodeText);
    });

    it('应该处理长输入', () => {
      const longText = 'A'.repeat(10000);
      expect(validateInput(longText, 'text')).toBe(true);
      
      const cleaned = sanitizeInput(longText, 'html');
      expect(cleaned.length).toBe(10000);
    });
  });
});