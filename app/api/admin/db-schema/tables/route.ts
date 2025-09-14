import { NextRequest, NextResponse } from 'next/server';
import { getAllDbTables } from '@/lib/db/models/db-schema';
import { requireAdmin } from '@/lib/api/auth';
import sequelize from '@/lib/db/sequelize';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const dbTables = await getAllDbTables();
    // 获取模型定义的表结构
    const models = sequelize.models;
    const modelTables = Object.keys(models).map(modelName => {
      const model = models[modelName];
      return {
        name: model.tableName,
        columns: Object.values(model.rawAttributes).map((attr: any) => ({
          name: attr.fieldName,
          type: attr.type?.key || '',
          allowNull: attr.allowNull,
          defaultValue: attr.defaultValue ?? null,
        })),
      };
    });
    return NextResponse.json({ dbTables, modelTables });
  } catch (e) {
    console.error('db-schema/tables error', e);
    return NextResponse.json(
      { error: String(e), stack: e?.stack },
      { status: 500 }
    );
  }
}
