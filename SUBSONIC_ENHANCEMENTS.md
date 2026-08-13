# Subsonic 增强功能（lxserver fork）

本 fork 在 [XCQ0607/lxserver](https://github.com/XCQ0607/lxserver) 的 Subsonic 协议支持之上，
补充了若干音乐客户端（如 **音流 / Feishin**）常用、但原版未实现的接口，让“点赞/收藏歌曲”
和“收藏（创建/删除）歌单”等操作可以在 Subsonic 客户端里正常工作。

> 所有改动都集中在 `src/server/subsonic.ts`，通过标准 Subsonic / OpenSubsonic 接口暴露，
> 客户端无需任何定制即可使用。

## 新增 / 修复的能力

### 1. 收藏歌曲（`star` / `unstar`） → “我喜欢的”
- `star?id=xxx`：把歌曲加入“我喜欢的”（`LIST_IDS.LOVE`）。
- `unstar?id=xxx`：从“我喜欢的”移除。
- 支持一次传多个 `id`。
- 解析歌曲时优先命中在线缓存，其次遍历本地歌单；对于“刚浏览过但尚未收藏”的歌曲，
  会根据 Subsonic id（`${source}_${songId}`）反推最小可用 `MusicInfo`，确保收藏操作始终生效。
- 每次操作后调用 `createSnapshot()` 持久化快照，重启不丢。

### 2. 收藏歌单（`createPlaylist` / `deletePlaylist` / `updatePlaylist`）
- `createPlaylist?name=xxx&songId=...`：新建用户歌单，可选附带初始歌曲。
- `deletePlaylist?id=xxx`：删除指定用户歌单。
- `updatePlaylist?playlistId=xxx&songIdToAdd=...`：向已有歌单追加歌曲
  （原版仅支持按索引删除，这里补齐了 `songIdToAdd` 追加能力）。
- 同样会 `createSnapshot()` 持久化。

### 3. 其他健壮性改进（同一文件内）
- 电台（`getInternetRadioSongs` / `getRadioSongs`）：过滤 QQ 电台接口偶发的垃圾条目
  （歌名为空或歌名等于 `songmid`）。
- `getSong`：当歌曲缺少元数据时，按 `songmid` 跨音源在线反查补全歌名/歌手。
- 播放地址解析：主音源取不到播放地址时，按“歌名+歌手”跨其它已启用音源重新搜索并试播
  （fallback 模式），解决推荐/收藏歌曲在绑定音源无版权/下架时无法播放的问题。
- `getSongsByGenre`：过滤垃圾条目。

## 如何使用

1. 安装依赖并构建：
   ```bash
   npm install
   npm run build
   ```
2. 复制配置模板并按需修改（**不要提交 `config.js`**，它包含你的密码）：
   ```bash
   cp config.example.js config.js
   # 编辑 config.js 设置 frontend.password / users 等
   ```
3. 启动：
   ```bash
   npm start
   # 或生产模式： npm run prd
   ```
4. 在 Subsonic 客户端（音流 / Feishin 等）中用 `http://<host>:9527/rest` 作为 Subsonic 地址，
   用户名/密码填写 `config.js` 中的 `users` 配置即可。之后即可正常“点赞/收藏歌曲”“创建/删除歌单”。

## 已知限制
- 本 fork 的改动**仅作用于源码**（`src/server/subsonic.ts`）。如果你之前是用“直接修改运行容器中
  已编译的 `subsonic.js`”的方式打过补丁，请改用本仓库重新 `npm run build` 部署，以保证源码与运行一致。
- `createPlaylist` 生成的是本地用户歌单，跨用户隔离。

## 安全提示
- `config.js` 含密码等敏感信息，已被 `.gitignore` 忽略，**不会被提交**。
- 请使用 `config.example.js` 作为模板，切勿把真实密码提交到任何仓库。
