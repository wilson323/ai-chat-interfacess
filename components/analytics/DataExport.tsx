'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface DataExportProps {
  className?: string;
}

const exportFormats = [
  {
    value: 'csv',
    label: 'CSV',
    description: '逗号分隔值文件，适合Excel打开',
    icon: FileSpreadsheet,
    extension: 'csv',
  },
  {
    value: 'excel',
    label: 'Excel',
    description: 'Microsoft Excel工作簿',
    icon: FileSpreadsheet,
    extension: 'xlsx',
  },
  {
    value: 'json',
    label: 'JSON',
    description: '结构化数据格式，适合开发者',
    icon: FileText,
    extension: 'json',
  },
];

const dataTypes = [
  {
    value: 'usage',
    label: '使用数据',
    description: '包含会话、消息、响应时间等详细信息',
    icon: Database,
  },
  {
    value: 'sessions',
    label: '会话数据',
    description: '聊天会话的详细记录',
    icon: FileText,
  },
  {
    value: 'agents',
    label: '智能体数据',
    description: '各智能体的使用统计和性能指标',
    icon: Database,
  },
  {
    value: 'locations',
    label: '地理位置数据',
    description: '用户地理位置分布和访问统计',
    icon: FileText,
  },
];

export default function DataExport({ className = '' }: DataExportProps) {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedDataType, setSelectedDataType] = useState('usage');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 设置默认日期范围
  React.useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30); // 默认导出最近30天数据

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  // 导出数据
  const handleExport = async () => {
    try {
      setLoading(true);
      setExportStatus('idle');
      setErrorMessage('');

      const params = new URLSearchParams({
        format: selectedFormat,
        dataType: selectedDataType,
        includeHeaders: includeHeaders.toString(),
        startDate,
        endDate,
      });

      const response = await fetch(`/api/analytics/export?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '导出失败');
      }

      const blob = await response.blob();

      // 检查返回的内容类型
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await blob.text();
        const errorObj = JSON.parse(errorData);
        throw new Error(errorObj.error || '导出失败');
      }

      // 下载文件
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // 生成文件名
      const dataTypeInfo = dataTypes.find(dt => dt.value === selectedDataType);
      const formatInfo = exportFormats.find(f => f.value === selectedFormat);
      const fileName = `${dataTypeInfo?.label || 'data'}_${startDate}_${endDate}.${formatInfo?.extension || selectedFormat}`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus('success');
    } catch (error) {
      setExportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '导出失败');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取选择的格式信息
  const selectedFormatInfo = exportFormats.find(f => f.value === selectedFormat);
  const selectedDataTypeInfo = dataTypes.find(dt => dt.value === selectedDataType);
  const FormatIcon = selectedFormatInfo?.icon || FileSpreadsheet;
  const DataTypeIcon = selectedDataTypeInfo?.icon || Database;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          数据导出
        </CardTitle>
        <CardDescription>
          导出各种格式的分析数据，支持自定义时间范围和数据类型
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 状态提示 */}
        {exportStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">导出成功！</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              文件已开始下载，请检查您的下载文件夹。
            </p>
          </div>
        )}

        {exportStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">导出失败</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        {/* 导出选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 数据格式选择 */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">导出格式</label>
            <div className="space-y-2">
              {exportFormats.map(format => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.value;
                return (
                  <div
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{format.label}</div>
                        <div className="text-sm text-gray-500">{format.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 数据类型选择 */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">数据类型</label>
            <div className="space-y-2">
              {dataTypes.map(dataType => {
                const Icon = dataType.icon;
                const isSelected = selectedDataType === dataType.value;
                return (
                  <div
                    key={dataType.value}
                    onClick={() => setSelectedDataType(dataType.value)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{dataType.label}</div>
                        <div className="text-sm text-gray-500">{dataType.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 时间范围选择 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            时间范围
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 快速选择按钮 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 7);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                最近7天
              </button>
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 30);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                最近30天
              </button>
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date(end.getFullYear(), end.getMonth(), 1);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                本月
              </button>
            </div>
          </div>
        </div>

        {/* 导出选项 */}
        {selectedFormat === 'csv' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">导出选项</label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeHeaders"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="includeHeaders" className="text-sm text-gray-700 cursor-pointer">
                包含列标题（推荐用于数据分析）
              </label>
            </div>
          </div>
        )}

        {/* 导出按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedDataTypeInfo && selectedFormatInfo && (
              <span>
                将导出 <span className="font-medium">{selectedDataTypeInfo.label}</span> 数据为{' '}
                <span className="font-medium">{selectedFormatInfo.label}</span> 格式
              </span>
            )}
          </div>
          <Button
            onClick={handleExport}
            disabled={loading || !startDate || !endDate}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                导出数据
              </>
            )}
          </Button>
        </div>

        {/* 导出说明 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">导出说明</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 数据会根据您选择的时间范围进行筛选</li>
            <li>• 大量数据导出可能需要一些时间，请耐心等待</li>
            <li>• 导出的文件会在浏览器的下载文件夹中</li>
            <li>• 如需导出更长时间的数据，请联系系统管理员</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}