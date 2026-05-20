module.exports = {
    name: "get_waf_asset_tree",
    description: "一键获取 Imperva WAF 全局配置的 Web 资产层级拓扑树 (包含 Site -> Server Group -> Web Service -> Web Application)。用于回答用户关于业务范围、站点配置或应用分布的宏观问题。",
    inputSchema: {
        type: "object",
        properties: {}, // 无需任何输入参数
        required: []
    }
};