// 文件位置：index.js (根目录下)
const path = require('path');

// 🌟 终极防丢手段：在程序的最入口，强制钉死 .env 文件的绝对路径
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

const tools = require('./src/tools');    // 注意：这里直接 require 文件夹名，Node 会自动读取里面的 index.js
const handlers = require('./src/handlers');   // 注意：这里直接 require 文件夹名，Node 会自动读取里面的 index.js

// 打印日志到终端，证明我们成功读到了 IP
console.error("====== MCP 服务启动检查 ======");
console.error("成功加载的 WAF IP 是:", process.env.WAF_BASE_URL || "警告：未读取到 IP，请检查 .env 文件！");
console.error("==============================");

const server = new Server({
    name: "Imperva-SecureSphere-MCP-Server",
    version: "1.0.0"
}, {
    capabilities: { tools: {} }
});
// 1. 告诉大模型我们有哪些工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: tools };
});
// 2. 将大模型的调用请求路由到对应的 Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const handler = handlers[name];
    if (handler) {
        return await handler(args);
    }
    throw new Error(`未知的工具: ${name}`);
});
// 3. 启动服务
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("模块化 Imperva MCP Server 已通过 STDIO 启动...");
}

main().catch(console.error);