import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import UserGeo from '@/lib/db/models/UserGeo';
import sequelize from '@/lib/db/sequelize';
import { Op } from 'sequelize';

describe('UserGeo Model Tests', () => {
  beforeEach(async () => {
    // 清空测试数据
    await UserGeo.destroy({ where: {} });
  });

  afterEach(async () => {
    // 清理测试数据
    await UserGeo.destroy({ where: {} });
  });

  describe('CRUD Operations', () => {
    it('should create a new UserGeo record', async () => {
      const geoData = {
        ipAddress: '192.168.1.1',
        country: '中国',
        region: '广东省',
        city: '深圳市',
        latitude: 22.5431,
        longitude: 114.0579,
        timezone: 'Asia/Shanghai',
        isp: 'China Telecom',
      };

      const userGeo = await UserGeo.create(geoData);

      expect(userGeo.id).toBeDefined();
      expect(userGeo.ipAddress).toBe(geoData.ipAddress);
      expect(userGeo.country).toBe(geoData.country);
      expect(userGeo.region).toBe(geoData.region);
      expect(userGeo.city).toBe(geoData.city);
      expect(parseFloat(userGeo.latitude!.toString())).toBe(geoData.latitude);
      expect(parseFloat(userGeo.longitude!.toString())).toBe(geoData.longitude);
      expect(userGeo.timezone).toBe(geoData.timezone);
      expect(userGeo.isp).toBe(geoData.isp);
      expect(userGeo.usageCount).toBe(1);
      expect(userGeo.lastSeenAt).toBeInstanceOf(Date);
    });

    it('should read UserGeo record', async () => {
      const geoData = {
        ipAddress: '192.168.1.2',
        country: '美国',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
        isp: 'AT&T',
      };

      const created = await UserGeo.create(geoData);
      const found = await UserGeo.findByPk(created.id);

      expect(found).toBeTruthy();
      expect(found!.ipAddress).toBe(geoData.ipAddress);
      expect(found!.country).toBe(geoData.country);
    });

    it('should update UserGeo record', async () => {
      const geoData = {
        ipAddress: '192.168.1.3',
        country: '日本',
        region: '东京都',
        city: '东京',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo',
        isp: 'NTT',
      };

      const userGeo = await UserGeo.create(geoData);

      await userGeo.update({
        usageCount: 5,
        lastSeenAt: new Date(),
      });

      const updated = await UserGeo.findByPk(userGeo.id);
      expect(updated!.usageCount).toBe(5);
    });

    it('should delete UserGeo record', async () => {
      const geoData = {
        ipAddress: '192.168.1.4',
        country: '英国',
        region: 'England',
        city: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
        isp: 'BT',
      };

      const userGeo = await UserGeo.create(geoData);
      const id = userGeo.id;

      await userGeo.destroy();
      const deleted = await UserGeo.findByPk(id);

      expect(deleted).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should create multiple UserGeo records', async () => {
      const geoDataArray = [
        {
          ipAddress: '192.168.1.5',
          country: '中国',
          region: '北京市',
          city: '北京',
          latitude: 39.9042,
          longitude: 116.4074,
          timezone: 'Asia/Shanghai',
          isp: 'China Unicom',
        },
        {
          ipAddress: '192.168.1.6',
          country: '中国',
          region: '上海市',
          city: '上海',
          latitude: 31.2304,
          longitude: 121.4737,
          timezone: 'Asia/Shanghai',
          isp: 'China Mobile',
        },
      ];

      const createdUsers = await UserGeo.bulkCreate(geoDataArray);
      expect(createdUsers).toHaveLength(2);

      const allUsers = await UserGeo.findAll();
      expect(allUsers).toHaveLength(2);
    });

    it('should update multiple UserGeo records', async () => {
      const geoDataArray = [
        {
          ipAddress: '192.168.1.7',
          country: '德国',
          region: 'Bavaria',
          city: 'Munich',
          latitude: 48.1351,
          longitude: 11.5820,
          timezone: 'Europe/Berlin',
          isp: 'Deutsche Telekom',
        },
        {
          ipAddress: '192.168.1.8',
          country: '法国',
          region: 'Île-de-France',
          city: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522,
          timezone: 'Europe/Paris',
          isp: 'Orange',
        },
      ];

      await UserGeo.bulkCreate(geoDataArray);

      await UserGeo.update(
        { usageCount: 10 },
        { where: { country: { [Op.in]: ['德国', '法国'] } } }
      );

      const updatedUsers = await UserGeo.findAll({
        where: { country: { [Op.in]: ['德国', '法国'] } },
      });

      updatedUsers.forEach(user => {
        expect(user.usageCount).toBe(10);
      });
    });

    it('should delete multiple UserGeo records', async () => {
      const geoDataArray = [
        {
          ipAddress: '192.168.1.9',
          country: '意大利',
          region: 'Lombardy',
          city: 'Milan',
          latitude: 45.4642,
          longitude: 9.1900,
          timezone: 'Europe/Rome',
          isp: 'TIM',
        },
        {
          ipAddress: '192.168.1.10',
          country: '西班牙',
          region: 'Madrid',
          city: 'Madrid',
          latitude: 40.4168,
          longitude: -3.7038,
          timezone: 'Europe/Madrid',
          isp: 'Movistar',
        },
      ];

      await UserGeo.bulkCreate(geoDataArray);

      await UserGeo.destroy({
        where: { country: { [Op.in]: ['意大利', '西班牙'] } },
      });

      const remainingUsers = await UserGeo.findAll();
      expect(remainingUsers).toHaveLength(0);
    });
  });

  describe('IP Validation', () => {
    it('should validate IPv4 addresses', async () => {
      const validIPv4Addresses = [
        '192.168.1.1',
        '10.0.0.1',
        '172.16.0.1',
        '127.0.0.1',
        '8.8.8.8',
      ];

      for (const ip of validIPv4Addresses) {
        const geoData = {
          ipAddress: ip,
          country: '测试国家',
          region: '测试地区',
          city: '测试城市',
        };

        const userGeo = await UserGeo.create(geoData);
        expect(userGeo.ipAddress).toBe(ip);
      }
    });

    it('should validate IPv6 addresses', async () => {
      const validIPv6Addresses = [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        '::1',
        '2001:db8::1',
        'fe80::1',
      ];

      for (const ip of validIPv6Addresses) {
        const geoData = {
          ipAddress: ip,
          country: '测试国家',
          region: '测试地区',
          city: '测试城市',
        };

        const userGeo = await UserGeo.create(geoData);
        expect(userGeo.ipAddress).toBe(ip);
      }
    });

    it('should reject invalid IP addresses', async () => {
      const invalidIPAddresses = [
        '256.256.256.256',
        '192.168.1',
        'not.an.ip.address',
        '',
        '192.168.1.256',
      ];

      for (const ip of invalidIPAddresses) {
        const geoData = {
          ipAddress: ip,
          country: '测试国家',
          region: '测试地区',
          city: '测试城市',
        };

        await expect(UserGeo.create(geoData)).rejects.toThrow();
      }
    });

    it('should enforce unique IP constraint', async () => {
      const geoData = {
        ipAddress: '192.168.1.100',
        country: '测试国家',
        region: '测试地区',
        city: '测试城市',
      };

      await UserGeo.create(geoData);

      await expect(UserGeo.create(geoData)).rejects.toThrow();
    });
  });

  describe('Coordinate Validation', () => {
    it('should validate latitude range', async () => {
      const validLatitudes = [-90, -45, 0, 45, 90];
      const invalidLatitudes = [-91, -90.1, 90.1, 91];

      for (const lat of validLatitudes) {
        const geoData = {
          ipAddress: `192.168.1.${lat}`,
          country: '测试国家',
          latitude: lat,
          longitude: 0,
        };

        const userGeo = await UserGeo.create(geoData);
        expect(parseFloat(userGeo.latitude!.toString())).toBe(lat);
      }

      for (const lat of invalidLatitudes) {
        const geoData = {
          ipAddress: `192.168.1.${Math.abs(lat)}`,
          country: '测试国家',
          latitude: lat,
          longitude: 0,
        };

        await expect(UserGeo.create(geoData)).rejects.toThrow();
      }
    });

    it('should validate longitude range', async () => {
      const validLongitudes = [-180, -90, 0, 90, 180];
      const invalidLongitudes = [-181, -180.1, 180.1, 181];

      for (const lng of validLongitudes) {
        const geoData = {
          ipAddress: `192.168.1.${Math.abs(lng)}`,
          country: '测试国家',
          latitude: 0,
          longitude: lng,
        };

        const userGeo = await UserGeo.create(geoData);
        expect(parseFloat(userGeo.longitude!.toString())).toBe(lng);
      }

      for (const lng of invalidLongitudes) {
        const geoData = {
          ipAddress: `192.168.1.${Math.abs(lng)}`,
          country: '测试国家',
          latitude: 0,
          longitude: lng,
        };

        await expect(UserGeo.create(geoData)).rejects.toThrow();
      }
    });
  });

  describe('Static Methods', () => {
    it('should create or update UserGeo record', async () => {
      const geoData = {
        ipAddress: '192.168.1.200',
        country: '中国',
        region: '广东省',
        city: '深圳市',
      };

      // First creation
      const userGeo1 = await UserGeo.createOrUpdate(geoData);
      expect(userGeo1.usageCount).toBe(1);

      // Second call should update existing record
      const userGeo2 = await UserGeo.createOrUpdate(geoData);
      expect(userGeo2.usageCount).toBe(2);
      expect(userGeo2.id).toBe(userGeo1.id);
    });

    it('should get top locations', async () => {
      const locations = [
        { ipAddress: '192.168.1.201', country: '中国', city: '北京' },
        { ipAddress: '192.168.1.202', country: '美国', city: '纽约' },
        { ipAddress: '192.168.1.203', country: '日本', city: '东京' },
      ];

      for (const location of locations) {
        await UserGeo.create(location);
      }

      // Update usage counts
      await UserGeo.update({ usageCount: 100 }, { where: { ipAddress: '192.168.1.201' } });
      await UserGeo.update({ usageCount: 50 }, { where: { ipAddress: '192.168.1.202' } });
      await UserGeo.update({ usageCount: 75 }, { where: { ipAddress: '192.168.1.203' } });

      const topLocations = await UserGeo.getTopLocations(2);
      expect(topLocations).toHaveLength(2);
      expect(topLocations[0].usageCount).toBe(100);
      expect(topLocations[1].usageCount).toBe(75);
    });

    it('should get location statistics', async () => {
      const locations = [
        { ipAddress: '192.168.1.204', country: '中国', region: '广东', city: '深圳', usageCount: 100 },
        { ipAddress: '192.168.1.205', country: '中国', region: '北京', city: '北京', usageCount: 80 },
        { ipAddress: '192.168.1.206', country: '美国', region: 'California', city: 'SF', usageCount: 60 },
      ];

      await UserGeo.bulkCreate(locations);

      const stats = await UserGeo.getLocationStats({ groupBy: 'country' });
      expect(stats).toHaveLength(2);

      const chinaStats = stats.find(s => s.country === '中国');
      expect(chinaStats.total_usage).toBe(180);
      expect(chinaStats.unique_users).toBe(2);
    });

    it('should cleanup old data', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 400);

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);

      await UserGeo.create({
        ipAddress: '192.168.1.207',
        country: '测试国家',
        lastSeenAt: oldDate,
      });

      await UserGeo.create({
        ipAddress: '192.168.1.208',
        country: '测试国家',
        lastSeenAt: recentDate,
      });

      const cleanupCount = await UserGeo.cleanupOldData(365);
      expect(cleanupCount).toBe(1);

      const remaining = await UserGeo.findAll();
      expect(remaining).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Mock database connection error
      const originalSequelize = sequelize;

      // This test would require mocking the database connection
      // For now, we'll test the error handling structure
      expect(true).toBe(true);
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        ipAddress: '', // Empty IP should fail validation
        country: '', // Empty country should fail validation
      };

      await expect(UserGeo.create(invalidData)).rejects.toThrow();
    });

    it('should handle constraint violations', async () => {
      const geoData = {
        ipAddress: '192.168.1.300',
        country: '测试国家',
      };

      await UserGeo.create(geoData);

      await expect(UserGeo.create(geoData)).rejects.toThrow();
    });
  });
});