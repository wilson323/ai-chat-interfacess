import { NextRequest } from 'next/server';
import CadHistory from '@/lib/db/models/cad-history';

// GET /api/admin/cad-history/export?format=pdf|json|excel|txt
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const userId = searchParams.get('userId');
    const format = (searchParams.get('format') || 'txt').toLowerCase();

    const where: Record<string, string> = {};
    if (agentId) where.agentId = agentId;
    if (userId) where.userId = userId;

    const list = await CadHistory.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    if (!list.length) {
      return new Response('无数据可导出', { status: 404 });
    }

    // 根据格式返回不同的响应
    if (format === 'json') {
      return new Response(JSON.stringify(list, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename=cad_history_export_${Date.now()}.json`,
        },
      });
    }

    // 默认返回TXT格式
    const txtContent = list
      .map(
        item =>
          `ID: ${item.id}\n文件名: ${item.fileName}\n用户ID: ${item.userId}\n分析结果: ${item.analysisResult}\n创建时间: ${item.createdAt}\n---\n`
      )
      .join('\n');

    return new Response(txtContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=cad_history_export_${Date.now()}.txt`,
      },
    });
  } catch (e) {
    return new Response('导出失败', { status: 500 });
  }
}
