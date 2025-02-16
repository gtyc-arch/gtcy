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
        let checkUrl = `${proxyServer}/proxy/check-domain?host=${encodeURIComponent(host)}`;

        $.get(checkUrl, function (data) {
            console.log(`🔎 创建检测任务: ${domain}`);

            if (data.id) {
                console.log(`✅ 任务创建成功，任务ID: ${data.id}`);
                setTimeout(() => queryTaskResult(data.id, domain, callback), 10000); // **等待 10 秒再查询**
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
   function queryTaskResult(taskId, domain, callback) {
    let queryUrl = `${proxyServer}/proxy/query-task?id=${taskId}`;
    
    setTimeout(function () {
        $.get(queryUrl, function (data) {
            if (data.done && data.list && data.list.length > 0) {
                console.log(`✅ 任务 ${taskId} 完成, 结果:`, data.list);

                // **统计当前检测域名的访问失败地区数量**
                let failedRegions = data.list.filter(node => node.http_code === 0);
                let failedCount = failedRegions.length;

                console.log(`❌ 当前检测域名 ${domain} 访问失败地区数量: ${failedCount}/${data.list.length}`);

                // **如果失败地区 >= 5，自动切换域名**
                if (failedCount >= 5) {
                    console.warn(`⚠️ 访问失败地区过多 (${failedCount}/${data.list.length})，尝试切换域名...`);
                    switchDomain();
                    return; // **停止后续执行**
                }

                // **把检测结果渲染到页面**
                let resultHTML = `<h3>检测结果</h3><p>❌ 当前检测域名 ${domain} 访问失败地区数量: ${failedCount}/${data.list.length}</p><ul>`;
                data.list.forEach(node => {
                    resultHTML += `
                        <li>
                            <strong>节点：</strong> ${node.node_name} (${node.node_id})<br>
                            <strong>HTTP 状态：</strong> ${node.http_code} <br>
                            <strong>解析 IP：</strong> ${node.remote_ip || "N/A"} <br>
                            <strong>下载速度：</strong> ${node.speed_download} bytes/s <br>
                            <strong>总时间：</strong> ${node.time_total} 秒
                        </li><hr>`;
                });
                resultHTML += "</ul>";
                $("#check-results").html(resultHTML); // 显示在网页上
                callback(true, data.list);
            } else {
                console.warn(`⌛ 任务 ${taskId} 未完成，稍后重试`);
                setTimeout(() => queryTaskResult(taskId, domain, callback), 5000); // 5秒后重试
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
            window.currentDomainIndex++;

            if (window.currentDomainIndex >= domainList.length) {
                console.error("❌ 所有域名都不可用，请检查网络！");
                return;
            }

            console.log(`🔀 切换到下一个域名：${domainList[window.currentDomainIndex]}`);
            testCurrentDomain();
        }
    }

    // 🔄 当前域名检测
    function testCurrentDomain() {
        const domain = domainList[window.currentDomainIndex];
        checkDomainStatus(domain, function (isAvailable, data) {
            if (!isAvailable) {
                switchDomain();
            } else {
                console.log(`🎉 当前域名 ${domain} 可用，检测数据:`, data);
            }
        });
    }

    /**
     * 🔗 **绑定点击事件**
     * 改为直接在 DOM 加载完成后绑定
     */
    $(document).on("click", ".jump-button", function (e) {
        e.preventDefault(); // 阻止默认行为

        // 获取当前页面的 shareName 和 proxyAccount 参数
        var urlParams = new URLSearchParams(window.location.search);
        var shareName = urlParams.get("shareName") || "";
        var proxyAccount = urlParams.get("proxyAccount") || "";

        // **确保当前域名索引不超出范围**
        if (window.currentDomainIndex >= domainList.length) {
            console.error("❌ 无法获取有效域名，跳转失败！");
            return;
        }

        // **获取基础 URL 和 data-url**
        let baseUrl = domainList[window.currentDomainIndex];
        let path = $(this).attr("data-url") || "";

        // **确保路径正确拼接**
        let fullUrl = new URL(path, baseUrl).href;

        // **拼接 shareName 和 proxyAccount 参数**
        let finalUrl = `${fullUrl}?shareName=${shareName}&proxyAccount=${proxyAccount}`;
        console.log("最终跳转的 URL:", finalUrl);

        // **如果 URL 有效，则执行跳转**
        if (finalUrl) {
            window.location.href = finalUrl;
        }
    });

    // **初始化：检测当前域名状态**
    checkDomainStatus(domainList[window.currentDomainIndex], function (isAvailable, data) {
        if (!isAvailable) {
            switchDomain();
        }
    });
});
