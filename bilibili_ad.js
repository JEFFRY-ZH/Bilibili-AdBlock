/**
 * Quantumult X 哔哩哔哩去广告脚本
 * V1：仅处理首页推荐广告和开屏广告。
 * 不修改会员、播放画质、地区限制或正常 Banner。
 */

const requestUrl = $request.url;

function removeFeedAds(body) {
  if (!body.data || !Array.isArray(body.data.items)) return 0;

  const observedAdGotos = new Set(["ad_av", "ad_inline_av"]);
  const originalLength = body.data.items.length;

  body.data.items = body.data.items.filter((item) => {
    if (!item || typeof item !== "object") return true;

    if (item.ad_info && item.ad_info.is_ad === true) return false;
    if (observedAdGotos.has(item.card_goto)) return false;

    return true;
  });

  return originalLength - body.data.items.length;
}

function isMarkedAd(item) {
  return Boolean(
    item &&
      typeof item === "object" &&
      (item.is_ad === true ||
        (item.ad_info && item.ad_info.is_ad === true))
  );
}

function removeSplashListAds(body) {
  if (!body.data || typeof body.data !== "object") return 0;

  const splashItems = Array.isArray(body.data.list) ? body.data.list : [];
  const removedIds = new Set();

  body.data.list = splashItems.filter((item) => {
    if (!isMarkedAd(item)) return true;
    if (item.id !== undefined && item.id !== null) removedIds.add(item.id);
    return false;
  });

  const schedules = Array.isArray(body.data.show) ? body.data.show : [];
  body.data.show = schedules.filter((item) => !removedIds.has(item && item.id));

  const cachedIds = Array.isArray(body.data.keep_ids)
    ? body.data.keep_ids.length
    : 0;
  if (Array.isArray(body.data.keep_ids)) body.data.keep_ids = [];

  return (
    splashItems.length -
    body.data.list.length +
    (schedules.length - body.data.show.length) +
    cachedIds
  );
}

function removeSplashShowAds(body) {
  if (!body.data || typeof body.data !== "object") return 0;

  let removed = 0;

  if (Array.isArray(body.data.show)) {
    const originalLength = body.data.show.length;
    body.data.show = body.data.show.filter((item) => {
      if (isMarkedAd(item)) return false;
      if (item && isMarkedAd(item.splash_content)) return false;
      return true;
    });
    removed += originalLength - body.data.show.length;
  }

  if (isMarkedAd(body.data.splash_content)) {
    delete body.data.splash_content;
    removed += 1;
  }

  return removed;
}

try {
  const body = JSON.parse($response.body);
  let removed = 0;

  if (requestUrl.includes("/x/v2/feed/index")) {
    removed = removeFeedAds(body);
    console.log(`[哔哩哔哩去广告] 已删除首页推荐广告：${removed} 条`);
  } else if (requestUrl.includes("/x/v2/splash/show")) {
    removed = removeSplashShowAds(body);
    console.log(`[哔哩哔哩去广告] 已删除开屏广告相关数据：${removed} 条`);
  } else if (requestUrl.includes("/x/v2/splash/list")) {
    removed = removeSplashListAds(body);
    console.log(`[哔哩哔哩去广告] 已删除开屏广告相关数据：${removed} 条`);
  }

  $done({ body: JSON.stringify(body) });
} catch (error) {
  console.log(`[哔哩哔哩去广告] 响应解析失败，已保持原始内容：${error}`);
  $done({});
}
