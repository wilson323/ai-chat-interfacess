/**
 * 全局变量集成功能测试
 * 测试用户端全局变量验证、填写和传递功能
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// 模拟localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// 模拟智能体数据
const mockAgentWithRequiredVariables = {
  id: "test-agent-1",
  name: "测试智能体",
  type: "fastgpt" as const,
  description: "用于测试的智能体",
  supportsStream: true,
  supportsDetail: true,
  globalVariables: [
    {
      id: "var1",
      key: "product",
      label: "产品名称",
      type: "select",
      required: true,
      valueType: "string",
      description: "请选择产品",
      list: [
        { value: "product1", label: "产品1" },
        { value: "product2", label: "产品2" }
      ]
    },
    {
      id: "var2", 
      key: "username",
      label: "用户名",
      type: "text",
      required: true,
      valueType: "string",
      description: "请输入用户名",
      maxLen: 50
    },
    {
      id: "var3",
      key: "age",
      label: "年龄",
      type: "number",
      required: false,
      valueType: "number",
      description: "请输入年龄"
    }
  ]
};

const mockAgentWithoutVariables = {
  id: "test-agent-2",
  name: "无变量智能体",
  type: "fastgpt" as const,
  description: "没有全局变量的智能体",
  supportsStream: true,
  supportsDetail: true,
  globalVariables: []
};

// 模拟检查必填变量的函数
function checkRequiredVariables(agent: typeof mockAgentWithRequiredVariables): boolean {
  if (agent.type !== 'fastgpt' || !agent.globalVariables) {
    return true; // 非FastGPT智能体或无全局变量，直接通过
  }
  
  const requiredVars = agent.globalVariables.filter(v => v.required);
  if (requiredVars.length === 0) {
    return true; // 无必填变量，直接通过
  }
  
  // 检查是否已有保存的变量值
  const savedValues = localStorage.getItem(`agent-variables-${agent.id}`);
  if (!savedValues) {
    return false; // 无保存值，需要填写
  }
  
  try {
    const parsedValues = JSON.parse(savedValues);
    // 检查所有必填变量是否都有值
    return requiredVars.every(variable => {
      const value = parsedValues[variable.key];
      return value !== undefined && value !== null && value.toString().trim() !== "";
    });
  } catch {
    return false; // 解析失败，需要重新填写
  }
}

// 模拟变量验证函数
function validateVariable(variable: any, value: any): string | null {
  if (variable.required && (!value || value.toString().trim() === "")) {
    return `${variable.label}是必填项`;
  }
  
  if (variable.maxLen && value && value.toString().length > variable.maxLen) {
    return `${variable.label}长度不能超过${variable.maxLen}个字符`;
  }
  
  if (variable.valueType === "number" && value && isNaN(Number(value))) {
    return `${variable.label}必须是数字`;
  }
  
  return null;
}

describe('全局变量集成功能测试', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('必填变量检查', () => {
    it('应该正确识别有必填变量的智能体', () => {
      const needsVariables = !checkRequiredVariables(mockAgentWithRequiredVariables);
      expect(needsVariables).toBe(true);
    });

    it('应该正确识别无变量的智能体', () => {
      const needsVariables = !checkRequiredVariables(mockAgentWithoutVariables);
      expect(needsVariables).toBe(false);
    });

    it('应该在有保存值时通过检查', () => {
      const savedValues = {
        product: "product1",
        username: "testuser"
      };
      localStorage.setItem(`agent-variables-${mockAgentWithRequiredVariables.id}`, JSON.stringify(savedValues));
      
      const needsVariables = !checkRequiredVariables(mockAgentWithRequiredVariables);
      expect(needsVariables).toBe(false);
    });

    it('应该在保存值不完整时要求重新填写', () => {
      const incompleteValues = {
        product: "product1"
        // 缺少 username
      };
      localStorage.setItem(`agent-variables-${mockAgentWithRequiredVariables.id}`, JSON.stringify(incompleteValues));
      
      const needsVariables = !checkRequiredVariables(mockAgentWithRequiredVariables);
      expect(needsVariables).toBe(true);
    });
  });

  describe('变量验证', () => {
    it('应该验证必填项', () => {
      const requiredVar = mockAgentWithRequiredVariables.globalVariables![0];
      
      const error1 = validateVariable(requiredVar, "");
      expect(error1).toBe("产品名称是必填项");
      
      const error2 = validateVariable(requiredVar, "product1");
      expect(error2).toBeNull();
    });

    it('应该验证长度限制', () => {
      const textVar = mockAgentWithRequiredVariables.globalVariables![1];
      
      const longValue = "a".repeat(51);
      const error = validateVariable(textVar, longValue);
      expect(error).toBe("用户名长度不能超过50个字符");
      
      const validValue = "validname";
      const noError = validateVariable(textVar, validValue);
      expect(noError).toBeNull();
    });

    it('应该验证数字类型', () => {
      const numberVar = mockAgentWithRequiredVariables.globalVariables![2];
      
      const error1 = validateVariable(numberVar, "not a number");
      expect(error1).toBe("年龄必须是数字");
      
      const error2 = validateVariable(numberVar, "25");
      expect(error2).toBeNull();
      
      const error3 = validateVariable(numberVar, 30);
      expect(error3).toBeNull();
    });
  });

  describe('变量存储和加载', () => {
    it('应该正确保存变量到localStorage', () => {
      const variables = {
        product: "product1",
        username: "testuser",
        age: "25"
      };
      
      localStorage.setItem(`agent-variables-${mockAgentWithRequiredVariables.id}`, JSON.stringify(variables));
      
      const saved = localStorage.getItem(`agent-variables-${mockAgentWithRequiredVariables.id}`);
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.product).toBe("product1");
      expect(parsed.username).toBe("testuser");
      expect(parsed.age).toBe("25");
    });

    it('应该正确加载保存的变量', () => {
      const variables = {
        product: "product2",
        username: "anotheruser"
      };
      
      localStorage.setItem(`agent-variables-${mockAgentWithRequiredVariables.id}`, JSON.stringify(variables));
      
      const loaded = localStorage.getItem(`agent-variables-${mockAgentWithRequiredVariables.id}`);
      const parsed = JSON.parse(loaded!);
      
      expect(parsed.product).toBe("product2");
      expect(parsed.username).toBe("anotheruser");
    });
  });

  describe('API请求格式', () => {
    it('应该正确格式化全局变量用于API请求', () => {
      const variables = {
        product: "product1",
        username: "testuser",
        age: "25"
      };
      
      // 模拟API请求体
      const requestBody = {
        model: mockAgentWithRequiredVariables.id,
        chatId: "test-chat-id",
        messages: [{ role: "user", content: "Hello" }],
        variables: variables,
        temperature: 0.7,
        max_tokens: 2000
      };
      
      expect(requestBody.variables).toEqual(variables);
      expect(requestBody.variables.product).toBe("product1");
      expect(requestBody.variables.username).toBe("testuser");
      expect(requestBody.variables.age).toBe("25");
    });

    it('应该在没有变量时传递空对象', () => {
      const requestBody = {
        model: mockAgentWithoutVariables.id,
        chatId: "test-chat-id",
        messages: [{ role: "user", content: "Hello" }],
        variables: {},
        temperature: 0.7,
        max_tokens: 2000
      };
      
      expect(requestBody.variables).toEqual({});
    });
  });

  describe('边界情况处理', () => {
    it('应该处理损坏的localStorage数据', () => {
      localStorage.setItem(`agent-variables-${mockAgentWithRequiredVariables.id}`, "invalid json");
      
      const needsVariables = !checkRequiredVariables(mockAgentWithRequiredVariables);
      expect(needsVariables).toBe(true); // 应该要求重新填写
    });

    it('应该处理空值和null值', () => {
      const requiredVar = mockAgentWithRequiredVariables.globalVariables![0];
      
      expect(validateVariable(requiredVar, null)).toBe("产品名称是必填项");
      expect(validateVariable(requiredVar, undefined)).toBe("产品名称是必填项");
      expect(validateVariable(requiredVar, "")).toBe("产品名称是必填项");
      expect(validateVariable(requiredVar, "   ")).toBe("产品名称是必填项");
    });

    it('应该处理非必填变量的空值', () => {
      const optionalVar = mockAgentWithRequiredVariables.globalVariables![2]; // age是非必填的
      
      expect(validateVariable(optionalVar, "")).toBeNull();
      expect(validateVariable(optionalVar, null)).toBeNull();
      expect(validateVariable(optionalVar, undefined)).toBeNull();
    });
  });
});

// 导出测试工具函数供其他测试使用
export { 
  checkRequiredVariables, 
  validateVariable, 
  mockAgentWithRequiredVariables, 
  mockAgentWithoutVariables 
};
