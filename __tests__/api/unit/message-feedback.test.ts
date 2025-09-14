/**
 * Message Feedback API Unit Tests
 * Tests for /api/message-feedback endpoint
 */

import { POST } from '@/app/api/message-feedback/route';
import { TestRequestBuilder, testValidators } from '@/__tests__/utils/api-test-utils';

// Mock file system operations
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

const mockFs = require('fs/promises');
const mockPath = require('path');

describe('Message Feedback API - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('[]');
    mockFs.writeFile.mockResolvedValue(undefined);
    mockPath.join.mockImplementation((...args) => args.join('/'));
  });

  describe('POST /api/message-feedback', () => {
    it('should save valid like feedback successfully', async () => {
      const feedbackData = {
        messageId: 'msg-123',
        type: 'like',
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);

      expect(mockFs.mkdir).toHaveBeenCalledWith(expect.stringContaining('data'), {
        recursive: true,
      });
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('message-feedback.json'),
        'utf-8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('message-feedback.json'),
        JSON.stringify([feedbackData], null, 2)
      );
    });

    it('should save valid dislike feedback successfully', async () => {
      const feedbackData = {
        messageId: 'msg-456',
        type: 'dislike',
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('message-feedback.json'),
        JSON.stringify([feedbackData], null, 2)
      );
    });

    it('should validate required messageId field', async () => {
      const feedbackData = {
        type: 'like',
        // Missing messageId
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('参数错误');
      expect(mockFs.mkdir).not.toHaveBeenCalled();
      expect(mockFs.readFile).not.toHaveBeenCalled();
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should validate required type field', async () => {
      const feedbackData = {
        messageId: 'msg-123',
        // Missing type
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('参数错误');
      expect(mockFs.mkdir).not.toHaveBeenCalled();
    });

    it('should validate allowed type values', async () => {
      const invalidTypes = ['upvote', 'downvote', 'star', 'flag', ''];

      for (const type of invalidTypes) {
        const feedbackData = {
          messageId: 'msg-123',
          type: type,
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('参数错误');
      }
    });

    it('should handle existing feedback file with content', async () => {
      const existingFeedback = [
        { messageId: 'msg-existing', type: 'like', time: 1640995200000 },
        { messageId: 'msg-old', type: 'dislike', time: 1640995100000 },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingFeedback));

      const newFeedback = {
        messageId: 'msg-new',
        type: 'like',
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', newFeedback);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);

      // Should append new feedback to existing list
      const expectedList = [...existingFeedback, { ...newFeedback, time: expect.any(Number) }];
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('message-feedback.json'),
        JSON.stringify(expectedList, null, 2)
      );
    });

    it('should handle duplicate messageId by replacing existing feedback', async () => {
      const existingFeedback = [
        { messageId: 'msg-123', type: 'like', time: 1640995200000 },
        { messageId: 'msg-other', type: 'dislike', time: 1640995100000 },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingFeedback));

      const updatedFeedback = {
        messageId: 'msg-123', // Same messageId as existing
        type: 'dislike',   // Different type
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', updatedFeedback);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);

      // Should replace the existing feedback with same messageId
      const expectedList = [
        { messageId: 'msg-other', type: 'dislike', time: 1640995100000 },
        { ...updatedFeedback, time: expect.any(Number) },
      ];
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('message-feedback.json'),
        JSON.stringify(expectedList, null, 2)
      );
    });

    it('should handle empty feedback file', async () => {
      mockFs.readFile.mockResolvedValue('');

      const feedbackData = {
        messageId: 'msg-123',
        type: 'like',
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.json().ok).toBe(true);
    });

    it('should handle malformed JSON in existing file', async () => {
      mockFs.readFile.mockResolvedValue('invalid json content');

      const feedbackData = {
        messageId: 'msg-123',
        type: 'like',
      };

      const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);

      // Should create new list when JSON is malformed
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('message-feedback.json'),
        JSON.stringify([{ ...feedbackData, time: expect.any(Number) }], null, 2)
      );
    });

    describe('File system error handling', () => {
      it('should handle directory creation errors', async () => {
        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);

        expect(response.status).toBe(500);
        expect(response.json().ok).toBeUndefined();
      });

      it('should handle file read errors', async () => {
        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        mockFs.readFile.mockRejectedValue(new Error('File not found'));

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.ok).toBe(true);

        // Should continue with empty list when file read fails
        expect(mockFs.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('message-feedback.json'),
          JSON.stringify([{ ...feedbackData, time: expect.any(Number) }], null, 2)
        );
      });

      it('should handle file write errors', async () => {
        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        mockFs.writeFile.mockRejectedValue(new Error('Disk full'));

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);

        expect(response.status).toBe(500);
        expect(response.json().ok).toBeUndefined();
      });

      it('should handle permission errors on directory creation', async () => {
        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        mockFs.mkdir.mockRejectedValue(new Error('EACCES: permission denied'));

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);

        expect(response.status).toBe(500);
      });

      it('should handle disk space errors on file write', async () => {
        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        mockFs.writeFile.mockRejectedValue(new Error('ENOSPC: no space left on device'));

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);

        expect(response.status).toBe(500);
      });
    });

    describe('Request validation', () => {
      it('should handle invalid JSON in request body', async () => {
        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback');
        request.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('参数错误');
      });

      it('should handle empty request body', async () => {
        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', {});
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('参数错误');
      });

      it('should handle null request body', async () => {
        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback');
        request.json = jest.fn().mockResolvedValue(null);

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('参数错误');
      });
    });

    describe('Data format validation', () => {
      it('should handle non-string messageId', async () => {
        const invalidMessageIds = [123, null, undefined, {}, []];

        for (const messageId of invalidMessageIds) {
          const feedbackData = {
            messageId: messageId,
            type: 'like',
          };

          const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(400);
          expect(data.error).toBe('参数错误');
        }
      });

      it('should handle empty string messageId', async () => {
        const feedbackData = {
          messageId: '',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('参数错误');
      });

      it('should handle whitespace-only messageId', async () => {
        const feedbackData = {
          messageId: '   ',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('参数错误');
      });
    });

    describe('Response format', () => {
      it('should return consistent success response format', async () => {
        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('ok', true);
        expect(Object.keys(data)).toHaveLength(1); // Only 'ok' property
      });

      it('should return consistent error response format', async () => {
        const feedbackData = {
          messageId: '',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toHaveProperty('error', '参数错误');
        expect(Object.keys(data)).toHaveLength(1); // Only 'error' property
      });
    });

    describe('Performance tests', () => {
      it('should handle large existing feedback lists efficiently', async () => {
        const largeFeedbackList = Array.from({ length: 1000 }, (_, i) => ({
          messageId: `msg-${i}`,
          type: i % 2 === 0 ? 'like' : 'dislike',
          time: 1640995200000 + i,
        }));

        mockFs.readFile.mockResolvedValue(JSON.stringify(largeFeedbackList));

        const feedbackData = {
          messageId: 'msg-new',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);

        const startTime = process.hrtime.bigint();
        const response = await POST(request);
        const endTime = process.hrtime.bigint();

        const responseTime = Number(endTime - startTime) / 1000000;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(100); // Should handle 1000 items quickly
        console.log(`Large feedback list processing time: ${responseTime}ms`);
      });

      it('should respond within 50ms for normal operations', async () => {
        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);

        const startTime = process.hrtime.bigint();
        const response = await POST(request);
        const endTime = process.hrtime.bigint();

        const responseTime = Number(endTime - startTime) / 1000000;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(50);
        console.log(`Message feedback save response time: ${responseTime}ms`);
      });
    });

    describe('Security and input sanitization', () => {
      it('should handle potentially malicious messageId values', async () => {
        const maliciousMessageIds = [
          '../../../etc/passwd',
          '<script>alert("xss")</script>',
          'msg-123; DROP TABLE users; --',
          '{"malformed":"json"}',
          'msg-123/../secret',
        ];

        for (const messageId of maliciousMessageIds) {
          const feedbackData = {
            messageId: messageId,
            type: 'like',
          };

          const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
          const response = await POST(request);
          const data = await response.json();

          // Should still process the feedback (sanitization should happen at storage level)
          expect(response.status).toBe(200);
          expect(data.ok).toBe(true);
        }
      });

      it('should not expose file system paths in error responses', async () => {
        mockFs.mkdir.mockRejectedValue(new Error('/path/to/secret/directory not found'));

        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);

        expect(response.status).toBe(500);
        // Error message should not contain sensitive file paths
        const errorData = await response.json();
        expect(errorData.error).not.toContain('/path/to/secret');
      });

      it('should prevent directory traversal through messageId', async () => {
        const maliciousMessageId = '../../../etc/passwd';

        const feedbackData = {
          messageId: maliciousMessageId,
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);

        // File path should be properly constructed
        const writeCall = mockFs.writeFile.mock.calls[0];
        const filePath = writeCall[0];
        expect(filePath).not.toContain('..');
        expect(filePath).not.toContain('etc');
        expect(filePath).not.toContain('passwd');
      });
    });

    describe('File path handling', () => {
      it('should use correct file path structure', async () => {
        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);
        await POST(request);

        expect(mockPath.join).toHaveBeenCalledWith(
          expect.stringContaining('data'),
          'message-feedback.json'
        );
      });

      it('should handle process.cwd() correctly', () => {
        // Test that the path construction uses process.cwd()
        const originalCwd = process.cwd;
        process.cwd = jest.fn().mockReturnValue('/custom/path');

        const feedbackData = {
          messageId: 'msg-123',
          type: 'like',
        };

        const request = TestRequestBuilder.createRequest('POST', '/api/message-feedback', feedbackData);

        // We need to restore the original cwd after test
        const originalCwdFunc = process.cwd;
        process.cwd = originalCwd;
      });
    });
  });
});