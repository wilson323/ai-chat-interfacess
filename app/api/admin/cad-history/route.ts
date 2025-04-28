import { NextRequest, NextResponse } from 'next/server';
import CadHistory from '@/lib/db/models/cad-history';
// @ts-ignore
// import archiver from "archiver";
import { Readable } from "stream";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import sequelize from '@/lib/db/sequelize';

// GET /api/admin/cad-history?agentId=xx&userId=xx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const userId = searchParams.get('userId');
  const where: any = {};
  if (agentId) where.agentId = agentId;
  if (userId) where.userId = userId;
  const list = await CadHistory.findAll({ where, order: [['createdAt', 'DESC']] });
  return NextResponse.json({ code: 0, data: list });
}

// POST /api/admin/cad-history
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agentId, userId, fileName, fileUrl, analysisResult } = body;
  if (!agentId || !userId || !fileName || !fileUrl || !analysisResult) {
    return NextResponse.json({ code: 1, message: '参数不完整' }, { status: 400 });
  }
  const record = await CadHistory.create({ agentId, userId, fileName, fileUrl, analysisResult, createdAt: new Date() });
  return NextResponse.json({ code: 0, data: record });
}

// PUT /api/admin/cad-history?id=xx
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ code: 1, message: '缺少ID' }, { status: 400 });
  const body = await req.json();
  const record = await CadHistory.findByPk(id);
  if (!record) return NextResponse.json({ code: 1, message: '记录不存在' }, { status: 404 });
  await record.update(body);
  return NextResponse.json({ code: 0, data: record });
}

// DELETE /api/admin/cad-history?id=xx
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ code: 1, message: '缺少ID' }, { status: 400 });
  const record = await CadHistory.findByPk(id);
  if (!record) return NextResponse.json({ code: 1, message: '记录不存在' }, { status: 404 });
  await record.destroy();
  return NextResponse.json({ code: 0, message: '删除成功' });
}

