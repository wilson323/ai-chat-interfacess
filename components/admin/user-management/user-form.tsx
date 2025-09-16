'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast/use-toast';
import { User, UserRole, UserStatus, Permission } from '@/types/admin';
import { Save, X } from 'lucide-react';

interface UserFormProps {
  user?: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  department: string;
  phone: string;
}

// 可用权限列表
const availablePermissions = [
  Permission.AGENT_MANAGE,
  Permission.SYSTEM_CONFIG,
  Permission.USER_MANAGE,
  Permission.DATA_EXPORT,
  Permission.SYSTEM_MONITOR,
];

// 权限描述映射
const permissionDescriptions = {
  [Permission.AGENT_MANAGE]: '智能体管理',
  [Permission.SYSTEM_CONFIG]: '系统配置',
  [Permission.USER_MANAGE]: '用户管理',
  [Permission.DATA_EXPORT]: '数据导出',
  [Permission.SYSTEM_MONITOR]: '系统监控',
};

// 默认角色权限
const roleDefaultPermissions = {
  [UserRole.SUPER_ADMIN]: availablePermissions,
  [UserRole.ADMIN]: [
    Permission.AGENT_MANAGE,
    Permission.USER_MANAGE,
    Permission.DATA_EXPORT,
    Permission.SYSTEM_MONITOR,
  ],
  [UserRole.OPERATOR]: [Permission.AGENT_MANAGE, Permission.SYSTEM_MONITOR],
  [UserRole.VIEWER]: [Permission.SYSTEM_MONITOR],
};

export function UserForm({ user, open, onClose, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.VIEWER,
    status: UserStatus.ACTIVE,
    permissions: [],
    department: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        status: user.status,
        permissions: user.permissions || [],
        department: user.department || '',
        phone: user.phone || '',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: UserRole.VIEWER,
        status: UserStatus.ACTIVE,
        permissions: [],
        department: '',
        phone: '',
      });
    }
    setErrors({});
  }, [user, open]);

  // 处理角色变更，自动设置默认权限
  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: roleDefaultPermissions[role] || [],
    }));
  };

  // 处理权限变更
  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission] as Permission[]
        : prev.permissions.filter(p => p !== permission) as Permission[],
    }));
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 用户名验证
    if (!formData.username) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符';
    } else if (formData.username.length > 50) {
      newErrors.username = '用户名最多50个字符';
    }

    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    // 密码验证
    if (!user) {
      // 创建用户时需要密码
      if (!formData.password) {
        newErrors.password = '密码不能为空';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码至少6个字符';
      } else if (formData.password.length > 255) {
        newErrors.password = '密码最多255个字符';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    } else if (formData.password) {
      // 编辑时如果提供了密码，需要验证
      if (formData.password.length < 6) {
        newErrors.password = '密码至少6个字符';
      } else if (formData.password.length > 255) {
        newErrors.password = '密码最多255个字符';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    }

    // 手机号验证（可选）
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '手机号格式不正确';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions,
        department: formData.department,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }),
      };

      const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users';
      const method = user ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: user ? '用户更新成功' : '用户创建成功',
          description: user
            ? `用户 "${formData.username}" 已成功更新`
            : `用户 "${formData.username}" 已成功创建`,
        });
        onSuccess();
      } else {
        toast({
          title: user ? '用户更新失败' : '用户创建失败',
          description: result.error?.message || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: user ? '用户更新失败' : '用户创建失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{user ? '编辑用户' : '创建用户'}</DialogTitle>
          <DialogDescription>
            {user ? '修改用户信息和权限设置' : '创建新用户并分配相应的权限'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>基本信息</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='username'>用户名 *</Label>
                  <Input
                    id='username'
                    value={formData.username}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder='请输入用户名'
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className='text-sm text-red-500'>{errors.username}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>邮箱 *</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, email: e.target.value }))
                    }
                    placeholder='请输入邮箱'
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className='text-sm text-red-500'>{errors.email}</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='role'>角色 *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='请选择角色' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.SUPER_ADMIN}>
                        超级管理员
                      </SelectItem>
                      <SelectItem value={UserRole.ADMIN}>管理员</SelectItem>
                      <SelectItem value={UserRole.OPERATOR}>操作员</SelectItem>
                      <SelectItem value={UserRole.VIEWER}>查看者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='status'>状态 *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value =>
                      setFormData(prev => ({
                        ...prev,
                        status: value as UserStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='请选择状态' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserStatus.ACTIVE}>激活</SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>
                        未激活
                      </SelectItem>
                      <SelectItem value={UserStatus.SUSPENDED}>暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='department'>部门</Label>
                  <Input
                    id='department'
                    value={formData.department}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    placeholder='请输入部门名称'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>手机号</Label>
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder='请输入手机号'
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className='text-sm text-red-500'>{errors.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 密码设置 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>密码设置</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='password'>
                    {user ? '新密码（留空则不修改）' : '密码 *'}
                  </Label>
                  <Input
                    id='password'
                    type='password'
                    value={formData.password}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder={user ? '请输入新密码' : '请输入密码'}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className='text-sm text-red-500'>{errors.password}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>
                    确认密码 {!user && '*'}
                  </Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    value={formData.confirmPassword}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder='请再次输入密码'
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className='text-sm text-red-500'>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              {formData.password && (
                <p className='text-sm text-gray-600'>
                  密码长度需在 6-255 个字符之间
                </p>
              )}
            </CardContent>
          </Card>

          {/* 权限设置 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>权限设置</CardTitle>
              <p className='text-sm text-gray-600'>
                为用户分配具体的操作权限（超级管理员拥有所有权限）
              </p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                {availablePermissions.map(permission => (
                  <div
                    key={permission}
                    className='flex items-start space-x-3 p-3 border rounded-lg'
                  >
                    <Checkbox
                      id={permission}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={checked =>
                        handlePermissionChange(permission, checked as boolean)
                      }
                      disabled={formData.role === UserRole.SUPER_ADMIN}
                    />
                    <div className='flex-1'>
                      <Label
                        htmlFor={permission}
                        className='text-sm font-medium cursor-pointer'
                      >
                        {
                          permissionDescriptions[
                            permission as keyof typeof permissionDescriptions
                          ]
                        }
                      </Label>
                      <p className='text-xs text-gray-500 mt-1'>{permission}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 当前权限预览 */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>当前权限</Label>
                <div className='flex flex-wrap gap-2'>
                  {formData.permissions.length === 0 ? (
                    <Badge variant='outline'>无权限</Badge>
                  ) : (
                    formData.permissions.map(permission => (
                      <Badge key={permission} variant='secondary'>
                        {
                          permissionDescriptions[
                            permission as keyof typeof permissionDescriptions
                          ]
                        }
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              <X className='h-4 w-4 mr-2' />
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              <Save className='h-4 w-4 mr-2' />
              {loading ? '保存中...' : user ? '更新用户' : '创建用户'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
