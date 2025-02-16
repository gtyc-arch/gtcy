$(document).ready(function () {
    console.log("✅ h5.js 已加载，等待 #jump-button 渲染...");

    const proxyServer = "http://localhost:3000"; // 本地代理服务器地址
    let currentDomain = ""; // 当前可用的域名

    // **🔥 获取服务器存储的最新可用域名**
    function getCurrentDomain(callback) {
        $.get(`${proxyServer}/proxy/current-domain`, function (data) {
            if (data.domain) {
                console.log("🌍 服务器返回当前可用域名:", data.domain);
                currentDomain = data.domain;
                callback();
            } else {
                console.error("❌ 无法获取当前可用域名，使用默认域名");
            }
        }).fail(function () {
            console.error("❌ 无法连接到服务器获取当前可用域名");
        });
    }

    // **🔍 使用本地代理服务器检测域名可用性**
    function checkDomainStatus(domain, callback) {
        let checkUrl = `${proxyServer}/proxy/check-domain?host=${encodeURIComponent(domain)}`;

        $.get(checkUrl, function (data) {
            console.log(`🔎 创建检测任务: ${domain}`);

            if (data.id) {
                console.log(`✅ 任务创建成功，任务ID: ${data.id}`);
                setTimeout(() => queryTaskResult(data.id, domain, callback), 10000); // **等待 10 秒再查询**
            } else {
                console.warn(`⚠️ ${domain} 任务创建失败`);
                callback(false);
            }
        }).fail(function () {
            console.error(`❌ ${domain} 任务创建请求失败`);
            callback(false);
        });
    }

    // **🔄 查询任务结果**
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

                    // **如果失败地区 ≥ 5，前端请求服务器更新域名**
                    if (failedCount >= 5) {
                        console.warn(`⚠️ 访问失败地区过多 (${failedCount}/${data.list.length})，请求服务器更新域名...`);
                        
                        // 请求服务器更新域名
                        $.post(`${proxyServer}/proxy/update-domain`, function (data) {
                            console.log("✅ 服务器已更新域名:", data.domain);
                            currentDomain = data.domain;

                            // 重新检测新域名
                            checkDomainStatus(currentDomain, callback);
                        }).fail(function () {
                            console.error("❌ 无法请求服务器更新域名");
                        });

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

    /**
     * 🔗 **绑定点击事件**
     * 直接在 DOM 加载完成后绑定
     */
    $(document).on("click", ".jump-button", function (e) {
        e.preventDefault(); // 阻止默认行为

        // 获取当前页面的 shareName 和 proxyAccount 参数
        var urlParams = new URLSearchParams(window.location.search);
        var shareName = urlParams.get("shareName") || "";
        var proxyAccount = urlParams.get("proxyAccount") || "";

        // **确保当前域名有效**
        if (!currentDomain) {
            console.error("❌ 无法获取有效域名，跳转失败！");
            return;
        }

        // **获取 data-url**
        let path = $(this).attr("data-url") || "";

        // **拼接最终 URL**
        let fullUrl = new URL(path, currentDomain).href;
        let finalUrl = `${fullUrl}?shareName=${shareName}&proxyAccount=${proxyAccount}`;

        console.log("最终跳转的 URL:", finalUrl);

        // **如果 URL 有效，则执行跳转**
        if (finalUrl) {
            window.location.href = finalUrl;
        }
    });

    // **初始化：获取最新可用域名并检测**
    getCurrentDomain(() => {
        console.log("🚀 使用服务器的最新域名:", currentDomain);
        checkDomainStatus(currentDomain, function (isAvailable, data) {
            if (!isAvailable) {
                getCurrentDomain(() => {
                    console.log("🔁 获取新域名后重新检测:", currentDomain);
                    checkDomainStatus(currentDomain, () => {});
                });
            }
        });
    });
});
