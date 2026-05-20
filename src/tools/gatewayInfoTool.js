// 文件位置：src/tools/gatewayInfoTool.js
module.exports = {
    name: "get_waf_gateway_info",
    description: "获取 Imperva WAF 网关的设备台账与部署状态。💡 智能逻辑：如果用户说出了明确的网关名称，请传入；如果用户不知道名称、只提供了IP，或者想看全局所有的网关台账，请不要传任何参数！后台会自动进行『网关组 -> 网关 -> 详细信息』的三层遍历，返回全网所有网关的详细配置。",
    inputSchema: {
        type: "object",
        properties: {
            gatewayName: {
                type: "string",
                description: "目标网关的确切名称。如果你不知道准确名字，请保持此参数为空！"
            }
        },
        required: [] // 🌟 核心修改：取消必填项，允许一键全网发现！
    }
};