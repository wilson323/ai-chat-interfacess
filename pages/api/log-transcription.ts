import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// 定义响应体类型
type Data = {
  message: string;
  filename?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    try {
      const { logContent } = req.body;

      if (!logContent || typeof logContent !== 'string') {
        return res
          .status(400)
          .json({ message: '无效的日志内容 (Invalid log content)' });
      }

      // 确保 'docs' 文件夹在项目的根目录下
      // process.cwd() 返回项目的根目录
      const docsDir = path.join(process.cwd(), 'docs');

      // 检查 'docs' 文件夹是否存在，如果不存在则创建它
      // recursive: true 允许创建嵌套文件夹，如果 docs 本身就需要被创建
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      const timestamp = new Date().getTime();
      const filename = `transcribe_form_data_log_${timestamp}.txt`;
      const filePath = path.join(docsDir, filename);

      // 将日志内容追加到文件，如果文件不存在则创建
      // 使用 appendFileSync 可以避免覆盖已有日志（如果选择固定文件名的话）
      // 这里我们使用时间戳文件名，所以 writeFile 或 appendFile 效果类似
      fs.appendFileSync(
        filePath,
        logContent + '\n\n--- Log Entry End ---\n\n',
        'utf8'
      );

      res
        .status(200)
        .json({ message: '日志已成功保存 (Log saved successfully)', filename });
    } catch (error: any) {
      console.error('保存日志时出错 (Error saving log):', error);
      res
        .status(500)
        .json({
          message: '保存日志失败 (Failed to save log)',
          error: error.message,
        });
    }
  } else {
    // 只允许 POST 方法
    res.setHeader('Allow', ['POST']);
    res
      .status(405)
      .end(`方法 ${req.method} 不允许 (Method ${req.method} Not Allowed)`);
  }
}
