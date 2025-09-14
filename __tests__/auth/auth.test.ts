import { describe, it, expect, jest } from '@jest/globals';
import { isAdmin, hasPermission } from '@/lib/auth';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Auth Utils', () => {
  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const adminUser = { role: 'admin' };
      expect(isAdmin(adminUser)).toBe(true);
    });

    it('should return false for non-admin user', () => {
      const regularUser = { role: 'user' };
      expect(isAdmin(regularUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isAdmin(null)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      const adminUser = { role: 'admin' };
      expect(hasPermission(adminUser, 'read')).toBe(true);
      expect(hasPermission(adminUser, 'write')).toBe(true);
      expect(hasPermission(adminUser, 'delete')).toBe(true);
      expect(hasPermission(adminUser, 'admin')).toBe(true);
    });

    it('should return true for user with read permission', () => {
      const user = { role: 'user' };
      expect(hasPermission(user, 'read')).toBe(true);
    });

    it('should return false for user without write permission', () => {
      const user = { role: 'user' };
      expect(hasPermission(user, 'write')).toBe(false);
    });

    it('should return true for moderator with write permission', () => {
      const moderator = { role: 'moderator' };
      expect(hasPermission(moderator, 'write')).toBe(true);
    });

    it('should return false for null user', () => {
      expect(hasPermission(null, 'read')).toBe(false);
    });

    it('should return false for unknown role', () => {
      const unknownUser = { role: 'unknown' };
      expect(hasPermission(unknownUser, 'read')).toBe(false);
    });
  });
});
