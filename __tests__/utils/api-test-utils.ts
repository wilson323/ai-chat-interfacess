/**
 * API Test Utilities
 * Common utilities for API testing including database setup, fixtures, and test helpers
 */

import { NextRequest } from 'next/server';
import { createClient } from 'redis';
import { Sequelize } from 'sequelize';
import { AgentConfig, ChatMessage, ChatSession } from '@/lib/db/models';
import { v4 as uuidv4 } from 'uuid';

// Test Database Configuration
const TEST_DB_CONFIG = {
  database: process.env.TEST_DB_NAME || 'ai_chat_test',
  username: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  dialect: 'postgres' as const,
  logging: false,
};

// Test Redis Configuration
const TEST_REDIS_CONFIG = {
  host: process.env.TEST_REDIS_HOST || 'localhost',
  port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
  password: process.env.TEST_REDIS_PASSWORD,
  db: parseInt(process.env.TEST_REDIS_DB || '1'),
};

/**
 * Test Database Manager
 * Handles test database setup and teardown
 */
export class TestDatabaseManager {
  private sequelize: Sequelize | null = null;

  async setup() {
    // Create test Sequelize instance
    this.sequelize = new Sequelize({
      ...TEST_DB_CONFIG,
      define: {
        timestamps: true,
        underscored: true,
        paranoid: true,
      },
    });

    try {
      // Authenticate and sync database
      await this.sequelize.authenticate();
      await this.sequelize.sync({ force: true });
      console.log('Test database setup completed');
    } catch (error) {
      console.error('Test database setup failed:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.sequelize) {
      // Drop all tables
      await this.sequelize.drop();
      await this.sequelize.close();
      this.sequelize = null;
      console.log('Test database cleanup completed');
    }
  }

  async clearTables() {
    if (this.sequelize) {
      const queryInterface = this.sequelize.getQueryInterface();
      const tableNames = await queryInterface.showAllTables();

      for (const tableName of tableNames) {
        await queryInterface.bulkDelete(tableName, {}, {});
      }
      console.log('Test tables cleared');
    }
  }

  getSequelize(): Sequelize {
    if (!this.sequelize) {
      throw new Error('Database not initialized. Call setup() first.');
    }
    return this.sequelize;
  }
}

/**
 * Test Redis Manager
 * Handles test Redis setup and cleanup
 */
export class TestRedisManager {
  private client: any = null;

