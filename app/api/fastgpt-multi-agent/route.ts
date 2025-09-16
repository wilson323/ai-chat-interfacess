/**
 * FastGPT 多智能体统一 API 端点
 * 提供智能的智能体选择、负载均衡和容错处理
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getGlobalIntelligentClient,
  type ChatRequestOptions,
} from '@/lib/api/fastgpt/intelligent-client';

/**
 * 处理聊天请求 - 自动选择最佳智能体
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      options = {},
      agentId, // 可选：指定智能体ID
    } = body;

    // 参数验证
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'messages 参数不能为空且必须是数组',
        },
        { status: 400 }
      );
    }

    // 验证消息格式
    for (const message of messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          {
            success: false,
            error: '每条消息必须包含 role 和 content 字段',
          },
          { status: 400 }
        );
      }
    }

    // 获取智能客户端
    const client = getGlobalIntelligentClient();

    // 准备聊天选项
    const chatOptions: ChatRequestOptions = {
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      detail: options.detail,
      stream: options.stream,
      agentId,
      variables: options.variables || {},
      signal: options.signal,
    };

    // 如果是流式请求
    if (options.stream) {
      // 创建流式响应
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      try {
        const { agentId: selectedAgentId, response } = await client.streamChat(
          messages,
          {
            ...chatOptions,
            onStart: () => {
              // 发送开始事件
              writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'start',
                    agentId: selectedAgentId,
                    timestamp: Date.now(),
                  })}\n\n`
                )
              );
            },
            onChunk: (chunk: string) => {
              // 发送内容块
              writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'chunk',
                    content: chunk,
                    agentId: selectedAgentId,
                    timestamp: Date.now(),
                  })}\n\n`
                )
              );
            },
            onIntermediateValue: (value: unknown, eventType: string) => {
              // 发送中间值（如思考过程、工具调用等）
              writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'intermediate',
                    eventType,
                    value,
                    agentId: selectedAgentId,
                    timestamp: Date.now(),
                  })}\n\n`
                )
              );
            },
            onProcessingStep: (step: unknown) => {
              // 发送处理步骤
              writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'processing',
                    step,
                    agentId: selectedAgentId,
                    timestamp: Date.now(),
                  })}\n\n`
                )
              );
            },
            onError: (error: Error) => {
              // 发送错误事件
              writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'error',
                    error: error.message,
                    agentId: selectedAgentId,
                    timestamp: Date.now(),
                  })}\n\n`
                )
              );
            },
            onFinish: () => {
              // 发送完成事件
              writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'finish',
                    agentId: selectedAgentId,
                    timestamp: Date.now(),
                  })}\n\n`
                )
              );
              writer.write(encoder.encode('data: [DONE]\n\n'));
              writer.close();
            },
          }
        );

        response.catch(async error => {
          // 处理未捕获的错误
          console.error('流式聊天请求失败:', error);
          try {
            writer.write(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'error',
                  error: '请求处理失败',
                  details: error.message,
                  timestamp: Date.now(),
                })}\n\n`
              )
            );
            writer.write(encoder.encode('data: [DONE]\n\n'));
            await writer.close();
          } catch (closeError) {
            console.error('关闭流写入器失败:', closeError);
          }
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Accel-Buffering': 'no',
          },
        });
      } catch (error) {
        // 如果在设置流时出错，返回错误响应
        console.error('设置流式响应失败:', error);
        return NextResponse.json(
          {
            success: false,
            error: '设置流式响应失败',
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    } else {
      // 非流式请求
      try {
        const { agentId: selectedAgentId, response } = await client.streamChat(
          messages,
          {
            ...chatOptions,
            onChunk: (_chunk: string) => {
              // 收集所有块作为完整响应
              // 这里我们只需要让流完成，然后返回结果
            },
          }
        );

        // 等待流完成
        await response;

        return NextResponse.json({
          success: true,
          data: {
            agentId: selectedAgentId,
            message: '请求已成功处理',
            timestamp: Date.now(),
          },
        });
      } catch (error) {
        console.error('非流式聊天请求失败:', error);
        return NextResponse.json(
          {
            success: false,
            error: '聊天请求失败',
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('多智能体聊天 API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '内部服务器错误',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 获取可用智能体列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const client = getGlobalIntelligentClient();

    switch (action) {
      case 'list-agents':
        // 获取可用智能体列表
        const agents = await client.getAvailableAgents();
        return NextResponse.json({
          success: true,
          data: agents,
        });

      case 'metrics':
        // 获取客户端指标
        const clientMetrics = client.getClientMetrics();
        return NextResponse.json({
          success: true,
          data: clientMetrics,
        });

      case 'agent-metrics':
        // 获取特定智能体的指标
        const agentId = searchParams.get('agentId');
        if (!agentId) {
          return NextResponse.json(
            {
              success: false,
              error: 'agentId 参数不能为空',
            },
            { status: 400 }
          );
        }

        const agentMetrics = await client.getAgentMetrics(agentId);
        return NextResponse.json({
          success: true,
          data: agentMetrics,
        });

      case 'health':
        // 健康检查
        const healthStatus = await client.healthCheck();
        return NextResponse.json({
          success: true,
          data: healthStatus,
        });

      case 'question-suggestions':
        // 获取问题建议
        const suggestionAgentId = searchParams.get('agentId');
        const chatId = searchParams.get('chatId');
        const suggestions = await client.getQuestionSuggestions(
          suggestionAgentId || undefined,
          chatId || undefined
        );
        return NextResponse.json({
          success: true,
          data: suggestions,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '不支持的 action 参数',
            supportedActions: [
              'list-agents',
              'metrics',
              'agent-metrics',
              'health',
              'question-suggestions',
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('多智能体 API GET 请求错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取信息失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 重新加载智能体配置
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const client = getGlobalIntelligentClient();

    switch (action) {
      case 'reload-configs':
        // 重新加载智能体配置
        await client.reloadAgentConfigs();
        return NextResponse.json({
          success: true,
          message: '智能体配置重新加载成功',
        });

      case 'reset-metrics':
        // 重置指标
        const agentId = body.agentId;
        client.resetMetrics(agentId);
        return NextResponse.json({
          success: true,
          message: agentId
            ? `智能体 ${agentId} 的指标已重置`
            : '所有指标已重置',
        });

      case 'enable-agent':
        // 启用智能体
        if (!body.agentId) {
          return NextResponse.json(
            {
              success: false,
              error: 'agentId 参数不能为空',
            },
            { status: 400 }
          );
        }
        // 注意：这需要通过管理器来实现
        return NextResponse.json({
          success: false,
          error: '该功能暂未实现',
        });

      case 'disable-agent':
        // 禁用智能体
        if (!body.agentId) {
          return NextResponse.json(
            {
              success: false,
              error: 'agentId 参数不能为空',
            },
            { status: 400 }
          );
        }
        // 注意：这需要通过管理器来实现
        return NextResponse.json({
          success: false,
          error: '该功能暂未实现',
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '不支持的 action 参数',
            supportedActions: [
              'reload-configs',
              'reset-metrics',
              'enable-agent',
              'disable-agent',
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('多智能体 API PUT 请求错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '操作失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
