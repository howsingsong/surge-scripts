const body = JSON.parse($request.body);
if (body && body.s) {
  $persistentStore.write(body.s, "shopee_farm_s");
  $persistentStore.write(String(body.cropId), "shopee_farm_cropid");
  $persistentStore.write(String(body.resourceId), "shopee_farm_resourceid");
}
$done({});
