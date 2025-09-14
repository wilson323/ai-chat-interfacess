/**
 * 处理 FastGPT 流式响应中的中间值
 */

// 各种中间值的类型
export interface ModuleStatusValue {
  type: 'moduleStatus' | 'moduleStart' | 'moduleEnd';
  name: string;
  status: 'running' | 'success' | 'error' | 'pending';
  nodeId?: string;
  moduleName?: string;
  moduleType?: string;
  timestamp: Date;
  runningTime?: number;
}

export interface ThinkingValue {
  type: 'thinking' | 'thinkingStart' | 'thinkingEnd';
  content: string;
  timestamp: Date;
}

export interface ModuleResultValue {
  type: 'moduleResult';
  name: string;
  result: any;
  timestamp: Date;
}

export interface ResponseDataValue {
  type: 'responseData';
  data: any;
  timestamp: Date;
}

export type IntermediateValue =
  | ModuleStatusValue
  | ThinkingValue
  | ModuleResultValue
  | ResponseDataValue
  | { type: string; [key: string]: any };

/**
 * 将原始 FastGPT 事件数据处理为结构化的中间值
 */
export function processIntermediateValue(
  data: any,
  eventType: string
): IntermediateValue {
  const timestamp = new Date();

  // 处理模块状态事件
  if (
    eventType === 'moduleStatus' ||
    eventType === 'moduleStart' ||
    eventType === 'moduleEnd'
  ) {
    return {
      type: eventType,
      name: data.name || data.moduleName || '处理中',
      status: data.status || 'running',
      nodeId: data.nodeId,
      moduleName: data.moduleName,
      moduleType: data.moduleType,
      runningTime: data.runningTime,
      timestamp,
    };
  }

  // 处理思考事件
  else if (
    eventType === 'thinking' ||
    eventType === 'thinkingStart' ||
    eventType === 'thinkingEnd'
  ) {
    return {
      type: eventType,
      content:
        typeof data === 'string'
          ? data
          : data.content || data.text || JSON.stringify(data),
      timestamp,
    };
  }

  // 处理模块结果事件
  else if (eventType === 'moduleResult') {
    return {
      type: eventType,
      name: data.name || data.moduleName || '结果',
      result: data,
      timestamp,
    };
  }

  // 处理响应数据事件
  else if (eventType === 'responseData') {
    return {
      type: eventType,
      data,
      timestamp,
    };
  }

  // 其他事件类型的默认处理程序
  return {
    type: eventType,
    ...data,
    timestamp,
  };
}

/**
 * 按类型对中间值进行分组
 */
export function groupIntermediateValues(values: IntermediateValue[]) {
  return {
    moduleStatus: values.filter(
      v =>
        v.type === 'moduleStatus' ||
        v.type === 'moduleStart' ||
        v.type === 'moduleEnd'
    ) as ModuleStatusValue[],
    thinking: values.filter(
      v =>
        v.type === 'thinking' ||
        v.type === 'thinkingStart' ||
        v.type === 'thinkingEnd'
    ) as ThinkingValue[],
    moduleResult: values.filter(
      v => v.type === 'moduleResult'
    ) as ModuleResultValue[],
    responseData: values.filter(
      v => v.type === 'responseData'
    ) as ResponseDataValue[],
    other: values.filter(
      v =>
        ![
          'moduleStatus',
          'moduleStart',
          'moduleEnd',
          'thinking',
          'thinkingStart',
          'thinkingEnd',
          'moduleResult',
          'responseData',
        ].includes(v.type)
    ),
  };
}
