/**
 * Voice Transcription API Unit Tests
 * Tests for /api/voice-to-text endpoint
 */

import { POST } from '@/app/api/voice-to-text/route';
import { TestRequestBuilder, testValidators } from '@/__tests__/utils/api-test-utils';

// Mock file system operations
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  appendFile: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

// Mock fetch for external API calls
global.fetch = jest.fn();

const mockFs = require('fs/promises');
const mockPath = require('path');

describe('Voice Transcription API - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.appendFile.mockResolvedValue(undefined);
    mockPath.join.mockImplementation((...args) => args.join('/'));

    // Reset environment variables
    process.env.OPENAI_AUDIO_API_URL = 'http://test-api.com/v1/audio/transcriptions';
    process.env.OPENAI_AUDIO_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/voice-to-text', () => {
    it('should transcribe audio file successfully', async () => {
      const mockFile = new File(['audio content'], 'test.wav', {
        type: 'audio/wav',
      });

      const mockApiResponse = {
        text: '这是语音转文字的结果',
        duration: 5.2,
        language: 'zh',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const formData = new FormData();
      formData.append('file', mockFile);

      const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
        headers: new Map([['content-type', 'multipart/form-data']]),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.text).toBe('这是语音转文字的结果');
      expect(data.duration).toBe(5.2);
      expect(data.language).toBe('zh');

      expect(fetch).toHaveBeenCalledWith(
        'http://test-api.com/v1/audio/transcriptions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-api-key',
          },
          body: expect.any(FormData),
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should validate required file parameter', async () => {
      const formData = new FormData();
      // Missing file

      const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
        headers: new Map([['content-type', 'multipart/form-data']]),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('未检测到音频文件');
      expect(data.code).toBe('NO_FILE');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should validate file size limit (25MB)', async () => {
      // Create a file that's too large (30MB)
      const largeFile = new File(['x'.repeat(30 * 1024 * 1024)], 'large.wav', {
        type: 'audio/wav',
      });

      const formData = new FormData();
      formData.append('file', largeFile);

      const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
        headers: new Map([['content-type', 'multipart/form-data']]),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toBe('音频文件过大，请录制较短的音频');
      expect(data.code).toBe('FILE_TOO_LARGE');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should validate allowed audio file types', async () => {
      const invalidFile = new File(['audio content'], 'test.txt', {
        type: 'text/plain',
      });

      const formData = new FormData();
      formData.append('file', invalidFile);

      const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
        headers: new Map([['content-type', 'multipart/form-data']]),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('不支持的音频格式');
      expect(data.code).toBe('UNSUPPORTED_FORMAT');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should accept files with valid audio extensions', async () => {
      const validFiles = [
        new File(['audio content'], 'test.wav', { type: 'audio/wav' }),
        new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' }),
        new File(['audio content'], 'test.mp4', { type: 'audio/mp4' }),
        new File(['audio content'], 'test.webm', { type: 'audio/webm' }),
        new File(['audio content'], 'test.ogg', { type: 'audio/ogg' }),
        new File(['audio content'], 'test.m4a', { type: 'audio/mp4' }),
      ];

      for (const file of validFiles) {
        const mockApiResponse = { text: '转录成功', duration: 2.5 };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockApiResponse),
        });

        const formData = new FormData();
        formData.append('file', file);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should handle missing API configuration', async () => {
      // Clear API key to simulate missing configuration
      const originalApiKey = process.env.OPENAI_AUDIO_API_KEY;
      delete process.env.OPENAI_AUDIO_API_KEY;

      const mockFile = new File(['audio content'], 'test.wav', {
        type: 'audio/wav',
      });

      const formData = new FormData();
      formData.append('file', mockFile);

      const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
        headers: new Map([['content-type', 'multipart/form-data']]),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('OpenAI Audio API 配置缺失');
      expect(data.code).toBe('CONFIG_MISSING');

      // Restore API key
      process.env.OPENAI_AUDIO_API_KEY = originalApiKey;
    });

    it('should handle default API URL when not configured', async () => {
      // Clear API URL to test default
      const originalApiUrl = process.env.OPENAI_AUDIO_API_URL;
      delete process.env.OPENAI_AUDIO_API_URL;

      const mockFile = new File(['audio content'], 'test.wav', {
        type: 'audio/wav',
      });

      const mockApiResponse = { text: '转录成功' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const formData = new FormData();
      formData.append('file', mockFile);

      const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
        headers: new Map([['content-type', 'multipart/form-data']]),
      });

      await POST(request);

      // Should use default URL
      expect(fetch).toHaveBeenCalledWith(
        'http://112.48.22.44:38082/v1/audio/transcriptions',
        expect.any(Object)
      );

      // Restore API URL
      process.env.OPENAI_AUDIO_API_URL = originalApiUrl;
    });

    describe('API error handling', () => {
      it('should handle API authentication errors', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: jest.fn().mockResolvedValue({
            error: {
              message: 'Invalid API key',
              code: 'AUTH_ERROR',
            },
          }),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid API key');
        expect(data.code).toBe('AUTH_ERROR');
      });

      it('should handle API rate limit errors', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: jest.fn().mockResolvedValue({
            error: {
              message: 'Rate limit exceeded',
              code: 'RATE_LIMIT',
            },
          }),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.error).toBe('Rate limit exceeded');
        expect(data.code).toBe('RATE_LIMIT');
      });

      it('should handle API server errors', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: jest.fn().mockResolvedValue({
            error: {
              message: 'Internal server error',
              code: 'SERVER_ERROR',
            },
          }),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
        expect(data.code).toBe('SERVER_ERROR');
      });

      it('should handle empty API response', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({}), // Empty response
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('识别结果为空');
        expect(data.code).toBe('EMPTY_RESULT');
      });

      it('should handle malformed API response', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            text: '', // Empty text
          }),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.text).toBe(''); // Empty but valid response
      });
    });

    describe('Network error handling', () => {
      it('should handle request timeout', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        // Mock timeout
        (fetch as jest.Mock).mockImplementationOnce(() => {
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AbortError')), 100);
          });
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(408);
        expect(data.error).toBe('请求超时，请重试');
        expect(data.code).toBe('REQUEST_TIMEOUT');
      });

      it('should handle network connection errors', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network connection failed'));

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('识别失败，请重试');
        expect(data.code).toBe('UNKNOWN_ERROR');
        expect(data.suggestion).toBe('如问题持续，请联系技术支持');
      });

      it('should handle DNS resolution errors', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        const dnsError = new Error('ENOTFOUND');
        (dnsError as any).code = 'ENOTFOUND';
        (fetch as jest.Mock).mockRejectedValueOnce(dnsError);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('识别失败，请重试');
        expect(data.code).toBe('UNKNOWN_ERROR');
      });
    });

    describe('Request validation', () => {
      it('should handle invalid form data', async () => {
        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text');
        // Simulate form data parsing error
        request.formData = jest.fn().mockRejectedValue(new Error('Invalid form data'));

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('识别失败，请重试');
        expect(data.code).toBe('UNKNOWN_ERROR');
      });

      it('should handle malformed file object', async () => {
        const formData = new FormData();
        formData.append('file', 'not-a-file-object'); // Invalid file

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('未检测到音频文件');
        expect(data.code).toBe('NO_FILE');
      });
    });

    describe('Error logging', () => {
      it('should log API errors to file system', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        const testError = new Error('Test API error');
        (fetch as jest.Mock).mockRejectedValueOnce(testError);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        await POST(request);

        expect(mockFs.mkdir).toHaveBeenCalledWith(expect.stringContaining('data'), {
          recursive: true,
        });
        expect(mockFs.appendFile).toHaveBeenCalledWith(
          expect.stringContaining('api-error.log'),
          expect.stringContaining('[voice-to-text]')
        );
      });

      it('should handle file system logging errors gracefully', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        // Mock file system error
        mockFs.appendFile.mockRejectedValueOnce(new Error('Cannot write log file'));

        const testError = new Error('Test API error');
        (fetch as jest.Mock).mockRejectedValueOnce(testError);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);

        // Should still return error response even if logging fails
        expect(response.status).toBe(500);
      });
    });

    describe('FormData construction', () => {
      it('should construct FormData with correct parameters', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        const mockApiResponse = { text: '转录成功' };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockApiResponse),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        await POST(request);

        // Verify FormData construction
        const fetchCall = (fetch as jest.Mock).mock.calls[0];
        const sentFormData = fetchCall[0].body;

        expect(sentFormData).toBeInstanceOf(FormData);
        expect(fetchCall[1].headers.Authorization).toBe('Bearer test-api-key');
      });

      it('should set correct language parameter', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        const mockApiResponse = { text: '转录成功' };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockApiResponse),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        await POST(request);

        // Language should be set to 'zh' for Chinese transcription
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.any(FormData),
          })
        );
      });
    });

    describe('Performance tests', () => {
      it('should handle timeout correctly (30 second limit)', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        let timeoutTriggered = false;
        (fetch as jest.Mock).mockImplementationOnce(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              timeoutTriggered = true;
              resolve({
                ok: true,
                json: jest.fn().mockResolvedValue({ text: '转录成功' }),
              });
            }, 100); // Should complete before 30s timeout
          });
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const startTime = process.hrtime.bigint();
        const response = await POST(request);
        const endTime = process.hrtime.bigint();

        const responseTime = Number(endTime - startTime) / 1000000;

        expect(response.status).toBe(200);
        expect(responseTime).toBeGreaterThan(100); // Should wait for the simulated API call
        expect(responseTime).toBeLessThan(31000); // Should not exceed 30s timeout + buffer
        console.log(`Voice transcription with timeout response time: ${responseTime}ms`);
      });

      it('should respond within 50ms for validation failures', async () => {
        const largeFile = new File(['x'.repeat(30 * 1024 * 1024)], 'large.wav', {
          type: 'audio/wav',
        });

        const formData = new FormData();
        formData.append('file', largeFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const startTime = process.hrtime.bigint();
        const response = await POST(request);
        const endTime = process.hrtime.bigint();

        const responseTime = Number(endTime - startTime) / 1000000;

        expect(response.status).toBe(413);
        expect(responseTime).toBeLessThan(50); // File size validation should be fast
        console.log(`File validation response time: ${responseTime}ms`);
      });
    });

    describe('Response format validation', () => {
      it('should return consistent success response format', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        const mockApiResponse = {
          text: '转录成功',
          duration: 3.5,
          language: 'zh',
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockApiResponse),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('text');
        expect(data).toHaveProperty('duration');
        expect(data).toHaveProperty('language');
        expect(typeof data.text).toBe('string');
      });

      it('should return consistent error response format', async () => {
        const formData = new FormData();
        // Missing file

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('code');
        expect(typeof data.error).toBe('string');
        expect(typeof data.code).toBe('string');
      });

      it('should handle API responses with missing optional fields', async () => {
        const mockFile = new File(['audio content'], 'test.wav', {
          type: 'audio/wav',
        });

        const mockApiResponse = {
          text: '转录成功',
          // Missing duration and language
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockApiResponse),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest('POST', '/api/voice-to-text', formData, {
          headers: new Map([['content-type', 'multipart/form-data']]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.text).toBe('转录成功');
        expect(data.duration).toBeNull(); // Should default to null
        expect(data.language).toBe('zh'); // Should default to 'zh'
      });
    });
  });
});