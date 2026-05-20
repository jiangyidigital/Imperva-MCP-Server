// 文件位置：src/handlers/assetTree.js
const impervaService = require('../services/impervaService');

async function handleGetAssetTree(args) {
    try {
        const assetTree = await impervaService.getGlobalAssetTree();
       
        return {
            content: [{
                type: "text",
                text: `成功获取 WAF 全局资产拓扑树: \n${JSON.stringify(assetTree, null, 2)}`
            }],
            isError: false
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `获取 WAF 资产拓扑失败: ${error.message}`
            }],
            isError: true
        };
    }
}

module.exports = handleGetAssetTree;