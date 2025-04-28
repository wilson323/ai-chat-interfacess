import { NextRequest, NextResponse } from 'next/server'
import DbSchemaApproval from '@/lib/db/models/db-schema-approval'
import sequelize from '@/lib/db/sequelize'

const ENABLED = process.env.DB_SCHEMA_APPROVAL_ENABLED === 'true'

export async function GET(req: NextRequest) {
  const approvals = await DbSchemaApproval.findAll({ order: [['createdAt', 'DESC']] })
  return NextResponse.json({ approvals })
}

export async function POST(req: NextRequest) {
  if (!ENABLED) return NextResponse.json({ error: '审批流未启用' }, { status: 403 })
  const { action, sql, requester } = await req.json()
  if (!action || !sql || !requester) return NextResponse.json({ error: '参数不全' }, { status: 400 })
  const approval = await DbSchemaApproval.create({ action, sql, requester, status: 'pending', createdAt: new Date(), updatedAt: new Date() })
  return NextResponse.json({ approval })
}

export async function PUT(req: NextRequest) {
  if (!ENABLED) return NextResponse.json({ error: '审批流未启用' }, { status: 403 })
  const { id, approve, approver } = await req.json()
  const approval = await DbSchemaApproval.findByPk(id)
  if (!approval) return NextResponse.json({ error: '未找到审批请求' }, { status: 404 })
  if (approval.status !== 'pending') return NextResponse.json({ error: '已处理' }, { status: 400 })
  approval.status = approve ? 'approved' : 'rejected'
  approval.approver = approver
  approval.updatedAt = new Date()
  await approval.save()
  if (approve) {
    // 审批通过，自动执行SQL
    await sequelize.query(approval.sql)
  }
  return NextResponse.json({ approval })
} 