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
    e.preventDefault();  // 阻止默认行为

    // 获取当前页面 URL 中的 shareName 参数
    let urlParams = new URLSearchParams(window.location.search);
    let shareName = urlParams.get('shareName');  // 获取当前页面中的 shareName 参数
    console.log("主链接中的 shareName 参数:", shareName);

    // 获取 proxyAccount 参数（可以是 window.location 或其他方式）
    let proxyAccount = window.location.host;  // 假设使用 host 作为 proxyAccount，或者根据需要修改

    // 获取 data-url
    let targetUrl = $(this).attr("data-url");

    // 拼接目标 URL，确保添加 shareName 和 proxyAccount
    let fullUrl = targetUrl + "?shareName=" + (shareName || "") + "&proxyAccount=" + (proxyAccount || "");

    console.log("拼接后的跳转 URL:", fullUrl);  // 查看拼接后的完整 URL

    // 使用 window.open 进行跳转
    if (fullUrl) {
        window.open(fullUrl, "_blank");  // 打开新标签页
    }
});



  

  // **初始化：检测当前域名状态**
  checkDomainStatus(domainList[currentDomainIndex], function (isAvailable) {
    if (!isAvailable) {
      switchDomain();
    }
  });
});
