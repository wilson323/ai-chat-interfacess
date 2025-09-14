'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Mail,
  Phone,
  Building,
  User as UserIcon,
  Shield,
  Activity,
  Clock,
  X,
  Edit,
} from 'lucide-react';
import { User, UserRole, UserStatus } from '@/types/admin';
import { OperationLog, OperationStatus } from '@/lib/db/models';

interface UserDetailProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

// 权限描述映射
const permissionDescriptions = {
  'agent:manage': '智能体管理',
  'system:config': '系统配置',
  'user:manage': '用户管理',
  'data:export': '数据导出',
  'system:monitor': '系统监控',
};

// 状态描述映射
const statusDescriptions = {
  [UserStatus.ACTIVE]: { text: '激活', color: 'bg-green-500' },
  [UserStatus.INACTIVE]: { text: '未激活', color: 'bg-gray-500' },
  [UserStatus.SUSPENDED]: { text: '暂停', color: 'bg-red-500' },
};

// 角色描述映射
const roleDescriptions = {
  [UserRole.SUPER_ADMIN]: { text: '超级管理员', color: 'bg-red-500' },
  [UserRole.ADMIN]: { text: '管理员', color: 'bg-blue-500' },
  [UserRole.OPERATOR]: { text: '操作员', color: 'bg-yellow-500' },
  [UserRole.VIEWER]: { text: '查看者', color: 'bg-gray-500' },
};

// 操作类型描述映射
const actionDescriptions = {
  'CREATE_USER': '创建用户',
  'UPDATE_USER': '更新用户',
  'DELETE_USER': '删除用户',
  'ACTIVATE_USER': '激活用户',
  'DEACTIVATE_USER': '停用用户',
  'SUSPEND_USER': '暂停用户',
  'BULK_OPERATION': '批量操作',
  'LOGIN': '登录',
  'LOGOUT': '登出',
  'CHANGE_PASSWORD': '修改密码',
};

export function UserDetail({ user, open, onClose }: UserDetailProps) {
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      fetchOperationLogs();
    }
  }, [user, open]);

  // 获取操作日志
  const fetchOperationLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`);
      const result = await response.json();

      if (result.success) {
        // 操作日志已经包含在用户详情中
        setOperationLogs(result.data.operationLogs || []);
      }
    } catch (error) {
      console.error('获取操作日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期时间
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>用户详情</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            查看用户详细信息、权限配置和操作记录
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">用户名</p>
                        <p className="font-medium">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">邮箱</p>
                        <p className="font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">角色</p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${roleDescriptions[user.role].color}`}
                          />
                          <Badge variant="outline">
                            {roleDescriptions[user.role].text}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">状态</p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${statusDescriptions[user.status].color}`}
                          />
                          <Badge variant="outline">
                            {statusDescriptions[user.status].text}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {(user.department || user.phone) && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          {user.department && (
                            <div>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                部门
                              </p>
                              <p className="font-medium">{user.department}</p>
                            </div>
                          )}
                          {user.phone && (
                            <div>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                手机号
                              </p>
                              <p className="font-medium">{user.phone}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 权限配置 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  权限配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-3">用户权限</p>
                    <div className="flex flex-wrap gap-2">
                      {user.permissions && user.permissions.length > 0 ? (
                        user.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permissionDescriptions[permission as keyof typeof permissionDescriptions] || permission}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">无特殊权限</Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-500 mb-2">角色权限说明</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• 超级管理员：拥有所有系统权限</p>
                      <p>• 管理员：可管理用户、智能体和数据导出</p>
                      <p>• 操作员：可管理智能体和查看系统监控</p>
                      <p>• 查看者：仅可查看系统监控信息</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 账户信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  账户信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      创建时间
                    </p>
                    <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      更新时间
                    </p>
                    <p className="font-medium">{formatDateTime(user.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      最后登录
                    </p>
                    <p className="font-medium">
                      {user.lastLogin ? formatDateTime(user.lastLogin) : '从未登录'}
                    </p>
                  </div>
                  {user.createdBy && (
                    <div>
                      <p className="text-sm text-gray-500">创建者</p>
                      <p className="font-medium">ID: {user.createdBy}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 操作日志 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  操作日志
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">加载中...</span>
                  </div>
                ) : operationLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无操作记录
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>操作时间</TableHead>
                        <TableHead>操作类型</TableHead>
                        <TableHead>资源类型</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>IP地址</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operationLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDateTime(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {actionDescriptions[log.action as keyof typeof actionDescriptions] || log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {log.resourceType || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  log.status === OperationStatus.SUCCESS
                                    ? 'bg-green-500'
                                    : log.status === OperationStatus.FAILED
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }`}
                              />
                              <span className="text-sm">
                                {log.status === OperationStatus.SUCCESS
                                  ? '成功'
                                  : log.status === OperationStatus.FAILED
                                  ? '失败'
                                  : '进行中'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ipAddress || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
