/**
 * FastGPT参数获取功能测试
 * 测试全局变量的序列化、反序列化和类型映射功能
 */

import { describe, it, expect } from '@jest/globals';

// 模拟全局变量类型映射函数
function getVariableTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    text: '文本',
    select: '选择框',
    custom: '自定义',
    number: '数字',
    boolean: '布尔值',
    option: '选项',
  };
  return typeMap[type] || type;
}

// 模拟全局变量接口
interface GlobalVariable {
  id: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  valueType: string;
  description?: string;
  defaultValue?: string;
  maxLen?: number;
  icon?: string;
  enums?: Array<{ value: string; label?: string }>;
  list?: Array<{ value: string; label?: string }>;
}

// 模拟FastGPT API响应
const mockFastGPTResponse = {
  code: 200,
  data: {
    chatId: '11',
    appId: '67dd2f0dedb9d9c7419aa8d5',
    app: {
      chatConfig: {
        welcomeText: '您好呀！我是您的AI智能体定制方案设计师小助手~✨',
        variables: [
          {
            id: 'rrxjek',
            key: '问题历史',
            label: '问题历史',
            type: 'custom',
            required: false,
            maxLen: 50,
            enums: [{ value: '' }],
            valueType: 'any',
            icon: 'core/workflow/inputType/customVariable',
            list: [{ value: '' }],
            description: '',
            defaultValue: '',
          },
          {
            id: 'fvee6t',
            key: 'product',
            label: 'product',
            type: 'select',
            description: '产品',
            required: true,
            valueType: 'string',
            list: [
              { label: '万傲瑞达V6600', value: '万傲瑞达V6600' },
              { label: 'ZKEcoPro', value: 'ZKEcoPro' },
            ],
            defaultValue: '万傲瑞达V6600',
            enums: [
              { label: '万傲瑞达V6600', value: '万傲瑞达V6600' },
              { label: 'ZKEcoPro', value: 'ZKEcoPro' },
            ],
            icon: 'core/workflow/inputType/option',
          },
        ],
      },
      chatModels: ['qwq-plus-latest'],
      name: '熵犇犇定制需求分析',
      avatar: '/api/system/img/681077bf119dd736232e0a4f.png',
      intro: '熵犇犇定制需求智能应用，专注于为您提供全方位的定制服务',
      type: 'advanced',
    },
  },
};

describe('FastGPT参数获取功能测试', () => {
  describe('变量类型映射', () => {
    it('应该正确映射已知的变量类型', () => {
      expect(getVariableTypeLabel('text')).toBe('文本');
      expect(getVariableTypeLabel('select')).toBe('选择框');
      expect(getVariableTypeLabel('custom')).toBe('自定义');
      expect(getVariableTypeLabel('number')).toBe('数字');
      expect(getVariableTypeLabel('boolean')).toBe('布尔值');
      expect(getVariableTypeLabel('option')).toBe('选项');
    });

    it('应该返回原始类型名称对于未知类型', () => {
      expect(getVariableTypeLabel('unknown')).toBe('unknown');
      expect(getVariableTypeLabel('custom-type')).toBe('custom-type');
    });
  });

  describe('全局变量序列化', () => {
    it('应该能够序列化全局变量为JSON字符串', () => {
      const variables: GlobalVariable[] =
        mockFastGPTResponse.data.app.chatConfig.variables;
      const serialized = JSON.stringify(variables);

      expect(typeof serialized).toBe('string');
      expect(serialized).toContain('问题历史');
      expect(serialized).toContain('product');
    });

    it('应该能够反序列化JSON字符串为全局变量数组', () => {
      const variables: GlobalVariable[] =
        mockFastGPTResponse.data.app.chatConfig.variables;
      const serialized = JSON.stringify(variables);
      const deserialized: GlobalVariable[] = JSON.parse(serialized);

      expect(Array.isArray(deserialized)).toBe(true);
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0]?.key).toBe('问题历史');
      expect(deserialized[1]?.key).toBe('product');
    });
  });

  describe('FastGPT响应解析', () => {
    it('应该能够从FastGPT响应中提取基础信息', () => {
      const response = mockFastGPTResponse;

      expect(response.code).toBe(200);
      expect(response.data.app.name).toBe('熵犇犇定制需求分析');
      expect(response.data.app.intro).toContain('熵犇犇定制需求智能应用');
      expect(response.data.app.chatConfig.welcomeText).toContain(
        'AI智能体定制方案设计师'
      );
    });

    it('应该能够从FastGPT响应中提取全局变量', () => {
      const variables = mockFastGPTResponse.data.app.chatConfig.variables;

      expect(Array.isArray(variables)).toBe(true);
      expect(variables).toHaveLength(2);

      // 测试第一个变量
      const firstVar = variables[0];
      expect(firstVar).toBeDefined();
      if (firstVar) {
        expect(firstVar.key).toBe('问题历史');
        expect(firstVar.type).toBe('custom');
        expect(firstVar.required).toBe(false);
      }

      // 测试第二个变量
      const secondVar = variables[1];
      expect(secondVar).toBeDefined();
      if (secondVar) {
        expect(secondVar.key).toBe('product');
        expect(secondVar.type).toBe('select');
        expect(secondVar.required).toBe(true);
        expect(secondVar.list).toHaveLength(2);
      }
    });

    it('应该能够从FastGPT响应中提取模型信息', () => {
      const models = mockFastGPTResponse.data.app.chatModels;

      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(1);
      expect(models[0]).toBe('qwq-plus-latest');
    });
  });

  describe('数据验证', () => {
    it('应该验证必填变量的required字段', () => {
      const variables = mockFastGPTResponse.data.app.chatConfig.variables;
      const requiredVars = variables.filter(v => v.required);
      const optionalVars = variables.filter(v => !v.required);

      expect(requiredVars).toHaveLength(1);
      expect(requiredVars[0]?.key).toBe('product');
      expect(optionalVars).toHaveLength(1);
      expect(optionalVars[0]?.key).toBe('问题历史');
    });

    it('应该验证选择类型变量的选项列表', () => {
      const variables = mockFastGPTResponse.data.app.chatConfig.variables;
      const selectVar = variables.find(v => v.type === 'select');

      expect(selectVar).toBeDefined();
      expect(selectVar?.list).toBeDefined();
      expect(selectVar?.list).toHaveLength(2);
      expect(selectVar?.enums).toBeDefined();
      expect(selectVar?.enums).toHaveLength(2);
    });
  });
});

// 导出测试工具函数供其他测试使用
export { getVariableTypeLabel, mockFastGPTResponse };
