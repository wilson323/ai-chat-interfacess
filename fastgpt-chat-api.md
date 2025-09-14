# FastGPT 对话接口文档

## 1. 如何获取 AppId

可在应用详情的路径里获取 AppId。

## 2. 获取对话初始化信息

### 2.1 请求信息

#### 请求地址

```
GET https://fastgpt.run/api/v1/chat/init
```

#### 请求头

```
Content-Type: application/json
Authorization: Bearer {API_KEY}
```

#### 响应格式

```json
{
  "code": 200, // 状态码，表示请求成功
  "statusText": "", // 状态文本，通常为空
  "message": "", // 消息内容，成功时一般为空
  "data": {
    "chatId": "11", // 对话ID，用于标识当前会话
    "appId": "67dd2f0dedb9d9c7419aa8d5", // 应用ID，标识具体使用的应用
    "app": {
      "chatConfig": {
        "questionGuide": false, // 是否开启问题引导功能
        "ttsConfig": { "type": "web" }, // 语音合成配置，类型为网页版
        "whisperConfig": {
          "open": true, // 语音识别功能是否开启
          "autoSend": false, // 是否自动发送语音识别内容
          "autoTTSResponse": true // 是否自动将回复转为语音
        },
        "chatInputGuide": {
          "open": true, // 输入引导功能是否开启
          "textList": [], // 输入引导的文本列表（当前为空）
          "customUrl": "" // 自定义引导链接（当前为空）
        },
        "instruction": "", // 对话指令（当前为空）
        "autoExecute": {
          "open": false, // 自动执行功能是否开启
          "defaultPrompt": "" // 默认提示词（当前为空）
        },
        "welcomeText": "您好呀！我是您的AI智能体定制方案设计师小助手~✨\n\n为了更好地为您贴心打造专属解决方案，请允许我暖暖地问三个小问题：\n1️⃣ 您现在使用的是哪款软件呢？（开始对话请先选择软件名称）\n2️⃣ 您最期待实现哪些功能呢？\n3️⃣ 有没有特殊需求？（比如适配国产化系统这类个性化需求）\n**如果哪个环节不好，一定记得点击对应对话头像右边的“向下大拇指图标”进行反馈**，您的每一个需求都是珍贵的灵感火花，我会用十二分的热情将它们变成现实！", // 欢迎语内容，包含引导用户回答的三个问题
        "variables": [
          {
            "id": "rrxjek",
            "key": "问题历史",
            "label": "问题历史",
            "type": "custom", // 变量类型为自定义
            "required": false, // 是否为必填项
            "maxLen": 50, // 最大长度限制
            "enums": [{ "value": "" }], // 枚举值（当前仅有一个空值）
            "valueType": "any", // 数据类型为任意类型
            "icon": "core/workflow/inputType/customVariable", // 变量图标标识
            "list": [{ "value": "" }], // 列表值（当前仅有一个空值）
            "description": "", // 变量描述（当前为空）
            "defaultValue": "" // 默认值（当前为空）
          },
          {
            "id": "a6x3af",
            "key": "原始问题",
            "label": "原始问题",
            "type": "custom",
            "description": "",
            "required": false,
            "valueType": "any",
            "list": [{ "value": "", "label": "" }],
            "defaultValue": "",
            "enums": [{ "value": "", "label": "" }]
          },
          {
            "id": "d6e1kh",
            "key": "huizong",
            "label": "huizong",
            "type": "custom",
            "description": "功能汇总", // 变量描述为“功能汇总”
            "required": false,
            "valueType": "any",
            "list": [{ "value": "", "label": "" }],
            "defaultValue": "",
            "enums": [{ "value": "", "label": "" }]
          },
          {
            "id": "fvee6t",
            "key": "product",
            "label": "product",
            "type": "select", // 变量类型为下拉选择框
            "description": "产品", // 变量描述为“产品”
            "required": true, // 为必填项
            "valueType": "string", // 数据类型为字符串
            "list": [
              { "label": "万傲瑞达V6600", "value": "万傲瑞达V6600" },
              { "label": "ZKEcoPro", "value": "ZKEcoPro" }
            ], // 下拉选择的选项列表
            "defaultValue": "万傲瑞达V6600", // 默认选中的产品
            "enums": [
              { "label": "万傲瑞达V6600", "value": "万傲瑞达V6600" },
              { "label": "ZKEcoPro", "value": "ZKEcoPro" }
            ],
            "icon": "core/workflow/inputType/option" // 选择框类型的图标标识
          }
        ]
      },
      "_id": "66eec807451c7139d8046eef", // 应用的唯一标识符
      "chatModels": ["qwq-plus-latest"], // 使用的对话模型列表
      "name": "熵犇犇定制需求分析", // 应用名称
      "avatar": "/api/system/img/681077bf119dd736232e0a4f.png", // 应用头像的URL路径
      "intro": "熵犇犇定制需求智能应用，专注于为您提供全方位的定制服务，包括精准的需求功能定制方案、专业的标准功能分析以及高效的操作方案制定，助力您轻松实现目标。", // 应用简介
      "type": "advanced", // 应用类型为“高级”
      "pluginInputs": [] // 插件输入列表（当前为空）
    }
  }
}
```

