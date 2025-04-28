import { NextResponse } from "next/server"
import sequelize from '@/lib/db/sequelize';

// 辅助函数，验证 URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// 标准化错误响应
function createErrorResponse(message: string, status = 200, fallback = true) {
  return NextResponse.json(
    {
      status: status,
      message: message,
      fallback: fallback,
      data: {
        choices: [
          {
            message: {
              content: "抱歉，连接服务器时出现问题。请检查您的网络连接或API配置，然后重试。",
            },
          },
        ],
      },
    },
    { status: 200 }, // 始终返回200状态码，让客户端能正常处理
  )
}

// 处理 GET 请求
export async function GET(request: Request) {
  try {
    // 从查询参数中提取目标 URL
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get("targetUrl")

    if (!targetUrl) {
      return createErrorResponse("缺少 targetUrl 参数", 400)
    }

    // 验证 URL 格式
    if (!isValidUrl(targetUrl)) {
      console.error(`无效的 URL 格式: ${targetUrl}`)
      return createErrorResponse("无效的 URL 格式", 400)
    }

    // 获取原始请求的头信息
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      // 跳过 host 头以避免冲突
      if (key.toLowerCase() !== "host") {
        headers[key] = value
      }
    })

    // 添加超时处理
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.error("GET 请求超时")
    }, 15000) // 15 秒超时

    try {
      console.log(`转发 GET 请求到: ${targetUrl}`)

      // 添加重试逻辑
      let retryCount = 0
      const maxRetries = 1 // 减少重试次数
      let response

      while (retryCount <= maxRetries) {
        try {
          response = await fetch(targetUrl, {
            method: "GET",
            headers,
            cache: "no-store",
            signal: controller.signal,
          })

          // 如果请求成功，跳出重试循环
          break
        } catch (error) {
          retryCount++
          console.error(`GET Fetch 错误 (尝试 ${retryCount}/${maxRetries + 1}): ${error.message}`)

          // 如果已达到最大重试次数，抛出错误
          if (retryCount > maxRetries) {
            throw error
          }

          // 等待一段时间后重试 (指数退避)
          const delay = Math.min(1000 * Math.pow(1.5, retryCount - 1), 3000) // 减少最大延迟
          console.log(`等待 ${delay}ms 后重试...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }

      // 如果所有重试都失败，response 将是 undefined
      if (!response) {
        throw new Error("所有 GET 重试尝试均失败")
      }

      // 清除超时，因为我们已经收到响应
      clearTimeout(timeoutId)

      // 检查响应是否正常
      if (!response.ok) {
        console.error(`API 响应状态 ${response.status}`)

        // 尝试获取响应文本以便更好地诊断错误
        const errorText = await response.text().catch(() => "无法读取错误响应")
        console.error(`错误响应体(前 200 个字符): ${errorText.substring(0, 200)}`)

        return NextResponse.json(
          {
            status: 200,
            data: {
              message: "无法连接到服务器，请稍后再试。",
            },
          },
          { status: 200 },
        )
      }

      // 检查内容类型，确保是 JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error(`意外的内容类型: ${contentType}`)

        // 尝试获取响应文本以便更好地诊断错误
        const text = await response.text()
        console.error(`响应体(前 200 个字符): ${text.substring(0, 200)}`)

        return NextResponse.json(
          {
            status: 415,
            message: `API 返回非 JSON 响应: ${contentType || "未知内容类型"}`,
            fallback: true,
          },
          { status: 200 }, // 使用200状态码
        )
      }

      // 解析 JSON 响应
      const data = await response.json().catch((error) => {
        console.error("解析 JSON 响应时出错:", error)
        return { error: "无效的 JSON 响应" }
      })

      // 返回响应数据
      return NextResponse.json({ status: 200, data })
    } catch (fetchError) {
      // 出错时清除超时
      clearTimeout(timeoutId)

      console.error("GET fetch 错误:", fetchError)
      return createErrorResponse(fetchError instanceof Error ? fetchError.message : "Fetch 失败", 500)
    }
  } catch (error) {
    console.error("代理 GET 错误:", error)
    return createErrorResponse(error instanceof Error ? error.message : "内部服务器错误", 500)
  }
}

// 处理 POST 请求，更好地处理 FastGPT 的流式格式
export async function POST(request: Request) {
  try {
    // 获取请求体
    const body = await request.json()
    const { targetUrl, method = "POST", headers = {}, body: requestBody } = body

    if (!targetUrl) {
      return createErrorResponse("缺少 targetUrl 参数", 400)
    }

    // 验证 URL 格式
    if (!isValidUrl(targetUrl)) {
      console.error(`无效的 URL 格式: ${targetUrl}`)
      return createErrorResponse("无效的 URL 格式", 400)
    }

    // 确保 requestBody 不为 undefined
    const safeRequestBody = requestBody || {}

    // 确保 detail 参数设置为 false，以减少中间处理步骤，提高性能
    if (typeof safeRequestBody === "object") {
      safeRequestBody.detail = false
    }

    // 检查这是否是流式请求
    const isStreaming = headers.Accept === "text/event-stream" || (safeRequestBody && safeRequestBody.stream === true)

    if (isStreaming) {
      // 对于流式请求，我们需要使用不同的方法
      // 我们将创建一个带有 TransformStream 的新 Response
      const { readable, writable } = new TransformStream()
      const writer = writable.getWriter()
      const encoder = new TextEncoder()

      // 添加超时处理
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.error("流式请求超时")
      }, 30000) // 流式请求 30 秒超时

      // 记录请求详情以便调试
      console.log(`流式请求到: ${targetUrl}`)

      // 向目标 URL 发出请求
      fetch(targetUrl, {
        method,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(safeRequestBody),
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (response) => {
          // 清除超时，因为我们已经收到响应
          clearTimeout(timeoutId)

          console.log(`收到响应，状态: ${response.status}`)

          if (!response.ok) {
            const errorText = await response.text().catch(() => "无法读取错误响应")
            console.error(`API 请求失败: ${response.status} ${response.statusText} - ${errorText}`)
            throw new Error(`API 请求失败: ${response.status} ${response.statusText} - ${errorText}`)
          }

          if (!response.body) {
            console.error("响应体为空")
            throw new Error("响应体为空")
          }

          // 从响应体获取读取器
          const reader = response.body.getReader()

          // 读取流
          try {
            let buffer = ""
            const decoder = new TextDecoder()

            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                console.log("流读取完成")
                break
              }

              // 解码块并添加到缓冲区
              const chunk = decoder.decode(value, { stream: true })
              buffer += chunk

              // 处理缓冲区中的完整行
              const lines = buffer.split("\n")
              buffer = lines.pop() || "" // 保留缓冲区中的最后一个不完整行

              for (const line of lines) {
                if (line.trim() === "") continue

                // 将行转发给客户端
                await writer.write(encoder.encode(line + "\n"))
              }
            }

            // 处理缓冲区中的任何剩余数据
            if (buffer.trim() !== "") {
              await writer.write(encoder.encode(buffer + "\n"))
            }

            // 发送最终的 [DONE] 事件（如果未包含）
            await writer.write(encoder.encode("data: [DONE]\n\n"))
            console.log("向客户端发送 [DONE] 事件")
          } catch (readError) {
            console.error("读取流时出错:", readError)
            await writer.write(encoder.encode(`data: {"error": "${readError.message}"}\n\n`))
          }
        })
        .catch(async (error) => {
          // 出错时清除超时
          clearTimeout(timeoutId)

          console.error("流式代理错误:", error)
          // 以客户端期望的格式向流写入错误消息
          const errorMessage = error instanceof Error ? error.message : "未知错误"
          const safeErrorMessage = errorMessage.replace(/"/g, '\\"')

          console.log(`向客户端发送错误: ${safeErrorMessage}`)

          // 发送一个可用的回退响应
          await writer.write(
            encoder.encode(
              `data: {"choices":[{"delta":{"content":"抱歉，连接服务器时遇到网络问题。请检查您的网络连接或稍后再试。"}}]}\n\n`,
            ),
          )
          await writer.write(encoder.encode("data: [DONE]\n\n"))
        })
        .finally(async () => {
          // 如果尚未清除，则清除超时
          clearTimeout(timeoutId)
          try {
            await writer.close()
            console.log("流写入器已关闭")
          } catch (closeError) {
            console.error("关闭写入器时出错:", closeError)
          }
        })

      // 将可读流作为响应返回
      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      // 对于非流式请求，我们可以使用更简单的方法
      // 添加超时处理
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.error("非流式请求超时")
      }, 15000) // 15 秒超时

      try {
        // 添加更多错误处理和日志记录
        console.log(`发送非流式请求到: ${targetUrl}`)

        // 添加错误处理和重试逻辑
        let retryCount = 0
        const maxRetries = 1 // 减少重试次数
        let response

        while (retryCount <= maxRetries) {
          try {
            response = await fetch(targetUrl, {
              method,
              headers: {
                ...headers,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(safeRequestBody),
              cache: "no-store",
              signal: controller.signal,
            })

            // 如果请求成功，跳出重试循环
            break
          } catch (fetchError) {
            retryCount++
            console.error(`Fetch 错误 (尝试 ${retryCount}/${maxRetries + 1}): ${fetchError.message}`)

            // 如果已达到最大重试次数，抛出错误
            if (retryCount > maxRetries) {
              throw fetchError
            }

            // 等待一段时间后重试 (指数退避)
            const delay = Math.min(1000 * Math.pow(1.5, retryCount - 1), 3000) // 减少最大延迟
            console.log(`等待 ${delay}ms 后重试...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
          }
        }

        // 如果所有重试都失败，response 将是 undefined
        if (!response) {
          throw new Error("所有重试尝试均失败")
        }

        // 清除超时，因为我们已经收到响应
        clearTimeout(timeoutId)

        console.log(`收到响应，状态: ${response.status}`)

        // 检查响应状态
        if (!response.ok) {
          const errorText = await response.text().catch(() => "无法读取错误响应")
          console.error(`API 响应状态 ${response.status}: ${errorText}`)
          return createErrorResponse(`API 错误: ${response.statusText}`, 502)
        }

        // 检查内容类型，确保是 JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error(`意外的内容类型: ${contentType}`)

          // 尝试获取响应文本以便更好地诊断错误
          const text = await response.text()
          console.error(`响应体(前 200 个字符): ${text.substring(0, 200)}`)

          // 尝试将响应作为文本返回，而不是失败
          return NextResponse.json(
            {
              status: 200,
              data: {
                choices: [
                  {
                    message: {
                      content: "收到非JSON响应。服务器可能暂时不可用，请稍后再试。",
                    },
                  },
                ],
              },
              originalContentType: contentType,
              fallback: true,
            },
            { status: 200 },
          )
        }

        // 获取响应数据
        const data = await response.json().catch((error) => {
          console.error("解析 JSON 响应时出错:", error)
          return {
            choices: [
              {
                message: {
                  content: "解析响应时出错。服务器可能暂时不可用，请稍后再试。",
                },
              },
            ],
          }
        })

        // 返回响应数据
        return NextResponse.json({ status: 200, data })
      } catch (fetchError) {
        // 出错时清除超时
        clearTimeout(timeoutId)

        console.error("非流式 fetch 错误:", fetchError)

        // 返回一个友好的错误响应，包含回退内容
        return NextResponse.json(
          {
            status: 200, // 使用200状态码，让客户端能正常处理
            data: {
              choices: [
                {
                  message: {
                    content: "抱歉，连接服务器时遇到网络问题。请检查您的网络连接或稍后再试。",
                  },
                },
              ],
            },
            error: fetchError instanceof Error ? fetchError.message : "网络连接失败",
            fallback: true, // 添加标志表示这是一个回退响应
          },
          { status: 200 }, // 使用200状态码
        )
      }
    }
  } catch (error) {
    console.error("代理错误:", error)
    return NextResponse.json(
      { status: 500, message: error instanceof Error ? error.message : "内部服务器错误" },
      { status: 200 }, // 使用200状态码，让客户端能正常处理
    )
  }
}
