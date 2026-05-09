(function() {
  const cookie = $persistentStore.read("shopee_cookie");
  const deviceId = "F998219F00384F5FB52412A6C4DE3731";
  const sToken = "AAAAAAAAAAAAAAAAAAAAf7fQAsIMfKz3luwh03omwFgQVsJwujVXhSMUS3uw9+uQZ0oWZs2L9MNMXJneih4AA==";

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
    let messages = [];

    if (cropState === 100 && cropId) {
      doHarvest(cropId, headers, baseUrl, deviceId, sToken, messages);
    } else if (!cropId) {
      doCreate(11516, headers, baseUrl, sToken, messages, null);
    } else {
      doWater(cropId, headers, baseUrl, sToken, messages);
    }
  });
})();

function doHarvest(cropId, headers, baseUrl, deviceId, sToken, messages) {
  const metaId = 11516;
  $httpClient.post({
    url: `${baseUrl}/crop/harvest`,
    headers: headers,
    body: JSON.stringify({ metaId: metaId, deviceId: deviceId, cropId: cropId })
  }, (err, resp, data) => {
    if (!err) {
      const result = JSON.parse(data);
      if (result.code === 0) {
        messages.push("✅ 收成成功");
        doCreate(metaId, headers, baseUrl, sToken, messages, cropId);
      } else {
        messages.push("⚠️ 收成失敗: " + result.msg);
        $notification.post("蝦蝦果園", messages.join(" | "), "");
        $done();
      }
    } else {
      $notification.post("蝦蝦果園", "❌ 收成錯誤", err);
      $done();
    }
  });
}

function doCreate(metaId, headers, baseUrl, sToken, messages, oldCropId) {
  $httpClient.post({
    url: `${baseUrl}/crop/create`,
    headers: headers,
    body: JSON.stringify({ metaId: metaId, s: sToken })
  }, (err, resp, data) => {
    if (!err) {
      const result = JSON.parse(data);
      if (result.code === 0) {
        messages.push("🌱 種植成功");
        const newCropId = result.data && result.data.crop ? result.data.crop.id : oldCropId;
        doWater(newCropId, headers, baseUrl, sToken, messages);
      } else {
        messages.push("⚠️ 種植失敗: " + result.msg);
        doWater(oldCropId, headers, baseUrl, sToken, messages);
      }
    } else {
      $notification.post("蝦蝦果園", "❌ 種植錯誤", err);
      $done();
    }
  });
}

function doWater(cropId, headers, baseUrl, sToken, messages) {
  const resourceId = 3474650667;
  if (!cropId) {
    $notification.post("蝦蝦果園", messages.join(" | ") || "完成", "無法澆水");
    $done();
    return;
  }
  $httpClient.post({
    url: `${baseUrl}/crop/water`,
    headers: headers,
    body: JSON.stringify({ s: sToken, resourceId: resourceId, cropId: cropId })
  }, (err, resp, data) => {
    if (!err) {
      const result = JSON.parse(data);
      if (result.code === 0) {
        messages.push("💧 澆水成功");
      } else {
        messages.push("⚠️ 澆水失敗: " + result.msg);
      }
    } else {
      messages.push("❌ 澆水錯誤: " + err);
    }
    $notification.post("蝦蝦果園", messages.join(" | "), "");
    $done();
  });
}
