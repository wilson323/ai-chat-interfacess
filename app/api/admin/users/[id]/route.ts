import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/api/auth';
import { ApiResponse } from '@/types';
import { User, UserRole, UserStatus } from '@/types/admin';
import { User as UserModel, OperationLog, OperationStatus } from '@/lib/db/models';
import sequelize from '@/lib/db/sequelize';
import { Op } from 'sequelize';
import { z } from 'zod';

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(255).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  permissions: z.array(z.string()).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

// 记录操作日志
async function logOperation(
  userId: number,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, any>,
  status: OperationStatus,
  errorMessage?: string,
  request: NextRequest
) {
  try {
    await OperationLog.create({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status,
      errorMessage,
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

// GET /api/admin/users/[id] - 获取单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const authResult = await isAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要管理员权限',
        },
      } as ApiResponse, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '无效的用户ID',
        },
      } as ApiResponse, { status: 400 });
    }

    // 查询用户
    const user = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
      include: [
        {
          model: UserModel,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: OperationLog,
          as: 'operationLogs',
          limit: 10,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'action', 'resourceType', 'status', 'createdAt', 'details'],
        },
      ],
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      } as ApiResponse, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user.toJSON() as User,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse<User>);

  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '获取用户详情失败',
        details: error instanceof Error ? error.message : error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const transaction = await sequelize.transaction();

  try {
    // 验证管理员权限
    const authResult = await isAdmin(request);
    if (!authResult.success) {
      await transaction.rollback();
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要管理员权限',
        },
      } as ApiResponse, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      await transaction.rollback();
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '无效的用户ID',
        },
      } as ApiResponse, { status: 400 });
    }

    // 查询用户
    const user = await UserModel.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      } as ApiResponse, { status: 404 });
    }

    // 解析和验证请求数据
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // 检查用户名和邮箱唯一性
    if (validatedData.username || validatedData.email) {
      const whereClause: any = { id: { [Op.ne]: userId } };

      if (validatedData.username) {
        whereClause.username = validatedData.username;
      }
      if (validatedData.email) {
        whereClause.email = validatedData.email;
      }

      const existingUser = await UserModel.findOne({
        where: whereClause,
        transaction,
      });

      if (existingUser) {
        await transaction.rollback();
        return NextResponse.json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: '用户名或邮箱已存在',
          },
        } as ApiResponse, { status: 409 });
      }
    }

    // 获取当前操作用户
    const adminToken = request.cookies.get('adminToken')?.value;
    let operatorId: number | undefined;
    if (adminToken) {
      operatorId = 1; // 假设当前用户ID为1
    }

    // 记录更新前的数据
    const beforeData = user.toJSON();

    // 更新用户
    await user.update(validatedData, { transaction });

    // 记录操作日志
    await logOperation(
      operatorId || 1,
      'UPDATE_USER',
      'USER',
      userId.toString(),
      {
        before: beforeData,
        after: validatedData,
      },
      OperationStatus.SUCCESS,
      undefined,
      request
    );

    await transaction.commit();

    // 返回更新后的用户信息
    const updatedUser = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password'],
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser?.toJSON() as User,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse<User>);

  } catch (error) {
    await transaction.rollback();

    if (error instanceof z.ZodError) {
      return NextResponse.json({
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
      } as ApiResponse, { status: 400 });
    }

    console.error('更新用户失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '更新用户失败',
        details: error instanceof Error ? error.message : error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const transaction = await sequelize.transaction();

  try {
    // 验证管理员权限
    const authResult = await isAdmin(request);
    if (!authResult.success) {
      await transaction.rollback();
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要管理员权限',
        },
      } as ApiResponse, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      await transaction.rollback();
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '无效的用户ID',
        },
      } as ApiResponse, { status: 400 });
    }

    // 查询用户
    const user = await UserModel.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      } as ApiResponse, { status: 404 });
    }

    // 获取当前操作用户
    const adminToken = request.cookies.get('adminToken')?.value;
    let operatorId: number | undefined;
    if (adminToken) {
      operatorId = 1; // 假设当前用户ID为1
    }

    // 记录删除前的数据
    const deletedData = user.toJSON();
    delete deletedData.password; // 不记录密码

    // 删除用户
    await user.destroy({ transaction });

    // 记录操作日志
    await logOperation(
      operatorId || 1,
      'DELETE_USER',
      'USER',
      userId.toString(),
      {
        deletedUser: deletedData,
      },
      OperationStatus.SUCCESS,
      undefined,
      request
    );

    await transaction.commit();

    return NextResponse.json({
      success: true,
      message: '用户删除成功',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse, { status: 200 });

  } catch (error) {
    await transaction.rollback();

    console.error('删除用户失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '删除用户失败',
        details: error instanceof Error ? error.message : error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse, { status: 500 });
  }
}