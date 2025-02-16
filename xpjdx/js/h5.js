$(document).ready(function () {
    console.log("✅ h5.js 已加载，等待 #jump-button 渲染...");

    window.currentDomainIndex = 0; // 当前使用的域名索引
    let failCount = 0; // 失败计数器
    const maxFailCount = 5; // 失败超过 5 个地区就切换域名
    const domainList = [
        'https://www.987631.vip',
        'https://zt.p98704.vip',
        'https://qp.ampj.x94751.vip',
        'https://qp.ampj.x96762.vip',
        'https://qp.ampj.x93713.vip',
        'https://qp.ampj.x92729.vip',
        'https://qp.ampj.x95793.vip'
    ]; // 例子中的域名列表，可以自行修改
    
    const proxyServer = "http://localhost:3000"; // 本地代理服务器地址

    // 🔍 使用本地代理服务器检测域名可用性
    function checkDomainStatus(domain, callback) {
        let host = encodeURIComponent(domain); // 保留 https:// 并编码
        let checkUrl = `${proxyServer}/proxy/check-domain?host=${host}`;
        
        $.get(checkUrl, function (data) {
            console.log(`🔎 创建检测任务: ${domain}`);

            if (data.error_code === 0 && data.data.id) {
                console.log(`✅ 任务创建成功，任务ID: ${data.data.id}`);
                queryTaskResult(data.data.id, callback);
            } else {
                failCount++;
                console.warn(`⚠️ ${domain} 任务创建失败 (${failCount}/${maxFailCount})`);
                callback(false);
            }
        }).fail(function () {
            failCount++;
            console.error(`❌ ${domain} 任务创建请求失败 (${failCount}/${maxFailCount})`);
            callback(false);
        });
    }

    // 🔄 查询任务结果
    function queryTaskResult(taskId, callback) {
        let queryUrl = `${proxyServer}/proxy/query-task?id=${taskId}`;
        
        setTimeout(function () {
            $.get(queryUrl, function (data) {
                if (data.done && data.list && data.list.length > 0) {
                    console.log(`✅ 任务 ${taskId} 完成, 结果:`, data.list);
                    callback(true, data.list);
                } else {
                    console.warn(`⌛ 任务 ${taskId} 未完成，稍后重试`);
                    setTimeout(() => queryTaskResult(taskId, callback), 5000); // 5秒后重试
                }
            }).fail(function () {
                console.error(`❌ 查询任务 ${taskId} 失败`);
                callback(false);
            });
        }, 5000); // 5秒后开始查询
    }

    console.log("✅ h5.js 已成功加载");

    // 🔄 切换到下一个可用域名
    function switchDomain() {
        if (failCount >= maxFailCount) {
            failCount = 0; // 重置失败计数
            currentDomainIndex++;

            if (currentDomainIndex >= domainList.length) {
                console.error("❌ 所有域名都不可用，请检查网络！");
                return;
            }

            console.log(`🔀 切换到下一个域名：${domainList[currentDomainIndex]}`);
            testCurrentDomain();
        }
    }

    // 🔄 当前域名检测
    function testCurrentDomain() {
        const domain = domainList[currentDomainIndex];
        checkDomainStatus(domain, function (isAvailable, data) {
            if (!isAvailable) {
                switchDomain();
            } else {
                console.log(`🎉 当前域名 ${domain} 可用，检测数据:`, data);
            }
        });
    }

    // **初始化：检测当前域名状态**
    checkDomainStatus(domainList[currentDomainIndex], function (isAvailable, data) {
        if (!isAvailable) {
            switchDomain();
        }
    });
});
