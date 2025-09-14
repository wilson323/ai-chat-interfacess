/**
 * Upload API Unit Tests
 * Tests for /api/upload endpoint
 */

import { POST } from '@/app/api/upload/route';
import {
  TestRequestBuilder,
  testValidators,
} from '@/__tests__/utils/api-test-utils';

// Mock dependencies
jest.mock('@/lib/config', () => ({
  appConfig: {
    upload: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      storagePath: '/tmp/uploads',
    },
  },
}));

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}));

const mockFs = require('fs/promises');

describe('Upload API - Unit Tests', () => {
  const mockConfig = require('@/lib/config').appConfig;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/upload', () => {
    it('should successfully upload a valid file', async () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
        size: 1024,
      });

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);

      const request = TestRequestBuilder.createRequest('POST', '/api/upload');
      // Simulate FormData by modifying the request
      Object.defineProperty(request, 'formData', {
        value: jest.fn().mockResolvedValue({
          get: () => mockFile,
        }),
        configurable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      testValidators.validateSuccessResponse(data);
      expect(data.data).toHaveProperty('filename');
      expect(data.data).toHaveProperty('originalName', 'test.jpg');
      expect(data.data).toHaveProperty('size', 1024);
      expect(data.data).toHaveProperty('mimeType', 'image/jpeg');
      expect(data.data).toHaveProperty('path');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/tmp/uploads', {
        recursive: true,
      });
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should reject file too large', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
        size: 11 * 1024 * 1024,
      });

      const request = TestRequestBuilder.createRequest('POST', '/api/upload');
      Object.defineProperty(request, 'formData', {
        value: jest.fn().mockResolvedValue({
          get: () => largeFile,
        }),
        configurable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      testValidators.validateErrorResponse(data, undefined, 'File too large');
    });

    it('should reject invalid file type', async () => {
      const invalidFile = new File(['test content'], 'test.exe', {
        type: 'application/x-executable',
        size: 1024,
      });

      const request = TestRequestBuilder.createRequest('POST', '/api/upload');
      Object.defineProperty(request, 'formData', {
        value: jest.fn().mockResolvedValue({
          get: () => invalidFile,
        }),
        configurable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(415);
      testValidators.validateErrorResponse(
        data,
        undefined,
        'Invalid file type'
      );
    });

    it('should handle missing file in request', async () => {
      const request = TestRequestBuilder.createRequest('POST', '/api/upload');
      Object.defineProperty(request, 'formData', {
        value: jest.fn().mockResolvedValue({
          get: () => null,
        }),
        configurable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      testValidators.validateErrorResponse(data, undefined, 'No file uploaded');
    });

    it('should handle file system errors', async () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
        size: 1024,
      });

      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

      const request = TestRequestBuilder.createRequest('POST', '/api/upload');
      Object.defineProperty(request, 'formData', {
        value: jest.fn().mockResolvedValue({
          get: () => mockFile,
        }),
        configurable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      testValidators.validateErrorResponse(
        data,
        undefined,
        'Failed to save file'
      );
    });

    it('should sanitize file names to prevent path traversal', async () => {
      const dangerousFile = new File(['test content'], '../../../etc/passwd', {
        type: 'image/jpeg',
        size: 1024,
      });

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const request = TestRequestBuilder.createRequest('POST', '/api/upload');
      Object.defineProperty(request, 'formData', {
        value: jest.fn().mockResolvedValue({
          get: () => dangerousFile,
        }),
        configurable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.originalName).toBe('etc_passwd'); // Should be sanitized
      expect(data.data.path).not.toContain('..');
    });

    describe('File size validation', () => {
      it('should handle exactly maximum size', async () => {
        const maxSizeFile = new File(
          ['x'.repeat(10 * 1024 * 1024)],
          'max.jpg',
          {
            type: 'image/jpeg',
            size: 10 * 1024 * 1024,
          }
        );

        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.writeFile.mockResolvedValue(undefined);

        const request = TestRequestBuilder.createRequest('POST', '/api/upload');
        Object.defineProperty(request, 'formData', {
          value: jest.fn().mockResolvedValue({
            get: () => maxSizeFile,
          }),
          configurable: true,
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
      });

      it('should handle zero byte file', async () => {
        const emptyFile = new File([''], 'empty.jpg', {
          type: 'image/jpeg',
          size: 0,
        });

        const request = TestRequestBuilder.createRequest('POST', '/api/upload');
        Object.defineProperty(request, 'formData', {
          value: jest.fn().mockResolvedValue({
            get: () => emptyFile,
          }),
          configurable: true,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        testValidators.validateErrorResponse(data, undefined, 'Empty file');
      });
    });

    describe('File type validation', () => {
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
      ];

      validTypes.forEach(type => {
        it(`should accept valid file type: ${type}`, async () => {
          const mockFile = new File(
            ['test content'],
            `test.${type.split('/')[1]}`,
            {
              type,
              size: 1024,
            }
          );

          mockFs.mkdir.mockResolvedValue(undefined);
          mockFs.writeFile.mockResolvedValue(undefined);

          const request = TestRequestBuilder.createRequest(
            'POST',
            '/api/upload'
          );
          Object.defineProperty(request, 'formData', {
            value: jest.fn().mockResolvedValue({
              get: () => mockFile,
            }),
            configurable: true,
          });

          const response = await POST(request);

          expect(response.status).toBe(200);
        });
      });

      const invalidTypes = [
        'application/x-executable',
        'text/html',
        'application/javascript',
        'text/plain',
      ];

      invalidTypes.forEach(type => {
        it(`should reject invalid file type: ${type}`, async () => {
          const mockFile = new File(['test content'], 'test.exe', {
            type,
            size: 1024,
          });

          const request = TestRequestBuilder.createRequest(
            'POST',
            '/api/upload'
          );
          Object.defineProperty(request, 'formData', {
            value: jest.fn().mockResolvedValue({
              get: () => mockFile,
            }),
            configurable: true,
          });

          const response = await POST(request);

          expect(response.status).toBe(415);
        });
      });
    });

    describe('File name sanitization', () => {
      const testCases = [
        { input: 'test file.jpg', expected: 'test_file.jpg' },
        { input: 'test@file#name.jpg', expected: 'testfilename.jpg' },
        { input: 'test-file_name.jpg', expected: 'test-file_name.jpg' },
        { input: 'TEST.FILE.JPG', expected: 'test.file.jpg' },
        { input: '   spaces   .jpg', expected: 'spaces.jpg' },
      ];

      testCases.forEach(({ input, expected }) => {
        it(`should sanitize file name: "${input}" -> "${expected}"`, async () => {
          const mockFile = new File(['test content'], input, {
            type: 'image/jpeg',
            size: 1024,
          });

          mockFs.mkdir.mockResolvedValue(undefined);
          mockFs.writeFile.mockResolvedValue(undefined);

          const request = TestRequestBuilder.createRequest(
            'POST',
            '/api/upload'
          );
          Object.defineProperty(request, 'formData', {
            value: jest.fn().mockResolvedValue({
              get: () => mockFile,
            }),
            configurable: true,
          });

          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data.data.originalName).toBe(expected);
        });
      });
    });

    describe('Error handling', () => {
      it('should handle FormData parsing errors', async () => {
        const request = TestRequestBuilder.createRequest('POST', '/api/upload');
        Object.defineProperty(request, 'formData', {
          value: jest.fn().mockRejectedValue(new Error('FormData parse error')),
          configurable: true,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        testValidators.validateErrorResponse(
          data,
          undefined,
          'Invalid form data'
        );
      });

      it('should handle file system permission errors', async () => {
        const mockFile = new File(['test content'], 'test.jpg', {
          type: 'image/jpeg',
          size: 1024,
        });

        mockFs.mkdir.mockRejectedValue(new Error('EACCES: permission denied'));

        const request = TestRequestBuilder.createRequest('POST', '/api/upload');
        Object.defineProperty(request, 'formData', {
          value: jest.fn().mockResolvedValue({
            get: () => mockFile,
          }),
          configurable: true,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        testValidators.validateErrorResponse(
          data,
          undefined,
          'Permission denied'
        );
      });

      it('should handle disk space errors', async () => {
        const mockFile = new File(['test content'], 'test.jpg', {
          type: 'image/jpeg',
          size: 1024,
        });

        mockFs.mkdir.mockRejectedValue(
          new Error('ENOSPC: no space left on device')
        );

        const request = TestRequestBuilder.createRequest('POST', '/api/upload');
        Object.defineProperty(request, 'formData', {
          value: jest.fn().mockResolvedValue({
            get: () => mockFile,
          }),
          configurable: true,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(507);
        testValidators.validateErrorResponse(
          data,
          undefined,
          'Insufficient storage'
        );
      });
    });

    describe('Response structure', () => {
      it('should return complete file information', async () => {
        const mockFile = new File(['test content'], 'test.jpg', {
          type: 'image/jpeg',
          size: 1024,
        });

        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.writeFile.mockResolvedValue(undefined);

        const request = TestRequestBuilder.createRequest('POST', '/api/upload');
        Object.defineProperty(request, 'formData', {
          value: jest.fn().mockResolvedValue({
            get: () => mockFile,
          }),
          configurable: true,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toHaveProperty('filename');
        expect(data.data).toHaveProperty('originalName');
        expect(data.data).toHaveProperty('size');
        expect(data.data).toHaveProperty('mimeType');
        expect(data.data).toHaveProperty('path');
        expect(data.data).toHaveProperty('url');
        expect(typeof data.data.size).toBe('number');
        expect(typeof data.data.filename).toBe('string');
      });
    });

    describe('Performance tests', () => {
      it('should handle large files within timeout', async () => {
        const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.jpg', {
          type: 'image/jpeg',
          size: 5 * 1024 * 1024,
        });

        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.writeFile.mockResolvedValue(undefined);

        const request = TestRequestBuilder.createRequest('POST', '/api/upload');
        Object.defineProperty(request, 'formData', {
          value: jest.fn().mockResolvedValue({
            get: () => largeFile,
          }),
          configurable: true,
        });

        const startTime = process.hrtime.bigint();
        const response = await POST(request);
        const endTime = process.hrtime.bigint();

        const responseTime = Number(endTime - startTime) / 1000000;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(5000); // 5 seconds for 5MB file
        console.log(`Large file upload response time: ${responseTime}ms`);
      });
    });
  });
});
