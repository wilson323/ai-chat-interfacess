import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/api/auth';
import { ApiResponse, PaginatedResponse, PaginationRequest } from '@/types';
import { User, UserRole, UserStatus } from '@/types/admin';
import { User as UserModel, OperationLog, OperationStatus } from '@/lib/db/models';
import sequelize from '@/lib/db/sequelize';
import { Op } from 'sequelize';
import { z } from 'zod';

// 请求验证模式
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(255),
  role: z.nativeEnum(UserRole).default(UserRole.VIEWER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  permissions: z.array(z.string()).default([]),
  department: z.string().optional(),
  phone: z.string().optional(),
});

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

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  department: z.string().optional(),
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

// GET /api/admin/users - 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const isAdminUser = await isAdmin(request);
    if (!isAdminUser) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要管理员权限',
        },
      } as ApiResponse, { status: 401 });
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const paginationParams = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      search: searchParams.get('search'),
      role: searchParams.get('role'),
      status: searchParams.get('status'),
      department: searchParams.get('department'),
    });

    const { page, limit, sortBy, sortOrder, search, role, status, department } = paginationParams;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    if (department) whereClause.department = { [Op.iLike]: `%${department}%` };

    // 查询用户总数
    const total = await UserModel.count({ where: whereClause });

    // 查询用户列表
    const users = await UserModel.findAll({
      where: whereClause,
      attributes: {
        exclude: ['password'], // 不返回密码
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
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'action', 'status', 'createdAt'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    const result: PaginatedResponse<User> = {
      data: users.map(user => user.toJSON() as User),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse<PaginatedResponse<User>>);

  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '获取用户列表失败',
        details: error instanceof Error ? error.message : error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse, { status: 500 });
  }
}

// POST /api/admin/users - 创建用户
export async function POST(request: NextRequest) {
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

    // 解析和验证请求数据
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // 检查用户名是否已存在
    const existingUser = await UserModel.findOne({
      where: {
        [Op.or]: [
          { username: validatedData.username },
          { email: validatedData.email },
        ],
      },
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

    // 获取当前操作用户
    const adminToken = request.cookies.get('adminToken')?.value;
    let createdBy: number | undefined;
    if (adminToken) {
      // 这里应该解析token获取用户ID，简化示例中直接使用
      createdBy = 1; // 假设当前用户ID为1
    }

    // 创建用户
    const user = await UserModel.create(
      {
        ...validatedData,
        createdBy,
      },
      { transaction }
    );

    // 记录操作日志
    await logOperation(
      createdBy || 1,
      'CREATE_USER',
      'USER',
      user.id.toString(),
      {
        username: validatedData.username,
        email: validatedData.email,
        role: validatedData.role,
        status: validatedData.status,
      },
      OperationStatus.SUCCESS,
      undefined,
      request
    );

    await transaction.commit();

    // 返回用户信息（不包含密码）
    const userResponse = user.toJSON();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse as User,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse<User>, { status: 201 });

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

    console.error('创建用户失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '创建用户失败',
        details: error instanceof Error ? error.message : error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    } as ApiResponse, { status: 500 });
  }
}