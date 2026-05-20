// 文件位置：src/services/sshService.js
const { NodeSSH } = require('node-ssh');

class SshService {
    constructor() {
        this.ssh = new NodeSSH();
    }

    async getGatewayThroughput(host, username, password) {
        try {
            await this.ssh.connect({
                host: host,
                username: username,
                password: password,
                readyTimeout: 5000
            });

            return new Promise(async (resolve, reject) => {
                try {
                    const shell = await this.ssh.requestShell();
                    let outputBuffer = '';
                    let finalOutput = '';
                    let step = 0;

                    // 使用专属标签，彻底杜绝回显乱码干扰
                    const monitorCommands = `
awk '/Global:/{getline; print "METRIC_THROUGHPUT:" $1; exit}' /opt/SecureSphere/etc/proc/hades/status
awk '/connection\\/sec/ && !/overload/ {print "METRIC_CPS:" $1; exit}' /opt/SecureSphere/etc/proc/hades/status
awk '/HTTP hits\\/sec/ && !/overload/ {print "METRIC_TPS:" $1; exit}' /opt/SecureSphere/etc/proc/hades/status
reg_count=$(cat /proc/hades/nzcounters 2>/dev/null | grep regexp | grep "(net)" | wc -l)
echo "METRIC_REGEXP:$reg_count"
exit
exit
`.trim().replace(/\n/g, '; ') + '\n';

                    shell.on('data', (data) => {
                        const chunk = data.toString();
                        outputBuffer += chunk;
                        finalOutput += chunk;

                        // 🌟 终极改进1：剥离所有终端隐藏的 ANSI 颜色控制符
                        const cleanText = outputBuffer.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();

                        if (step === 0) {
                            // 🌟 终极改进2：双重锁定，防止被 Banner 里的 # 欺骗
                            if (cleanText.endsWith('#') && cleanText.includes('root@')) {
                                step = 2;
                                outputBuffer = '';
                                shell.write(monitorCommands);
                            } 
                            // 双重锁定，准确识别 admin 的 >
                            else if (cleanText.endsWith('>') && cleanText.includes('admin@')) {
                                step = 1;
                                outputBuffer = '';
                                shell.write('admin\n');
                            }
                        } else if (step === 1) {
                            // 提权后，再次精准等待 root 提示符
                            if (cleanText.endsWith('#') && cleanText.includes('root@')) {
                                step = 2;
                                outputBuffer = '';
                                shell.write(monitorCommands);
                            }
                        }
                    });

                    shell.on('close', () => {
                        this.ssh.dispose();

                        let cps = 0, tps = 0, throughput = 0, regexpTimeout = 0;
                        let successParse = false;

                        // 精准正则提取引擎
                        const tpMatch = finalOutput.match(/METRIC_THROUGHPUT:\s*(\d+)/);
                        if (tpMatch) { throughput = parseInt(tpMatch[1], 10); successParse = true; }

                        const cpsMatch = finalOutput.match(/METRIC_CPS:\s*(\d+)/);
                        if (cpsMatch) { cps = parseInt(cpsMatch[1], 10); successParse = true; }

                        const tpsMatch = finalOutput.match(/METRIC_TPS:\s*(\d+)/);
                        if (tpsMatch) { tps = parseInt(tpsMatch[1], 10); successParse = true; }

                        const regMatch = finalOutput.match(/METRIC_REGEXP:\s*(\d+)/);
                        if (regMatch) { regexpTimeout = parseInt(regMatch[1], 10); successParse = true; }

                        resolve({
                            gateway_ip: host,
                            connections_per_sec_CPS: cps,
                            http_hits_per_sec_TPS: tps,
                            throughput_Kbps: throughput,
                            regexp_timeout_count: regexpTimeout,
                            // 失败时甩出包含真实现场的日志给大模型
                            assessment: successParse ? 
                                (regexpTimeout > 0 ? "⚠️ 警告：检测到 Regexp 正则匹配超时！" : "✅ 运行良好，无正则匹配超时。") :
                                `❌ 抓取失败！未能解析到底层数据。这通常是因为命令执行失败或卡在提示符。终端日志摘要：\n${finalOutput.substring(finalOutput.length - 500)}`
                        });
                    });
                } catch (err) {
                    this.ssh.dispose();
                    reject(err);
                }
            });

        } catch (error) {
            console.error(`SSH连接网关 ${host} 失败:`, error.message);
            throw new Error(`网络或凭证错误，无法连接到 ${host}`);
        }
    }
}

module.exports = new SshService();