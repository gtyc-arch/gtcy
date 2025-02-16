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
    let host = domain; // 直接传递完整 URL
    let checkUrl = `http://localhost:3000/proxy/check-domain?host=${encodeURIComponent(host)}`;

    $.get(checkUrl, function (data) {
        console.log(`🔎 创建检测任务: ${domain}`);

        if (data.id) {
            console.log(`✅ 任务创建成功，任务ID: ${data.id}`);
            setTimeout(() => queryTaskResult(data.id, callback), 10000); // **等待 10 秒再查询**
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

                // **把检测结果渲染到页面**
                let resultHTML = "<h3>检测结果</h3><ul>";
                data.list.forEach(node => {
                    resultHTML += `
                        <li>
                            <strong>节点：</strong> ${node.node_name} (${node.node_id})<br>
                            <strong>HTTP 状态：</strong> ${node.http_code} <br>
                            <strong>解析 IP：</strong> ${node.remote_ip} <br>
                            <strong>下载速度：</strong> ${node.speed_download} bytes/s <br>
                            <strong>总时间：</strong> ${node.time_total} 秒
                        </li><hr>`;
                });
                resultHTML += "</ul>";
                $("#check-results").html(resultHTML); // 显示在网页上
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

    // 🔄 查询任务结果
function queryTaskResult(taskId, callback) {
    let queryUrl = `http://localhost:3000/proxy/query-task?id=${taskId}`;
    
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
