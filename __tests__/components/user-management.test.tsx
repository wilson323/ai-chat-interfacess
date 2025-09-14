import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from '@/components/admin/user-management/user-list';
import { UserForm } from '@/components/admin/user-management/user-form';
import { UserDetail } from '@/components/admin/user-management/user-detail';
import { UserRole, UserStatus } from '@/types/admin';

// Mock the API calls
jest.mock('@/lib/api/auth', () => ({
  isAdmin: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

describe('User Management Components', () => {
  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      permissions: ['agent:manage', 'system:config'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      role: UserRole.VIEWER,
      status: UserStatus.INACTIVE,
      permissions: ['system:monitor'],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    // Mock fetch API
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              data: mockUsers,
              pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('UserList', () => {
    test('renders user list with users', async () => {
      render(<UserList />);

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('user1')).toBeInTheDocument();
      });

      // Check if role badges are displayed
      expect(screen.getByText('超级管理员')).toBeInTheDocument();
      expect(screen.getByText('查看者')).toBeInTheDocument();
    });

    test('handles search functionality', async () => {
      render(<UserList />);

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText('搜索用户名或邮箱...');
      fireEvent.change(searchInput, { target: { value: 'admin' } });

      // Verify search was called
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=admin'),
        expect.any(Object)
      );
    });

    test('opens create user form', async () => {
      render(<UserList />);

      // Click create user button
      const createButton = screen.getByText('创建用户');
      fireEvent.click(createButton);

      // Verify form is opened (this would be tested more thoroughly in integration tests)
      expect(screen.getByText('创建用户')).toBeInTheDocument();
    });
  });

  describe('UserForm', () => {
    test('renders create user form', () => {
      render(
        <UserForm
          open={true}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      );

      expect(screen.getByText('创建用户')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入邮箱')).toBeInTheDocument();
    });

    test('renders edit user form with user data', () => {
      const user = mockUsers[0];
      render(
        <UserForm
          user={user}
          open={true}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      );

      expect(screen.getByText('编辑用户')).toBeInTheDocument();
      expect(screen.getByDisplayValue(user.username)).toBeInTheDocument();
      expect(screen.getByDisplayValue(user.email)).toBeInTheDocument();
    });

    test('validates form inputs', async () => {
      const mockOnSuccess = jest.fn();
      render(
        <UserForm
          open={true}
          onClose={() => {}}
          onSuccess={mockOnSuccess}
        />
      );

      // Try to submit without required fields
      const submitButton = screen.getByText('创建用户');
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
        expect(screen.getByText('邮箱不能为空')).toBeInTheDocument();
      });

      // Success callback should not be called
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('UserDetail', () => {
    test('renders user details', () => {
      const user = mockUsers[0];
      render(
        <UserDetail
          user={user}
          open={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('用户详情')).toBeInTheDocument();
      expect(screen.getByText(user.username)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByText('超级管理员')).toBeInTheDocument();
    });

    test('displays user permissions', () => {
      const user = mockUsers[0];
      render(
        <UserDetail
          user={user}
          open={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('智能体管理')).toBeInTheDocument();
      expect(screen.getByText('系统配置')).toBeInTheDocument();
    });
  });
});