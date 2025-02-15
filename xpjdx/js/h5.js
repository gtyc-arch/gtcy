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
  
  // 🔍 检测域名可用性，通过 boce.com 检查访问失败的地区
 const axios = require('axios');

const apiUrl = 'https://api.boce.com/v1/domain/check';
const apiKey = 'a459f496daec3fbf742cf800e5700e54';
const domain = 'https://www.987631.vip';
   xios.get(`${apiUrl}?domain=${encodeURIComponent(domain)}&apiKey=${apiKey}`)
  .then(response => {
    console.log(`🔎 检测 ${domain} 可用`);
    let failRegions = response.data.failRegions || 0;
    console.log(`⚠️ ${domain} 失败的地区数量：${failRegions}`);
  })
  .catch(error => {
    console.error('❌ 请求失败', error);
  });

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
