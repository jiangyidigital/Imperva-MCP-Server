// 文件位置：src/handlers/securityEvents.js
const impervaService = require('../services/impervaService');

async function handleGetSecurityEvents(args) {
    try {
        const lastFewDays = args.lastFewDays || 1;
        const limit = args.limit || 50;
        
        const violations = await impervaService.getSecurityViolations(lastFewDays, limit);
        
        return {
            content: [{
                type: "text",
                text: `成功获取 WAF 告警数据 (共 ${violations.length || 0} 条): \n${JSON.stringify(violations, null, 2)}`
            }],
            isError: false
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `获取 WAF 告警失败: ${error.message}`
            }],
            isError: true
        };
    }
}

module.exports = handleGetSecurityEvents;