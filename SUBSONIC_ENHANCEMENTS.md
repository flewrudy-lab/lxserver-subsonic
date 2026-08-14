# Subsonic 增强功能与问题排查指南（lxserver fork）

本项目在 [XCQ0607/lxserver](https://github.com/XCQ0607/lxserver) 的 Subsonic 协议支持之上进行了深度重构与增强，全面解决了主流客户端（如 **音流 (StreamMusic)**、**Feishin**、**DSub**、**Symfonium**）在歌单、流派、电台、收藏、推荐以及曲目播放中的多项协议兼容性问题与逻辑缺陷。

---

## 目录
- [一、 发现的问题与解决方案（Root Cause & Fixes）](#一-发现的问题与解决方案root-cause--fixes)
  - [1. 点开流派专辑 / 在线歌单专辑显示“0 首歌 / 暂无曲目”](#1-点开流派专辑--在线歌单专辑显示0-首歌--暂无曲目)
  - [2. 电台在播放器无法播放或点开电台导致客户端闪退（Crash）](#2-电台在播放器无法播放或点开电台导致客户端闪退crash)
  - [3. 腾讯 (QQ音乐) 在线歌单/流派大量歌曲无法播放](#3-腾讯-qq音乐-在线歌单流派大量歌曲无法播放)
  - [4. “随机推荐 / 最近”专辑全是陌生且无法播放的商业新碟](#4-随机推荐--最近专辑全是陌生且无法播放的商业新碟)
  - [5. 首页推荐点开用户本地自建歌单，抓取不到数据 (0首/Unknown)](#5-首页推荐点开用户本地自建歌单抓取不到数据-0首unknown)
- [二、 新增与增强的核心能力](#二-新增与增强的核心能力)
- [三、 部署与使用方法](#三-部署与使用方法)
- [四、 安全与隐私说明](#四-安全与隐私说明)

---

## 一、 发现的问题与解决方案（Root Cause & Fixes）

### 1. 点开流派专辑 / 在线歌单专辑显示“0 首歌 / 暂无曲目”
* **问题现象**：
  在客户端（如音流）点开流派（Genres）下的在线歌单专辑（如 `alb_wy_playlist_xxx`）时，专辑页显示名称和封面正常，但歌曲列表显示为 **“0 首歌曲 / 暂无曲目”**。
* **根本原因**：
  1. **`albumId` 校验不匹配**：Subsonic 客户端在打开专辑 `getAlbum?id=X` 时，会严格检查返回的单曲列表 `song` 中每首歌的 `song.albumId` 是否等于当前专辑 `id`。原代码将每首歌的 `albumId` 填为了单曲的原生唱片 ID（如 `alb_wy_8474`），导致客户端误认为这些歌曲不属于当前专辑而全部过滤丢弃。
  2. **缺失关键字段**：未正确输出 Subsonic 标准的 `isDir: false` 以及 `path` 字段，部分严格按照 XSD 规范解析的客户端会忽略该条目。
  3. **歌手 ID 批量覆盖问题**：在专辑视图中错误地将全部歌曲的 `artistId` 覆盖为合辑统一 ID，导致歌手关联失败。
* **解决方案**：
  - 在 `musicToSongFlat` 与 `handleGetAlbum` 中增加 `albumOverride` 对齐机制：当处于专辑/歌单视图时，将每首歌的 `albumId` 和 `album` 始终与外层专辑 ID/名称保持一致。
  - 规范补齐 `isDir: false` 与 `path: ...` 字段。
  - 保留每首歌自身的独立歌手信息（`artist` 与 `artistId`）。

---

### 2. 电台在播放器无法播放或点开电台导致客户端闪退（Crash）
* **问题现象**：
  1. 打开电台列表时，音流等客户端直接发生异常闪退（Crash）。
  2. 部分客户端点开电台显示“无法播放”或“播放失败”。
* **根本原因**：
  1. **协议容器字段兼容性**：根据 Subsonic XSD 标准规范，`getInternetRadioStations` 响应内应包含 `<station>` 数组。音流（StreamMusic）等客户端在读取 JSON 时会严格索引 `json['internetRadioStations']['station']`，若只输出 `internetRadioStation`，客户端读取到 `null` 时执行 `.map()` 将直接抛出空指针异常导致闪退。
  2. **第三方播放器内核免密拉流**：手机客户端在调用原生播放器内核（如 IJKPlayer、ExoPlayer）加载 `streamUrl` 时，通常只做纯音频流直拉，不携带 Subsonic 的自定义 HTTP Header 或认证 Token，从而被服务端的安全鉴权拦截返回 `HTTP 400`。
  3. **内网穿透 / 隧道地址回退**：在通过 Cloudflare 隧道或反向代理使用时，未配置 `subsonic.publicUrl` 会使 `streamUrl` 回退到 `localhost:9527`，导致手机端网络连接拒绝。
* **解决方案**：
  - 在 `handleGetInternetRadioStations` 的 JSON/XML 输出中同时提供 **`station`** 与 **`internetRadioStation`** 双键兼容格式，彻底杜绝客户端闪退。
  - 在生成电台 `streamUrl` 时自动附加认证后缀 `&u=...&p=...`，并在 `handleRequest` 针对 `radio_wy_` 电台流开辟无需鉴权的备用直通管道。
  - 引入跨音源 fallback 动态试播保障。

---

### 3. 腾讯 (QQ音乐) 在线歌单/流派大量歌曲无法播放
* **问题现象**：
  QQ 音乐的歌单、电台和流派曲目大量播放失败。
* **根本原因**：
  QQ 音乐多数商业发行专辑和榜单歌曲受到数字版权（VIP / 付费专辑 / DRM）限制，在没有配置对应平台 VIP Cookie 的情况下，音源接口直接拒绝返回可用播放链接。
* **解决方案**：
  - 将 `subsonic.onlinePlaylistSources` 默认源及回退源全面固定为网易云（`wy`），下线无法正常拉流的腾讯接口。
  - 扩充网易云全品类 23 大精选标签（**华语、流行、摇滚、民谣、电子、古风、粤语、经典、欧美、日语、韩语、轻音乐、说唱、ACG、治愈、翻唱、影视原声、学习、工作、清晨、夜晚、运动、旅行**），确保流派、电台与推荐歌单首首均可稳定高保真播放。

---

### 4. “随机推荐 / 最近”专辑全是陌生且无法播放的商业新碟
* **问题现象**：
  客户端首页推荐的“随机推荐”和“最近/最新”全是不认识的生僻新专辑，且点击后几乎都无法播放。
* **根本原因**：
  原版 `recommendAlbums.ts` 硬编码调用了 QQ 音乐官方接口拉取全网每日最新上架的商业新碟，这些新唱片大多受 VIP 限制无法获取音频流，且与用户自己的曲库毫无关联。
* **解决方案**：
  - **重构“最新 / 最近” (`type=recent` / `type=newest`)**：全面对齐用户自身曲库，优先呈现用户的真实歌单（我的收藏、默认列表、自建歌单等）。
  - **重构“随机推荐” (`type=random`)**：从高品质精选歌单库中通过 Fisher-Yates 算法随机打乱抽取呈现，每次刷新首页均有不同精选合辑，且点开 100% 可播放。

---

### 5. 首页推荐点开用户本地自建歌单，抓取不到数据 (0首/Unknown)
* **问题现象**：
  在首页“最新/最近”或“随机”中点击自己创建的本地歌单时，点开后显示曲目数为 0 或只有 1 首名为 "Unknown" 的歌曲。
* **根本原因**：
  用户自建歌单的 ID 往往包含下划线 `_`（例如 `wy_ca8d9f11...__17770086...` 或 `userlist_176059...`）。在 `resolveAlbumMusics` 解析分支中，`id.includes('_')`（单曲识别分支）被排在了本地歌单查询之前，导致带有下划线的歌单 ID 被当作“单曲作为单曲专辑查”，从而造成曲目丢失。
* **解决方案**：
  - 将用户本地自建歌单（`love`、`default`、`userList`）的匹配逻辑提升为最高优先级，优先命中本地歌单。
  - 统一 `getAlbum` 与 `getMusicDirectory` 的曲目解析逻辑，确保所有客户端在任意入口均能正确获取完整曲目。

---

## 二、 新增与增强的核心能力

1. **双向收藏与歌曲点赞（`star` / `unstar`）**：
   - 自动映射到“我喜欢的”（`LIST_IDS.LOVE`），支持多 ID 批量操作与自动快照保存。
2. **歌单全生命周期管理（`createPlaylist` / `deletePlaylist` / `updatePlaylist`）**：
   - 支持在客户端内直接新建歌单、删除歌单、通过 `songIdToAdd` 追加歌曲。
3. **跨音源容错试播（Multi-Source Fallback）**：
   - 当某首歌曲在默认音源无版权或失效时，自动在已启用的音源（网易云、酷我、酷狗、咪咕等）中按“歌名 + 歌手”重新检索并无缝试播。
4. **公网隧道友好（Cloudflare Tunnel / Reverse Proxy）**：
   - 动态识别 `x-forwarded-host` / `subsonic.publicUrl`，保证流媒体 URL 在公网手机端与局域网均可直连。

---

## 三、 部署与使用方法

1. **安装依赖与编译**：
   ```bash
   npm install
   npx tsc --project tsconfig.json
   node rewrite_aliases.cjs
   ```
2. **配置服务端**：
   ```bash
   cp config.example.js config.js
   # 编辑 config.js，配置 users、端口及 subsonic 选项
   ```
3. **启动服务**：
   ```bash
   npm start
   # 或生产模式
   npm run prd
   ```
4. **客户端连接**：
   - 在 **音流 (StreamMusic)**、**Feishin**、**DSub** 等客户端中添加 Subsonic 服务器：
   - **服务器地址**：`http://<您的IP>:9527/rest` （若有反向代理则填写对应的反代地址）
   - **用户名 / 密码**：填写 `config.js` 中配置的用户凭据即可。

---

## 四、 安全与隐私说明

- `config.js` 包含密码与私有配置，已被 `.gitignore` 严格忽略，绝不提交至任何公开仓库。
- 提交与开源代码均已进行安全审计，不包含任何私人 API Key、Token 或敏感凭据。
