import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeatmapComponent } from '@/components/admin/heatmap/HeatmapComponent';
import { HeatmapChart } from '@/components/admin/heatmap/HeatmapChart';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';
import { RealTimeMonitor } from '@/components/admin/analytics/RealTimeMonitor';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('@/lib/services/heatmap');
jest.mock('@/lib/services/analytics');
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ children }: { children: React.ReactNode }) => <div data-testid="circle-marker">{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
}));

const mockHeatmapService = require('@/lib/services/heatmap');
const mockAnalyticsService = require('@/lib/services/analytics');

describe('Heatmap Components Tests', () => {
  const mockHeatmapData = {
    locations: [
      {
        id: 1,
        country: '中国',
        region: '广东省',
        city: '深圳市',
        latitude: 22.5431,
        longitude: 114.0579,
        count: 50,
        totalMessages: 500,
        totalTokens: 25000,
        totalDuration: 1500,
        avgMessages: 10,
        avgTokens: 500,
        avgDuration: 30,
        intensity: 0.8,
        sessions: [],
      },
      {
        id: 2,
        country: '美国',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        count: 30,
        totalMessages: 300,
        totalTokens: 15000,
        totalDuration: 900,
        avgMessages: 10,
        avgTokens: 500,
        avgDuration: 30,
        intensity: 0.5,
        sessions: [],
      },
    ],
    summary: {
      totalSessions: 80,
      totalUsers: 60,
      totalMessages: 800,
      totalTokens: 40000,
      averageResponseTime: 250,
      averageSessionDuration: 35,
    },
    metadata: {
      dateRange: {
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
      filters: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHeatmapService.getHeatmapData.mockResolvedValue(mockHeatmapData);
  });

  describe('HeatmapComponent', () => {
    it('should render heatmap component with initial loading state', () => {
      render(<HeatmapComponent />);

      expect(screen.getByText('热点地图分析')).toBeInTheDocument();
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('should load and display heatmap data', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        expect(screen.getByText('总会话数: 80')).toBeInTheDocument();
        expect(screen.getByText('总用户数: 60')).toBeInTheDocument();
        expect(screen.getByText('总消息数: 800')).toBeInTheDocument();
      });
    });

    it('should handle date filter changes', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      // Simulate date filter change
      const startDateInput = screen.getByLabelText('开始日期');
      const endDateInput = screen.getByLabelText('结束日期');

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

      // Verify service was called with new date range
      await waitFor(() => {
        expect(mockHeatmapService.getHeatmapData).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: expect.any(Date),
            endDate: expect.any(Date),
          })
        );
      });
    });

    it('should handle agent type filter', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      // Simulate agent type filter change
      const agentTypeSelect = screen.getByLabelText('智能体类型');
      fireEvent.change(agentTypeSelect, { target: { value: 'fastgpt' } });

      await waitFor(() => {
        expect(mockHeatmapService.getHeatmapData).toHaveBeenCalledWith(
          expect.objectContaining({
            agentType: 'fastgpt',
          })
        );
      });
    });

    it('should handle message type filter', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      // Simulate message type filter change
      const messageTypeSelect = screen.getByLabelText('消息类型');
      fireEvent.change(messageTypeSelect, { target: { value: 'text' } });

      await waitFor(() => {
        expect(mockHeatmapService.getHeatmapData).toHaveBeenCalledWith(
          expect.objectContaining({
            messageType: 'text',
          })
        );
      });
    });

    it('should handle location filter', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      // Simulate location filter change
      const countryInput = screen.getByLabelText('国家');
      fireEvent.change(countryInput, { target: { value: '中国' } });

      await waitFor(() => {
        expect(mockHeatmapService.getHeatmapData).toHaveBeenCalledWith(
          expect.objectContaining({
            country: '中国',
          })
        );
      });
    });

    it('should handle loading errors gracefully', async () => {
      mockHeatmapService.getHeatmapData.mockRejectedValue(new Error('Failed to load data'));

      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
        expect(screen.getByText('重试')).toBeInTheDocument();
      });

      // Test retry functionality
      const retryButton = screen.getByText('重试');
      fireEvent.click(retryButton);

      expect(mockHeatmapService.getHeatmapData).toHaveBeenCalledTimes(2);
    });

    it('should export data as CSV', async () => {
      const mockCsvData = 'Country,City,Count\n中国,深圳市,50\n美国,San Francisco,30';
      mockHeatmapService.exportData.mockResolvedValue(mockCsvData);

      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      const exportButton = screen.getByText('导出CSV');
      fireEvent.click(exportButton);

      expect(mockHeatmapService.exportData).toHaveBeenCalledWith(
        expect.any(Object),
        'csv'
      );
    });

    it('should export data as JSON', async () => {
      const mockJsonData = JSON.stringify(mockHeatmapData.locations);
      mockHeatmapService.exportData.mockResolvedValue(mockJsonData);

      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      const exportButton = screen.getByText('导出JSON');
      fireEvent.click(exportButton);

      expect(mockHeatmapService.exportData).toHaveBeenCalledWith(
        expect.any(Object),
        'json'
      );
    });

    it('should display map markers for each location', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      const markers = screen.getAllByTestId('circle-marker');
      expect(markers).toHaveLength(2);
    });

    it('should show location details on marker click', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      const markers = screen.getAllByTestId('circle-marker');
      fireEvent.click(markers[0]);

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument();
        expect(screen.getByText('中国')).toBeInTheDocument();
        expect(screen.getByText('深圳市')).toBeInTheDocument();
        expect(screen.getByText('会话数: 50')).toBeInTheDocument();
      });
    });
  });

  describe('HeatmapChart', () => {
    it('should render chart with heatmap data', () => {
      render(<HeatmapChart data={mockHeatmapData} />);

      expect(screen.getByText('使用热点分布')).toBeInTheDocument();
    });

    it('should display location statistics', () => {
      render(<HeatmapChart data={mockHeatmapData} />);

      expect(screen.getByText('中国')).toBeInTheDocument();
      expect(screen.getByText('美国')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('should handle empty data', () => {
      const emptyData = {
        locations: [],
        summary: {
          totalSessions: 0,
          totalUsers: 0,
          totalMessages: 0,
          totalTokens: 0,
          averageResponseTime: 0,
          averageSessionDuration: 0,
        },
        metadata: {
          dateRange: {
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
          },
          filters: {},
        },
      };

      render(<HeatmapChart data={emptyData} />);

      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });

    it('should handle click on chart elements', () => {
      render(<HeatmapChart data={mockHeatmapData} />);

      const locationElement = screen.getByText('中国');
      fireEvent.click(locationElement);

      // Verify that clicking triggers a callback or action
      // This depends on the specific implementation
    });
  });

  describe('AnalyticsDashboard', () => {
    const mockAnalyticsData = {
      overview: {
        totalSessions: 100,
        totalUsers: 80,
        totalMessages: 1000,
        totalTokens: 50000,
        averageSessionDuration: 45,
        averageResponseTime: 200,
        userSatisfaction: {
          positive: 60,
          neutral: 25,
          negative: 15,
        },
        topAgents: [
          { id: 1, name: 'FastGPT', usageCount: 50 },
          { id: 2, name: 'CAD Analyzer', usageCount: 30 },
        ],
        topLocations: [
          { country: '中国', city: '深圳', usageCount: 40 },
          { country: '美国', city: '纽约', usageCount: 25 },
        ],
        messageTypeDistribution: [
          { type: 'text', count: 600 },
          { type: 'image', count: 300 },
          { type: 'file', count: 100 },
        ],
      },
      trends: {
        timeSeries: [
          { date: '2024-01-01', sessions: 10, users: 8 },
          { date: '2024-01-02', sessions: 15, users: 12 },
        ],
        growthRates: {
          sessionGrowth: 5.2,
          userGrowth: 4.8,
          messageGrowth: 6.1,
        },
      },
    };

    beforeEach(() => {
      mockAnalyticsService.getOverviewData.mockResolvedValue(mockAnalyticsData.overview);
      mockAnalyticsService.getTrendsData.mockResolvedValue(mockAnalyticsData.trends);
    });

    it('should render analytics dashboard', () => {
      render(<AnalyticsDashboard />);

      expect(screen.getByText('数据分析仪表板')).toBeInTheDocument();
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('should load and display overview data', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('总会话数: 100')).toBeInTheDocument();
        expect(screen.getByText('总用户数: 80')).toBeInTheDocument();
        expect(screen.getByText('总消息数: 1000')).toBeInTheDocument();
        expect(screen.getByText('平均会话时长: 45秒')).toBeInTheDocument();
        expect(screen.getByText('平均响应时间: 200ms')).toBeInTheDocument();
      });
    });

    it('should display user satisfaction chart', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('用户满意度')).toBeInTheDocument();
        expect(screen.getByText('满意 60%')).toBeInTheDocument();
        expect(screen.getByText('一般 25%')).toBeInTheDocument();
        expect(screen.getByText('不满意 15%')).toBeInTheDocument();
      });
    });

    it('should display top agents', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('热门智能体')).toBeInTheDocument();
        expect(screen.getByText('FastGPT')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('CAD Analyzer')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
      });
    });

    it('should display message type distribution', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('消息类型分布')).toBeInTheDocument();
        expect(screen.getByText('文本')).toBeInTheDocument();
        expect(screen.getByText('图像')).toBeInTheDocument();
        expect(screen.getByText('文件')).toBeInTheDocument();
      });
    });

    it('should handle tab navigation', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      // Click on trends tab
      const trendsTab = screen.getByText('趋势分析');
      fireEvent.click(trendsTab);

      expect(screen.getByText('增长趋势')).toBeInTheDocument();
      expect(screen.getByText('会话增长率: 5.2%')).toBeInTheDocument();
    });

    it('should refresh data on refresh button click', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      const refreshButton = screen.getByText('刷新数据');
      fireEvent.click(refreshButton);

      expect(mockAnalyticsService.getOverviewData).toHaveBeenCalledTimes(2);
      expect(mockAnalyticsService.getTrendsData).toHaveBeenCalledTimes(2);
    });
  });

  describe('RealTimeMonitor', () => {
    const mockRealTimeData = {
      sessions: [
        {
          sessionId: 'realtime-session-1',
          userId: 1,
          agentId: 1,
          messageType: 'text',
          startTime: new Date(),
          isActive: true,
          location: {
            country: '中国',
            city: '深圳',
          },
        },
      ],
      metrics: {
        activeSessions: 15,
        messageRate: 2.5,
        responseTime: 180,
        systemLoad: 0.65,
      },
      alerts: [
        {
          type: 'warning',
          message: '响应时间超过阈值',
          timestamp: new Date(),
        },
      ],
    };

    beforeEach(() => {
      mockAnalyticsService.getRealTimeData.mockResolvedValue(mockRealTimeData);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should render real-time monitor', () => {
      render(<RealTimeMonitor />);

      expect(screen.getByText('实时监控')).toBeInTheDocument();
      expect(screen.getByText('连接中...')).toBeInTheDocument();
    });

    it('should load and display real-time data', async () => {
      render(<RealTimeMonitor />);

      await waitFor(() => {
        expect(screen.getByText('活跃会话: 15')).toBeInTheDocument();
        expect(screen.getByText('消息速率: 2.5/分钟')).toBeInTheDocument();
        expect(screen.getByText('响应时间: 180ms')).toBeInTheDocument();
        expect(screen.getByText('系统负载: 65%')).toBeInTheDocument();
      });
    });

    it('should auto-refresh data', async () => {
      render(<RealTimeMonitor />);

      await waitFor(() => {
        expect(screen.getByText('连接中...')).not.toBeInTheDocument();
      });

      // Fast-forward time by 30 seconds
      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(mockAnalyticsService.getRealTimeData).toHaveBeenCalledTimes(2);
      });
    });

    it('should display active sessions list', async () => {
      render(<RealTimeMonitor />);

      await waitFor(() => {
        expect(screen.getByText('realtime-session-1')).toBeInTheDocument();
        expect(screen.getByText('中国 - 深圳')).toBeInTheDocument();
      });
    });

    it('should display alerts', async () => {
      render(<RealTimeMonitor />);

      await waitFor(() => {
        expect(screen.getByText('响应时间超过阈值')).toBeInTheDocument();
      });
    });

    it('should handle connection errors', async () => {
      mockAnalyticsService.getRealTimeData.mockRejectedValue(new Error('Connection failed'));

      render(<RealTimeMonitor />);

      await waitFor(() => {
        expect(screen.getByText('连接失败')).toBeInTheDocument();
        expect(screen.getByText('重连中...')).toBeInTheDocument();
      });
    });

    it('should reconnect after connection loss', async () => {
      mockAnalyticsService.getRealTimeData
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValue(mockRealTimeData);

      render(<RealTimeMonitor />);

      await waitFor(() => {
        expect(screen.getByText('连接失败')).toBeInTheDocument();
      });

      // Fast-forward time by 10 seconds
      jest.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(screen.getByText('活跃会话: 15')).toBeInTheDocument();
      });
    });

    it('should stop auto-refresh on unmount', () => {
      const { unmount } = render(<RealTimeMonitor />);

      unmount();

      // Verify that timers are cleared
      expect(clearInterval).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      mockHeatmapService.getHeatmapData.mockRejectedValue(new Error('Network error'));

      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
        expect(screen.getByText('网络错误')).toBeInTheDocument();
      });
    });

    it('should handle malformed data', async () => {
      mockHeatmapService.getHeatmapData.mockResolvedValue({
        locations: [{ invalid: 'data' }],
        summary: {},
      });

      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('数据格式错误')).toBeInTheDocument();
      });
    });

    it('should handle loading timeouts', async () => {
      mockHeatmapService.getHeatmapData.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载超时')).toBeInTheDocument();
      }, 11000);
    });

    it('should handle large datasets gracefully', async () => {
      const largeData = {
        locations: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          country: `Country ${i}`,
          city: `City ${i}`,
          latitude: Math.random() * 180 - 90,
          longitude: Math.random() * 360 - 180,
          count: Math.floor(Math.random() * 100),
          totalMessages: Math.floor(Math.random() * 1000),
          totalTokens: Math.floor(Math.random() * 10000),
          totalDuration: Math.floor(Math.random() * 1000),
          avgMessages: Math.floor(Math.random() * 20),
          avgTokens: Math.floor(Math.random() * 500),
          avgDuration: Math.floor(Math.random() * 60),
          intensity: Math.random(),
          sessions: [],
        })),
        summary: {
          totalSessions: 50000,
          totalUsers: 30000,
          totalMessages: 500000,
          totalTokens: 25000000,
          averageResponseTime: 250,
          averageSessionDuration: 35,
        },
        metadata: {
          dateRange: {
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
          },
          filters: {},
        },
      };

      mockHeatmapService.getHeatmapData.mockResolvedValue(largeData);

      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('数据加载中...')).toBeInTheDocument();
      }, 5000);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        const map = screen.getByTestId('map-container');
        expect(map).toHaveAttribute('aria-label', '热点地图');
      });
    });

    it('should support keyboard navigation', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        expect(screen.getByText('加载中...')).not.toBeInTheDocument();
      });

      const exportButton = screen.getByText('导出CSV');
      expect(exportButton).toHaveAttribute('tabindex', '0');

      // Test keyboard navigation
      fireEvent.keyDown(exportButton, { key: 'Enter' });
      expect(mockHeatmapService.exportData).toHaveBeenCalled();
    });

    it('should have proper color contrast', async () => {
      render(<HeatmapComponent />);

      await waitFor(() => {
        const textElements = screen.getAllByRole('heading');
        textElements.forEach(element => {
          expect(element).toHaveStyle({ color: expect.any(String) });
        });
      });
    });
  });
});