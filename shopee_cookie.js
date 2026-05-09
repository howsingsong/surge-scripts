const url = $request.url;
const headers = $request.headers;
const cookie = headers["cookie"] || headers["Cookie"];

if (cookie) {
  $persistentStore.write(cookie, "shopee_cookie");
  console.log("Cookie 已儲存");
}

$done({});
