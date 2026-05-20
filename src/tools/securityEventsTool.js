// 文件位置：src/tools/securityEventsTool.js
module.exports = {
    name: "get_waf_security_events",
    description: "拉取 Imperva SecureSphere WAF 的最新安全告警 (Security Violations)，用于生成安全巡检报告。",
    inputSchema: {
        type: "object",
        properties: {
            lastFewDays: {
                type: "number",
                description: "查询过去几天的告警，例如填 1 表示过去 1 天（24小时）内的告警。",
                default: 1
            },
            limit: {
                type: "number",
                description: "需要返回的告警条数上限。",
                default: 50
            }
        },
        required: ["lastFewDays"]
    }
};