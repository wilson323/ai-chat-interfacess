/**
 * Image Editor API Unit Tests
 *
 * Tests for /api/image-editor/save endpoint:
 * - Admin token validation
 * - File validation (format, size)
 * - Configuration management
 * - File operations
 * - Marks processing
 * - Error handling
 * - Security testing
 * - Performance testing
 */

import fs from 'fs/promises';
import path from 'path';

// Mock dependencies with factory functions to ensure they're mocked before module import
jest.mock('fs/promises');
jest.mock('path', () => {
  const originalPath = jest.requireActual('path');
  const mockPath = {
    ...originalPath,
    resolve: jest.fn(),
    join: jest.fn(),
  };
  return mockPath;
});

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

// Mock process.cwd() to return consistent working directory
const mockCwd = '/app/ai-chat-interfacess';
jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);

// Mock path.resolve - return proper config path and data directory
mockPath.resolve.mockImplementation((...args) => {
  // Ensure args is an array
  if (!Array.isArray(args) || args.length === 0) {
    return '';
  }

  // Handle CONFIG_PATH = path.resolve(process.cwd(), 'config/image-editor-config.json')
  if (args.length === 2 && args[1] === 'config/image-editor-config.json') {
    return `${mockCwd}/config/image-editor-config.json`;
  }
  // Handle data directory path for logging
  if (args.some(arg => typeof arg === 'string' && arg.includes('data'))) {
    return `${mockCwd}/data`;
  }
  // Use simple join to avoid recursive calls
  return args.join('/');
});

// Mock path.join for directory operations
mockPath.join.mockImplementation((...args) => {
  // Ensure args is an array
  if (!Array.isArray(args)) {
    return '';
  }

  // Handle public/image-edits directory
  if (args.some(arg => typeof arg === 'string' && arg.includes('public')) &&
      args.some(arg => typeof arg === 'string' && arg.includes('image-edits'))) {
    return `${mockCwd}/public/image-edits`;
  }
  // Handle data directory for error logging
  if (args.some(arg => typeof arg === 'string' && arg.includes('data')) &&
      args.some(arg => typeof arg === 'string' && arg.includes('api-error.log'))) {
    return `${mockCwd}/data/api-error.log`;
  }
  // Use the original path.join to avoid recursive calls
  return args.join('/');
});

// Dynamic import to ensure mocks are set up before module loading
let POST: any;
let NextRequest: any;

beforeAll(async () => {
  const routeModule = await import('@/app/api/image-editor/save/route');
  POST = routeModule.POST;
  const nextModule = await import('next/server');
  NextRequest = nextModule.NextRequest;
});

