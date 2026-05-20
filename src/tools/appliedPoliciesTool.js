// 文件位置：src/tools/appliedPoliciesTool.js
module.exports = {
    name: "get_waf_applied_policies",
    description: "获取特定资产绑定的安全策略（仅返回策略名称）。🚨 极度重要：如果你要查 Application 级别的策略，你【必须】同时提供 siteName、serverGroupName、webServiceName、webApplicationName 这 4 个完整参数！本工具返回的数据已经是清洗过的【策略名称列表】（如 ['Firewall Policy', '...']），你只需要把这些名字原样按层级展示给用户即可，绝对严禁自己捏造数字或汇总统计！",
    inputSchema: {
        type: "object",
        properties: {
            siteName: { type: "string", description: "站点名称 (必须)" },
            serverGroupName: { type: "string", description: "服务器组名称 (必须)" },
            webServiceName: { type: "string", description: "Web服务名称 (查Application必须带上此父级参数)" },
            webApplicationName: { type: "string", description: "Web应用名称 (查Application策略时必填)" }
        },
        required: ["siteName", "serverGroupName"]
    }
};