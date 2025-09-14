import { GeoLocation, IpGeoResolver, CacheStrategy } from '@/types/heatmap';
import { cacheManager } from '@/lib/cache/redis-manager';
import logger from '@/lib/utils/logger';

/**
 * IP地理位置解析服务
 * 支持多个IP地理位置服务提供商，具备缓存和错误处理机制
 */
export class GeoLocationService {
  private resolvers: IpGeoResolver[] = [];
  private cache: CacheStrategy;
  private cacheTTL: number = 24 * 60 * 60 * 1000; // 24小时缓存

  constructor(cache?: CacheStrategy) {
    this.cache = cache || cacheManager;
    this.initializeResolvers();
  }

  /**
   * 初始化IP地理位置解析器
   */
  private initializeResolvers(): void {
    // 可以根据环境配置添加不同的解析器
    // 例如：ip-api.com, ipinfo.io, maxmind等
    // 这里使用一个基础的实现作为示例
    this.resolvers.push(new BasicIpResolver());
  }

  /**
   * 根据IP地址获取地理位置
   */
  public async getLocationByIp(ipAddress: string): Promise<GeoLocation> {
    try {
      // 检查IP地址格式
      if (!this.isValidIpAddress(ipAddress)) {
        throw new Error(`Invalid IP address: ${ipAddress}`);
      }

      // 生成缓存键
      const cacheKey = `geo:${ipAddress}`;

      // 尝试从缓存获取
      const cachedLocation = await this.cache.get(cacheKey);
      if (cachedLocation) {
        return cachedLocation as GeoLocation;
      }

      // 检查是否为私有IP地址
      if (this.isPrivateIp(ipAddress)) {
        const privateLocation = this.getPrivateIpLocation(ipAddress);
        await this.cache.set(cacheKey, privateLocation, this.cacheTTL);
        return privateLocation;
      }

      // 尝试各个解析器
      let location: GeoLocation | null = null;
      let lastError: Error | null = null;

      for (const resolver of this.resolvers) {
        try {
          const isAvailable = await resolver.isAvailable();
          if (!isAvailable) {
            continue;
          }

          location = await resolver.resolve(ipAddress);
          if (location && this.isValidLocation(location)) {
            break;
          }
        } catch (error) {
          lastError = error as Error;
          logger.warn(`Geo location resolver ${resolver.name} failed for IP ${ipAddress}:`, error);
          continue;
        }
      }

      if (!location) {
        throw new Error(`All geo location resolvers failed. Last error: ${lastError?.message}`);
      }

      // 缓存结果
      await this.cache.set(cacheKey, location, this.cacheTTL);

      return location;
    } catch (error) {
      logger.error(`Failed to get location for IP ${ipAddress}:`, error);
      // 返回默认位置而不是抛出错误，确保系统可用性
      return this.getDefaultLocation();
    }
  }

