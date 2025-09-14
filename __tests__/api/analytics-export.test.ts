import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/analytics/export/route';

// Mock dependencies
jest.mock('@/lib/db/models', () => ({
  AgentUsage: {
    findAll: jest.fn(),
  },
  ChatSession: {
    findAll: jest.fn(),
  },
  UserGeo: {
    findAll: jest.fn(),
  },
  AgentConfig: {
    findAll: jest.fn(),
  },
}));

jest.mock('sequelize', () => ({
  Op: {
    gte: 'gte',
    lte: 'lte',
  },
}));

describe('Analytics Export API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle valid request with default parameters', async () => {
    const mockData = [
      {
        id: 1,
        sessionId: 'session-1',
        userId: 1,
        agentId: 1,
        messageType: 'text',
        messageCount: 5,
        tokenUsage: 100,
        responseTime: 500,
        startTime: new Date('2024-01-01'),
        endTime: new Date('2024-01-01'),
        duration: 30,
        isCompleted: true,
        userSatisfaction: 'good',
        agent: { name: 'Test Agent', type: 'chat' },
        geoLocation: { location: { country: 'US', region: 'CA', city: 'SF' } },
      },
    ];

    const { AgentUsage } = require('@/lib/db/models');
    AgentUsage.findAll.mockResolvedValue(mockData);

    const request = new NextRequest(
      'http://localhost:3000/api/analytics/export'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(AgentUsage.findAll).toHaveBeenCalled();
  });

  it('should handle request with custom parameters', async () => {
    const { AgentUsage } = require('@/lib/db/models');
    AgentUsage.findAll.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/analytics/export?startDate=2024-01-01&endDate=2024-01-31&format=json&dataType=usage&agentId=1'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(AgentUsage.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          startTime: expect.objectContaining({
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          }),
        }),
      })
    );
  });

  it('should handle invalid format parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics/export?format=invalid'
    );
    const response = await GET(request);

    // Should default to 'csv' format
    expect(response.status).toBe(200);
  });

  it('should handle invalid dataType parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics/export?dataType=invalid'
    );
    const response = await GET(request);

    // Should default to 'usage' dataType
    expect(response.status).toBe(200);
  });

  it('should handle database error gracefully', async () => {
    const { AgentUsage } = require('@/lib/db/models');
    AgentUsage.findAll.mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/analytics/export'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Database connection failed');
  });
});
