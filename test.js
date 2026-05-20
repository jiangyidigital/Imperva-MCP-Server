const config = require('./src/config');

console.log("=== 环境变量测试 ===");
console.log("WAF IP:", config.waf.baseUrl);
console.log("用户名:", config.waf.username);
console.log("读取到的密码长度:", config.waf.password ? config.waf.password.length : "密码是空的!");
console.log("密码前两位:", config.waf.password ? config.waf.password.substring(0, 2) + "***" : "无");