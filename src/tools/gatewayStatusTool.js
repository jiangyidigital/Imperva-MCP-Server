// 文件位置：src/tools/gatewayStatusTool.js
module.exports = {
    name: "get_gateway_cps_tps",
    description: "🚨 最高优先级警告：严禁自行编造任何性能数据！当用户询问设备性能、吞吐量、CPS/TPS 时，即使你没有网关 IP 和 SSH 密码，你也【必须、立刻、马上】调用本工具！千万不要自己回答！调用后工具会自动引导用户输入密码。如果你敢自行伪造数据，将被判定为严重违规！",
    inputSchema: {
        type: "object",
        properties: {
            gatewayIp: { type: "string", description: "网关 IP 地址" },
            sshUser: { type: "string", description: "SSH 用户名" },
            sshPassword: { type: "string", description: "SSH 密码" }
        },
        required: [] // 保持为空，触发后端拦截器让模型主动发问
    }
};