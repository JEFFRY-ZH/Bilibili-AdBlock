# Quantumult X 哔哩哔哩去广告

基于 Bilibili iOS 9.13.0 的实际 HAR 响应编写。

V1 仅处理：

- 首页推荐流广告：`/x/v2/feed/index`
- 当前开屏广告：`/x/v2/splash/show`
- 开屏预加载与缓存排期：`/x/v2/splash/list`

不会修改 VIP、会员、画质、地区限制或正常首页 Banner。

## Quantumult X 使用方法

1. 打开 Quantumult X。
2. 进入“设置 → 重写 → 引用”。
3. 添加下面的订阅地址：

   `https://raw.githubusercontent.com/JEFFRY-ZH/Bilibili-AdBlock/main/Bilibili.conf`

4. 启用该引用，并关闭其他会处理相同 Bilibili 接口的旧规则。
5. 确认 MitM 已开启、证书已安装并完全信任。
6. 完全退出 Bilibili 后重新打开，再测试开屏和首页推荐。

## 当前过滤依据

首页推荐只删除 HAR 中确认的广告特征：

- `ad_info.is_ad === true`
- `card_goto === "ad_av"`
- `card_goto === "ad_inline_av"`

不使用 `card_type` 白名单，因此正常视频、直播和 `banner_v8` Banner 会保留。

开屏规则处理 HAR 中确认的结构：

- `data.show[].splash_content.is_ad === true`
- `data.list[].is_ad === true`
- 删除与广告素材关联的 `data.show` 排期
- 清空 `data.keep_ids`，避免继续保留旧开屏广告缓存