// 批量多格式导出API GET /api/admin/cad-history/export?format=pdf|json|excel|txt
export async function GET_EXPORT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const userId = searchParams.get("userId");
    const format = (searchParams.get("format") || "txt").toLowerCase();
    const where: any = {};
    if (agentId) where.agentId = agentId;
    if (userId) where.userId = userId;
    const list = await CadHistory.findAll({ where, order: [["createdAt", "DESC"]] });
    if (!list.length) {
      return new Response("无数据可导出", { status: 404 });
    }
    // 动态引入 archiver
    // @ts-ignore
    const archiver = require("archiver");
    const fsSync = require("fs");
    const os = require("os");
    const tmpDir = os.tmpdir();
    const zipPath = path.join(tmpDir, `cad_history_export_${Date.now()}.zip`);
    const output = fsSync.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);
    const publicDir = path.join(process.cwd(), "public");
    // 多格式批量导出
    for (const item of list) {
      // 结构化分析内容示例
      // 建议后续分析逻辑返回如下结构
      const structured = {
        id: item.id,
        fileName: item.fileName,
        userId: item.userId,
        createdAt: item.createdAt,
        // 结构化分析内容，建议后端分析时生成
        analysis: {
          // 设备清单
          devices: [
            // { type: '摄像机', count: 2, coordinates: [{x:100,y:200}, ...] }
          ],
          // 其他结构化字段
          summary: item.analysisResult || '',
        },
      };
      // 文件原件
      if (item.fileUrl) {
        const absPath = path.join(publicDir, decodeURIComponent(item.fileUrl.replace(/^\//, "")));
        if (fsSync.existsSync(absPath)) {
          archive.file(absPath, { name: `files/${item.fileName}` });
        }
      }
      // 多格式导出
      if (format === "pdf") {
        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.fontSize(18).text("CAD 分析报告", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`文件名: ${item.fileName}`);
        doc.text(`用户ID: ${item.userId}`);
        doc.text(`分析时间: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}`);
        doc.moveDown();
        doc.fontSize(14).text("结构化分析内容:");
        doc.fontSize(12).text(JSON.stringify(structured.analysis, null, 2));
        doc.end();
        // 等待pdf生成
        archive.append(Buffer.concat(chunks), { name: `reports/CAD_Report_${item.id}.pdf` });
      } else if (format === "excel" || format === "xlsx") {
        const ExcelJS = require("exceljs");
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("CAD分析报告");
        sheet.addRow(["字段", "内容"]);
        sheet.addRow(["文件名", item.fileName]);
        sheet.addRow(["用户ID", item.userId]);
        sheet.addRow(["分析时间", item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"]);
        sheet.addRow(["结构化分析内容", JSON.stringify(structured.analysis)]);
        // 可扩展：设备清单分多行
        if (structured.analysis.devices && structured.analysis.devices.length) {
          sheet.addRow(["设备类型", "数量", "坐标"]);
          structured.analysis.devices.forEach((dev: any) => {
            sheet.addRow([dev.type, dev.count, JSON.stringify(dev.coordinates)]);
          });
        }
        const buffer = workbook.xlsx.writeBuffer();
        archive.append(buffer, { name: `reports/CAD_Report_${item.id}.xlsx` });
      } else if (format === "json") {
        archive.append(JSON.stringify(structured, null, 2), { name: `reports/CAD_Report_${item.id}.json` });
      } else {
        // txt
        archive.append(item.analysisResult || "无分析结果", { name: `reports/CAD_Report_${item.id}.txt` });
      }
      // 结构化元数据
      archive.append(JSON.stringify(structured, null, 2), { name: `meta/${item.id}.json` });
    }
    await archive.finalize();
    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
    });
    const zipBuffer = await fs.readFile(zipPath);
    await fs.unlink(zipPath);
    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=CAD_History_Export_${format.toUpperCase()}_${Date.now()}.zip`,
      },
    });
  } catch (e) {
    return new Response("导出失败", { status: 500 });
  }
}

// 单条记录多格式导出API GET /api/admin/cad-history/export-single?id=xxx&format=pdf|json|excel|txt
export async function GET_EXPORT_SINGLE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const format = (searchParams.get("format") || "txt").toLowerCase();
    if (!id) return new Response("缺少ID", { status: 400 });
    const record = await CadHistory.findByPk(id);
    if (!record) return new Response("记录不存在", { status: 404 });
    // PDF
    if (format === "pdf") {
      const PDFDocument = require("pdfkit");
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => {});
      doc.fontSize(18).text("CAD 分析报告", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`文件名: ${record.fileName}`);
      doc.text(`用户ID: ${record.userId}`);
      doc.text(`分析时间: ${record.createdAt ? new Date(record.createdAt).toLocaleString() : "-"}`);
      doc.moveDown();
      doc.fontSize(14).text("分析结果:");
      doc.fontSize(12).text(record.analysisResult || "无");
      doc.end();
      await new Promise(resolve => doc.on("end", resolve));
      const pdfBuffer = Buffer.concat(chunks);
      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=CAD_Report_${record.id}.pdf`,
        },
      });
    }
    // Excel
    if (format === "excel" || format === "xlsx") {
      const ExcelJS = require("exceljs");
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("CAD分析报告");
      sheet.addRow(["字段", "内容"]);
      sheet.addRow(["文件名", record.fileName]);
      sheet.addRow(["用户ID", record.userId]);
      sheet.addRow(["分析时间", record.createdAt ? new Date(record.createdAt).toLocaleString() : "-"]);
      sheet.addRow(["分析结果", record.analysisResult]);
      const buffer = await workbook.xlsx.writeBuffer();
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename=CAD_Report_${record.id}.xlsx`,
        },
      });
    }
    // JSON
    if (format === "json") {
      return new Response(JSON.stringify(record, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename=CAD_Report_${record.id}.json`,
        },
      });
    }
    // TXT（默认）
    return new Response(record.analysisResult || "无分析结果", {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename=CAD_Report_${record.id}.txt`,
      },
    });
  } catch (e) {
    return new Response("导出失败", { status: 500 });
  }
} 