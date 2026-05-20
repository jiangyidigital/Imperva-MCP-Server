// 文件位置：src/services/impervaService.js
const axios = require('axios');
const config = require('../config');

class ImpervaService {
    constructor() {
        this.client = axios.create({
            baseURL: config.waf.baseUrl,
            // 忽略虚拟化测试环境的自签名证书错误
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            proxy: false // 强制关闭代理，防止被环境误导
        });
        this.sessionCookie = null;
    }

    // 1. 获取 Session Token (认证)
    async authenticate() {
        try {
            const authHeader = `Basic ${Buffer.from(`${config.waf.username}:${config.waf.password}`).toString('base64')}`;
            const response = await this.client.post('/SecureSphere/api/v1/auth/session', null, {
                headers: { 
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                this.sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
            }
            return true;
        } catch (error) {
            const detail = error.response ? JSON.stringify(error.response.data) : error.message;
            throw new Error(`认证请求失败: ${detail} (目标: ${config.waf.baseUrl})`);
        }
    }

    // 2. 拉取安全告警 
    async getSecurityViolations(lastFewDays = 1, limit = 50) {
        if (!this.sessionCookie) await this.authenticate();
        try {
            const response = await this.client.get('/SecureSphere/api/v1/monitor/violations', {
                headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' },
                params: { lastFewDays: lastFewDays, limit: limit }
            });
            return response.data;
        } catch (error) {
            const detail = error.response ? JSON.stringify(error.response.data) : error.message;
            throw new Error(`获取告警失败: ${detail}`);
        }
    }

    // 3. 获取当前被拉黑的源列表
    async getBlockedSources() {
        if (!this.sessionCookie) await this.authenticate();
        try {
            const response = await this.client.get('/SecureSphere/api/v1/monitor/blockedSources', {
                headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            const detail = error.response ? JSON.stringify(error.response.data) : error.message;
            throw new Error(`获取黑名单失败: ${detail}`);
        }
    }

    // 4. 获取全局 Web 资产树 (Site -> Server Group -> Web Service -> Web Application)
    async getGlobalAssetTree() {
        if (!this.sessionCookie) await this.authenticate();
        const assetTree = {};
        console.log("🌲 开始构建全局资产树，请稍候...");

        try {
            const sitesRes = await this.client.get('/SecureSphere/api/v1/conf/sites', {
                headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' }
            });
            const sites = sitesRes.data.sites || [];

            for (const site of sites) {
                assetTree[site] = {};
                const encSite = encodeURIComponent(site);

                try {
                    const sgRes = await this.client.get(`/SecureSphere/api/v1/conf/serverGroups/${encSite}`, {
                        headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' }
                    });
                    const serverGroups = sgRes.data['server-groups'] || [];

                    for (const sg of serverGroups) {
                        assetTree[site][sg] = {};
                        const encSg = encodeURIComponent(sg);

                        try {
                            const wsRes = await this.client.get(`/SecureSphere/api/v1/conf/webServices/${encSite}/${encSg}`, {
                                headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' }
                            });
                            const webServices = wsRes.data['web-services'] || [];

                            for (const ws of webServices) {
                                const encWs = encodeURIComponent(ws);
                                try {
                                    const appRes = await this.client.get(`/SecureSphere/api/v1/conf/webApplications/${encSite}/${encSg}/${encWs}`, {
                                        headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' }
                                    });
                                    assetTree[site][sg][ws] = appRes.data.webApplications || [];
                                } catch (appErr) {
                                    if (appErr.response && appErr.response.status === 404) assetTree[site][sg][ws] = [];
                                    else throw appErr;
                                }
                            }
                        } catch (wsErr) {
                            if (wsErr.response && wsErr.response.status === 404) continue;
                            else throw wsErr;
                        }
                    }
                } catch (sgErr) {
                    if (sgErr.response && sgErr.response.status === 404) continue;
                    else throw sgErr;
                }
            }
            console.log("✅ 全局资产树构建完成！");
            return assetTree;
        } catch (error) {
            const detail = error.response ? JSON.stringify(error.response.data) : error.message;
            throw new Error(`获取资产层级失败: ${detail}`);
        }
    }

    // 5. 获取特定网关的详细设备状态信息
    async getGatewayInfo(gatewayName) {
        if (!this.sessionCookie) await this.authenticate();
        try {
            const encName = encodeURIComponent(gatewayName);
            const response = await this.client.get(`/SecureSphere/api/v1/conf/gateways/${encName}`, {
                headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error(`IMP-10102: 找不到指定的网关 [${gatewayName}]。`);
            }
            throw new Error(`获取网关 [${gatewayName}] 信息失败: ${error.message}`);
        }
    }

    // 6. 全网网关智能发现 (三层遍历)
    async getAllGatewaysDetails() {
        if (!this.sessionCookie) await this.authenticate();
        console.log("🔍 开始全网网关智能发现...");
        const allGateways = [];

        try {
            const ggRes = await this.client.get('/SecureSphere/api/v1/conf/gatewayGroups', {
                headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' }
            });
            const groups = ggRes.data['gateway-groups'] || [];

            for (const group of groups) {
                const encGroup = encodeURIComponent(group);
                try {
                    const gwRes = await this.client.get(`/SecureSphere/api/v1/conf/gatewayGroups/${encGroup}/gateways`, {
                        headers: { 'Cookie': this.sessionCookie, 'Content-Type': 'application/json' }
                    });
                    const gateways = gwRes.data.gateways || [];

                    for (const gw of gateways) {
                        try {
                            const detail = await this.getGatewayInfo(gw.name);
                            allGateways.push({
                                groupName: group,
                                basicInfo: gw,
                                details: detail
                            });
                        } catch (err) {
                            console.error(`忽略：获取网关详情失败 [${gw.name}]`);
                        }
                    }
                } catch (err) {
                    if (err.response && err.response.status === 404) continue;
                    throw err;
                }
            }
            console.log("✅ 全网网关发现完毕！");
            return allGateways;
        } catch (error) {
            const detail = error.response ? JSON.stringify(error.response.data) : error.message;
            throw new Error(`全局网关发现失败: ${detail}`);
        }
    }

// 7. 获取各个层级资产绑定的安全策略 (按类型分组智能版)
    async getAppliedPolicies(siteName, serverGroupName, webServiceName, webApplicationName) {
        if (!this.sessionCookie) await this.authenticate();

        const encSite = encodeURIComponent(siteName);
        const encSg = encodeURIComponent(serverGroupName);
        const policyStack = {};
        const headers = { 'Cookie': this.sessionCookie, 'Accept': 'application/json' };

        // 🌟 终极脱水器：不再返回扁平数组，而是按【策略类型 (Type)】智能分组
        const extractAndGroup = (data) => {
            let arr = data.policies || data['security-policies'] || data;
            if (!Array.isArray(arr)) return null;
            if (arr.length === 0) return null;

            const grouped = {};
            arr.forEach(p => {
                if (typeof p === 'string') {
                    if (!grouped['Other']) grouped['Other'] = [];
                    grouped['Other'].push(p);
                    return;
                }
                const name = p.name || p['policy-name'] || p.policyName || "未知策略名";
                const type = p.type || p['policy-type'] || p.policyType || "未分类策略";

                // 按策略类型创建数组，把同类型的策略放一起
                if (!grouped[type]) grouped[type] = [];
                grouped[type].push(name);
            });
            return grouped;
        };

        try {
            console.log(`🔍 正在按类型分组抓取 [${siteName}/${serverGroupName}] 的策略...`);

            // --- 1. Server Group 层级查询 ---
            try {
                const sgUrl = `/SecureSphere/api/v1/conf/serverGroups/${encSite}/${encSg}/securityPolicies`;
                const sgRes = await this.client.get(sgUrl, { headers });
                const groupedPolicies = extractAndGroup(sgRes.data);
                policyStack['1_Server_Group_Level'] = groupedPolicies || "该层级未挂载任何策略";
            } catch (e) {
                policyStack['1_Server_Group_Level'] = `查询失败: ${e.response ? e.response.status : e.message}`;
            }

            // --- 2. Web Service 层级查询 ---
            if (webServiceName) {
                const encWs = encodeURIComponent(webServiceName);
                try {
                    const wsUrl = `/SecureSphere/api/v1/conf/webServices/${encSite}/${encSg}/${encWs}/securityPolicies`;
                    const wsRes = await this.client.get(wsUrl, { headers });
                    const groupedPolicies = extractAndGroup(wsRes.data);
                    policyStack['2_Web_Service_Level'] = groupedPolicies || "该层级未挂载任何策略";
                } catch (e) {
                    policyStack['2_Web_Service_Level'] = `查询失败: ${e.response ? e.response.status : e.message}`;
                }

                // --- 3. Web Application 层级查询 ---
                if (webApplicationName) {
                    const encApp = encodeURIComponent(webApplicationName);
                    try {
                        const appUrl = `/SecureSphere/api/v1/conf/webApplications/${encSite}/${encSg}/${encWs}/${encApp}/securityPolicies`;
                        const appRes = await this.client.get(appUrl, { headers });
                        const groupedPolicies = extractAndGroup(appRes.data);
                        policyStack['3_Web_Application_Level'] = groupedPolicies || "该层级未挂载任何策略";
                    } catch (e) {
                        policyStack['3_Web_Application_Level'] = `查询失败: ${e.response ? e.response.status : e.message}`;
                    }
                } else {
                    policyStack['3_Web_Application_Level'] = "⚠️ 未提供 Application 名称，底层策略已跳过查询";
                }
            } else {
                policyStack['2_Web_Service_Level'] = "⚠️ 未提供 Service 名称，中层策略已跳过查询";
                policyStack['3_Web_Application_Level'] = "⚠️ 依赖缺失，底层策略已跳过查询";
            }

            return policyStack;

        } catch (error) {
            throw new Error(`获取策略栈严重失败: ${error.message}`);
        }
    }

}

module.exports = new ImpervaService();