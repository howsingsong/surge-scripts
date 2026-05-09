(function() {
  const body = JSON.parse($request.body);
  if (!body || !body.s) {
    $done({});
    return;
  }

  // 儲存 token
  $persistentStore.write(body.s, "shopee_farm_s");
  $persistentStore.write(String(body.cropId), "shopee_farm_cropid");
  $persistentStore.write(String(body.resourceId), "shopee_farm_resourceid");

  const cookie = $request.headers["cookie"] || $request.headers["Cookie"];
  const headers = Object.assign({}, $request.headers);

  // 多澆幾次
  let count = 0;
  function waterAgain() {
    if (count >= 5) {
      $notification.post("蝦蝦果園", "💧 自動多澆了5次", "");
      $done({});
      return;
    }
    count++;
    $httpClient.post({
      url: $request.url,
      headers: headers,
      body: JSON.stringify(body)
    }, (err, resp, data) => {
      waterAgain();
    });
  }

  waterAgain();
})();
