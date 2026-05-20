const axios = require('axios');
const path = require('path');

// 强制读取根目录的 .env 文件
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testWafLogin() {
    console.log("========== WAF 登录极简测试 ==========");
    
    const baseURL = process.env.WAF_BASE_URL;
    const username = process.env.WAF_USER;
    const password = process.env.WAF_PASSWORD;

    console.log(`[配置检查] 目标地址: ${baseURL}`);
    console.log(`[配置检查] 用户名: ${username}`);
    console.log(`[配置检查] 密码长度: ${password ? password.length : '空!'}`);

    if (!baseURL || !username || !password) {
        console.log("❌ 错误：环境变量加载失败，请检查 .env 文件！");
        return;
    }

    try {
        // 1. 拼接并生成 Base64 加密的 Basic Auth 字符串
        const authStr = `${username}:${password}`;
        const base64Auth = Buffer.from(authStr).toString('base64');
        const authHeader = `Basic ${base64Auth}`;

        // 2. 忽略虚拟化 WAF 的自签名证书报错
        const httpsAgent = new (require('https').Agent)({ rejectUnauthorized: false });

        console.log("\n⏳ 正在向 WAF 发起认证请求...");

        // 3. 发送最纯粹的 POST 请求
        const response = await axios.post(`${baseURL}/SecureSphere/api/v1/auth/session`, null, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            httpsAgent: httpsAgent
        });

        console.log("\n✅ 登录成功！大门已敞开！");
        console.log("HTTP 状态码:", response.status);
        console.log("获取到的 Session-ID:", response.data);
        
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            console.log("获取到的 Cookie 凭证:", cookies[0].split(';')[0]);
        }

    } catch (error) {
        console.log("\n❌ 登录被拒绝或失败！");
        if (error.response) {
            console.log("HTTP 状态码:", error.response.status);
            console.log("WAF 返回的具体报错:", JSON.stringify(error.response.data, null, 2));
            console.log("\n💡 排查建议:");
            console.log("1. 确认该账号是否在 GUI 中被临时锁定（Lockout）。");
            console.log("2. 确认 WAF 版本是否允许默认 admin 账号调用 API（有些版本需新建专用 API User）。");
            console.log("3. 检查用户名首字母是否需要大写（如 Admin）。");
        } else {
            console.log("网络连接报错:", error.message);
        }
    }
}

testWafLogin();