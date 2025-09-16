import { NextRequest } from 'next/server';
import CadHistory from '@/lib/db/models/cad-history';

// GET /api/admin/cad-history/export-single?id=xxx&format=pdf|json|excel|txt
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const format = (searchParams.get('format') || 'txt').toLowerCase();

    if (!id) return new Response('缺少ID', { status: 400 });

    const record = await CadHistory.findByPk(id);
    if (!record) return new Response('记录不存在', { status: 404 });

    // 根据格式返回不同的响应
    if (format === 'json') {
      return new Response(JSON.stringify(record, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename=CAD_Report_${record.id}.json`,
        },
      });
    }

    // 默认返回TXT格式
    const txtContent = `ID: ${record.id}\n文件名: ${record.fileName}\n用户ID: ${record.userId}\n分析结果: ${record.analysisResult}\n创建时间: ${record.createdAt}`;

    return new Response(txtContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=CAD_Report_${record.id}.txt`,
      },
    });
  } catch (e) {
    return new Response('导出失败', { status: 500 });
  }
}
