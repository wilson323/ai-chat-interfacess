/**
 * Lovart色彩系统映射
 * 建立现有主题系统与Lovart色彩系统的完整映射关系
 */

import { LovartColorSystem, LovartColorScale } from '../../types/theme-enhanced';
import { rgbToHex } from './color-utils';

/**
 * Lovart基础色彩系统定义（基于CSS变量）
 */
export const lovartBaseColors = {
  red: {
    1: '255, 236, 232',
    2: '253, 205, 197',
    3: '251, 172, 163',
    4: '249, 137, 129',
    5: '247, 101, 96',
    6: '245, 63, 63',
    7: '203, 39, 45',
    8: '161, 21, 30',
    9: '119, 8, 19',
    10: '77, 0, 10',
  },
  orangered: {
    1: '255, 243, 232',
    2: '253, 221, 195',
    3: '252, 197, 159',
    4: '250, 172, 123',
    5: '249, 144, 87',
    6: '247, 114, 52',
    7: '204, 81, 32',
    8: '162, 53, 17',
    9: '119, 31, 6',
    10: '77, 14, 0',
  },
  orange: {
    1: '255, 247, 232',
    2: '255, 228, 186',
    3: '255, 207, 139',
    4: '255, 182, 93',
    5: '255, 154, 46',
    6: '255, 125, 0',
    7: '210, 95, 0',
    8: '166, 69, 0',
    9: '121, 46, 0',
    10: '77, 27, 0',
  },
  gold: {
    1: '255, 252, 232',
    2: '253, 244, 191',
    3: '252, 233, 150',
    4: '250, 220, 109',
    5: '249, 204, 69',
    6: '247, 186, 30',
    7: '204, 146, 19',
    8: '162, 109, 10',
    9: '119, 75, 4',
    10: '77, 45, 0',
  },
  yellow: {
    1: '254, 255, 232',
    2: '254, 254, 190',
    3: '253, 250, 148',
    4: '252, 242, 107',
    5: '251, 232, 66',
    6: '250, 220, 25',
    7: '207, 175, 15',
    8: '163, 132, 8',
    9: '120, 93, 3',
    10: '77, 56, 0',
  },
  lime: {
    1: '252, 255, 232',
    2: '237, 248, 187',
    3: '220, 241, 144',
    4: '201, 233, 104',
    5: '181, 226, 65',
    6: '159, 219, 29',
    7: '126, 183, 18',
    8: '95, 148, 10',
    9: '67, 112, 4',
    10: '42, 77, 0',
  },
  green: {
    1: '232, 255, 234',
    2: '175, 240, 181',
    3: '123, 225, 136',
    4: '76, 210, 99',
    5: '35, 195, 67',
    6: '0, 180, 42',
    7: '0, 154, 41',
    8: '0, 128, 38',
    9: '0, 102, 34',
    10: '0, 77, 28',
  },
  cyan: {
    1: '232, 255, 251',
    2: '183, 244, 236',
    3: '137, 233, 224',
    4: '94, 223, 214',
    5: '55, 212, 207',
    6: '20, 201, 201',
    7: '13, 165, 170',
    8: '7, 130, 139',
    9: '3, 97, 108',
    10: '0, 66, 77',
  },
  blue: {
    1: '232, 247, 255',
    2: '195, 231, 254',
    3: '159, 212, 253',
    4: '123, 192, 252',
    5: '87, 169, 251',
    6: '52, 145, 250',
    7: '32, 108, 207',
    8: '17, 75, 163',
    9: '6, 48, 120',
    10: '0, 26, 77',
  },
  arcoblue: {
    1: '232, 243, 255',
    2: '190, 218, 255',
    3: '148, 191, 255',
    4: '106, 161, 255',
    5: '64, 128, 255',
    6: '22, 93, 255',
    7: '14, 66, 210',
    8: '7, 44, 166',
    9: '3, 26, 121',
    10: '0, 13, 77',
  },
  purple: {
    1: '245, 232, 255',
    2: '221, 190, 246',
    3: '195, 150, 237',
    4: '168, 113, 227',
    5: '141, 78, 218',
    6: '114, 46, 209',
    7: '85, 29, 176',
    8: '60, 16, 143',
    9: '39, 6, 110',
    10: '22, 0, 77',
  },
  pinkpurple: {
    1: '255, 232, 251',
    2: '247, 186, 239',
    3: '240, 142, 230',
    4: '232, 101, 223',
    5: '225, 62, 219',
    6: '217, 26, 217',
    7: '176, 16, 182',
    8: '138, 9, 147',
    9: '101, 3, 112',
    10: '66, 0, 77',
  },
  magenta: {
    1: '255, 232, 241',
    2: '253, 194, 219',
    3: '251, 157, 199',
    4: '249, 121, 183',
    5: '247, 84, 168',
    6: '245, 49, 157',
    7: '203, 30, 131',
    8: '161, 16, 105',
    9: '119, 6, 79',
    10: '77, 0, 52',
  },
  gray: {
    1: '247, 248, 250',
    2: '242, 243, 245',
    3: '229, 230, 235',
    4: '201, 205, 212',
    5: '169, 174, 184',
    6: '134, 144, 156',
    7: '107, 119, 133',
    8: '78, 89, 105',
    9: '39, 46, 59',
    10: '29, 33, 41',
  },
};

