const cookie = $request.headers["cookie"] || $request.headers["Cookie"];

if (cookie && cookie.includes("shopee_token")) {
  $persistentStore.write(cookie, "shopee_cookie");
}

$done({});
