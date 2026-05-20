🚀 项目简介

欢迎使用 Imperva WAF MCP Server！本项目致力于打破大语言模型（如 DeepSeek, Claude 等）与企业级核心安全网关之间的壁垒。通过接入 MCP（模型上下文协议），我们将传统的 Imperva WAF 转化为一个具备自主思考能力的 Agentic SecOps（智能体安全运营）平台。

安全运维工程师不再需要繁琐地点按 GUI 或手动拼接 API，只需使用自然语言，即可在数秒内完成策略审计、性能排障和威胁猎捕。

✨ 核心功能与工具
本 MCP Server 向大模型暴露了 6 个极其强大的核心工具：

get_waf_security_events: 抓取最新的安全违规与告警日志。

get_waf_blocked_sources: 实时查询当前被 WAF 封禁的源 IP 列表。

get_waf_asset_tree: 一键构建并返回全局 Web 资产层级拓扑树（Site -> Server Group -> Service -> App）。

get_waf_gateway_info: 智能发现并获取网关硬件状态、版本号及网卡信息。

get_gateway_cps_tps: 绕过常规 API 限制，通过 SSH 直连探针获取网关底层真实性能指标（CPS、TPS、吞吐量、正则匹配超时）。

get_waf_applied_policies: 全链路安全合规审计，精准提取并分层展示各个资产层级挂载的安全策略与特征库。

🛠️ 环境要求
Node.js: v18 及以上版本。

Imperva WAF: 拥有 MX 管理中心（v14/v15+）的访问权限，并开启 REST API。

MCP Client: 支持 MCP 协议的大模型客户端（如 Cherry Studio, Claude Desktop）。

📦 安装步骤

克隆本仓库到本地：

git clone [https://github.com/jiangyidigital/Imperva-MCP-Server.git](https://github.com/jiangyidigital/Imperva-MCP-Server.git)

cd Imperva-MCP-Server

安装必要的依赖包：

npm install

配置环境变量：

复制环境模板文件，并填入你真实的 MX 登录凭证。

cp .env.example .env

⚙️ 接入大模型客户端（以 Cherry Studio 为例）

在你的 AI 客户端中添加新的 MCP Server，配置如下：

运行方式 (Type): stdio

执行命令 (Command): node

参数 (Args): /你的绝对路径/Imperva-MCP-Server/index.js

⚠️ 防幻觉极客建议： > 在安全运维场景下，强烈建议为您的大模型助手配置极其严格的“系统提示词（System Prompt）”。明确禁止大模型脑补、瞎编 IP 或性能数据，强制要求其在面对运维问题时，必须调用底层 MCP 工具获取实时真相。

################################################################################################################


 🚀 Introduction

Welcome to the **Imperva WAF MCP Server**! This project bridges the gap between Large Language Models (LLMs like DeepSeek, Claude, Qwen) and Enterprise Security Infrastructure. By implementing the **Model Context Protocol (MCP)**, this server transforms your Imperva Web Application Firewall (WAF) into an autonomous, AI-driven Agentic SecOps platform.

Instead of navigating complex GUIs or chaining manual API requests, SecOps engineers can now use natural language to audit policies, troubleshoot performance, and hunt threats in seconds.

 ✨ Core Features (Tools)
This MCP server exposes 6 powerful tools to the AI:
1. `get_waf_security_events`: Fetches recent security violations and alerts.
2. `get_waf_blocked_sources`: Queries real-time blocked IPs (ThreatRadar & Custom Rules).
3. `get_waf_asset_tree`: Automatically maps the global Web Asset Topology (Site -> Server Group -> Service -> App).
4. `get_waf_gateway_info`: Discovers gateway hardware, versions, and network interfaces.
5. `get_gateway_cps_tps`: Probes deep Gateway performance metrics via direct SSH (CPS, TPS, Throughput, Regexp timeouts) to bypass API limitations.
6. `get_waf_applied_policies`: Performs a full-stack, hierarchical compliance audit of applied security policies and signatures.

### 🛠️ Prerequisites
- **Node.js**: v18 or higher.
- **Imperva WAF**: Access to the MX Management Server (v14/v15+) with REST API enabled.
- **MCP Client**: An MCP-compatible LLM client (e.g., Cherry Studio, Claude Desktop).

### 📦 Installation
1. Clone the repository:
   
   git clone [https://github.com/jiangyidigital/Imperva-MCP-Server.git](https://github.com/jiangyidigital/Imperva-MCP-Server.git)

   cd Imperva-MCP-Server

3. Install dependencies:

   npm install

3.Set up your environment variables:

Copy the example file and edit it with your MX credentials.

cp .env.example .env

⚙️ Integration with MCP Clients (e.g., Cherry Studio)

To connect this server to your AI client, add a new MCP Server with the following configuration:

Type: stdio

Command: node

Args: /absolute/path/to/Imperva-MCP-Server/index.js

⚠️ Anti-Hallucination Tip: > When using LLMs for SecOps, it is highly recommended to set a strict System Prompt to forbid the AI from hallucinating IP addresses or metrics. Force the AI to always execute the tools for real-time data.
