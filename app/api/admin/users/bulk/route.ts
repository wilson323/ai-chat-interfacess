import { NextRequest, NextResponse } from 'next/server';
// Removed invalid typescript import
import { isAdmin } from '@/lib/api/auth';
import { ApiResponse } from '@/types';
import {
  User as UserModel,
  OperationLog,
  OperationStatus,
} from '@/lib/db/models';
import sequelize from '@/lib/db/sequelize';
import { z } from 'zod';

const bulkOperationSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'suspend', 'delete']),
  userIds: z.array(z.number()).min(1),
  data: z.record(z.unknown()).optional(),
});

// 记录操作日志
async function logOperation(
  userId: number,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, unknown>,
  status: OperationStatus,
  request: NextRequest,
  errorMessage?: string
) {
  try {
    await OperationLog.create({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status,
      errorMessage,
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

// PUT /api/admin/users/bulk - 批量操作用户
export async function PUT(request: NextRequest) {
  const transaction = await sequelize.transaction();

  try {
    // 验证管理员权限
    const isAdminResult = await isAdmin(request);
    if (!isAdminResult) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要管理员权限',
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // 解析和验证请求数据
    const body = await request.json();
    const validatedData = bulkOperationSchema.parse(body);

    const { action, userIds } = validatedData;

    // 获取当前操作用户
    const adminToken = request.cookies.get('adminToken')?.value;
    let operatorId: number | undefined;
    if (adminToken) {
      operatorId = 1; // 假设当前用户ID为1
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const userId of userIds) {
      try {
        const user = await UserModel.findByPk(userId, { transaction });

        if (!user) {
          results.push({
            userId,
            success: false,
            error: '用户不存在',
          });
          failureCount++;
          continue;
        }

        let updatedData: Record<string, string | number | boolean> = {};
        let actionType = '';
        let actionDescription = '';

        switch (action) {
          case 'activate':
            updatedData = { status: 'active' };
            actionType = 'ACTIVATE_USER';
            actionDescription = '激活用户';
            break;
          case 'deactivate':
            updatedData = { status: 'inactive' };
            actionType = 'DEACTIVATE_USER';
            actionDescription = '停用用户';
            break;
          case 'suspend':
            updatedData = { status: 'suspended' };
            actionType = 'SUSPEND_USER';
            actionDescription = '暂停用户';
            break;
          case 'delete':
            // 记录删除前的数据
            const deletedData = user.toJSON() as Record<string, unknown>;
            delete deletedData.password;

            await user.destroy({ transaction });

            // 记录删除操作日志
            await logOperation(
              operatorId || 1,
              'DELETE_USER',
              'USER',
              userId.toString(),
              {
                action: 'BULK_DELETE',
                deletedUser: deletedData,
              },
              OperationStatus.SUCCESS,
              request
            );

            results.push({
              userId,
              success: true,
              action: 'deleted',
              message: '用户删除成功',
            });
            successCount++;
            continue;
        }

        if (Object.keys(updatedData as Record<string, unknown>).length > 0) {
          const beforeData = user.toJSON();
          await user.update(updatedData, { transaction });

          // 记录操作日志
          await logOperation(
            operatorId || 1,
            actionType,
            'USER',
            userId.toString(),
            {
              action: 'BULK_OPERATION',
              operation: actionDescription,
              before: beforeData,
              after: updatedData,
            },
            OperationStatus.SUCCESS,
            request
          );

          results.push({
            userId,
            success: true,
            action: 'updated',
            message: `${actionDescription}成功`,
          });
          successCount++;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';

        // 记录操作失败日志
        await logOperation(
          operatorId || 1,
          action || 'BULK_OPERATION_ERROR',
          'USER',
          userId.toString(),
          {
            action,
            error: errorMessage,
          },
          OperationStatus.FAILED,
          request,
          errorMessage
        );

        results.push({
          userId,
          success: false,
          error: errorMessage,
        });
        failureCount++;
      }
    }

    await transaction.commit();

    return NextResponse.json(
      {
        success: true,
        data: {
          results,
          summary: {
            total: userIds.length,
            success: successCount,
            failed: failureCount,
            action,
          },
        },
        message: `批量操作完成：成功 ${successCount} 个，失败 ${failureCount} 个`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    await transaction.rollback();

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求数据验证失败',
            details: error.errors,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    console.error('批量操作失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '批量操作失败',
          details: error instanceof Error ? error.message : error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