  async setup() {
    this.client = createClient(TEST_REDIS_CONFIG);

    this.client.on('error', (err: Error) => {
      console.error('Redis client error:', err);
    });

    try {
      await this.client.connect();
      await this.client.flushDb();
      console.log('Test Redis setup completed');
    } catch (error) {
      console.error('Test Redis setup failed:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.client) {
      await this.client.flushDb();
      await this.client.quit();
      this.client = null;
      console.log('Test Redis cleanup completed');
    }
  }

  async clear() {
    if (this.client) {
      await this.client.flushDb();
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis not initialized. Call setup() first.');
    }
    return this.client;
  }
}

/**
 * Test Request Builder
 * Creates mock NextRequest objects for testing
 */
export class TestRequestBuilder {
  static createRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    url: string = '/api/test',
    options: {
      body?: any;
      headers?: Record<string, string>;
      searchParams?: Record<string, string>;
    } = {}
  ): NextRequest {
    const { body, headers = {}, searchParams = {} } = options;

    // Build URL with search params - ensure absolute URL
    let finalUrl: string;
    if (url.startsWith('http')) {
      finalUrl = url;
    } else {
      // Ensure URL starts with / for relative paths
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      finalUrl = `http://localhost:3000${normalizedUrl}`;
    }

    if (Object.keys(searchParams).length > 0) {
      const params = new URLSearchParams(searchParams);
      finalUrl += `?${params.toString()}`;
    }

    // Create request with headers
    const requestHeaders = new Headers(headers);

    // Add content-type for requests with body
    if (body && !requestHeaders.has('content-type')) {
      requestHeaders.set('content-type', 'application/json');
    }

    return new NextRequest(finalUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static createAuthenticatedRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    url: string = '/api/test',
    token: string,
    options: Omit<
      Parameters<typeof TestRequestBuilder.createRequest>[2],
      'headers'
    > = {}
  ): NextRequest {
    return this.createRequest(method, url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

/**
 * Test Data Fixtures
 * Provides test data for various scenarios
 */
export class TestFixtures {
  // Agent fixtures
  static createAgent(overrides: Partial<any> = {}) {
    return {
      id: uuidv4(),
      name: `Test Agent ${Date.now()}`,
      description: 'Test agent description',
      type: 'fastgpt',
      isPublished: true,
      globalVariables: [],
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  // Chat session fixtures
  static createChatSession(overrides: Partial<any> = {}) {
    return {
      id: uuidv4(),
      sessionId: `session_${Date.now()}`,
      agentId: uuidv4(),
      userId: 'test-user',
      title: 'Test Chat Session',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  // Chat message fixtures
  static createChatMessage(overrides: Partial<any> = {}) {
    return {
      id: uuidv4(),
      sessionId: `session_${Date.now()}`,
      role: 'user',
      content: 'Test message content',
      metadata: {},
      thinking: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  // User fixtures
  static createUser(overrides: Partial<any> = {}) {
    return {
      id: uuidv4(),
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'hashedPassword123',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  // API request fixtures
  static createValidAgentRequest() {
    return {
      name: 'New Test Agent',
      description: 'A test agent for API testing',
      type: 'fastgpt',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
      },
    };
  }

  static createInvalidAgentRequest() {
    return {
      name: '', // Invalid: empty name
      type: 'invalid-type', // Invalid: not a valid type
    };
  }

  // JWT token fixtures
  static createJWTToken(payload: any, secret: string = 'test-secret'): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url'
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url'
    );

    // Simple HMAC-SHA256 for testing (not production secure)
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static createExpiredJWTToken(payload: any): string {
    const expiredPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };
    return this.createJWTToken(expiredPayload);
  }
}

/**
 * Test Validators
 * Validation helpers for API responses
 */
export class TestValidators {
  /**
   * Validate API response structure
   */
  static validateSuccessResponse(response: any, expectedData?: any) {
    expect(response).toHaveProperty('success', true);
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('meta');
    expect(response.meta).toHaveProperty('timestamp');
    expect(response.meta).toHaveProperty('requestId');
    expect(response.meta).toHaveProperty('version');

    if (expectedData) {
      expect(response.data).toMatchObject(expectedData);
    }
  }

  /**
   * Validate error response structure
   */
  static validateErrorResponse(
    response: any,
    expectedCode?: string,
    expectedMessage?: string
  ) {
    expect(response).toHaveProperty('success', false);
    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code');
    expect(response.error).toHaveProperty('message');
    expect(response.error).toHaveProperty('timestamp');
    expect(response.error).toHaveProperty('requestId');
    expect(response.error).toHaveProperty('version');

    if (expectedCode) {
      expect(response.error.code).toBe(expectedCode);
    }

    if (expectedMessage) {
      expect(response.error.message).toContain(expectedMessage);
    }
  }

  /**
   * Validate paginated response
   */
  static validatePaginatedResponse(response: any, expectedTotal?: number) {
    this.validateSuccessResponse(response);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.meta).toHaveProperty('pagination');
    expect(response.meta.pagination).toHaveProperty('page');
    expect(response.meta.pagination).toHaveProperty('limit');
    expect(response.meta.pagination).toHaveProperty('total');
    expect(response.meta.pagination).toHaveProperty('totalPages');
    expect(response.meta.pagination).toHaveProperty('hasNext');
    expect(response.meta.pagination).toHaveProperty('hasPrev');

    if (expectedTotal !== undefined) {
      expect(response.meta.pagination.total).toBe(expectedTotal);
    }
  }

  /**
   * Validate date format
   */
  static isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString();
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

/**
 * Performance Test Helpers
 */
export class PerformanceTestHelpers {
  /**
   * Measure response time
   */
  static async measureResponseTime(fn: () => Promise<any>): Promise<number> {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // Convert to milliseconds
  }

  /**
   * Run load test
   */
  static async runLoadTest(
    fn: () => Promise<any>,
    options: {
      concurrentUsers: number;
      requestsPerUser: number;
      maxTimeMs?: number;
    }
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    throughput: number;
  }> {
    const { concurrentUsers, requestsPerUser, maxTimeMs } = options;
    const results: number[] = [];
    let successful = 0;
    let failed = 0;

    const startTime = Date.now();

    const userPromises = Array(concurrentUsers)
      .fill(null)
      .map(async () => {
        for (let i = 0; i < requestsPerUser; i++) {
          if (maxTimeMs && Date.now() - startTime > maxTimeMs) {
            break;
          }

          try {
            const responseTime = await this.measureResponseTime(fn);
            results.push(responseTime);
            successful++;
          } catch (error) {
            failed++;
          }
        }
      });

    await Promise.all(userPromises);
    const totalTime = (Date.now() - startTime) / 1000; // Convert to seconds

    return {
      totalRequests: successful + failed,
      successfulRequests: successful,
      failedRequests: failed,
      averageResponseTime:
        results.length > 0
          ? results.reduce((a, b) => a + b, 0) / results.length
          : 0,
      minResponseTime: results.length > 0 ? Math.min(...results) : 0,
      maxResponseTime: results.length > 0 ? Math.max(...results) : 0,
      throughput: successful / totalTime,
    };
  }
}

/**
 * Security Test Helpers
 */
export class SecurityTestHelpers {
  /**
   * Common SQL injection payloads
   */
  static getSQLInjectionPayloads(): string[] {
    return [
      "' OR '1'='1",
      "' OR 1=1--",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users--",
      "1' OR '1'='1",
      "admin'--",
      "' OR 'x'='x",
    ];
  }

  /**
   * Common XSS payloads
   */
  static getXSSPayloads(): string[] {
    return [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '"><script>alert(document.cookie)</script>',
    ];
  }

  /**
   * Common path traversal payloads
   */
  static getPathTraversalPayloads(): string[] {
    return [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '/etc/passwd%00',
      '..%2f..%2f..%2fetc%2fpasswd',
    ];
  }

  /**
   * Test input against security payloads
   */
  static async testSecurityPayloads(
    fn: (payload: string) => Promise<any>,
    payloads: string[],
    expectVulnerability: boolean = false
  ): Promise<{
    vulnerablePayloads: string[];
    safePayloads: string[];
  }> {
    const vulnerablePayloads: string[] = [];
    const safePayloads: string[] = [];

    for (const payload of payloads) {
      try {
        const result = await fn(payload);

        // If we expect vulnerability but got success, it's vulnerable
        if (expectVulnerability && result.success) {
          vulnerablePayloads.push(payload);
        } else if (!expectVulnerability && !result.success) {
          safePayloads.push(payload);
        }
      } catch (error) {
        // Error means the payload was blocked (safe)
        if (!expectVulnerability) {
          safePayloads.push(payload);
        }
      }
    }

    return { vulnerablePayloads, safePayloads };
  }
}

/**
 * Mock implementations
 */
export class TestMocks {
  /**
   * Mock external API calls
   */
  static mockExternalAPI(
    implementation: (url: string, options?: any) => Promise<any>
  ) {
    global.fetch = jest.fn().mockImplementation(implementation);
  }

  /**
   * Mock authentication
   */
  static mockAuthMiddleware(
    implementation: (
      request: NextRequest
    ) => Promise<{ success: boolean; user?: any }>
  ) {
    jest.mock('@/lib/middleware/auth', () => ({
      authenticateRequest: implementation,
    }));
  }

  /**
   * Mock rate limiting
   */
  static mockRateLimiter(
    implementation: (
      key: string
    ) => Promise<{ allowed: boolean; remaining?: number }>
  ) {
    jest.mock('@/lib/middleware/rate-limit', () => ({
      checkRateLimit: implementation,
    }));
  }

  /**
   * Restore all mocks
   */
  static restoreAll() {
    jest.restoreAllMocks();
  }
}

// Export instances for convenience
export const testDb = new TestDatabaseManager();
export const testRedis = new TestRedisManager();
export const testFixtures = TestFixtures;
export const testValidators = TestValidators;
export const testPerf = PerformanceTestHelpers;
export const testSecurity = SecurityTestHelpers;
export const testMocks = TestMocks;
