const securityEventsTool = require('./securityEventsTool');
const blockedSourcesTool = require('./blockedSourcesTool');
const gatewayStatusTool = require('./gatewayStatusTool');
const assetTreeTool = require('./assetTreeTool');
const gatewayInfoTool = require('./gatewayInfoTool');
const appliedPoliciesTool = require('./appliedPoliciesTool'); // 🌟 新增引入

module.exports = [
    securityEventsTool,
    blockedSourcesTool,
    gatewayStatusTool,
    assetTreeTool,
    gatewayInfoTool,
    appliedPoliciesTool // 🌟 新增暴露
];