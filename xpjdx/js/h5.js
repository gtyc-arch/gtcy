$(document).ready(function () {
  console.log("✅ h5.js 已加载，等待 #jump-button 渲染...");

  // 备用域名列表（按优先级排序）
  window.domainList = [
      'https://www.987631.vip',
      'https://zt.p98704.vip',
      'https://qp.ampj.x94751.vip',
      'https://qp.ampj.x96762.vip',
      'https://qp.ampj.x93713.vip',
      'https://qp.ampj.x92729.vip',
      'https://qp.ampj.x95793.vip'
  ];

  window.currentDomainIndex = 0;  // 当前使用的域名索引
let failCount = 0;  // 失败计数器
const maxFailCount = 5;  // 失败地区超过 5 个就切换域名

/**
 * 🔍 **检测域名可用性**
 * 通过 https://www.itdog.cn/http/ 进行检测，检测失败的地区数
 */
function checkDomainStatus(domain, callback) {
    let proxyUrl = "https://cors-anywhere.herokuapp.com/";
    let checkUrl = proxyUrl + `https://www.itdog.cn/http/${domain}`;

    $.get(checkUrl, function (data) {
        console.log(data);
        
        // 从返回的数据中提取访问失败地区的数量
        const failRegionsCount = (data.match(/访问失败/g) || []).length; // 查找所有 "访问失败" 的出现次数

        console.log(`🔎 检测 ${domain} 可用，访问失败地区数：${failRegionsCount}`);

        // 如果访问失败的地区数超过 maxFailCount，则切换域名
        if (failRegionsCount >= maxFailCount) {
            failCount++;
            console.warn(`⚠️ ${domain} 访问失败地区数超过 ${maxFailCount}，切换域名！`);
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
        failCount = 0;  // 重置失败计数
        currentDomainIndex++;  // 切换到下一个域名

        // 判断是否还有域名可用
        if (currentDomainIndex >= domainList.length) {
            console.error("❌ 所有域名都不可用，请检查网络！");
            return;
        }

        console.log(`🔀 切换到下一个域名：${domainList[currentDomainIndex]}`);
        // 开始检测下一个域名
        checkDomainStatus(domainList[currentDomainIndex], function(isAvailable) {
            if (!isAvailable) {
                switchDomain();  // 如果下一个域名仍不可用，继续切换
            }
        });
    }
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
switchToNextDomain();
      }
  });
});
