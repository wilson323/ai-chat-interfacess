/**
 * Test Environment Setup
 * Configures Jest test environment with proper mocks and utilities
 */

import { jest } from '@jest/globals';

// Mock Next.js globals and Web APIs
if (typeof Headers !== 'undefined') global.Headers = Headers;
if (typeof Request !== 'undefined') global.Request = Request;
if (typeof Response !== 'undefined') global.Response = Response;
global.fetch = global.fetch || jest.fn();

// Mock TextEncoder/TextDecoder for Node.js environment
if (!global.TextEncoder && typeof TextEncoder !== 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder && typeof TextDecoder !== 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Mock URL if not available
if (!global.URL && typeof URL !== 'undefined') {
  global.URL = URL;
}

// Mock URLSearchParams if not available
if (!global.URLSearchParams && typeof URLSearchParams !== 'undefined') {
  global.URLSearchParams = URLSearchParams;
}

// Mock FormData if not available
if (!global.FormData && typeof FormData !== 'undefined') {
  global.FormData = FormData;
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock console methods to reduce noise during tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Restore original console methods for debugging
global.originalConsole = originalConsole;

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Export utilities for tests
export const testUtils = {
  createMockRequest: (method = 'GET', url = 'http://localhost:3000/api/test', options = {}) => {
    const { body, headers = {} } = options;

    return new Request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  createMockResponse: (data, status = 200, headers = {}) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  },

  createJWTToken: (payload, secret = 'test-secret') => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

  validateUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  validateISODate: (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString();
  },
};

export default testUtils;