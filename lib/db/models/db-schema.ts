import sequelize from '../sequelize';
import { Sequelize } from 'sequelize';

export interface DbSchemaDiff {
  table: string;
  missingFields: string[];
  extraFields: string[];
  typeMismatch: string[];
  nullMismatch: string[];
  defaultMismatch: string[];
  missingIndexes: string[];
  missingUniques: string[];
  missingForeignKeys: string[];
}

// 更严谨的表结构比对，返回是否需要同步和详细diff
export async function checkDbSchema(): Promise<{
  syncNeeded: boolean;
  diffs: DbSchemaDiff[];
}> {
  const models = sequelize.models;
  const diffs: DbSchemaDiff[] = [];
  for (const modelName in models) {
    const model = models[modelName];
    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM \`${model.tableName}\``
    );
    const dbFields = (columns as any[]).map(col => col.Field);
    const modelFields = Object.keys(model.rawAttributes);
    const missingFields = modelFields.filter(f => !dbFields.includes(f));
    const extraFields = dbFields.filter(f => !modelFields.includes(f));
    const typeMismatch: string[] = [];
    const nullMismatch: string[] = [];
    const defaultMismatch: string[] = [];
    for (const col of columns as any[]) {
      const attr = model.rawAttributes[col.Field];
      if (!attr) continue;
      // 兼容string和DataType类型
      const modelType =
        typeof attr.type === 'string'
          ? attr.type
          : attr.type.key || String(attr.type);
      if (!col.Type.toLowerCase().includes(modelType.toLowerCase()))
        typeMismatch.push(col.Field);
      if ((col.Null === 'YES') !== attr.allowNull) nullMismatch.push(col.Field);
      if (
        col.Default != null &&
        attr.defaultValue != null &&
        col.Default !== attr.defaultValue
      )
        defaultMismatch.push(col.Field);
    }
    // 检查索引、唯一约束、外键
    const [indexes] = await sequelize.query(
      `SHOW INDEX FROM \`${model.tableName}\``
    );
    const modelIndexes = Object.values(model.options.indexes || {}).map(
      (idx: any) => idx.fields.map((f: any) => f.name || f)
    );
    const dbIndexes = (indexes as any[])
      .filter((i: any) => !i.Non_unique)
      .map((i: any) => i.Column_name);
    const missingIndexes = modelIndexes
      .flat()
      .filter(f => !dbIndexes.includes(f));
    // 唯一约束
    const modelUniques = Object.values(model.options.indexes || {})
      .filter((idx: any) => idx.unique)
      .map((idx: any) => idx.fields.map((f: any) => f.name || f))
      .flat();
    const dbUniques = (indexes as any[])
      .filter((i: any) => i.Non_unique === 0)
      .map((i: any) => i.Column_name);
    const missingUniques = modelUniques.filter(f => !dbUniques.includes(f));
    // 外键
    const [fks] = await sequelize.query(
      `SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME='${model.tableName}' AND CONSTRAINT_NAME!='PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    const modelFks = Object.values(model.rawAttributes)
      .filter((attr: any) => attr.references)
      .map((attr: any) => attr.fieldName);
    const dbFks = (fks as any[]).map((fk: any) => fk.COLUMN_NAME);
    const missingForeignKeys = modelFks.filter(f => !dbFks.includes(f));
    if (
      missingFields.length ||
      extraFields.length ||
      typeMismatch.length ||
      nullMismatch.length ||
      defaultMismatch.length ||
      missingIndexes.length ||
      missingUniques.length ||
      missingForeignKeys.length
    ) {
      diffs.push({
        table: model.tableName,
        missingFields,
        extraFields,
        typeMismatch,
        nullMismatch,
        defaultMismatch,
        missingIndexes,
        missingUniques,
        missingForeignKeys,
      });
    }
  }
  return { syncNeeded: diffs.length > 0, diffs };
}

// 获取所有表结构
export async function getAllDbTables(): Promise<
  {
    name: string;
    columns: {
      name: string;
      type: string;
      allowNull: boolean;
      defaultValue: any;
    }[];
  }[]
> {
  const tables: any[] = [];
  // 兼容PostgreSQL，不能用SHOW TABLES
  const [results] = await sequelize.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
  );
  console.log('getAllDbTables results:', results);
  for (const row of results as any[]) {
    const tableName = row.table_name;
    if (!tableName) continue;
    const [columns] = await sequelize.query(
      `SELECT column_name AS "Field", data_type AS "Type", is_nullable AS "Null", column_default AS "Default" FROM information_schema.columns WHERE table_name = '${tableName}'`
    );
    tables.push({
      name: tableName,
      columns: (columns as any[]).map(col => ({
        name: col.Field,
        type: col.Type,
        allowNull: col.Null === 'YES',
        defaultValue: col.Default,
      })),
    });
  }
  console.log('getAllDbTables tables:', tables);
  return tables;
}

// 同步数据库表结构
export async function syncDbSchema(): Promise<void> {
  // 这里假设用sequelize.sync({ alter: true })同步所有模型
  // 生产环境应更细致
  await sequelize.sync({ alter: true });
}

// 生成结构变更SQL脚本（简单示例）
export async function getSchemaDiffSQL(): Promise<string> {
  // 实际可用sequelize-auto-migrations等工具生成
  // 这里只返回一个示例SQL
  return '-- 结构变更SQL示例\nALTER TABLE agent_config ADD COLUMN demo_field VARCHAR(255);';
}