## 3. 发起对话请求

### 3.1 基本说明

- API Key 需使用应用特定的 key，否则会报错
- 有些包调用时，BaseUrl需要添加v1路径，如果出现404情况，可补充v1重试
- 接口兼容GPT的标准接口格式

### 3.2 请求信息

#### 请求地址

```
POST https://fastgpt.run/api/v1/chat/completions
```

#### 请求头

```
Content-Type: application/json
Authorization: Bearer {API_KEY}
```

#### 基础参数

```json
{
  "chatId": "my_chatId", // 会话ID
  "stream": false, // 是否流式输出
  "detail": false, // 是否返回详细信息
  "responseChatItemId": "xxx", // 响应消息ID
  "variables": {
    // 模块变量
    "uid": "xxx",
    "name": "张三"
  },
  "messages": [
    // 消息内容
    {
      "role": "user",
      "content": "问题内容"
    }
  ]
}
```

#### 重要字段说明

- **chatId**:
  - 类型: string | undefined
  - 说明: 对话的唯一标识符
  - undefined: 不使用上下文功能
  - string: 使用chatId进行对话，自动获取历史记录
  - 长度限制: <250字符

- **stream**:
  - 类型: boolean
  - 说明: 是否使用流式响应
  - true: 使用流式响应，实时返回生成内容
  - false: 等待完整响应后一次性返回

- **detail**:
  - 类型: boolean
  - 说明: 是否返回中间值(模块状态、完整结果等)
  - true: 返回详细的中间过程信息
  - false: 仅返回最终结果

- **responseChatItemId**:
  - 类型: string
  - 说明: 响应消息的唯一ID，用于追踪和管理响应

- **variables**:
  - 类型: object
  - 说明: 用于替换模块中的{{key}}变量
  - 格式: key-value对象，key对应模板变量名

- **messages**:
  - 类型: array
  - 说明: 对话消息数组，与GPT接口chat模式结构一致
  - role: 消息角色，可选值 user/assistant/system
  - content: 消息内容，可以是字符串或结构化内容

### 3.3 文件/图片请求格式

```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "分析图片"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "图片链接"
          }
        },
        {
          "type": "file_url",
          "name": "文件名",
          "url": "文档链接"
        }
      ]
    }
  ]
}
```

## 4. 响应格式

### 4.1 非流式响应 (stream=false)

```json
{
  "id": "xxx", // 响应ID
  "model": "", // 模型信息
  "usage": {
    // Token使用统计
    "prompt_tokens": 1, // 提示Token数
    "completion_tokens": 1, // 补全Token数
    "total_tokens": 1 // 总Token数
  },
  "choices": [
    // 响应选项数组
    {
      "message": {
        // 响应消息
        "role": "assistant",
        "content": "回复内容"
      },
      "finish_reason": "stop", // 结束原因
      "index": 0 // 选项索引
    }
  ]
}
```

### 4.2 流式响应 (stream=true)

```
data: {"id":"","choices":[{"delta":{"content":"部分"},"index":0}]}
data: {"id":"","choices":[{"delta":{"content":"内容"},"index":0}]}
```

### 4.3 事件类型

- **answer**: 返回文本内容
- **fastAnswer**: 指定快速回复文本
- **toolCall**: 执行工具调用
- **toolParams**: 工具调用参数
- **toolResponse**: 工具调用返回结果
- **flowNodeStatus**: 工作流节点状态更新
- **flowResponses**: 工作流节点响应内容
- **updateVariables**: 更新变量值
- **error**: 错误信息

## 5. 交互节点

### 5.1 交互节点响应

当工作流遇到交互节点时，会返回以下格式：

#### 用户选择节点

```json
{
  "interactive": {
    "type": "userSelect", // 交互类型：用户选择
    "params": {
      "description": "描述", // 选择说明
      "userSelectOptions": [
        // 选项列表
        {
          "value": "Confirm", // 选项显示值
          "key": "option1" // 选项标识
        },
        {
          "value": "Cancel",
          "key": "option2"
        }
      ]
    }
  }
}
```

#### 表单输入节点

```json
{
  "interactive": {
    "type": "userInput", // 交互类型：用户输入
    "params": {
      "description": "描述", // 表单说明
      "inputForm": [
        // 表单字段列表
        {
          "type": "input", // 输入框类型
          "key": "字段1", // 字段标识
          "label": "标签1", // 字段标签
          "valueType": "string", // 值类型
          "required": false // 是否必填
        },
        {
          "type": "numberInput",
          "key": "字段2",
          "label": "标签2",
          "valueType": "number",
          "required": false
        }
      ]
    }
  }
}
```

### 5.2 继续运行请求

#### 用户选择继续

```json
{
  "stream": true,
  "detail": true,
  "chatId": "xxx",
  "messages": [
    {
      "role": "user",
      "content": "Confirm" // 选择的选项值
    }
  ]
}
```

#### 表单输入继续

```json
{
  "stream": true,
  "detail": true,
  "chatId": "xxx",
  "messages": [
    {
      "role": "user",
      "content": "{\"字段1\":\"输入内容\",\"字段2\":666}" // JSON格式的表单数据
    }
  ]
}
```
