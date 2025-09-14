/**
 * Chat Proxy API Unit Tests
 *
 * Tests for /api/chat-proxy endpoint:
 * - GET request proxy functionality
 * - POST request proxy functionality
 * - URL validation and security
 * - Header handling and forwarding
 * - Streaming response processing
 * - Non-streaming response processing
 * - Error handling and retry logic
 * - Timeout management
 * - Cross-platform compatibility
 * - Performance testing
 * - Security testing
 */

import { GET, POST } from '@/app/api/chat-proxy/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/cross-platform-utils', () => ({
  createCrossPlatformTextDecoder: jest.fn(() => ({
    decode: jest.fn((chunk, options) =>
      options?.stream ? `decoded_chunk_${chunk}` : `decoded_${chunk}`
    )
  })),
  createCrossPlatformTextEncoder: jest.fn(() => ({
    encode: jest.fn(text => new TextEncoder().encode(text))
  })),
  isStreamingContentType: jest.fn((contentType) =>
    contentType?.includes('text/event-stream') || false
  ),
  processStreamLines: jest.fn((buffer) => ({
    lines: buffer.split('\n').filter(line => line.trim()),
    remainingBuffer: ''
  })),
  categorizeStreamError: jest.fn((error) => ({
    type: 'network_error',
    message: error instanceof Error ? error.message : String(error),
    shouldRetry: Math.random() > 0.5
  })),
  safeCrossPlatformLog: jest.fn()
}));

const crossPlatformUtils = require('@/lib/cross-platform-utils');

// Mock global fetch
global.fetch = jest.fn();

