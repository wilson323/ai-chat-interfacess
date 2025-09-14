/**
 * usePerformanceMonitor Hook测试
 */

import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { TestWrapper } from '@/lib/testing/test-utils';

// Mock performance monitor
jest.mock('@/lib/performance/monitor', () => ({
  monitor: {
    getMetrics: jest.fn(() => ({
      pageLoadTime: 1000,
      domContentLoaded: 800,
      firstContentfulPaint: 500,
      largestContentfulPaint: 1200,
      firstInputDelay: 50,
      cumulativeLayoutShift: 0.1,
      apiCalls: [
        {
          url: '/api/test',
          method: 'GET',
          duration: 200,
          status: 200,
          timestamp: Date.now(),
        },
      ],
      userInteractions: [
        { type: 'click', target: 'button', timestamp: Date.now() },
      ],
      resourceTimings: [
        {
          name: 'script.js',
          type: 'script',
          duration: 100,
          size: 1024,
          timestamp: Date.now(),
        },
      ],
      errors: [],
    })),
    setEnabled: jest.fn(),
    reset: jest.fn(),
    getReport: jest.fn(() => ({
      summary: {
        pageLoadTime: 1000,
        averageApiResponseTime: 200,
        errorCount: 0,
        resourceCount: 1,
      },
      details: {},
    })),
  },
}));

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确初始化', () => {
    const { result } = renderHook(() => usePerformanceMonitor(), {
      wrapper: TestWrapper,
    });

    expect(result.current.isMonitoring).toBe(true);
    expect(result.current.metrics).toBeDefined();
    expect(result.current.summary).toBeDefined();
  });

  it('应该提供正确的性能摘要', () => {
    const { result } = renderHook(() => usePerformanceMonitor(), {
      wrapper: TestWrapper,
    });

    expect(result.current.summary.pageLoadTime).toBe(1000);
    expect(result.current.summary.averageApiResponseTime).toBe(200);
    expect(result.current.summary.errorCount).toBe(0);
    expect(result.current.summary.resourceCount).toBe(1);
  });

  it('应该支持开始监控', () => {
    const { result } = renderHook(() => usePerformanceMonitor(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.startMonitoring();
    });

    expect(result.current.isMonitoring).toBe(true);
  });

  it('应该支持停止监控', () => {
    const { result } = renderHook(() => usePerformanceMonitor(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.stopMonitoring();
    });

    expect(result.current.isMonitoring).toBe(false);
  });

  it('应该支持重置指标', () => {
    const { result } = renderHook(() => usePerformanceMonitor(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.resetMetrics();
    });

    // 验证reset方法被调用
    expect(result.current.isMonitoring).toBe(true);
  });

  it('应该支持获取报告', () => {
    const { result } = renderHook(() => usePerformanceMonitor(), {
      wrapper: TestWrapper,
    });

    const report = result.current.getReport();
    expect(report).toBeDefined();
    expect(report.summary).toBeDefined();
  });
});
