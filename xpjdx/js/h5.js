$(document).ready(function () {
  console.log("✅ h5.js 已加载，等待 #jump-button 渲染...");

  // 备用域名列表（按优先级排序）
  var domainList = [
      'https://www.987631.vip',
      'https://zt.p98704.vip',
      'https://qp.ampj.x94751.vip',
      'https://qp.ampj.x96762.vip',
      'https://qp.ampj.x93713.vip',
      'https://qp.ampj.x92729.vip',
      'https://qp.ampj.x95793.vip'
  ];

var currentDomainIndex = 0;

  /**
   * 🔍 **检测域名可用性**
   * 通过 https://www.itdog.cn/http/ 进行检测
   */
  function testDomainAvailability(domain) {
  return new Promise((resolve, reject) => {
    $.get('https://www.itdog.cn/http/' + domain, function(response) {
      let failedRegions = 0;
      // 假设返回的数据中，有一个`regions`数组，包含访问结果
      response.regions.forEach(region => {
        if (region.status === '失败') {
          failedRegions++;
        }
      });

      // 如果访问失败的地区数大于等于5，就认为此域名不可用
      if (failedRegions >= 5) {
        reject('访问失败地区超过5个');
      } else {
        resolve('域名可用');
      }
    }).fail(function() {
      reject('测速请求失败');
    });
  });
}

// 切换域名函数
function switchToNextDomain() {
  currentDomainIndex++;
  if (currentDomainIndex >= domainList.length) {
    alert("所有域名均不可用，请检查网络");
    return;
  }

  let currentDomain = domainList[currentDomainIndex];
  console.log("正在检测域名：", currentDomain);

  // 测试当前域名
  testDomainAvailability(currentDomain)
    .then(function(successMessage) {
      console.log(successMessage);
      // 如果域名可用，继续使用当前域名
      window.location.href = currentDomain + "/#/?shareName=" + currentDomain;
    })
    .catch(function(errorMessage) {
      console.log(errorMessage);
      // 如果域名不可用，切换到下一个域名
      switchToNextDomain();
    });
}

// 初始化检查
switchToNextDomain();
