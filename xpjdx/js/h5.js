$(document).ready(function () {
    console.log("✅ h5.js 已加载，等待 #jump-button 渲染...");

    let currentDomain = "";
    const proxyServer = "https://40.81.31.71:38271"; // 代理服务器地址

    // 🔥 **获取当前服务器存储的可用域名**
    function getCurrentDomain(callback) {
        $.get(`${proxyServer}/proxy/current-domain`, function (data) {
            if (data.domain) {
                currentDomain = data.domain;
                console.log(`✅ 服务器返回当前可用域名: ${currentDomain}`);
                callback(true);
            } else {
                console.warn("⚠️ 无法获取服务器的最新域名");
                callback(false);
            }
        }).fail(function () {
            console.error("❌ 无法从服务器获取可用域名");
            callback(false);
        });
    }

    // 🔍 **使用本地代理服务器检测域名可用性**
    function checkDomainStatus(domain, callback) {
        let checkUrl = `${proxyServer}/proxy/check-domain?host=${encodeURIComponent(domain)}`;

        $.get(checkUrl, function (data) {
            console.log(`🔎 创建检测任务: ${domain}`);

            if (data.id) {
                console.log(`✅ 任务创建成功，任务ID: ${data.id}`);
                setTimeout(() => queryTaskResult(data.id, domain, callback), 10000); // 等待 10 秒再查询
            } else {
                console.warn(`⚠️ ${domain} 任务创建失败`);
                callback(false);
            }
        }).fail(function () {
            console.error(`❌ ${domain} 任务创建请求失败`);
            callback(false);
        });
    }

    // 🔄 **查询任务结果**
    function queryTaskResult(taskId, domain, callback) {
        let queryUrl = `${proxyServer}/proxy/query-task?id=${taskId}`;

        setTimeout(function () {
            $.get(queryUrl, function (data) {
                if (data.done && data.list && data.list.length > 0) {
                    console.log(`✅ 任务 ${taskId} 完成, 结果:`, data.list);

                    // **统计失败地区数量**
                    let failedRegions = data.list.filter(node => node.http_code === 0);
                    let failedCount = failedRegions.length;

                    console.log(`❌ 当前检测域名 ${domain} 访问失败地区数量: ${failedCount}/${data.list.length}`);

                    // **如果失败地区 ≥ 5，请求服务器更新域名**
                    if (failedCount >= 5) {
                        console.warn(`⚠️ 访问失败地区过多 (${failedCount}/${data.list.length})，请求服务器更新域名...`);

                        $.post(`${proxyServer}/proxy/update-domain`, function (updateResponse) {
                            console.log("✅ 服务器已更新域名，重新获取最新可用域名...");
                            getCurrentDomain(() => testCurrentDomain());
                        }).fail(function () {
                            console.error("❌ 无法请求服务器更新域名");
                        });

                        return; // **停止后续执行**
                    }

                    // **渲染检测结果**
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
                    $("#check-results").html(resultHTML);
                    callback(true, data.list);
                } else {
                    console.warn(`⌛ 任务 ${taskId} 未完成，稍后重试`);
                    setTimeout(() => queryTaskResult(taskId, domain, callback), 5000);
                }
            }).fail(function () {
                console.error(`❌ 查询任务 ${taskId} 失败`);
                callback(false);
            });
        }, 5000);
    }

    // 🔄 **测试当前域名**
    function testCurrentDomain() {
        checkDomainStatus(currentDomain, function (isAvailable) {
            if (!isAvailable) {
                console.warn(`❌ 当前域名 ${currentDomain} 不可用，请求服务器切换域名...`);

                $.post(`${proxyServer}/proxy/update-domain`, function () {
                    console.log("✅ 服务器已更新域名，重新获取最新可用域名...");
                    getCurrentDomain(() => testCurrentDomain());
                }).fail(function () {
                    console.error("❌ 无法请求服务器更新域名");
                });
            } else {
                console.log(`🎉 当前域名 ${currentDomain} 可用`);
            }
        });
    }

    /**
     * 🔗 **绑定点击事件**
     * 让用户点击 "立即访问" 按钮时，跳转到最新可用的域名
     */
    $(document).on("click", ".jump-button", function (e) {
        e.preventDefault();

        // 获取 URL 参数
        let urlParams = new URLSearchParams(window.location.search);
        let shareName = urlParams.get("shareName") || "";
        let proxyAccount = urlParams.get("proxyAccount") || "";

        // **确保当前域名可用**
        if (!currentDomain) {
            console.error("❌ 没有可用域名，无法跳转！");
            return;
        }

        // **拼接最终跳转 URL**
        let path = $(this).attr("data-url") || "/";
        let finalUrl = `${currentDomain}${path}?shareName=${shareName}&proxyAccount=${proxyAccount}`;
        console.log("🌍 最终跳转的 URL:", finalUrl);

        // **跳转**
        window.location.href = finalUrl;
    });

    // **初始化: 获取最新域名并检测**
    getCurrentDomain(() => testCurrentDomain());
});
