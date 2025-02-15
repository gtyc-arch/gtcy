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
  ];
// 🔍 检测域名可用性，通过 https://www.itdog.cn/http/ 检查访问失败的地区
function checkDomainStatus(domain, callback) {
    let proxyUrl = "https://cors-anywhere.herokuapp.com/"; // CORS 代理
    let checkUrl = proxyUrl + `https://www.itdog.cn/http/${domain}`;
    
    $.get(checkUrl, function (data) {
        console.log(`🔎 检测 ${domain} 可用`);

        // 解析返回的结果，找出失败的地区
        let failRegions = 0;
        // 假设返回的 data 包含失败的地区信息
        // 这里是一个例子，你需要根据实际返回的数据格式做修改
        const regions = data.match(/访问失败/g) || []; // 查找 "访问失败" 的地区
        failRegions = regions.length;

        console.log(`⚠️ ${domain} 失败的地区数量：${failRegions}`);

        // 判断失败的地区数量
        if (failRegions >= maxFailCount) {
            failCount++;
            console.warn(`⚠️ ${domain} 访问失败超过 ${maxFailCount} 个地区，切换域名 (${failCount}/${maxFailCount})`);
            callback(false); // 失败，触发切换域名
        } else {
            console.log(`✅ ${domain} 可用！`);
            callback(true); // 成功，继续使用当前域名
        }
    }).fail(function () {
        failCount++;
        console.error(`❌ ${domain} 检测失败 (${failCount}/${maxFailCount})`);
        callback(false); // 失败，触发切换域名
    });
}

console.log("✅ h5.js 已成功加载");

// 🔄 切换到下一个可用域名
function switchDomain() {
    if (failCount >= maxFailCount) {
        failCount = 0; // 重置失败计数
        currentDomainIndex++;

        // 如果超过了域名列表的长度，就提示所有域名不可用
        if (currentDomainIndex >= domainList.length) {
            console.error("❌ 所有域名都不可用，请检查网络！");
            return;
        }

        console.log(`🔀 切换到下一个域名：${domainList[currentDomainIndex]}`);
        testCurrentDomain(); // 切换到下一个域名后，重新进行检测
    }
}

// 🔄 当前域名检测
function testCurrentDomain() {
    const domain = domainList[currentDomainIndex];
    checkDomainStatus(domain, function(isAvailable) {
        if (!isAvailable) {
            switchDomain(); // 如果当前域名不可用，切换到下一个域名
        } else {
            console.log(`🎉 当前域名 ${domain} 可用，继续使用！`);
        }
    });
}
// 启动时测试当前域名
testCurrentDomain();
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
