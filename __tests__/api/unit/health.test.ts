/**
 * Health API Unit Tests
 * Tests for /api/health endpoint
 */

import { GET, POST, PUT, DELETE, HEAD } from '@/app/api/health/route';
import { testDb, testRedis, TestRequestBuilder, testValidators } from '@/__tests__/utils/api-test-utils';

// Mock database and Redis
jest.mock('@/lib/db/sequelize', () => ({
  authenticate: jest.fn(),
  close: jest.fn(),
}));

jest.mock('@/lib/db/redis', () => ({
  isOpen: false,
  connect: jest.fn(),
  ping: jest.fn(),
  quit: jest.fn(),
}));

jest.mock('@/lib/cross-platform-utils', () => ({
  getEnvironmentInfo: jest.fn(() => ({
    nodeVersion: 'v18.0.0',
    platform: 'linux',
    arch: 'x64',
    uptime: 3600,
  })),
  validateProductionConfig: jest.fn(() => ({
    isValid: true,
    warnings: [],
    errors: [],
  })),
}));

describe('Health API - Unit Tests', () => {
  const mockSequelize = require('@/lib/db/sequelize');
  const mockRedis = require('@/lib/db/redis');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    describe('Simple health check (deep=false)', () => {
      it('should return success response with environment info', async () => {
        const request = TestRequestBuilder.createRequest('GET', '/api/health');

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        testValidators.validateSuccessResponse(data);
        expect(data.message).toBe('ok');
        expect(data.environment).toBeDefined();
        expect(data.config).toBeDefined();
        expect(data.timestamp).toBeDefined();
        expect(data.dependencies).toBeUndefined();
      });

      it('should handle different URL formats for deep parameter', async () => {
        // Test with searchParams
        const request1 = TestRequestBuilder.createRequest('GET', '/api/health?deep=0');
        const response1 = await GET(request1);
        const data1 = await response1.json();

        expect(response1.status).toBe(200);
        testValidators.validateSuccessResponse(data1);

        // Test with URL string format
        const mockRequestWithUrl = {
          url: 'http://localhost:3000/api/health',
          nextUrl: null,
        } as any;

        const response2 = await GET(mockRequestWithUrl);
        const data2 = await response2.json();

        expect(response2.status).toBe(200);
        testValidators.validateSuccessResponse(data2);
      });

      it('should include cache-control headers', async () => {
        const request = TestRequestBuilder.createRequest('GET', '/api/health');
        const response = await GET(request);

        expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
        expect(response.headers.get('Pragma')).toBe('no-cache');
        expect(response.headers.get('Expires')).toBe('0');
      });
    });

    describe('Deep health check (deep=1)', () => {
      it('should check database and Redis dependencies', async () => {
        mockSequelize.authenticate.mockResolvedValue(undefined);
        mockRedis.connect.mockResolvedValue(undefined);
        mockRedis.ping.mockResolvedValue('PONG');

        const request = TestRequestBuilder.createRequest('GET', '/api/health?deep=1');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        testValidators.validateSuccessResponse(data);
        expect(data.dependencies).toBeDefined();
        expect(data.dependencies.db).toBe('ok');
        expect(data.dependencies.redis).toBe('ok');
        expect(data.success).toBe(true);
        expect(data.uptime).toBeDefined();
        expect(data.memory).toBeDefined();

        expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);
        expect(mockRedis.connect).toHaveBeenCalledTimes(1);
        expect(mockRedis.ping).toHaveBeenCalledTimes(1);
      });

      it('should handle database connection failure', async () => {
        mockSequelize.authenticate.mockRejectedValue(new Error('Database connection failed'));
        mockRedis.connect.mockResolvedValue(undefined);
        mockRedis.ping.mockResolvedValue('PONG');

        const request = TestRequestBuilder.createRequest('GET', '/api/health?deep=1');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(false);
        expect(data.dependencies.db).toBe('fail');
        expect(data.dependencies.redis).toBe('ok');
      });

      it('should handle Redis connection failure', async () => {
        mockSequelize.authenticate.mockResolvedValue(undefined);
        mockRedis.connect.mockRejectedValue(new Error('Redis connection failed'));

        const request = TestRequestBuilder.createRequest('GET', '/api/health?deep=1');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(false);
        expect(data.dependencies.db).toBe('ok');
        expect(data.dependencies.redis).toBe('fail');
      });

      it('should handle both database and Redis failures', async () => {
        mockSequelize.authenticate.mockRejectedValue(new Error('Database failed'));
        mockRedis.connect.mockRejectedValue(new Error('Redis failed'));

        const request = TestRequestBuilder.createRequest('GET', '/api/health?deep=1');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(false);
        expect(data.dependencies.db).toBe('fail');
        expect(data.dependencies.redis).toBe('fail');
      });

      it('should handle Redis already connected', async () => {
        mockSequelize.authenticate.mockResolvedValue(undefined);
        mockRedis.isOpen = true;
        mockRedis.ping.mockResolvedValue('PONG');

        const request = TestRequestBuilder.createRequest('GET', '/api/health?deep=1');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.dependencies.redis).toBe('ok');
        expect(mockRedis.connect).not.toHaveBeenCalled();
        expect(mockRedis.ping).toHaveBeenCalledTimes(1);
      });
    });

    describe('Error handling', () => {
      it('should handle utility function errors gracefully', async () => {
        const { getEnvironmentInfo, validateProductionConfig } = require('@/lib/cross-platform-utils');

        getEnvironmentInfo.mockImplementation(() => {
          throw new Error('Environment info error');
        });

        const request = TestRequestBuilder.createRequest('GET', '/api/health');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        testValidators.validateErrorResponse(data, 'INTERNAL_ERROR');
      });
    });
  });

  describe('Unsupported Methods', () => {
    const unsupportedMethods = [
      { method: 'POST', handler: POST },
      { method: 'PUT', handler: PUT },
      { method: 'DELETE', handler: DELETE },
    ];

    unsupportedMethods.forEach(({ method, handler }) => {
      it(`should return 405 for ${method} method`, async () => {
        const request = TestRequestBuilder.createRequest(method as any, '/api/health');
        const response = await handler();
        const data = await response.json();

        expect(response.status).toBe(405);
        testValidators.validateErrorResponse(data, undefined, 'Method Not Allowed');
      });
    });
  });

  describe('HEAD method', () => {
    it('should return 200 for HEAD request (Docker health check)', async () => {
      const response = await HEAD();

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    it('should return 500 for HEAD request on error', async () => {
      // Mock an error scenario
      const { getEnvironmentInfo } = require('@/lib/cross-platform-utils');
      getEnvironmentInfo.mockImplementation(() => {
        throw new Error('Server error');
      });

      const response = await HEAD();
      expect(response.status).toBe(500);
    });
  });

  describe('Response validation', () => {
    it('should include all required fields in success response', async () => {
      const request = TestRequestBuilder.createRequest('GET', '/api/health');
      const response = await GET(request);
      const data = await response.json();

      // Required fields
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('config');
      expect(data).toHaveProperty('timestamp');

      // Meta structure
      expect(data.meta).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('requestId');
      expect(data.meta).toHaveProperty('version');

      // Environment info
      expect(data.environment).toHaveProperty('nodeVersion');
      expect(data.environment).toHaveProperty('platform');
      expect(data.environment).toHaveProperty('arch');
      expect(data.environment).toHaveProperty('uptime');

      // Config validation
      expect(data.config).toHaveProperty('isValid');
      expect(data.config).toHaveProperty('warnings');
      expect(data.config).toHaveProperty('errors');
    });

    it('should use valid ISO date format for timestamps', async () => {
      const request = TestRequestBuilder.createRequest('GET', '/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(testValidators.isValidISODate(data.timestamp)).toBe(true);
      expect(testValidators.isValidISODate(data.meta.timestamp)).toBe(true);

      // Deep health check includes additional timestamp fields
      const deepRequest = TestRequestBuilder.createRequest('GET', '/api/health?deep=1');
      const deepResponse = await GET(deepRequest);
      const deepData = await deepResponse.json();

      if (deepData.success) {
        expect(testValidators.isValidISODate(deepData.meta.timestamp)).toBe(true);
      }
    });
  });

  describe('Performance tests', () => {
    it('should respond within 100ms for simple health check', async () => {
      const request = TestRequestBuilder.createRequest('GET', '/api/health');

      const startTime = process.hrtime.bigint();
      await GET(request);
      const endTime = process.hrtime.bigint();

      const responseTime = Number(endTime - startTime) / 1000000; // Convert to ms

      expect(responseTime).toBeLessThan(100);
      console.log(`Simple health check response time: ${responseTime}ms`);
    });

    it('should respond within 500ms for deep health check', async () => {
      mockSequelize.authenticate.mockResolvedValue(undefined);
      mockRedis.connect.mockResolvedValue(undefined);
      mockRedis.ping.mockResolvedValue('PONG');

      const request = TestRequestBuilder.createRequest('GET', '/api/health?deep=1');

      const startTime = process.hrtime.bigint();
      await GET(request);
      const endTime = process.hrtime.bigint();

      const responseTime = Number(endTime - startTime) / 1000000; // Convert to ms

      expect(responseTime).toBeLessThan(500);
      console.log(`Deep health check response time: ${responseTime}ms`);
    });
  });
});