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
    
    const apiKey = "5de3a1449e8f59b183b908c557c56887"; // API 密钥

    // 🔍 使用 Boce.com API 检测域名可用性
    function checkDomainStatus(domain, callback) {
        let checkUrl = `https://www.boce.com/api/check/?key=${apiKey}&url=${domain}`;
        
        $.get(checkUrl, function (data) {
            console.log(`🔎 检测 ${domain} 可用性`);

            if (data.status === "success" && data.data.available) {
                console.log(`✅ ${domain} 可用！`);
                callback(true);
            } else {
                failCount++;
                console.warn(`⚠️ ${domain} 不可用，切换域名 (${failCount}/${maxFailCount})`);
                callback(false);
            }
        }).fail(function () {
            failCount++;
            console.error(`❌ ${domain} 检测失败 (${failCount}/${maxFailCount})`);
            callback(false);
        });
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
        checkDomainStatus(domain, function (isAvailable) {
            if (!isAvailable) {
                switchDomain();
            } else {
                console.log(`🎉 当前域名 ${domain} 可用，继续使用！`);
            }
        });
    }

    // **初始化：检测当前域名状态**
    checkDomainStatus(domainList[currentDomainIndex], function (isAvailable) {
        if (!isAvailable) {
            switchDomain();
        }
    });
});
