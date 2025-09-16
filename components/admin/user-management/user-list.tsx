'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast/use-toast';
import {
  MoreHorizontal,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Ban,
} from 'lucide-react';
import { User, UserRole, UserStatus } from '@/types/admin';
import { UserForm } from './user-form';
import { UserDetail } from './user-detail';

interface UserListProps {
  refreshTrigger?: number;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterState {
  search: string;
  role: UserRole | '';
  status: UserStatus | '';
  department: string;
}

export function UserList({ refreshTrigger }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: '',
    status: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<User | null>(null);
  const [showDetail, setShowDetail] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [confirmBulkAction, setConfirmBulkAction] = useState<{
    action: string;
    userIds: number[];
  } | null>(null);

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.department && { department: filters.department }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data.data);
        setPagination(result.data.pagination);
      } else {
        toast({
          title: '获取用户列表失败',
          description: result.error?.message || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '获取用户列表失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  // 处理搜索和筛选
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 处理用户选择
  const handleUserSelect = (userId: number, checked: boolean) => {
    setSelectedUsers(prev =>
      checked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // 处理用户状态变更
  const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '状态更新成功',
          description: '用户状态已更新',
        });
        fetchUsers();
      } else {
        toast({
          title: '状态更新失败',
          description: result.error?.message || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '状态更新失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '删除成功',
          description: '用户已成功删除',
        });
        fetchUsers();
        setConfirmDelete(null);
      } else {
        toast({
          title: '删除失败',
          description: result.error?.message || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 批量操作
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userIds: selectedUsers,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '批量操作成功',
          description: result.message,
        });
        fetchUsers();
        setSelectedUsers([]);
        setConfirmBulkAction(null);
      } else {
        toast({
          title: '批量操作失败',
          description: result.error?.message || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '批量操作失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 获取角色标签样式
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'destructive';
      case UserRole.ADMIN:
        return 'default';
      case UserRole.OPERATOR:
        return 'secondary';
      case UserRole.VIEWER:
        return 'outline';
      default:
        return 'outline';
    }
  };

  // 获取状态标签样式
  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'default';
      case UserStatus.INACTIVE:
        return 'secondary';
      case UserStatus.SUSPENDED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>用户管理</span>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className='h-4 w-4 mr-2' />
            创建用户
          </Button>
        </CardTitle>
        <CardDescription>
          管理系统用户，包括角色分配、权限控制和状态管理
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 搜索和筛选 */}
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='搜索用户名或邮箱...'
              value={filters.search}
              onChange={e => handleSearch(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select
            value={filters.role || 'all'}
            onValueChange={value => handleFilterChange('role', value === 'all' ? '' : value)}
          >
            <SelectTrigger className='w-full md:w-40'>
              <SelectValue placeholder='选择角色' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部角色</SelectItem>
              {Object.values(UserRole).map(role => (
                <SelectItem key={role} value={role as string}>
                  {role === 'super_admin'
                    ? '超级管理员'
                    : role === 'admin'
                      ? '管理员'
                      : role === 'operator'
                        ? '操作员'
                        : '查看者'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status || 'all'}
            onValueChange={value => handleFilterChange('status', value === 'all' ? '' : value)}
          >
            <SelectTrigger className='w-full md:w-40'>
              <SelectValue placeholder='选择状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              {Object.values(UserStatus).map(status => (
                <SelectItem key={status} value={status as string}>
                  {status === 'active'
                    ? '激活'
                    : status === 'inactive'
                      ? '未激活'
                      : '暂停'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 批量操作 */}
        {selectedUsers.length > 0 && (
          <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-600'>
              已选择 {selectedUsers.length} 个用户
            </span>
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                setConfirmBulkAction({
                  action: 'activate',
                  userIds: selectedUsers,
                })
              }
            >
              <UserCheck className='h-4 w-4 mr-1' />
              激活
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                setConfirmBulkAction({
                  action: 'deactivate',
                  userIds: selectedUsers,
                })
              }
            >
              <UserX className='h-4 w-4 mr-1' />
              停用
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                setConfirmBulkAction({
                  action: 'suspend',
                  userIds: selectedUsers,
                })
              }
            >
              <Ban className='h-4 w-4 mr-1' />
              暂停
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={() =>
                setConfirmBulkAction({
                  action: 'delete',
                  userIds: selectedUsers,
                })
              }
            >
              <Trash2 className='h-4 w-4 mr-1' />
              删除
            </Button>
          </div>
        )}

        {/* 用户表格 */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>
                  <input
                    id='selectAllUsers'
                    name='selectAllUsers'
                    type='checkbox'
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className='rounded border-gray-300'
                  />
                </TableHead>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead className='text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center py-8'>
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900'></div>
                      <span className='ml-2'>加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center py-8 text-gray-500'
                  >
                    暂无用户数据
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        id={`selectUser-${user.id}`}
                        name={`selectUser-${user.id}`}
                        type='checkbox'
                        checked={selectedUsers.includes(user.id)}
                        onChange={e =>
                          handleUserSelect(user.id, e.target.checked)
                        }
                        className='rounded border-gray-300'
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium'>{user.username}</div>
                          <div className='text-sm text-gray-500'>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === 'super_admin'
                          ? '超级管理员'
                          : user.role === 'admin'
                            ? '管理员'
                            : user.role === 'operator'
                              ? '操作员'
                              : '查看者'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.status === UserStatus.ACTIVE}
                        onCheckedChange={checked =>
                          handleStatusChange(
                            user.id,
                            checked ? UserStatus.ACTIVE : UserStatus.INACTIVE
                          )
                        }
                      />
                      <Badge
                        variant={getStatusBadgeVariant(user.status)}
                        className='ml-2'
                      >
                        {user.status === 'active'
                          ? '激活'
                          : user.status === 'inactive'
                            ? '未激活'
                            : '暂停'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString('zh-CN')
                        : '从未登录'}
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => setShowDetail(user)}>
                            <Eye className='h-4 w-4 mr-2' />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowEditForm(user)}
                          >
                            <Edit className='h-4 w-4 mr-2' />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(
                                user.id,
                                user.status === UserStatus.ACTIVE
                                  ? UserStatus.INACTIVE
                                  : UserStatus.ACTIVE
                              )
                            }
                          >
                            {user.status === UserStatus.ACTIVE ? (
                              <>
                                <UserX className='h-4 w-4 mr-2' />
                                停用
                              </>
                            ) : (
                              <>
                                <UserCheck className='h-4 w-4 mr-2' />
                                激活
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(user.id, UserStatus.SUSPENDED)
                            }
                          >
                            <Ban className='h-4 w-4 mr-2' />
                            暂停
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setConfirmDelete(user)}
                            className='text-red-600'
                          >
                            <Trash2 className='h-4 w-4 mr-2' />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-600'>
            显示 {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
            条，共 {pagination.total} 条
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setPagination(prev => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page <= 1}
            >
              上一页
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setPagination(prev => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>

      {/* 创建用户表单 */}
      <UserForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          fetchUsers();
          setShowCreateForm(false);
        }}
      />

      {/* 编辑用户表单 */}
      {showEditForm && (
        <UserForm
          user={showEditForm}
          open={!!showEditForm}
          onClose={() => setShowEditForm(null)}
          onSuccess={() => {
            fetchUsers();
            setShowEditForm(null);
          }}
        />
      )}

      {/* 用户详情 */}
      {showDetail && (
        <UserDetail
          user={showDetail}
          open={!!showDetail}
          onClose={() => setShowDetail(null)}
        />
      )}

      {/* 删除确认对话框 */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除用户 &quot;{confirmDelete?.username}&quot;
              吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmDelete(null)}>
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={() =>
                confirmDelete && handleDeleteUser(confirmDelete.id)
              }
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量操作确认对话框 */}
      <Dialog
        open={!!confirmBulkAction}
        onOpenChange={() => setConfirmBulkAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量操作</DialogTitle>
            <DialogDescription>
              确定要对选中的 {confirmBulkAction?.userIds.length} 个用户执行
              {confirmBulkAction?.action === 'activate' && '激活'}
              {confirmBulkAction?.action === 'deactivate' && '停用'}
              {confirmBulkAction?.action === 'suspend' && '暂停'}
              {confirmBulkAction?.action === 'delete' && '删除'}
              操作吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setConfirmBulkAction(null)}
            >
              取消
            </Button>
            <Button
              variant={
                confirmBulkAction?.action === 'delete'
                  ? 'destructive'
                  : 'default'
              }
              onClick={() =>
                confirmBulkAction && handleBulkAction(confirmBulkAction.action)
              }
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