/**
 * 将Lovart RGB色彩系统转换为HEX格式
 */
export function convertLovartToHex(): LovartColorSystem {
  const hexSystem = {} as LovartColorSystem;

  Object.entries(lovartBaseColors).forEach(([colorName, scale]) => {
    hexSystem[colorName as keyof LovartColorSystem] = {
      1: rgbToHex(scale[1]),
      2: rgbToHex(scale[2]),
      3: rgbToHex(scale[3]),
      4: rgbToHex(scale[4]),
      5: rgbToHex(scale[5]),
      6: rgbToHex(scale[6]),
      7: rgbToHex(scale[7]),
      8: rgbToHex(scale[8]),
      9: rgbToHex(scale[9]),
      10: rgbToHex(scale[10]),
    };
  });

  return hexSystem;
}

/**
 * 主题分类到Lovart色彩的推荐映射
 */
export interface ThemeToLovartMapping {
  /** 主题分类 */
  category: string;
  /** 推荐的主色 */
  primaryColor: keyof LovartColorSystem;
  /** 推荐的辅助色 */
  secondaryColor: keyof LovartColorSystem;
  /** 推荐的强调色 */
  accentColor: keyof LovartColorSystem;
  /** 推荐的背景色 */
  backgroundColor: keyof LovartColorSystem;
  /** 推荐的文字色 */
  textColor: keyof LovartColorSystem;
  /** 推荐的成功色 */
  successColor: keyof LovartColorSystem;
  /** 推荐的警告色 */
  warningColor: keyof LovartColorSystem;
  /** 推荐的错误色 */
  errorColor: keyof LovartColorSystem;
  /** 推荐的信息色 */
  infoColor: keyof LovartColorSystem;
}

/**
 * 主题分类到Lovart色彩的映射配置
 */
export const themeToLovartMappings: Record<string, ThemeToLovartMapping> = {
  modern: {
    category: 'modern',
    primaryColor: 'green',
    secondaryColor: 'cyan',
    accentColor: 'blue',
    backgroundColor: 'gray',
    textColor: 'gray',
    successColor: 'green',
    warningColor: 'gold',
    errorColor: 'red',
    infoColor: 'blue',
  },
  business: {
    category: 'business',
    primaryColor: 'blue',
    secondaryColor: 'gray',
    accentColor: 'arcoblue',
    backgroundColor: 'gray',
    textColor: 'gray',
    successColor: 'green',
    warningColor: 'orange',
    errorColor: 'red',
    infoColor: 'blue',
  },
  tech: {
    category: 'tech',
    primaryColor: 'arcoblue',
    secondaryColor: 'cyan',
    accentColor: 'purple',
    backgroundColor: 'gray',
    textColor: 'gray',
    successColor: 'green',
    warningColor: 'gold',
    errorColor: 'red',
    infoColor: 'cyan',
  },
  nature: {
    category: 'nature',
    primaryColor: 'green',
    secondaryColor: 'lime',
    accentColor: 'cyan',
    backgroundColor: 'gray',
    textColor: 'gray',
    successColor: 'green',
    warningColor: 'yellow',
    errorColor: 'red',
    infoColor: 'cyan',
  },
  art: {
    category: 'art',
    primaryColor: 'purple',
    secondaryColor: 'pinkpurple',
    accentColor: 'magenta',
    backgroundColor: 'gray',
    textColor: 'gray',
    successColor: 'green',
    warningColor: 'orange',
    errorColor: 'red',
    infoColor: 'blue',
  },
};

/**
 * 根据主题分类获取推荐的Lovart色彩映射
 * @param category - 主题分类
 * @returns Lovart色彩映射配置
 */