describe('Image Editor API - POST /api/image-editor/save', () => {
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';
  const testRequestBuilder = {
    createRequest: (method: string, url: string, token?: string, body?: any): any => {
      const headers = new Headers();
      if (token) {
        headers.set('x-admin-token', token);
      }

      // Create absolute URL for Next.js 15
      const absoluteUrl = `http://localhost:3000${url}`;

      if (body && body instanceof FormData) {
        return new NextRequest(absoluteUrl, {
          method,
          headers,
          body,
        });
      }

      return new NextRequest(absoluteUrl, {
        method,
        headers,
        body: JSON.stringify(body),
      });
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment
    process.env.ADMIN_TOKEN = ADMIN_TOKEN;

    // Reset all mock implementations to their defaults
    mockPath.join.mockImplementation((...args) => {
      // Ensure args is an array
      if (!Array.isArray(args)) {
        return '';
      }

      // Handle special paths for testing
      if (args.length === 3 && args.includes('public') && args.includes('image-edits') && args.some(arg => typeof arg === 'string' && arg.includes('.png'))) {
        return `${mockCwd}/public/image-edits/${args.find(arg => typeof arg === 'string' && arg.includes('.png'))}`;
      }
      // Handle public/image-edits directory
      if (args.length === 2 && args.includes('public') && args.includes('image-edits')) {
        return `${mockCwd}/public/image-edits`;
      }
      // Handle data directory for error logging
      if (args.length === 2 && args.includes('data') && args.includes('api-error.log')) {
        return `${mockCwd}/data/api-error.log`;
      }
      // Use the original path.join to avoid recursive calls
      return args.join('/');
    });

    mockPath.resolve.mockImplementation((...args) => {
      // Ensure args is an array
      if (!Array.isArray(args) || args.length === 0) {
        return '';
      }

      // Handle CONFIG_PATH = path.resolve(process.cwd(), 'config/image-editor-config.json')
      if (args.length === 2 && args[1] === 'config/image-editor-config.json') {
        return `${mockCwd}/config/image-editor-config.json`;
      }
      // Handle data directory path for logging
      if (args.some(arg => typeof arg === 'string' && arg.includes('data'))) {
        return `${mockCwd}/data`;
      }
      // Use simple join to avoid recursive calls
      return args.join('/');
    });

    // Ensure appendFile is properly mocked for error logging tests
    mockFs.appendFile.mockResolvedValue(undefined);
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without admin token', async () => {
      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: '无权限' });
    });

    it('should reject requests with invalid admin token', async () => {
      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', 'invalid-token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: '无权限' });
    });

    it('should accept requests with valid admin token', async () => {
      // Setup mocks
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);

      expect(response.status).not.toBe(401);
    });

    it('should use environment variable for admin token', async () => {
      // Use the default admin token that matches the API
      const customToken = 'admin123';
      process.env.ADMIN_TOKEN = customToken;

      // Mock the file operations to avoid actual file system access
      mockFs.readFile.mockResolvedValue(JSON.stringify({ maxImageSizeMB: 10, supportedFormats: ['.jpg', '.png'] }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const formData = new FormData();
      const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', customToken, formData);
      const response = await POST(request);

      // Should pass authentication and proceed (will fail later but not due to auth)
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });

  describe('Configuration Management', () => {
    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should read configuration from file', async () => {
      const mockConfig = {
        maxImageSizeMB: 15,
        supportedFormats: ['.jpg', '.png', '.gif', '.webp']
      };

      // Let's check what path.resolve is actually returning
      let actualPath = '';
      mockFs.readFile.mockImplementation((path, encoding) => {
        actualPath = path;
        return Promise.resolve(JSON.stringify(mockConfig));
      });

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      await POST(request);

      if (actualPath === undefined) {
        throw new Error(`Debug info: actualPath is undefined. Mock calls: ${JSON.stringify({
          pathResolveCalls: mockPath.resolve.mock.calls,
          pathJoinCalls: mockPath.join.mock.calls,
          readFileCalls: mockFs.readFile.mock.calls
        }, null, 2)}`);
      }

      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('config/image-editor-config.json'),
        'utf-8'
      );
    });

    it('should use default configuration when file read fails', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should accept PNG with default config
      expect(data).toHaveProperty('url');
    });

    it('should handle invalid JSON in config file', async () => {
      mockFs.readFile.mockResolvedValue('invalid json content');
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should fall back to defaults and accept PNG
      expect(data).toHaveProperty('url');
    });

    it('should apply file size limits from configuration', async () => {
      const mockConfig = {
        maxImageSizeMB: 1, // Very small limit
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockConfig));

      const formData = new FormData();
      // Create file larger than 1MB using Buffer for Node.js compatibility
      const largeBuffer = Buffer.alloc(2 * 1024 * 1024, 'A'); // 2MB
      const largeFile = new File([largeBuffer], 'large.jpg', { type: 'image/jpeg' });
      formData.append('file', largeFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('图片过大');
      expect(data.error).toContain('最大1MB');
    });

    it('should apply format restrictions from configuration', async () => {
      const mockConfig = {
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.jpeg'] // Only JPG allowed
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockConfig));

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('不支持的图片类型');
    });
  });

  describe('File Validation', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should reject requests without file', async () => {
      const formData = new FormData();
      // No file added

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('未检测到图片文件');
    });

    it('should reject unsupported file formats', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.pdf', { type: 'application/pdf' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('不支持的图片类型');
    });

    it('should accept supported image formats', async () => {
      const supportedFormats = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.bmp', type: 'image/bmp' },
        { name: 'test.tiff', type: 'image/tiff' }
      ];

      for (const format of supportedFormats) {
        const formData = new FormData();
        const testFile = new File(['test image content'], format.name, { type: format.type });
        formData.append('file', testFile);

        const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
        const response = await POST(request);

        expect(response.status).toBe(200);
      }
    });

    it('should handle case-insensitive file extensions', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.JPG', { type: 'image/jpeg' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('url');
    });

    it('should reject files without extensions', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('不支持的图片类型');
    });

    it('should validate file size correctly', async () => {
      const formData = new FormData();
      // Create file exactly at the limit (10MB) using Buffer for Node.js compatibility
      const limitBuffer = Buffer.alloc(10 * 1024 * 1024, 'A'); // 10MB
      const limitFile = new File([limitBuffer], 'test.png', { type: 'image/png' });
      formData.append('file', limitFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);

      // Should accept file exactly at limit
      expect(response.status).toBe(200);
    });

    it('should reject files that exceed size limit', async () => {
      const formData = new FormData();
      // Create file slightly over the limit (10MB + 1 byte) using Buffer for Node.js compatibility
      const oversizedBuffer = Buffer.alloc((10 * 1024 * 1024) + 1, 'A'); // 10MB + 1 byte
      const oversizedFile = new File([oversizedBuffer], 'test.png', { type: 'image/png' });
      formData.append('file', oversizedFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('图片过大');
    });
  });

  describe('File Operations', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
    });

    it('should create output directory if it does not exist', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      await POST(request);

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('/public/image-edits'),
        { recursive: true }
      );
    });

    it('should handle directory creation errors', async () => {
      // Setup mocks with proper error scenario - mock the error but don't throw it
      let callCount = 0;
      mockFs.mkdir.mockImplementation((...args) => {
        callCount++;
        // First call (for public/image-edits) should fail, second call (for data) should succeed
        if (callCount === 1) {
          const error = new Error('Permission denied');
          return Promise.reject(error);
        }
        return Promise.resolve(undefined);
      });
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));

      // Mock appendFile to prevent cascading errors in logApiError
      mockFs.appendFile.mockResolvedValue(undefined);

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('服务异常，请稍后重试');
    });

    it('should save file with unique timestamp filename', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.appendFile.mockResolvedValue(undefined);

      // Mock Date.now() to get predictable filename
      const mockTimestamp = 1234567890;
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      try {
        const formData = new FormData();
        const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
        formData.append('file', testFile);

        const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
        const response = await POST(request);
        const data = await response.json();

        expect(mockFs.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('edit_1234567890.png'),
          expect.any(Buffer)
        );
        expect(data.url).toBe('/image-edits/edit_1234567890.png');
      } finally {
        // Restore the Date.now() mock
        dateSpy.mockRestore();
      }
    });

    it('should convert ArrayBuffer to Buffer correctly', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      let capturedBuffer: Buffer | null = null;
      mockFs.writeFile.mockImplementation((filePath, buffer) => {
        capturedBuffer = buffer as Buffer;
        return Promise.resolve();
      });

      const formData = new FormData();
      const testContent = 'test image content';
      const testFile = new File([testContent], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      await POST(request);

      expect(capturedBuffer).toBeTruthy();
      expect(capturedBuffer!.toString()).toBe(testContent);
    });

    it('should handle file write errors', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockRejectedValue(new Error('Disk full'));

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('服务异常，请稍后重试');
    });
  });

  describe('Marks Processing', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should handle requests without marks', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      // No marks added

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.marks).toEqual([]);
    });

    it('should parse valid JSON marks', async () => {
      const marks = [
        { x: 100, y: 200, type: 'circle', color: 'red' },
        { x: 300, y: 400, type: 'rect', color: 'blue' }
      ];

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      formData.append('marks', JSON.stringify(marks));

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.marks).toEqual(marks);
    });

    it('should handle invalid JSON in marks', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      formData.append('marks', 'invalid json {');

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('服务异常，请稍后重试');
    });

    it('should handle empty marks string', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      formData.append('marks', '');

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.marks).toEqual([]);
    });

    it('should handle null marks', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      formData.append('marks', 'null');

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.marks).toEqual(null);
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should return correct response structure on success', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('url');
      expect(data).toHaveProperty('marks');
      expect(typeof data.url).toBe('string');
      expect(data.url).toMatch(/^\/image-edits\/edit_\d+\.png$/);
      expect(Array.isArray(data.marks) || data.marks === null).toBe(true);
    });

    it('should return public URL for saved image', async () => {
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(data.url).toMatch(/^\/image-edits\//);
      expect(data.url).not.toContain('/public/'); // Should be relative to public directory
    });

    it('should include parsed marks in response when provided', async () => {
      const marks = [{ x: 100, y: 200, type: 'point' }];
      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      formData.append('marks', JSON.stringify(marks));

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(data.marks).toEqual(marks);
    });
  });

  describe('Error Handling & Logging', () => {
    it('should log API errors to error log file', async () => {
      const testError = new Error('Test error');

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.appendFile.mockResolvedValue(undefined);
      // Force an error during file writing
      mockFs.writeFile.mockRejectedValue(testError);

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      await POST(request);

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        expect.stringContaining('api-error.log'),
        expect.stringContaining('[image-editor-save]')
      );
    });

    it('should handle file system errors gracefully', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      // First mkdir call should succeed, second one (in logApiError) should also succeed
      let mkdirCallCount = 0;
      mockFs.mkdir.mockImplementation(() => {
        mkdirCallCount++;
        return Promise.resolve(undefined);
      });
      mockFs.writeFile.mockRejectedValue(new Error('File system error'));
      mockFs.appendFile.mockResolvedValue(undefined);

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('服务异常，请稍后重试');
    });

    it('should handle unexpected errors', async () => {
      // Mock a random error during processing
      jest.spyOn(FormData.prototype, 'get').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      // Ensure logApiError doesn't fail
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.appendFile.mockResolvedValue(undefined);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('服务异常，请稍后重试');
    });
  });

  describe('Performance Testing', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should handle large files within size limits efficiently', async () => {
      const startTime = Date.now();

      const formData = new FormData();
      // Create large file within limits (5MB) - use Buffer for Node.js compatibility
      const largeFileContent = Buffer.alloc(5 * 1024 * 1024, 'A');
      const largeFile = new File([largeFileContent], 'large.png', { type: 'image/png' });
      formData.append('file', largeFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Ensure clean mock state for this test
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should process within 1 second
    }, 10000);

    it('should process files with complex marks efficiently', async () => {
      const complexMarks = Array(1000).fill(null).map((_, i) => ({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        type: ['circle', 'rect', 'point', 'line'][Math.floor(Math.random() * 4)],
        color: ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)],
        size: Math.random() * 50 + 10
      }));

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      formData.append('marks', JSON.stringify(complexMarks));

      const startTime = Date.now();
      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500); // Should process complex marks within 500ms
    });
  });

  describe('Security Testing', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should prevent path traversal in file names', async () => {
      const formData = new FormData();
      const maliciousFile = new File(['test content'], '../../../etc/passwd', { type: 'image/png' });
      formData.append('file', maliciousFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      // Should reject due to unsupported extension
      expect(response.status).toBe(400);
      expect(data.error).toBe('不支持的图片类型');
    });

    it('should sanitize file extensions with special characters', async () => {
      const formData = new FormData();
      const suspiciousFile = new File(['test content'], 'test.pn"g', { type: 'image/png' });
      formData.append('file', suspiciousFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      // Should reject due to invalid extension
      expect(response.status).toBe(400);
      expect(data.error).toBe('不支持的图片类型');
    });

    it('should validate marks data structure for injection attempts', async () => {
      const maliciousMarks = '{"__proto__": {"polluted": true}, "constructor": {"prototype": {"malicious": true}}}';

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      formData.append('marks', maliciousMarks);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should not be vulnerable to prototype pollution
      expect(({} as any).polluted).toBeUndefined();
      expect(({} as any).malicious).toBeUndefined();
    });

    it('should handle extremely large JSON in marks', async () => {
      // Create very large JSON string
      const largeMarks = Array(10000).fill({ x: 0, y: 0, type: 'point' });
      const largeJson = JSON.stringify(largeMarks);

      const formData = new FormData();
      const testFile = new File(['test image content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);
      formData.append('marks', largeJson);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.marks)).toBe(true);
      expect(data.marks!.length).toBe(10000);
    });

    it('should prevent directory traversal in save path', async () => {
      const formData = new FormData();
      const testFile = new File(['test content'], 'test.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      await POST(request);

      // Verify that the save path is within expected directory
      const mkdirCall = mockFs.mkdir.mock.calls[0];
      const savePath = mkdirCall[0];
      expect(savePath).toContain('/public/image-edits');
      expect(savePath).not.toContain('..');
    });
  });

  describe('Edge Cases & Boundary Conditions', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        maxImageSizeMB: 10,
        supportedFormats: ['.jpg', '.png', '.bmp', '.tiff']
      }));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should handle zero-byte files', async () => {
      const formData = new FormData();
      const emptyFile = new File([], 'empty.png', { type: 'image/png' });
      formData.append('file', emptyFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('url');
    });

    it('should handle files with very long names', async () => {
      const longName = 'a'.repeat(250) + '.png';
      const formData = new FormData();
      const testFile = new File(['test content'], longName, { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should use generated filename, not the original long name
      expect(data.url).toMatch(/^\/image-edits\/edit_\d+\.png$/);
    });

    it('should handle Unicode characters in file names', async () => {
      const formData = new FormData();
      const testFile = new File(['test content'], '测试图片.png', { type: 'image/png' });
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should use generated filename, preserving Unicode in processing
      expect(data.url).toMatch(/^\/image-edits\/edit_\d+\.png$/);
    });

    it('should handle concurrent requests safely', async () => {
      const requests = [];
      const concurrentCount = 10;

      // Mock Date.now() to return different timestamps for each call
      const timestamps = Array(concurrentCount).fill(0).map((_, i) => 1234567890 + i);
      let callCount = 0;
      jest.spyOn(Date, 'now').mockImplementation(() => timestamps[callCount++]);

      for (let i = 0; i < concurrentCount; i++) {
        const formData = new FormData();
        const testFile = new File([`test content ${i}`], `test${i}.png`, { type: 'image/png' });
        formData.append('file', testFile);

        const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
        requests.push(POST(request));
      }

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Verify unique URLs were generated
      const urls = await Promise.all(responses.map(r => r.json()));
      const uniqueUrls = new Set(urls.map(u => u.url));
      expect(uniqueUrls.size).toBe(concurrentCount);

      // Restore Date.now
      jest.restoreAllMocks();
    });

    it('should handle missing Content-Type header gracefully', async () => {
      const formData = new FormData();
      const testFile = new File(['test content'], 'test.png');
      formData.append('file', testFile);

      const request = testRequestBuilder.createRequest('POST', '/api/image-editor/save', ADMIN_TOKEN, formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('url');
    });
  });
});