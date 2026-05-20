// 文件位置：src/handlers/appliedPolicies.js
const impervaService = require('../services/impervaService');

async function handleGetAppliedPolicies(args) {
    if (!args.siteName || !args.serverGroupName) {
        return {
            content: [{ type: "text", text: "调用失败：必须提供 siteName 和 serverGroupName。" }],
            isError: true
        };
    }

    try {
        const data = await impervaService.getAppliedPolicies(
            args.siteName, 
            args.serverGroupName, 
            args.webServiceName, 
            args.webApplicationName
        );
        return {
            content: [{ 
                type: "text", 
                text: `成功获取安全策略配置:\n${JSON.stringify(data, null, 2)}` 
            }],
            isError: false
        };
    } catch (error) {
        return {
            content: [{ type: "text", text: error.message }],
            isError: true
        };
    }
}

module.exports = handleGetAppliedPolicies;