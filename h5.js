$(document).ready(function () {
  console.log("✅ h5.js 已加载，等待 #jump-button 渲染...");

  // 备用域名列表（按优先级排序）
  window.domainList = [
    'https://zt.p98703.vip',
    'https://zt.p98704.vip',
    'https://qp.ampj.x94751.vip',
    'https://qp.ampj.x96762.vip',
    'https://qp.ampj.x93713.vip',
    'https://qp.ampj.x92729.vip',
    'https://qp.ampj.x95793.vip'
  ];

  window.currentDomainIndex = 0;  // 当前使用的域名索引
  let failCount = 0;  // 失败计数器
  const maxFailCount = 3;  // 失败超过 3 次就切换域名

  /**
   * 🔍 **检测域名可用性**
   * 通过 https://www.itdog.cn/http/ 进行检测
   */
  function checkDomainStatus(domain, callback) {
    let proxyUrl = "https://cors-anywhere.herokuapp.com/";
    let checkUrl = proxyUrl + `https://www.itdog.cn/http/${domain}`;
    $.get(checkUrl, function (data) {
        console.log(data);    
      console.log(`🔎 检测 ${domain} 可用`);
      if (data.includes("访问失败")) {
        failCount++;
        console.warn(`⚠️ ${domain} 访问失败 (${failCount}/${maxFailCount})`);
        callback(false);
      } else {
        console.log(`✅ ${domain} 正常可用！`);
        callback(true);
      }
    }).fail(function () {
      failCount++;
      console.error(`❌ ${domain} 检测失败 (${failCount}/${maxFailCount})`);
      callback(false);
    });
  }

  console.log("✅ h5.js 已成功加载");

  /**
   * 🔄 **切换到下一个可用域名**
   */
  function switchDomain() {
    if (failCount >= maxFailCount) {
      failCount = 0; // 重置失败计数
      currentDomainIndex++;

      if (currentDomainIndex >= domainList.length) {
        console.error("❌ 所有域名都不可用，请检查网络！");
        return;
      }

      console.log(`🔀 切换到下一个域名：${domainList[currentDomainIndex]}`);
    }
  }

  /**
   * 🔗 **绑定点击事件**
   * 改为直接在 DOM 加载完成后绑定
   */
  $(document).on("click", ".jump-button", function (e) {
    console.log("按钮点击事件触发！"); // 确保事件触发
    e.preventDefault(); // 防止默认行为
    let baseUrl = window.domainList[window.currentDomainIndex];
    let path = $(this).attr("data-url");
    let fullUrl = baseUrl + path;
    console.log("拼接的跳转 URL:", fullUrl); // 输出拼接后的 URL
  
    if (fullUrl) {
      window.location.href = fullUrl; // 使用 window.location.href 进行跳转
    }
  });
  

  // **初始化：检测当前域名状态**
  checkDomainStatus(domainList[currentDomainIndex], function (isAvailable) {
    if (!isAvailable) {
      switchDomain();
    }
  });
});
