import { API_CONSTANTS } from "@/lib/storage/shared/constants";
import { Agent } from "@/types/agent";

function getDefaultSuggestions(): string[] {
  return [
    "这个产品有哪些功能？",
    "如何使用这个系统？",
    "有没有相关的使用案例？",
    "能提供一些示例吗？",
    "有哪些限制？",
  ];
}

export async function getQuestionSuggestionsCore(
  agent: Agent,
  chatId: string,
  customConfig?: {
    open?: boolean;
    model?: string;
    customPrompt?: string;
  }
) {
  const apiEndpoint = API_CONSTANTS.FASTGPT_API_ENDPOINT;
  if (!apiEndpoint || !agent.apiKey || !agent.appId) {
    return {
      code: 200,
      data: getDefaultSuggestions(),
    };
  }
  try {
    const baseUrl = API_CONSTANTS.FASTGPT_BASE_API;
    const targetUrl = `${baseUrl}/core/ai/agent/v2/createQuestionGuide`;
    const requestBody = {
      appId: agent.appId,
      chatId: chatId,
      questionGuide: {
        open: true,
        model: agent.multimodalModel || "GPT-4o-mini",
        customPrompt: customConfig?.customPrompt || "你是一个智能助手，请根据用户的问题生成猜你想问。",
      },
    };
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agent.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      return {
        code: 200,
        data: getDefaultSuggestions(),
      };
    }
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      code: 200,
      data: getDefaultSuggestions(),
    };
  }
} 