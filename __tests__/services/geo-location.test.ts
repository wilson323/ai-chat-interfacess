import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GeoLocationService } from '@/lib/services/geo-location';
import { UserGeo } from '@/lib/db/models/user-geo';
import sequelize from '@/lib/db/sequelize';
import logger from '@/lib/utils/logger';

// Mock external dependencies
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/db/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

const mockRedis = require('@/lib/db/redis');

describe('GeoLocationService Tests', () => {
  let geoLocationService: GeoLocationService;

  beforeEach(() => {
    geoLocationService = new GeoLocationService();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test data
    await UserGeo.destroy({ where: {} });
  });

  describe('IP Address Resolution', () => {
    it('should resolve valid IPv4 address', async () => {
      const mockGeoData = {
        ipAddress: '192.168.1.100',
        country: '中国',
        region: '广东省',
        city: '深圳市',
        latitude: 22.5431,
        longitude: 114.0579,
        timezone: 'Asia/Shanghai',
        isp: 'China Telecom',
      };

      // Mock external API response
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockResolvedValue(mockGeoData);

      const result = await geoLocationService.resolveIP('192.168.1.100');

      expect(result).toEqual(mockGeoData);
      expect(result.country).toBe('中国');
      expect(result.city).toBe('深圳市');
      expect(parseFloat(result.latitude!.toString())).toBe(22.5431);
      expect(parseFloat(result.longitude!.toString())).toBe(114.0579);
    });

    it('should resolve valid IPv6 address', async () => {
      const mockGeoData = {
        ipAddress: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        country: '美国',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
        isp: 'AT&T',
      };

      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockResolvedValue(mockGeoData);

      const result = await geoLocationService.resolveIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334');

      expect(result).toEqual(mockGeoData);
      expect(result.country).toBe('美国');
      expect(result.city).toBe('San Francisco');
    });

    it('should handle invalid IP address format', async () => {
      await expect(geoLocationService.resolveIP('invalid-ip-address')).rejects.toThrow(
        'Invalid IP address format'
      );
    });

    it('should handle empty IP address', async () => {
      await expect(geoLocationService.resolveIP('')).rejects.toThrow(
        'IP address is required'
      );
    });

    it('should handle API request failures', async () => {
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockRejectedValue(
        new Error('API request failed')
      );

      await expect(geoLocationService.resolveIP('192.168.1.100')).rejects.toThrow(
        'Failed to resolve IP location'
      );
    });

    it('should handle rate limiting', async () => {
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(geoLocationService.resolveIP('192.168.1.100')).rejects.toThrow(
        'Rate limit exceeded'
      );
    });
  });

  describe('Caching Mechanism', () => {
    it('should cache resolved IP data', async () => {
      const mockGeoData = {
        ipAddress: '192.168.1.200',
        country: '日本',
        region: '东京都',
        city: '东京',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo',
        isp: 'NTT',
      };

      // Mock external API response
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockResolvedValue(mockGeoData);

      // First call - should hit external API
      const result1 = await geoLocationService.resolveIP('192.168.1.200');

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('geo:192.168.1.200'),
        expect.any(String),
        expect.any(Number)
      );

      // Second call - should use cache
      mockRedis.get.mockResolvedValue(JSON.stringify(mockGeoData));
      const result2 = await geoLocationService.resolveIP('192.168.1.200');

      expect(result2).toEqual(mockGeoData);
      expect(geoLocationService['fetchGeoData']).toHaveBeenCalledTimes(1);
    });

    it('should handle cache miss gracefully', async () => {
      const mockGeoData = {
        ipAddress: '192.168.1.300',
        country: '英国',
        region: 'England',
        city: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
        isp: 'BT',
      };

      // Mock cache miss
      mockRedis.get.mockResolvedValue(null);
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockResolvedValue(mockGeoData);

      const result = await geoLocationService.resolveIP('192.168.1.300');

      expect(result).toEqual(mockGeoData);
      expect(mockRedis.get).toHaveBeenCalledWith(expect.stringContaining('geo:192.168.1.300'));
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should handle cache corruption', async () => {
      // Mock corrupted cache data
      mockRedis.get.mockResolvedValue('invalid-json-data');
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockResolvedValue({
        ipAddress: '192.168.1.400',
        country: '德国',
        region: 'Bavaria',
        city: 'Munich',
        latitude: 48.1351,
        longitude: 11.5820,
        timezone: 'Europe/Berlin',
        isp: 'Deutsche Telekom',
      });

      const result = await geoLocationService.resolveIP('192.168.1.400');

      expect(result).toBeDefined();
      expect(result.country).toBe('德国');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse cached geo data')
      );
    });

    it('should respect cache TTL', async () => {
      const mockGeoData = {
        ipAddress: '192.168.1.500',
        country: '法国',
        region: 'Île-de-France',
        city: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: 'Europe/Paris',
        isp: 'Orange',
      };

      mockRedis.get.mockResolvedValue(null);
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockResolvedValue(mockGeoData);

      await geoLocationService.resolveIP('192.168.1.500');

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('geo:192.168.1.500'),
        expect.any(String),
        3600 // Default TTL
      );
    });

    it('should clear cache when requested', async () => {
      await geoLocationService.clearCache('192.168.1.600');

      expect(mockRedis.del).toHaveBeenCalledWith(
        expect.stringContaining('geo:192.168.1.600')
      );
    });
  });

  describe('Database Integration', () => {
    it('should create or update user geo record', async () => {
      const geoData = {
        ipAddress: '192.168.1.700',
        country: '意大利',
        region: 'Lombardy',
        city: 'Milan',
        latitude: 45.4642,
        longitude: 9.1900,
        timezone: 'Europe/Rome',
        isp: 'TIM',
      };

      const userGeo = await geoLocationService.createOrUpdateUserGeo(geoData);

      expect(userGeo).toBeDefined();
      expect(userGeo.ipAddress).toBe(geoData.ipAddress);
      expect(userGeo.country).toBe(geoData.country);
      expect(userGeo.usageCount).toBe(1);

      // Second call should update usage count
      const updatedUserGeo = await geoLocationService.createOrUpdateUserGeo(geoData);
      expect(updatedUserGeo.usageCount).toBe(2);
      expect(updatedUserGeo.id).toBe(userGeo.id);
    });

    it('should handle database errors gracefully', async () => {
      const geoData = {
        ipAddress: '192.168.1.800',
        country: '西班牙',
        region: 'Madrid',
        city: 'Madrid',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
        isp: 'Movistar',
      };

      // Mock database error
      jest.spyOn(UserGeo, 'createOrUpdate').mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(geoLocationService.createOrUpdateUserGeo(geoData)).rejects.toThrow(
        'Failed to create or update user geo record'
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create or update user geo record')
      );
    });

    it('should validate geo data before database operations', async () => {
      const invalidGeoData = {
        ipAddress: '192.168.1.900',
        country: '',
        region: 'Invalid Region',
        city: 'Invalid City',
        latitude: 95, // Invalid latitude
        longitude: 190, // Invalid longitude
      };

      await expect(geoLocationService.createOrUpdateUserGeo(invalidGeoData)).rejects.toThrow();
    });
  });

  describe('Batch Operations', () => {
    it('should resolve multiple IP addresses efficiently', async () => {
      const ipAddresses = [
        '192.168.1.100',
        '192.168.1.200',
        '192.168.1.300',
      ];

      const mockGeoDataArray = [
        {
          ipAddress: '192.168.1.100',
          country: '中国',
          region: '广东省',
          city: '深圳市',
        },
        {
          ipAddress: '192.168.1.200',
          country: '日本',
          region: '东京都',
          city: '东京',
        },
        {
          ipAddress: '192.168.1.300',
          country: '英国',
          region: 'England',
          city: 'London',
        },
      ];

      // Mock API responses
      jest.spyOn(geoLocationService as any, 'fetchGeoData')
        .mockResolvedValueOnce(mockGeoDataArray[0])
        .mockResolvedValueOnce(mockGeoDataArray[1])
        .mockResolvedValueOnce(mockGeoDataArray[2]);

      const results = await geoLocationService.resolveIPs(ipAddresses);

      expect(results).toHaveLength(3);
      expect(results[0].country).toBe('中国');
      expect(results[1].country).toBe('日本');
      expect(results[2].country).toBe('英国');
    });

    it('should handle partial failures in batch operations', async () => {
      const ipAddresses = [
        '192.168.1.100',
        'invalid-ip-address',
        '192.168.1.300',
      ];

      jest.spyOn(geoLocationService as any, 'fetchGeoData')
        .mockResolvedValueOnce({
          ipAddress: '192.168.1.100',
          country: '中国',
          region: '广东省',
          city: '深圳市',
        })
        .mockRejectedValueOnce(new Error('Invalid IP address'))
        .mockResolvedValueOnce({
          ipAddress: '192.168.1.300',
          country: '英国',
          region: 'England',
          city: 'London',
        });

      const results = await geoLocationService.resolveIPs(ipAddresses);

      expect(results).toHaveLength(3);
      expect(results[0]).toBeDefined();
      expect(results[0].country).toBe('中国');
      expect(results[1]).toBeNull(); // Failed resolution
      expect(results[2]).toBeDefined();
      expect(results[2].country).toBe('英国');

      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should respect concurrency limits in batch operations', async () => {
      const ipAddresses = Array.from({ length: 20 }, (_, i) => `192.168.1.${i + 1}`);

      // Mock API responses
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockImplementation((ip: string) =>
        Promise.resolve({
          ipAddress: ip,
          country: 'Test Country',
          region: 'Test Region',
          city: 'Test City',
        })
      );

      const startTime = Date.now();
      const results = await geoLocationService.resolveIPs(ipAddresses);
      const endTime = Date.now();

      expect(results).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log errors appropriately', async () => {
      const error = new Error('Test error');
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockRejectedValue(error);

      await expect(geoLocationService.resolveIP('192.168.1.100')).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to resolve IP location'),
        expect.objectContaining({
          error: error.message,
          ipAddress: '192.168.1.100',
        })
      );
    });

    it('should handle network timeouts', async () => {
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockRejectedValue(
        new Error('Request timeout')
      );

      await expect(geoLocationService.resolveIP('192.168.1.100')).rejects.toThrow(
        'Failed to resolve IP location'
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to resolve IP location'),
        expect.objectContaining({
          error: 'Request timeout',
        })
      );
    });

    it('should handle malformed API responses', async () => {
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockResolvedValue({
        // Missing required fields
        ipAddress: '192.168.1.100',
        // Missing country, city, etc.
      });

      await expect(geoLocationService.resolveIP('192.168.1.100')).rejects.toThrow(
        'Invalid geo data received'
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid geo data received'),
        expect.any(Object)
      );
    });
  });

  describe('Configuration and Settings', () => {
    it('should use configurable API endpoints', async () => {
      const service = new GeoLocationService({
        apiEndpoint: 'https://custom-api.example.com',
        apiKey: 'custom-api-key',
        cacheTTL: 7200,
      });

      const mockGeoData = {
        ipAddress: '192.168.1.100',
        country: 'Test Country',
        region: 'Test Region',
        city: 'Test City',
      };

      jest.spyOn(service as any, 'fetchGeoData').mockResolvedValue(mockGeoData);

      const result = await service.resolveIP('192.168.1.100');

      expect(result).toEqual(mockGeoData);
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        7200 // Custom TTL
      );
    });

    it('should handle missing configuration gracefully', async () => {
      const service = new GeoLocationService({
        // Missing some configuration
        cacheTTL: 1800,
      });

      const mockGeoData = {
        ipAddress: '192.168.1.100',
        country: 'Test Country',
        region: 'Test Region',
        city: 'Test City',
      };

      jest.spyOn(service as any, 'fetchGeoData').mockResolvedValue(mockGeoData);

      const result = await service.resolveIP('192.168.1.100');

      expect(result).toEqual(mockGeoData);
    });

    it('should validate configuration parameters', async () => {
      expect(() => {
        new GeoLocationService({
          cacheTTL: -1, // Invalid TTL
        } as any);
      }).toThrow('Invalid cache TTL');

      expect(() => {
        new GeoLocationService({
          concurrencyLimit: 0, // Invalid concurrency limit
        } as any);
      }).toThrow('Invalid concurrency limit');
    });
  });

  describe('Performance Optimization', () => {
    it('should implement request deduplication', async () => {
      const ipAddress = '192.168.1.100';
      const mockGeoData = {
        ipAddress,
        country: '中国',
        region: '广东省',
        city: '深圳市',
      };

      // Mock slow API response
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockGeoData), 100))
      );

      // Make concurrent requests for the same IP
      const [result1, result2] = await Promise.all([
        geoLocationService.resolveIP(ipAddress),
        geoLocationService.resolveIP(ipAddress),
      ]);

      expect(result1).toEqual(mockGeoData);
      expect(result2).toEqual(mockGeoData);
      expect(geoLocationService['fetchGeoData']).toHaveBeenCalledTimes(1);
    });

    it('should implement circuit breaker pattern', async () => {
      // Mock multiple consecutive failures
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockRejectedValue(
        new Error('Service unavailable')
      );

      // Make several requests to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        await expect(geoLocationService.resolveIP('192.168.1.100')).rejects.toThrow();
      }

      // Additional requests should fail fast without hitting the API
      await expect(geoLocationService.resolveIP('192.168.1.100')).rejects.toThrow(
        'Circuit breaker is open'
      );

      expect(geoLocationService['fetchGeoData']).toHaveBeenCalledTimes(5);
    });

    it('should implement retry mechanism with exponential backoff', async () => {
      let callCount = 0;
      jest.spyOn(geoLocationService as any, 'fetchGeoData').mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          ipAddress: '192.168.1.100',
          country: '中国',
          region: '广东省',
          city: '深圳市',
        });
      });

      const result = await geoLocationService.resolveIP('192.168.1.100');

      expect(result).toBeDefined();
      expect(result.country).toBe('中国');
      expect(callCount).toBe(3);
    });
  });
});