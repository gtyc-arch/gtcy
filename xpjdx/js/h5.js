$(document).ready(function () {
    console.log("✅ h5.js 已加载，等待 #jump-button 渲染...");

    let currentDomain = "";
    const proxyServer = "https://vfh8739.vip:38271"; // 代理服务器地址

    // **🔥 获取当前可用域名**
    function getCurrentDomain(callback) {
        $.get(`${proxyServer}/proxy/current-domain`, function (data) {
            if (data.domain) {
                currentDomain = data.domain; // 保持原始协议（HTTPS）
                console.log(`✅ 服务器返回当前可用域名: ${currentDomain}`);
                callback(true);
            } else {
                console.warn("⚠️ 没有可用域名");
                callback(false);
            }
        }).fail(function () {
            console.error("❌ 无法从服务器获取可用域名");
            callback(false);
        });
    }

    /**
     * 🔗 **绑定点击事件**
     * 让用户点击 "立即访问" 按钮时，跳转到最新可用的域名
     */
    $(document).on("click", ".jump-button", function (e) {
        e.preventDefault();

        let urlParams = new URLSearchParams(window.location.search);
        let shareName = urlParams.get("shareName") || "";
        let proxyAccount = urlParams.get("proxyAccount") || "";

        if (!currentDomain) {
            console.error("❌ 没有可用域名，无法跳转！");
            return;
        }

        let path = $(this).attr("data-url") || "/";
        let finalUrl = `${currentDomain}${path}?shareName=${shareName}&proxyAccount=${proxyAccount}`;
        console.log("🌍 最终跳转的 URL:", finalUrl);

        window.location.href = finalUrl;
    });

    // **初始化: 获取最新域名**
    getCurrentDomain(() => console.log("✅ 已获取最新可用域名"));
});
