// 文件位置：src/handlers/gatewayInfo.js
const impervaService = require('../services/impervaService');

async function handleGetGatewayInfo(args) {
    try {
        // 场景 A：大模型传了明确的网关名称，直接查单台
        if (args.gatewayName) {
            const data = await impervaService.getGatewayInfo(args.gatewayName);
            return {
                content: [{ type: "text", text: `成功获取网关 [${args.gatewayName}] 的详细信息:\n${JSON.stringify(data, null, 2)}` }],
                isError: false
            };
        } 
        // 场景 B：大模型没传名称（用户不知道名字或想看全网），触发三层智能发现
        else {
            const data = await impervaService.getAllGatewaysDetails();
            return {
                content: [{ type: "text", text: `全网网关智能发现成功 (含所属网关组、IP及详细配置):\n${JSON.stringify(data, null, 2)}` }],
                isError: false
            };
        }
    } catch (error) {
        return {
            content: [{ type: "text", text: error.message }],
            isError: true
        };
    }
}

module.exports = handleGetGatewayInfo;