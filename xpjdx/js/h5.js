$(document).ready(function () {
    console.log("✅ h5.js 已加载，等待 #jump-button 渲染...");

// 备用域名列表
let domainList = [
        'https://www.987631.vip',
        'https://zt.p98704.vip',
        'https://qp.ampj.x94751.vip',
        'https://qp.ampj.x96762.vip',
        'https://qp.ampj.x93713.vip',
        'https://qp.ampj.x92729.vip',
        'https://qp.ampj.x95793.vip'
    ];

// 当前正在使用的备用域名索引
let currentDomainIndex = 0;

// 功能：检测指定的域名访问情况
function checkDomainAvailability(domain) {
    return fetch(`https://www.itdog.cn/http/${domain}`)
        .then(response => response.json()) // 假设返回的是JSON格式
        .then(data => {
            // 假设返回的data包含'failureRegions'字段，表示失败的地区数量
            return data.failureRegions >= 100; // 如果失败的地区 >= 100，则返回true
        })
        .catch(() => {
            console.error("无法连接到测速服务器");
            return true; // 如果发生错误，默认返回失败
        });
}

// 更新域名到下一个备用域名
function switchToNextDomain() {
    currentDomainIndex = (currentDomainIndex + 1) % domainList.length;
    console.log(`切换到备用域名: ${domainList[currentDomainIndex]}`);
}

// 自动检查并切换域名
async function autoSwitchDomain() {
    const currentDomain = domainList[currentDomainIndex];
    const isUnavailable = await checkDomainAvailability(currentDomain);

    if (isUnavailable) {
        console.log(`域名 ${currentDomain} 访问失败，切换到下一个域名`);
        switchToNextDomain();
    } else {
        console.log(`域名 ${currentDomain} 正常，继续使用`);
    }
}

// 定时检查域名的可用性
setInterval(autoSwitchDomain, 60000); // 每1分钟检测一次
    /**
     * 🔗 **绑定点击事件**
     * 改为直接在 DOM 加载完成后绑定
     */
    $(document).on("click", ".jump-button", function (e) {
        e.preventDefault();  // 阻止默认行为

        // 获取当前页面的 shareName 和 proxyAccount 参数
        var urlParams = new URLSearchParams(window.location.search);
        var shareName = urlParams.get("shareName") || "";
        var proxyAccount = urlParams.get("proxyAccount") || "";

        // 获取基础URL和data-url
        let baseUrl = window.domainList[window.currentDomainIndex];
        let path = $(this).attr("data-url");

        // 确保在拼接 URL 时正确添加斜杠
        let fullUrl = baseUrl + (path.startsWith("/") ? path : "/" + path);
        console.log("拼接的跳转 URL:", fullUrl);  // 输出拼接后的 URL

        // 拼接 shareName 和 proxyAccount 参数
        let finalUrl = fullUrl + `?shareName=${shareName}&proxyAccount=${proxyAccount}`;
        console.log("最终跳转的 URL:", finalUrl);  // 输出最终的 URL

        // 如果拼接的URL有效，进行跳转
        if (finalUrl) {
            window.location.href = finalUrl;  // 使用 window.location.href 进行跳转
        }
    });

    // **初始化：检测当前域名状态**
    checkDomainStatus(domainList[currentDomainIndex], function (isAvailable) {
        if (!isAvailable) {
            switchDomain();
        }
    });
});