export function getLovartMappingByCategory(category: string): ThemeToLovartMapping {
  return themeToLovartMappings[category] || themeToLovartMappings.modern;
}

/**
 * 根据Lovart色彩生成主题色彩配置
 * @param mapping - Lovart映射配置
 * @param colorScale - 色阶选择（1-10）
 * @returns 主题色彩配置
 */
export function generateThemeColorsFromLovart(
  mapping: ThemeToLovartMapping,
  colorScale: number = 6
): Record<string, string> {
  const lovartHexSystem = convertLovartToHex();
  const scale = Math.max(1, Math.min(10, colorScale));

  return {
    primary: lovartHexSystem[mapping.primaryColor][scale as keyof LovartColorScale],
    secondary: lovartHexSystem[mapping.secondaryColor][(scale - 1) as keyof LovartColorScale],
    accent: lovartHexSystem[mapping.accentColor][(scale + 1) as keyof LovartColorScale],
    background: lovartHexSystem[mapping.backgroundColor][1],
    surface: lovartHexSystem[mapping.backgroundColor][2],
    text: lovartHexSystem[mapping.textColor][9],
    textSecondary: lovartHexSystem[mapping.textColor][7],
    border: lovartHexSystem[mapping.backgroundColor][4],
    success: lovartHexSystem[mapping.successColor][scale as keyof LovartColorScale],
    warning: lovartHexSystem[mapping.warningColor][scale as keyof LovartColorScale],
    error: lovartHexSystem[mapping.errorColor][scale as keyof LovartColorScale],
    info: lovartHexSystem[mapping.infoColor][scale as keyof LovartColorScale],
  };
}

/**
 * 生成完整的Lovart色阶配置
 * @param mapping - Lovart映射配置
 * @returns 完整色阶配置
 */
export function generateLovartColorScales(mapping: ThemeToLovartMapping): Record<string, string[]> {
  const lovartHexSystem = convertLovartToHex();

  const getScale = (colorKey: keyof LovartColorSystem): string[] => {
    const scale = lovartHexSystem[colorKey];
    return [
      scale[1], scale[2], scale[3], scale[4], scale[5],
      scale[6], scale[7], scale[8], scale[9], scale[10]
    ];
  };

  return {
    primaryScale: getScale(mapping.primaryColor),
    secondaryScale: getScale(mapping.secondaryColor),
    accentScale: getScale(mapping.accentColor),
    backgroundScale: getScale(mapping.backgroundColor),
    surfaceScale: getScale(mapping.backgroundColor),
    textScale: getScale(mapping.textColor),
  };
}

/**
 * 获取Lovart色彩系统中的所有可用色彩
 * @returns 色彩名称数组
 */
export function getAvailableLovartColors(): string[] {
  return Object.keys(lovartBaseColors);
}

/**
 * 验证Lovart色彩名称是否有效
 * @param colorName - 色彩名称
 * @returns 是否有效
 */
export function isValidLovartColor(colorName: string): boolean {
  return colorName in lovartBaseColors;
}

/**
 * 获取指定色彩的色阶
 * @param colorName - 色彩名称
 * @param format - 格式（'rgb' 或 'hex'）
 * @returns 色阶数组
 */
export function getColorScale(colorName: string, format: 'rgb' | 'hex' = 'hex'): string[] {
  if (!isValidLovartColor(colorName)) {
    throw new Error(`Invalid Lovart color name: ${colorName}`);
  }

  const scale = lovartBaseColors[colorName as keyof typeof lovartBaseColors];

  if (format === 'hex') {
    return [
      rgbToHex(scale[1]), rgbToHex(scale[2]), rgbToHex(scale[3]), rgbToHex(scale[4]), rgbToHex(scale[5]),
      rgbToHex(scale[6]), rgbToHex(scale[7]), rgbToHex(scale[8]), rgbToHex(scale[9]), rgbToHex(scale[10])
    ];
  } else {
    return [
      scale[1], scale[2], scale[3], scale[4], scale[5],
      scale[6], scale[7], scale[8], scale[9], scale[10]
    ];
  }
}

// 导出转换后的HEX色彩系统
export const lovartHexSystem = convertLovartToHex();


const lovartColorMapping = {
  lovartBaseColors,
  lovartHexSystem,
  themeToLovartMappings,
  convertLovartToHex,
  getLovartMappingByCategory,
  generateThemeColorsFromLovart,
  generateLovartColorScales,
  getAvailableLovartColors,
  isValidLovartColor,
  getColorScale,
};

export default lovartColorMapping;