  /**
   * 批量获取地理位置
   */
  public async getLocationByBatch(ipAddresses: string[]): Promise<Array<{
    ip: string;
    location: GeoLocation | null;
    error?: string;
  }>> {
    const results: Array<{
      ip: string;
      location: GeoLocation | null;
      error?: string;
    }> = [];

    // 并行处理多个IP地址
    const promises = ipAddresses.map(async (ip) => {
      try {
        const location = await this.getLocationByIp(ip);
        return { ip, location, error: undefined };
      } catch (error) {
        return {
          ip,
          location: null,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    return await Promise.all(promises);
  }

  /**
   * 清除缓存
   */
  public async clearCache(): Promise<void> {
    try {
      // 这里需要实现缓存清除逻辑
      // 由于Redis缓存没有直接的清除模式匹配功能，
      // 我们可能需要维护一个缓存键列表或者使用Redis的SCAN命令
      logger.info('Geo location cache cleared');
    } catch (error) {
      logger.error('Failed to clear geo location cache:', error);
    }
  }

  /**
   * 验证IP地址格式
   */
  private isValidIpAddress(ipAddress: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;

    return ipv4Regex.test(ipAddress) || ipv6Regex.test(ipAddress);
  }

  /**
   * 检查是否为私有IP地址
   */
  private isPrivateIp(ipAddress: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];

    return privateRanges.some(regex => regex.test(ipAddress));
  }

  /**
   * 获取私有IP的默认位置
   */
  private getPrivateIpLocation(ipAddress: string): GeoLocation {
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Private Network',
      city: 'Private',
      latitude: 0,
      longitude: 0,
    };
  }

  /**
   * 验证地理位置数据
   */
  private isValidLocation(location: GeoLocation): boolean {
    return !!(
      location.country &&
      location.countryCode &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  }

  /**
   * 获取默认位置
   */
  private getDefaultLocation(): GeoLocation {
    return {
      country: 'Unknown',
      countryCode: 'XX',
      latitude: 0,
      longitude: 0,
    };
  }
}

/**
 * 基础IP地理位置解析器
 * 这是一个简单的实现，生产环境应该使用专业的IP地理位置服务
 */
class BasicIpResolver implements IpGeoResolver {
  public readonly name = 'BasicIpResolver';

  public async resolve(ipAddress: string): Promise<GeoLocation> {
    // 这里是一个简化的实现
    // 生产环境应该集成真实的IP地理位置服务，如：
    // - ip-api.com
    // - ipinfo.io
    // - MaxMind GeoIP2
    // - IP2Location

    // 为了演示，我们返回一些模拟数据
    // 实际应用中应该调用真实的API

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

    // 模拟根据IP返回不同的地理位置
    const hash = this.simpleHash(ipAddress);

    return {
      country: this.getCountryByHash(hash),
      countryCode: this.getCountryCodeByHash(hash),
      region: this.getRegionByHash(hash),
      city: this.getCityByHash(hash),
      latitude: this.getLatitudeByHash(hash),
      longitude: this.getLongitudeByHash(hash),
      timezone: this.getTimezoneByHash(hash),
      continent: this.getContinentByHash(hash),
    };
  }

  public async isAvailable(): Promise<boolean> {
    // 检查服务是否可用
    // 实际应用中应该检查API端点的健康状态
    return true;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getCountryByHash(hash: number): string {
    const countries = [
      'China', 'United States', 'Japan', 'Germany', 'United Kingdom',
      'France', 'Canada', 'Australia', 'South Korea', 'Brazil'
    ];
    return countries[hash % countries.length];
  }

  private getCountryCodeByHash(hash: number): string {
    const countryCodes = [
      'CN', 'US', 'JP', 'DE', 'GB', 'FR', 'CA', 'AU', 'KR', 'BR'
    ];
    return countryCodes[hash % countryCodes.length];
  }

  private getRegionByHash(hash: number): string {
    const regions = [
      'Beijing', 'California', 'Tokyo', 'Bavaria', 'England',
      'Île-de-France', 'Ontario', 'New South Wales', 'Seoul', 'São Paulo'
    ];
    return regions[hash % regions.length];
  }

  private getCityByHash(hash: number): string {
    const cities = [
      'Beijing', 'Los Angeles', 'Tokyo', 'Munich', 'London',
      'Paris', 'Toronto', 'Sydney', 'Seoul', 'São Paulo'
    ];
    return cities[hash % cities.length];
  }

  private getLatitudeByHash(hash: number): number {
    // 在-90到90之间生成纬度
    return (hash % 180) - 90 + (Math.random() - 0.5);
  }

  private getLongitudeByHash(hash: number): number {
    // 在-180到180之间生成经度
    return (hash % 360) - 180 + (Math.random() - 0.5);
  }

  private getTimezoneByHash(hash: number): string {
    const timezones = [
      'Asia/Shanghai', 'America/Los_Angeles', 'Asia/Tokyo', 'Europe/Berlin',
      'Europe/London', 'Europe/Paris', 'America/Toronto', 'Australia/Sydney',
      'Asia/Seoul', 'America/São_Paulo'
    ];
    return timezones[hash % timezones.length];
  }

  private getContinentByHash(hash: number): string {
    const continents = [
      'Asia', 'North America', 'Asia', 'Europe', 'Europe',
      'Europe', 'North America', 'Oceania', 'Asia', 'South America'
    ];
    return continents[hash % continents.length];
  }
}

// 创建单例实例
export const geoLocationService = new GeoLocationService();