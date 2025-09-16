/**
 * Recharts 库类型定义包装器
 * 解决复杂的 label prop 类型问题
 */

import { PieProps, PieLabel } from 'recharts';

// 简化的 Pie label 类型
export type SafePieLabel = PieLabel;

// 简化的数据类型
export interface PieChartData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

// 简化的 Radar 数据类型
export interface RadarChartData {
  subject: string;
  A: number;
  fullMark: number;
  [key: string]: any;
}

// 简化的 Line 图表数据类型
export interface LineChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// 简化的 Bar 图表数据类型
export interface BarChartData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

// 重新导出安全的类型
export type { PieProps, PieLabelProps } from 'recharts';

// 扩展 PieProps 以包含简化的 label 类型
export interface SafePieProps extends Omit<PieProps, 'label'> {
  label?: SafePieLabel | string;
  data?: PieChartData[];
}