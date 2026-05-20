// 文件位置：src/handlers/blockedSources.js
const impervaService = require('../services/impervaService');

async function handleGetBlockedSources(args) {
    try {
        const blockedSources = await impervaService.getBlockedSources();
        
        return {
            content: [{
                type: "text",
                text: `成功获取 WAF 黑名单数据 (共 ${blockedSources.length || 0} 条): \n${JSON.stringify(blockedSources, null, 2)}`
            }],
            isError: false
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `获取 WAF 黑名单失败: ${error.message}`
            }],
            isError: true
        };
    }
}

module.exports = handleGetBlockedSources;