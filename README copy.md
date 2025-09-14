graph TD
%% 定义节点样式
classDef person fill:#f9f,stroke:#333;
classDef system fill:#bbf,stroke:#333;
classDef external fill:#f96,stroke:#333;

    %% 主要元素
    User[("个人用户
    (Human User)")]:::person
    Admin[("管理员
    (Admin User)")]:::person
    LLMChatSystem["LLMChat系统
    (核心功能:
    - 对话管理
    - 用户管理
    - 插件执行")]:::system

    %% 外部系统
    OpenAI[[OpenAI API
    (GPT模型服务)]]:::external
    SMSGateway[[短信网关
    (阿里云短信)]]:::external
    Payment[[支付网关
    (Stripe API)]]:::external
    AuthProvider[[OAuth提供商
    (Google/GitHub)]]:::external

    %% 交互关系
    User -->|"1. 发送消息请求"| LLMChatSystem
    User -->|"2. 购买会员"| LLMChatSystem
    User -->|"3. 第三方登录"| LLMChatSystem

    LLMChatSystem -->|"a. 调用AI模型"| OpenAI
    LLMChatSystem -->|"b. 发送验证码"| SMSGateway
    LLMChatSystem -->|"c. 发起支付"| Payment
    LLMChatSystem -->|"d. 认证请求"| AuthProvider

    Admin -->|"管理操作"| LLMChatSystem
