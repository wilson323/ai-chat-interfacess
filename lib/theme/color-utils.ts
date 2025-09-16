/**
 * 色彩转换工具
 * 提供RGB/HEX转换、色阶生成、颜色操作等功能
 */

/**
 * 色彩工具接口
 */
export interface ColorUtils {
  rgbToHex: (rgb: string) => string;
  hexToRgb: (hex: string) => string;
  parseRgb: (rgb: string) => { r: number; g: number; b: number };
  parseHex: (hex: string) => { r: number; g: number; b: number };
  darken: (color: string, amount: number) => string;
  lighten: (color: string, amount: number) => string;
  generateScale: (baseColor: string, steps: number) => string[];
  getContrastRatio: (color1: string, color2: string) => number;
  isDarkColor: (color: string) => boolean;
  generateRandomColor: () => string;
  mixColors: (color1: string, color2: string, ratio?: number) => string;
}

/**
 * RGB颜色字符串转换为HEX格式
 * @param rgb - RGB格式字符串，如 "255, 236, 232"
 * @returns HEX格式字符串，如 "#ffece8"
 */
export function rgbToHex(rgb: string): string {
  const values = rgb.split(',').map(v => parseInt(v.trim(), 10));
  if (values.length !== 3 || values.some(v => isNaN(v) || v < 0 || v > 255)) {
    throw new Error(`Invalid RGB format: ${rgb}`);
  }

  const hex = values.map(v => v.toString(16).padStart(2, '0')).join('');
  return `#${hex}`;
}

/**
 * HEX颜色字符串转换为RGB格式
 * @param hex - HEX格式字符串，如 "#ffece8" 或 "ffece8"
 * @returns RGB格式字符串，如 "255, 236, 232"
 */
export function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    throw new Error(`Invalid HEX format: ${hex}`);
  }

  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

/**
 * 将RGB字符串转换为RGB对象
 * @param rgb - RGB格式字符串，如 "255, 236, 232"
 * @returns RGB对象，如 { r: 255, g: 236, b: 232 }
 */
export function parseRgb(rgb: string): { r: number; g: number; b: number } {
  const values = rgb.split(',').map(v => parseInt(v.trim(), 10));
  if (values.length !== 3 || values.some(v => isNaN(v) || v < 0 || v > 255)) {
    throw new Error(`Invalid RGB format: ${rgb}`);
  }

  return { r: values[0], g: values[1], b: values[2] };
}

/**
 * 将HEX字符串转换为RGB对象
 * @param hex - HEX格式字符串，如 "#ffece8"
 * @returns RGB对象，如 { r: 255, g: 236, b: 232 }
 */
export function parseHex(hex: string): { r: number; g: number; b: number } {
  const rgbString = hexToRgb(hex);
  return parseRgb(rgbString);
}

/**
 * 颜色变暗
 * @param color - 颜色字符串（支持HEX和RGB）
 * @param amount - 变暗程度（0-1）
 * @returns 变暗后的颜色（HEX格式）
 */
export function darken(color: string, amount: number): string {
  if (amount < 0 || amount > 1) {
    throw new Error('Amount must be between 0 and 1');
  }

  let rgb: { r: number; g: number; b: number };

  if (color.startsWith('#')) {
    rgb = parseHex(color);
  } else if (color.includes(',')) {
    rgb = parseRgb(color);
  } else {
    throw new Error(`Unsupported color format: ${color}`);
  }

  const factor = 1 - amount;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 颜色变亮
 * @param color - 颜色字符串（支持HEX和RGB）
 * @param amount - 变亮程度（0-1）
 * @returns 变亮后的颜色（HEX格式）
 */
export function lighten(color: string, amount: number): string {
  if (amount < 0 || amount > 1) {
    throw new Error('Amount must be between 0 and 1');
  }

  let rgb: { r: number; g: number; b: number };

  if (color.startsWith('#')) {
    rgb = parseHex(color);
  } else if (color.includes(',')) {
    rgb = parseRgb(color);
  } else {
    throw new Error(`Unsupported color format: ${color}`);
  }

  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 生成色阶
 * @param baseColor - 基础颜色（HEX或RGB格式）
 * @param steps - 色阶数量
 * @returns 色阶数组（从浅到深）
 */
export function generateScale(baseColor: string, steps: number = 10): string[] {
  if (steps < 2) {
    throw new Error('Steps must be at least 2');
  }

  const scale: string[] = [];

  // 生成从浅到深的色阶
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    if (ratio < 0.5) {
      // 浅色部分（变亮）
      const amount = (0.5 - ratio) * 2;
      scale.push(lighten(baseColor, amount * 0.8));
    } else {
      // 深色部分（变暗）
      const amount = (ratio - 0.5) * 2;
      scale.push(darken(baseColor, amount * 0.7));
    }
  }

  return scale;
}

/**
 * 计算颜色对比度
 * @param color1 - 第一个颜色（HEX或RGB格式）
 * @param color2 - 第二个颜色（HEX或RGB格式）
 * @returns 对比度比例（1-21）
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = color1.startsWith('#') ? parseHex(color1) : parseRgb(color1);
  const rgb2 = color2.startsWith('#') ? parseHex(color2) : parseRgb(color2);

  // 计算相对亮度
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 判断是否为深色颜色
 * @param color - 颜色字符串（HEX或RGB格式）
 * @returns 是否为深色
 */
export function isDarkColor(color: string): boolean {
  let rgb: { r: number; g: number; b: number };

  if (color.startsWith('#')) {
    rgb = parseHex(color);
  } else if (color.includes(',')) {
    rgb = parseRgb(color);
  } else {
    throw new Error(`Unsupported color format: ${color}`);
  }

  // 使用相对亮度公式
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}

/**
 * 生成随机颜色
 * @param minBrightness - 最小亮度（0-1）
 * @param maxBrightness - 最大亮度（0-1）
 * @returns 随机颜色（HEX格式）
 */
export function generateRandomColor(minBrightness = 0, maxBrightness = 1): string {
  const min = Math.max(0, Math.min(1, minBrightness));
  const max = Math.max(min, Math.min(1, maxBrightness));

  const randomByte = () => {
    const range = (max - min) * 255;
    return Math.floor(min * 255 + Math.random() * range);
  };

  const r = randomByte();
  const g = randomByte();
  const b = randomByte();

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 混合两种颜色
 * @param color1 - 第一个颜色（HEX或RGB格式）
 * @param color2 - 第二个颜色（HEX或RGB格式）
 * @param weight - 混合权重（0-1，0为完全color1，1为完全color2）
 * @returns 混合后的颜色（HEX格式）
 */
export function mixColors(color1: string, color2: string, weight = 0.5): string {
  if (weight < 0 || weight > 1) {
    throw new Error('Weight must be between 0 and 1');
  }

  const rgb1 = color1.startsWith('#') ? parseHex(color1) : parseRgb(color1);
  const rgb2 = color2.startsWith('#') ? parseHex(color2) : parseRgb(color2);

  const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight);
  const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight);
  const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 色彩工具类
 */
export const colorUtils = {
  rgbToHex,
  hexToRgb,
  parseRgb,
  parseHex,
  darken,
  lighten,
  generateScale,
  getContrastRatio,
  isDarkColor,
  generateRandomColor,
  mixColors,
};

export default colorUtils;