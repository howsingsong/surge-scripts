(function() {
  const cookie = $persistentStore.read("shopee_cookie");

  if (!cookie) {
    $notification.post("蝦皮簽到", "❌ 失敗", "請先執行取得 Cookie 的腳本");
    $done();
    return;
  }

  const url = "https://games-dailycheckin.shopee.tw/mkt/coins/api/v2/checkin_new";

  const body = {
    "device_fingerprint": $persistentStore.read("shopee_device_fp") || "",
    "entrance": 2,
    "dfp": $persistentStore.read("shopee_dfp") || "",
    "s": "",
    "tongdun_blackbox": ""
  };

  const options = {
    url: url,
    headers: {
      "content-type": "application/json",
      "user-agent": "iOS app iPhone Shopee appver=37326 language=zh-Hant app_type=1 platform=native_ios os_ver=26.4.2 Cronet/102.0.5005.61",
      "x-api-source": "rn",
      "check-in-origin": "coinspage",
      "x-shopee-client-timezone": "Asia/Taipei",
      "accept": "application/json",
      "cookie": cookie
    },
    body: JSON.stringify(body)
  };

  $httpClient.post(options, (error, response, data) => {
    if (error) {
      $notification.post("蝦皮簽到", "❌ 失敗", error);
      $done();
      return;
    }

    try {
      const result = JSON.parse(data);
      if (result.code === 0 && result.data && result.data.success) {
        const coins = result.data.increase_coins;
        const day = result.data.check_in_day;
        $notification.post("蝦皮簽到", "✅ 成功", `獲得 ${coins} 蝦幣，連續簽到第 ${day} 天`);
      } else {
        $notification.post("蝦皮簽到", "⚠️ 可能失敗", JSON.stringify(result.msg));
      }
    } catch (e) {
      $notification.post("蝦皮簽到", "❌ 解析失敗", data);
    }

    $done();
  });
})();
