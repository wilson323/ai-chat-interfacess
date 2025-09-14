import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) return false;
  return true;
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  return new Promise(resolve => {
    exec(
      'npx sequelize-cli db:migrate',
      { cwd: process.cwd() },
      (error, stdout, stderr) => {
        if (error) {
          resolve(
            NextResponse.json(
              { error: '迁移失败', detail: stderr || error.message },
              { status: 500 }
            )
          );
        } else {
          resolve(NextResponse.json({ success: true, output: stdout }));
        }
      }
    );
  });
}
