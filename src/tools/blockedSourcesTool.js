// 文件位置：src/tools/blockedSourcesTool.js
module.exports = {
    name: "get_waf_blocked_sources",
    description: "获取 Imperva SecureSphere WAF 当前被拉黑的源列表（包括被封禁的 IP 地址、用户或会话），用于排查误封或分析攻击源。",
    inputSchema: {
        type: "object",
        properties: {}, 
        required: []
    }
};