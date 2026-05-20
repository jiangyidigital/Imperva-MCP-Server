const handleGetSecurityEvents = require('./securityEvents');
const handleGetBlockedSources = require('./blockedSources');
const handleGetGatewayStatus = require('./gatewayStatus');
const handleGetAssetTree = require('./assetTree');
const handleGetGatewayInfo = require('./gatewayInfo'); // 🌟 新增引入
const handleGetAppliedPolicies = require('./appliedPolicies');

module.exports = {
    "get_waf_security_events": handleGetSecurityEvents,
    "get_waf_blocked_sources": handleGetBlockedSources,
    "get_gateway_cps_tps": handleGetGatewayStatus,
    "get_waf_asset_tree": handleGetAssetTree,
    "get_waf_gateway_info": handleGetGatewayInfo,
    "get_waf_applied_policies": handleGetAppliedPolicies // 🌟 新增绑定
};