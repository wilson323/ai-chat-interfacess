import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 强鉴权：校验 cookie 中的 adminToken
async function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) return false;
  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded && (decoded as any).role === 'admin';
  } catch {
    return false;
  }
}

// 模拟数据，实际应该从数据库读取
const mockData = [
  {
    id: 1,
    agentId: 1,
    userId: 1,
    fileName: 'sample-image.jpg',
    fileUrl: '/uploads/sample-image.jpg',
    originalImageUrl: '/uploads/original/sample-image.jpg',
    editedImageUrl: '/uploads/edited/sample-image-edited.jpg',
    editOperations: ['resize', 'crop', 'adjust-brightness'],
    analysisResult: '图片已成功编辑，包含裁剪、缩放和亮度调整操作',
    createdAt: new Date('2024-01-15T10:30:00').toISOString(),
    status: 'completed',
  },
  {
    id: 2,
    agentId: 1,
    userId: 2,
    fileName: 'design-file.png',
    fileUrl: '/uploads/design-file.png',
    originalImageUrl: '/uploads/original/design-file.png',
    editedImageUrl: '/uploads/edited/design-file-edited.png',
    editOperations: ['add-text', 'apply-filter'],
    analysisResult: '添加了文本标签和应用了艺术滤镜',
    createdAt: new Date('2024-01-14T15:45:00').toISOString(),
    status: 'completed',
  },
  {
    id: 3,
    agentId: 1,
    userId: 3,
    fileName: 'photo-edit.jpg',
    fileUrl: '/uploads/photo-edit.jpg',
    originalImageUrl: '/uploads/original/photo-edit.jpg',
    editedImageUrl: null,
    editOperations: [],
    analysisResult: '处理中...',
    createdAt: new Date('2024-01-16T09:15:00').toISOString(),
    status: 'processing',
  },
];

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // 过滤数据
    let filteredData = mockData.filter((item) => {
      const matchesSearch = !search ||
        item.fileName.toLowerCase().includes(search.toLowerCase()) ||
        item.analysisResult.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || item.status === status;
      return matchesSearch && matchesStatus;
    });

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredData.length / limit),
        totalItems: filteredData.length,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取数据失败', detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const body = await req.json();

    // 这里应该保存到数据库
    console.log('保存图片编辑历史:', body);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '保存失败', detail: String(error) },
      { status: 500 }
    );
  }
}