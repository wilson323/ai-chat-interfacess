import type { Agent } from "@/types/agent"
import { getDeviceId } from "@/lib/utils"
import { API_CONSTANTS } from "@/lib/storage/shared/constants"

// 存储上次同步时间
let lastSyncTime = 0
const SYNC_INTERVAL = 60000 // 1分钟同步一次
const FORCE_SYNC_INTERVAL = 15 * 60000 // 15分钟强制同步一次

// 存储同步状态
let isSyncing = false
let pendingSync = false

/**
 * 从服务器获取最新的智能体配置
 * @param currentAgents 当前智能体列表
 * @param force 是否强制同步
 * @param locallyModifiedAgentIds 本地修改的智能体ID列表
 */
export async function syncAgents(
  currentAgents: Agent[],
  force = false,
  locallyModifiedAgentIds: string[] = [],
): Promise<Agent[]> {
  // 检查是否需要同步
  const now = Date.now()
  if (!force && now - lastSyncTime < SYNC_INTERVAL) {
    return currentAgents
  }

  // 如果已经在同步中，标记为待处理并返回当前智能体
  if (isSyncing) {
    pendingSync = true
    return currentAgents
  }

  try {
    isSyncing = true
    console.log("开始同步智能体...", { force, locallyModifiedAgentIds })

    // 获取设备ID
    const deviceId = getDeviceId()

    // 使用代理API避免CORS问题
    const response = await fetch("/api/agent-sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId,
        currentAgentIds: currentAgents.map((agent) => agent.id),
        lastSyncTime,
        forceSync: force || now - lastSyncTime > FORCE_SYNC_INTERVAL,
        locallyModifiedAgentIds,
      }),
    })

    // 更新同步时间
    lastSyncTime = now

    if (!response.ok) {
      console.warn("同步智能体失败:", response.status)
      return currentAgents
    }

    const data = await response.json()

    // 如果没有变化，返回当前智能体
    if (!data.hasUpdates) {
      console.log("智能体没有更新")
      return currentAgents
    }

    console.log("收到智能体更新:", data.agents.length)

    // 合并服务器返回的智能体和本地智能体
    // 保留本地的chatId等状态，以及本地修改的智能体
    const updatedAgents = currentAgents.map((localAgent) => {
      // 如果是本地修改的智能体，保留本地版本
      if (locallyModifiedAgentIds.includes(localAgent.id)) {
        console.log(`保留本地修改的智能体: ${localAgent.id}`)
        return localAgent
      }

      const serverAgent = data.agents.find((a: Agent) => a.id === localAgent.id)
      if (serverAgent) {
        console.log(`更新智能体: ${localAgent.id}`)
        return {
          ...serverAgent,
          chatId: localAgent.chatId, // 保留本地会话ID
          icon: localAgent.icon, // 保留本地图标
          apiEndpoint: API_CONSTANTS.FASTGPT_API_ENDPOINT, // 确保使用正确的API端点
        }
      }
      return localAgent
    })

    // 添加新的智能体
    const localAgentIds = new Set(currentAgents.map((a) => a.id))
    const newAgents = data.agents
      .filter((a: Agent) => !localAgentIds.has(a.id))
      .map((agent: Agent) => ({
        ...agent,
        apiEndpoint: API_CONSTANTS.FASTGPT_API_ENDPOINT, // 确保新智能体使用正确的API端点
      }))

    if (newAgents.length > 0) {
      console.log(`添加新智能体: ${newAgents.length}个`)
    }

    // 返回合并后的智能体列表
    return [...updatedAgents, ...newAgents]
  } catch (error) {
    console.error("同步智能体时出错:", error)
    return currentAgents
  } finally {
    isSyncing = false

    // 如果有待处理的同步请求，立即执行
    if (pendingSync) {
      pendingSync = false
      // 使用setTimeout避免可能的递归调用栈溢出
      setTimeout(() => syncAgents(currentAgents, true, locallyModifiedAgentIds), 100)
    }
  }
}

/**
 * 检查特定智能体是否有更新
 */
export async function checkAgentUpdate(agent: Agent, isLocallyModified: boolean): Promise<Agent | null> {
  if (!agent) return null

  // 如果是本地修改的智能体，不检查更新
  if (isLocallyModified) {
    return null
  }

  try {
    const response = await fetch(`/api/agent-sync?agentId=${agent.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data.hasUpdate) {
      return null
    }

    // 返回更新后的智能体，保留本地状态
    return {
      ...data.agent,
      chatId: agent.chatId,
      icon: agent.icon,
      apiEndpoint: API_CONSTANTS.FASTGPT_API_ENDPOINT, // 确保更新的智能体使用正确的API端点
    }
  } catch (error) {
    console.error("检查智能体更新时出错:", error)
    return null
  }
}
