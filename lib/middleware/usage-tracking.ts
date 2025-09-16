import { NextRequest } from 'next/server';
import { geoLocationService } from '@/lib/services/geo-location-service';
import { UserGeo, AgentUsage } from '@/lib/db/models';
import { DeviceInfo } from '@/types/heatmap';
import { logger } from '@/lib/utils/logger';

/**
 * 用户使用情况追踪中间件
 * 自动记录用户地理位置和智能体使用统计
 */
export class UsageTrackingMiddleware {
  private static instance: UsageTrackingMiddleware;

  public static getInstance(): UsageTrackingMiddleware {
    if (!UsageTrackingMiddleware.instance) {
      UsageTrackingMiddleware.instance = new UsageTrackingMiddleware();
    }
    return UsageTrackingMiddleware.instance;
  }

  /**
   * 追踪用户会话开始
   */
  public async trackSessionStart(
    sessionId: string,
    userId: number | undefined,
    agentId: number,
    messageType: 'text' | 'image' | 'file' | 'voice' | 'mixed',
    request: NextRequest
  ): Promise<void> {
    try {
      // 获取客户端IP地址
      const ipAddress = this.getClientIpAddress(request);

      // 获取设备信息
      const deviceInfo = this.extractDeviceInfo(request);

      // 获取地理位置
      const geoLocation = await geoLocationService.getLocationByIp(ipAddress);

      // 保存用户地理位置
      const userGeo = await (UserGeo as any).upsertUserGeo(
        userId,
        sessionId,
        ipAddress,
        geoLocation
      );

      // 开始智能体使用会话追踪
      await (AgentUsage as any).startSession(
        sessionId,
        userId,
        agentId,
        messageType,
        userGeo.id,
        deviceInfo
      );

      logger.info(`Session tracking started for ${sessionId}`);
    } catch (error) {
      logger.error('Failed to track session start:', error);
      // 不要抛出错误，避免影响正常功能
    }
  }

  /**
   * 追踪消息发送
   */
  public async trackMessage(
    sessionId: string,
    increment: number = 1
  ): Promise<void> {
    try {
      await (AgentUsage as any).updateMessageCount(sessionId, increment);
    } catch (error) {
      logger.error('Failed to track message:', error);
    }
  }

  /**
   * 追踪响应时间
   */
  public async trackResponseTime(
    sessionId: string,
    responseTime: number
  ): Promise<void> {
    try {
      await (AgentUsage as any).updateResponseTime(sessionId, responseTime);
    } catch (error) {
      logger.error('Failed to track response time:', error);
    }
  }

  /**
   * 追踪会话结束
   */
  public async trackSessionEnd(
    sessionId: string,
    tokenUsage?: number,
    userSatisfaction?: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    try {
      await (AgentUsage as any).endSession(sessionId, tokenUsage, userSatisfaction);
      logger.info(`Session tracking ended for ${sessionId}`);
    } catch (error) {
      logger.error('Failed to track session end:', error);
    }
  }

  /**
   * 更新用户地理位置
   */
  public async updateGeoLocation(
    userId: number | undefined,
    sessionId: string | undefined,
    request: NextRequest
  ): Promise<void> {
    try {
      const ipAddress = this.getClientIpAddress(request);
      const geoLocation = await geoLocationService.getLocationByIp(ipAddress);

      await (UserGeo as any).upsertUserGeo(userId, sessionId, ipAddress, geoLocation);
    } catch (error) {
      logger.error('Failed to update geo location:', error);
    }
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIpAddress(request: NextRequest): string {
    // 优先使用 X-Forwarded-For 头（代理后的真实IP）
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // X-Forwarded-For 可能包含多个IP，取第一个
      return forwardedFor.split(',')[0].trim();
    }

    // 其次使用 X-Real-IP 头
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }

    // 最后使用远程地址
    return request.ip || '127.0.0.1';
  }

  /**
   * 提取设备信息
   */
  private extractDeviceInfo(request: NextRequest): DeviceInfo {
    const userAgent = request.headers.get('user-agent') || '';

    // 解析用户代理字符串
    const deviceInfo: DeviceInfo = {
      userAgent,
    };

    // 检测平台
    if (userAgent.includes('Windows')) {
      deviceInfo.platform = 'windows';
    } else if (userAgent.includes('Mac')) {
      deviceInfo.platform = 'mac';
    } else if (userAgent.includes('Linux')) {
      deviceInfo.platform = 'linux';
    } else if (userAgent.includes('Android')) {
      deviceInfo.platform = 'android';
    } else if (
      userAgent.includes('iOS') ||
      userAgent.includes('iPhone') ||
      userAgent.includes('iPad')
    ) {
      deviceInfo.platform = 'ios';
    }

    // 检测浏览器
    if (userAgent.includes('Chrome')) {
      deviceInfo.browser = 'chrome';
    } else if (userAgent.includes('Firefox')) {
      deviceInfo.browser = 'firefox';
    } else if (userAgent.includes('Safari')) {
      deviceInfo.browser = 'safari';
    } else if (userAgent.includes('Edge')) {
      deviceInfo.browser = 'edge';
    }

    // 检测设备类型
    if (
      userAgent.includes('Mobile') ||
      userAgent.includes('Android') ||
      userAgent.includes('iPhone')
    ) {
      deviceInfo.deviceType = 'mobile';
    } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
      deviceInfo.deviceType = 'tablet';
    } else {
      deviceInfo.deviceType = 'desktop';
    }

    // 获取语言
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      deviceInfo.language = acceptLanguage.split(',')[0];
    }

    // 获取时区偏移
    const timezone = request.headers.get('timezone-offset');
    if (timezone) {
      deviceInfo.timezoneOffset = parseInt(timezone);
    }

    return deviceInfo;
  }

  /**
   * 清理过期数据
   */
  public async cleanupOldData(): Promise<void> {
    try {
      const geoCleanupCount = await (UserGeo as any).cleanupOldData();
      const usageCleanupCount = await (AgentUsage as any).cleanupOldData();

      logger.info(
        `Cleanup completed: ${geoCleanupCount} geo records, ${usageCleanupCount} usage records removed`
      );
    } catch (error) {
      logger.error('Failed to cleanup old data:', error);
    }
  }
}

// 创建单例实例
export const usageTracking = UsageTrackingMiddleware.getInstance();
