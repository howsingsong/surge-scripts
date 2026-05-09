(function() {
  const cookie = $persistentStore.read("shopee_cookie");
  const deviceId = "F998219F00384F5FB52412A6C4DE3731";

  if (!cookie) {
    $notification.post("蝦蝦果園", "❌ 失敗", "請先取得 Cookie");
    $done();
    return;
  }

  const baseUrl = "https://games.shopee.tw/farm/api/orchard";
  const headers = {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Beeshop locale=zh-Hant version=37326 appver=37326 rnver=1777275849 shopee_rn_bundle_version=7002002 Shopee language=zh-Hant app_type=1 platform=web_ios os_ver=26.4.2",
    "fruit-version-type": "h5",
    "game-operation-source": "fruit_farm",
    "fruit-app-version": "37326",
    "games-biz-version": "9.7.1",
    "game-entrance": "normal",
    "origin": "https://games.shopee.tw",
    "referer": "https://games.shopee.tw/farm/",
    "accept": "*/*",
    "accept-language": "zh-TW,zh-Hant;q=0.9",
    "cookie": cookie
  };

  // 第一步：取得果園狀態
  $httpClient.get({
    url: `${baseUrl}/context/get?skipGuidance=0`,
    headers: headers
  }, (err, resp, data) => {
    if (err) {
      $notification.post("蝦蝦果園", "❌ 取得狀態失敗", err);
      $done();
      return;
    }

    const ctx = JSON.parse(data);
    if (ctx.code !== 0) {
      $notification.post("蝦蝦果園", "❌ 狀態錯誤", ctx.msg);
      $done();
      return;
    }

    const crops = ctx.data.crops;
    const crop = crops && crops[0];
    const cropId = crop ? crop.id : null;
    const cropState = crop ? crop.state : null;

    // state: 1=生長中, 2=可澆水, 100=可收成, 101=已收成待種
    let messages = [];

    // 如果可以收成
    if (cropState === 100 && cropId) {
      doHarvest(cropId, headers, baseUrl, deviceId, messages);
    } else {
      // 直接澆水
      doWater(cropId, headers, baseUrl, messages);
    }
  });
})();

function doHarvest(cropId, headers, baseUrl, deviceId, messages) {
  const metaId = 11516; // 預設種子 metaId
  $httpClient.post({
    url: `${baseUrl}/crop/harvest`,
    headers: headers,
    body: JSON.stringify({ metaId: metaId, deviceId: deviceId, cropId: cropId })
  }, (err, resp, data) => {
    if (!err) {
      const result = JSON.parse(data);
      if (result.code === 0) {
        messages.push("✅ 收成成功");
        // 收成後種植
        doCreate(metaId, headers, baseUrl, messages);
      } else {
        messages.push("⚠️ 收成失敗: " + result.msg);
        $notification.post("蝦蝦果園", messages.join(" | "), "");
        $done();
      }
    }
  });
}

function doCreate(metaId, headers, baseUrl, messages) {
  $httpClient.post({
    url: `${baseUrl}/crop/create`,
    headers: headers,
    body: JSON.stringify({ metaId: metaId, s: "" })
  }, (err, resp, data) => {
    if (!err) {
      const result = JSON.parse(data);
      if (result.code === 0) {
        messages.push("🌱 種植成功");
      } else {
        messages.push("⚠️ 種植失敗: " + result.msg);
      }
    }
    // 種植後澆水
    const newCropId = null; // 需要重新取得
    doWater(newCropId, headers, baseUrl, messages);
  });
}

function doWater(cropId, headers, baseUrl, messages) {
  const resourceId = 3474650667;
  if (!cropId) {
    $notification.post("蝦蝦果園", messages.join(" | ") || "完成", "無法澆水，cropId 未取得");
    $done();
    return;
  }
  $httpClient.post({
    url: `${baseUrl}/crop/water`,
    headers: headers,
    body: JSON.stringify({ s: "", resourceId: resourceId, cropId: cropId })
  }, (err, resp, data) => {
    if (!err) {
      const result = JSON.parse(data);
      if (result.code === 0) {
        messages.push("💧 澆水成功");
      } else {
        messages.push("⚠️ 澆水失敗: " + result.msg);
      }
    }
    $notification.post("蝦蝦果園", messages.join(" | "), "");
    $done();
  });
}