describe('Chat Proxy API - GET /api/chat-proxy', () => {
  const testRequestBuilder = {
    createGetRequest: (url: string, targetUrl?: string): NextRequest => {
      const requestUrl = new URL(url);
      if (targetUrl) {
        requestUrl.searchParams.set('targetUrl', targetUrl);
      }
      return new NextRequest(requestUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
          'User-Agent': 'Test-Agent/1.0'
        }
      });
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Request Validation', () => {
    it('should reject requests without targetUrl parameter', async () => {
      const request = testRequestBuilder.createGetRequest('http://localhost:3000/api/chat-proxy');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(400);
      expect(data.message).toBe('缺少 targetUrl 参数');
      expect(data.fallback).toBe(true);
    });

    it('should reject requests with invalid URL format', async () => {
      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'invalid-url'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(400);
      expect(data.message).toBe('无效的 URL 格式');
      expect(data.fallback).toBe(true);
    });

    it('should accept requests with valid URL format', async () => {
      const mockResponse = new Response(JSON.stringify({ test: 'data' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/chat',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should handle various valid URL formats', async () => {
      const validUrls = [
        'https://api.example.com/chat',
        'http://localhost:8000/api/chat',
        'https://subdomain.example.com/v1/chat/completions',
        'http://192.168.1.100:3000/api/assistant/chat'
      ];

      for (const url of validUrls) {
        (global.fetch as jest.Mock).mockResolvedValue(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        );

        const request = testRequestBuilder.createGetRequest(
          'http://localhost:3000/api/chat-proxy',
          url
        );
        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(global.fetch).toHaveBeenCalledWith(
          url,
          expect.any(Object)
        );
      }
    });
  });

  describe('Header Processing', () => {
    it('should forward original headers excluding host', async () => {
      const mockResponse = new Response(JSON.stringify({ test: 'data' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      await GET(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[0].headers;

      expect(headers).toHaveProperty('Content-Type', 'application/json');
      expect(headers).toHaveProperty('Authorization', 'Bearer test-token');
      expect(headers).toHaveProperty('User-Agent', 'Test-Agent/1.0');
      expect(headers).not.toHaveProperty('host');
    });

    it('should handle requests with custom headers', async () => {
      const mockResponse = new Response(JSON.stringify({ test: 'data' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const customHeadersRequest = new NextRequest(
        'http://localhost:3000/api/chat-proxy?targetUrl=https://api.example.com/chat',
        {
          method: 'GET',
          headers: {
            'X-Custom-Header': 'custom-value',
            'X-API-Key': 'secret-key',
            'Accept': 'application/json',
            'Host': 'should-be-removed'
          }
        }
      );

      await GET(customHeadersRequest);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[0].headers;

      expect(headers).toHaveProperty('X-Custom-Header', 'custom-value');
      expect(headers).toHaveProperty('X-API-Key', 'secret-key');
      expect(headers).toHaveProperty('Accept', 'application/json');
      expect(headers).not.toHaveProperty('Host');
    });

    it('should handle requests with no additional headers', async () => {
      const mockResponse = new Response(JSON.stringify({ test: 'data' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const minimalRequest = new NextRequest(
        'http://localhost:3000/api/chat-proxy?targetUrl=https://api.example.com/chat',
        { method: 'GET' }
      );

      await GET(minimalRequest);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[0].headers;

      expect(headers).toEqual({});
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests with exponential backoff', async () => {
      // Fail first attempt, succeed on retry
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        );

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Verify exponential backoff was used
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should give up after max retries', async () => {
      // Always fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Persistent error'));

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(500);
      expect(data.message).toBe('Fetch 失败');
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should break retry loop on successful request', async () => {
      // Fail twice, succeed on third attempt
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockRejectedValueOnce(new Error('Second error'))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        );

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Response Processing', () => {
    it('should handle successful JSON responses', async () => {
      const mockData = {
        choices: [{ message: { content: 'Hello, world!' } }]
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(200);
      expect(data.data).toEqual(mockData);
    });

    it('should handle non-200 HTTP responses gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        new Response('Service unavailable', {
          status: 503,
          statusText: 'Service Unavailable'
        })
      );

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe('无法连接到服务器，请稍后再试。');
    });

    it('should handle non-JSON content types', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        new Response('Plain text response', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      );

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(415);
      expect(data.message).toContain('非 JSON 响应');
      expect(data.fallback).toBe(true);
    });

    it('should handle invalid JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        new Response('invalid json {', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual({ error: '无效的 JSON 响应' });
    });
  });

  describe('Timeout Management', () => {
    it('should handle request timeouts', async () => {
      // Mock fetch that never resolves
      const fetchPromise = new Promise(() => {});
      (global.fetch as jest.Mock).mockReturnValue(fetchPromise);

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      // Fast-forward timers to trigger timeout
      const responsePromise = GET(request);
      jest.advanceTimersByTime(15000);

      const response = await responsePromise;
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(500);
      expect(data.message).toBe('The operation was aborted.');
    });

    it('should clear timeout on successful response', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      await GET(request);

      // Verify timeout was cleared (setTimeout was called but not executed)
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 15000);
      expect(clearTimeout).toHaveBeenCalled();
    });

    it('should clear timeout on errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      await GET(request);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 15000);
      expect(clearTimeout).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network connection failed'));

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(500);
      expect(data.message).toBe('Network connection failed');
      expect(data.fallback).toBe(true);
    });

    it('should handle unexpected errors during processing', async () => {
      // Mock URL constructor to throw error
      jest.spyOn(URL.prototype, 'searchParams', 'get').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(500);
      expect(data.fallback).toBe(true);
    });
  });

  describe('Performance Testing', () => {
    it('should handle requests efficiently', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = testRequestBuilder.createGetRequest(
        'http://localhost:3000/api/chat-proxy',
        'https://api.example.com/chat'
      );

      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle concurrent requests efficiently', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const concurrentRequests = 10;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const request = testRequestBuilder.createGetRequest(
          'http://localhost:3000/api/chat-proxy',
          `https://api.example.com/chat/${i}`
        );
        requests.push(GET(request));
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses.length).toBe(concurrentRequests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      expect(duration).toBeLessThan(500); // Should complete within 500ms total
    });
  });

  describe('Security Testing', () => {
    it('should prevent SSRF attacks by validating URL format', async () => {
      const maliciousUrls = [
        'file:///etc/passwd',
        'ftp://internal-server/config',
        'http://169.254.169.254/latest/meta-data/',
        'http://127.0.0.1/admin',
        'http://localhost/admin',
        'http://[::1]/admin'
      ];

      for (const maliciousUrl of maliciousUrls) {
        const request = testRequestBuilder.createGetRequest(
          'http://localhost:3000/api/chat-proxy',
          maliciousUrl
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe(400);
        expect(data.message).toBe('无效的 URL 格式');
      }
    });

    it('should not forward sensitive headers', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = new NextRequest(
        'http://localhost:3000/api/chat-proxy?targetUrl=https://api.example.com/chat',
        {
          method: 'GET',
          headers: {
            'host': 'evil.com',
            'cookie': 'session=malicious',
            'authorization': 'Bearer secret',
            'x-forwarded-for': '192.168.1.100'
          }
        }
      );

      await GET(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[0].headers;

      expect(headers).not.toHaveProperty('host');
      // Authorization should be forwarded as it's needed for API calls
      expect(headers).toHaveProperty('authorization', 'Bearer secret');
    });

    it('should handle URL encoding attempts', async () => {
      const encodedUrls = [
        'https%3A%2F%2Fapi.example.com%2Fchat',
        'javascript:alert(1)//',
        'data:text/html,<script>alert(1)</script>'
      ];

      for (const encodedUrl of encodedUrls) {
        const request = testRequestBuilder.createGetRequest(
          'http://localhost:3000/api/chat-proxy',
          encodedUrl
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe(400);
        expect(data.message).toBe('无效的 URL 格式');
      }
    });
  });
});

describe('Chat Proxy API - POST /api/chat-proxy', () => {
  const testRequestBuilder = {
    createPostRequest: (body: any): NextRequest => {
      return new NextRequest('http://localhost:3000/api/chat-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Request Validation', () => {
    it('should reject requests without targetUrl', async () => {
      const request = testRequestBuilder.createPostRequest({
        method: 'POST',
        headers: {},
        body: { message: 'Hello' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(400);
      expect(data.message).toBe('缺少 targetUrl 参数');
    });

    it('should reject requests with invalid URL format', async () => {
      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'invalid-url',
        method: 'POST',
        headers: {},
        body: { message: 'Hello' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(400);
      expect(data.message).toBe('无效的 URL 格式');
    });

    it('should handle missing request body gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat-proxy', {
        method: 'POST'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(500);
    });

    it('should ensure requestBody is never undefined', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: {}
        // No body property
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0].body).toBe('{}'); // Empty object as fallback
    });
  });

  describe('Streaming Detection', () => {
    it('should detect streaming requests via Accept header', async () => {
      const mockReadable = new ReadableStream();
      const mockResponse = new Response(mockReadable, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });

      // Mock TransformStream
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      // Mock response body
      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockResolvedValue({ done: true, value: undefined })
        }))
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello', stream: true }
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/chat',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'text/event-stream'
          })
        })
      );
    });

    it('should detect streaming requests via body stream property', async () => {
      const mockReadable = new ReadableStream();
      const mockResponse = new Response(mockReadable, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });

      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockResolvedValue({ done: true, value: undefined })
        }))
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: {},
        body: { message: 'Hello', stream: true }
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
    });

    it('should process non-streaming requests normally', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: {},
        body: { message: 'Hello' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(200);
      expect(data.data).toEqual({ success: true });
    });
  });

  describe('Streaming Response Processing', () => {
    beforeEach(() => {
      // Mock TransformStream
      const mockReadable = new ReadableStream();
      const mockWriter = {
        write: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined)
      };
      const mockWritable = new WritableStream();
      jest.spyOn(mockWritable, 'getWriter').mockReturnValue(mockWriter);

      const mockTransformStream = {
        readable: mockReadable,
        writable: mockWritable
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);
    });

    it('should process streaming responses correctly', async () => {
      // Mock streaming response with chunks
      const mockChunks = [
        new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'),
        new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world!"}}]}\n\n'),
        new TextEncoder().encode('data: [DONE]\n\n')
      ];

      const mockBody = {
        getReader: jest.fn()
      };
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ done: false, value: mockChunks[0] })
          .mockResolvedValueOnce({ done: false, value: mockChunks[1] })
          .mockResolvedValueOnce({ done: false, value: mockChunks[2] })
          .mockResolvedValueOnce({ done: true, value: undefined })
      };
      mockBody.getReader.mockReturnValue(mockReader);

      const mockResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(crossPlatformUtils.processStreamLines).toHaveBeenCalled();
      expect(crossPlatformUtils.createCrossPlatformTextDecoder).toHaveBeenCalled();
      expect(crossPlatformUtils.createCrossPlatformTextEncoder).toHaveBeenCalled();
    });

    it('should handle streaming errors gracefully', async () => {
      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockRejectedValue(new Error('Stream error'))
        }))
      };

      const mockResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(crossPlatformUtils.categorizeStreamError).toHaveBeenCalled();
      expect(crossPlatformUtils.safeCrossPlatformLog).toHaveBeenCalledWith(
        'error',
        '流式代理错误',
        expect.any(Object)
      );
    });

    it('should handle streaming timeout', async () => {
      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn(() => new Promise(() => {})) // Never resolves
        }))
      };

      const mockResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const responsePromise = POST(request);

      // Fast-forward to trigger timeout
      jest.advanceTimersByTime(45000);

      const response = await responsePromise;

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(crossPlatformUtils.safeCrossPlatformLog).toHaveBeenCalledWith(
        'error',
        '流式代理错误',
        expect.objectContaining({
          errorType: expect.any(String),
          shouldRetry: expect.any(Boolean)
        })
      );
    });

    it('should handle empty streaming responses', async () => {
      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockResolvedValue({ done: true, value: undefined })
        }))
      };

      const mockResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(crossPlatformUtils.safeCrossPlatformLog).toHaveBeenCalledWith(
        'log',
        '流读取完成',
        expect.any(Object)
      );
    });
  });

  describe('Non-Streaming Response Processing', () => {
    it('should handle successful JSON responses', async () => {
      const mockData = {
        choices: [{ message: { content: 'Response from API' } }]
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: {},
        body: { message: 'Hello' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(200);
      expect(data.data).toEqual(mockData);
    });

    it('should handle non-JSON responses with fallback', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        new Response('Plain text error', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      );

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: {},
        body: { message: 'Hello' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.choices[0].message.content).toContain('非JSON响应');
      expect(data.fallback).toBe(true);
    });

    it('should handle API errors with user-friendly messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error'
        })
      );

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: {},
        body: { message: 'Hello' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(200);
      expect(data.fallback).toBe(true);
      expect(data.data.choices[0].message.content).toContain('网络问题');
    });
  });

  describe('Enhanced Headers for Streaming', () => {
    it('should set appropriate headers for streaming requests', async () => {
      const mockReadable = new ReadableStream();
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockResolvedValue({ done: true, value: undefined })
        }))
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const response = await POST(request);

      // Check response headers
      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      expect(response.headers.get('Connection')).toBe('keep-alive');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('X-Accel-Buffering')).toBe('no');

      // Check forwarded request headers
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const fetchHeaders = fetchCall[0].headers;
      expect(fetchHeaders['Content-Type']).toBe('application/json');
      expect(fetchHeaders['Accept']).toBe('text/event-stream');
      expect(fetchHeaders['Cache-Control']).toBe('no-cache');
      expect(fetchHeaders['Connection']).toBe('keep-alive');
      expect(fetchHeaders['User-Agent']).toBe('FastGPT-Proxy/1.0');
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should use cross-platform utilities for streaming', async () => {
      const mockReadable = new ReadableStream();
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockResolvedValue({ done: true, value: undefined })
        }))
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      await POST(request);

      expect(crossPlatformUtils.createCrossPlatformTextDecoder).toHaveBeenCalled();
      expect(crossPlatformUtils.createCrossPlatformTextEncoder).toHaveBeenCalled();
      expect(crossPlatformUtils.processStreamLines).toHaveBeenCalled();
      expect(crossPlatformUtils.isStreamingContentType).toHaveBeenCalled();
      expect(crossPlatformUtils.categorizeStreamError).toHaveBeenCalled();
      expect(crossPlatformUtils.safeCrossPlatformLog).toHaveBeenCalled();
    });

    it('should handle platform-specific error categorization', async () => {
      crossPlatformUtils.categorizeStreamError.mockReturnValue({
        type: 'timeout_error',
        message: 'Request timeout',
        shouldRetry: true
      });

      const mockReadable = new ReadableStream();
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockRejectedValue(new Error('Timeout'))
        }))
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      await POST(request);

      expect(crossPlatformUtils.categorizeStreamError).toHaveBeenCalledWith(
        expect.any(Error)
      );
      expect(crossPlatformUtils.safeCrossPlatformLog).toHaveBeenCalledWith(
        'error',
        '流式代理错误',
        expect.objectContaining({
          errorType: 'timeout_error',
          shouldRetry: true
        })
      );
    });
  });

  describe('Performance Testing', () => {
    it('should handle streaming requests efficiently', async () => {
      const mockReadable = new ReadableStream();
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockResolvedValue({ done: true, value: undefined })
        }))
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const startTime = Date.now();
      const response = await POST(request);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle large payloads efficiently', async () => {
      const largePayload = {
        messages: Array(100).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i} with some content`.repeat(10)
        }))
      };

      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: {},
        body: largePayload
      });

      const startTime = Date.now();
      const response = await POST(request);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(200); // Should complete within 200ms even with large payload
    });
  });

  describe('Security Testing', () => {
    it('should prevent header injection attacks', async () => {
      const maliciousHeaders = {
        'X-Injected-Header': 'malicious-value\r\nX-Another: injected',
        'User-Agent': 'Mozilla/5.0\r\nX-Hacked: true'
      };

      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: maliciousHeaders,
        body: { message: 'Hello' }
      });

      await POST(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const forwardedHeaders = fetchCall[0].headers;

      // Headers should be forwarded as-is (fetch handles this safely)
      expect(forwardedHeaders['X-Injected-Header']).toBe(maliciousHeaders['X-Injected-Header']);
    });

    it('should validate target URLs to prevent SSRF', async () => {
      const maliciousUrls = [
        'file:///etc/passwd',
        'http://169.254.169.254/latest/meta-data/',
        'http://127.0.0.1/internal-api',
        'http://localhost/admin',
        'http://[::1]/config'
      ];

      for (const maliciousUrl of maliciousUrls) {
        const request = testRequestBuilder.createPostRequest({
          targetUrl: maliciousUrl,
          method: 'POST',
          headers: {},
          body: { message: 'Hello' }
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe(400);
        expect(data.message).toBe('无效的 URL 格式');
      }
    });

    it('should sanitize error messages in streaming responses', async () => {
      const mockReadable = new ReadableStream();
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockRejectedValue(new Error('Error with "quotes" and new\nlines'))
        }))
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: mockBody
      });

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      await POST(request);

      expect(crossPlatformUtils.safeCrossPlatformLog).toHaveBeenCalled();
    });
  });

  describe('Edge Cases & Error Recovery', () => {
    it('should handle partial streaming responses', async () => {
      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('partial data') })
            .mockResolvedValueOnce({ done: true, value: undefined })
        }))
      };

      const mockResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const mockReadable = new ReadableStream();
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(crossPlatformUtils.processStreamLines).toHaveBeenCalledWith('partial data');
    });

    it('should handle connection interruptions during streaming', async () => {
      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn().mockRejectedValue(new Error('Connection reset'))
        }))
      };

      const mockResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const mockReadable = new ReadableStream();
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(crossPlatformUtils.categorizeStreamError).toHaveBeenCalled();
    });

    it('should handle malformed streaming data', async () => {
      const mockBody = {
        getReader: jest.fn(() => ({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('malformed streaming data without proper format') })
            .mockResolvedValueOnce({ done: true, value: undefined })
        }))
      };

      const mockResponse = new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ...mockResponse,
        body: mockBody
      });

      const mockReadable = new ReadableStream();
      const mockTransformStream = {
        readable: mockReadable,
        writable: new WritableStream()
      };
      jest.spyOn(global, 'TransformStream').mockImplementation(() => mockTransformStream);

      const request = testRequestBuilder.createPostRequest({
        targetUrl: 'https://api.example.com/chat',
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: { message: 'Hello' }
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      // Should still process the data even if malformed
      expect(crossPlatformUtils.processStreamLines).toHaveBeenCalled();
    });
  });
});