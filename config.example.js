/**
 * 配置文件（示例，不含任何真实密码/密钥）
 *
 * 使用方法：将本文件复制为 `config.js` 后，按需修改下面的密码等敏感字段。
 * 本文件会被 .gitignore 忽略，不会被提交/分享，避免泄露你的真实配置。
 *
 * 配置优先级：WEBDAV备份数据 > 环境变量 > config.js (本文件) > src/defaultConfig.ts (默认配置)
 */
module.exports = {
  // 同步服务名称
  "serverName": "lxserver",

  // 是否使用代理转发请求到本服务器
  "proxy.enabled": false,
  "proxy.header": "x-real-ip",

  // 服务绑定IP
  "bindIP": "0.0.0.0",
  // 服务监听端口
  "port": 9527,

  "user.enablePath": true,
  "user.enableRoot": false,
  "user.enablePublicRestriction": true,
  "user.enablePublicFavorites": false,
  "user.enablePublicNonAdminLocalMusic": false,
  "user.enablePublicNonAdminAccess": false,
  "user.enableLoginCacheRestriction": false,
  "user.enableCacheSizeLimit": false,
  "user.cacheSizeLimit": 2000,

  "maxSnapshotNum": 10,
  "list.addMusicLocationType": "top",
  "disableTelemetry": false,

  // 前端管理控制台访问密码（请改为你自己的强密码）
  "frontend.password": "CHANGE_ME",

  // 用户列表（请改为你自己的用户名/密码）
  "users": [
    {
      "name": "admin",
      "password": "CHANGE_ME"
    }
  ],

  // WebDAV 同步配置（可选，用于数据备份）
  "webdav.enable": false,
  "webdav.url": "",
  "webdav.username": "",
  "webdav.password": "",
  "webdav.syncPath": "/lx-sync",
  "webdav.backupPath": "/lx-sync-backups",

  "sync.interval": 60,
  "sync.backupInterval": 24,

  // Web播放器 访问密码
  "player.enableAuth": false,
  "player.password": "CHANGE_ME",

  "proxy.all.enabled": false,
  "proxy.all.address": "",

  "admin.path": "",
  "player.path": "/music",

  // Subsonic 协议配置
  "subsonic.enable": true,
  "subsonic.path": "/rest",
  "subsonic.enableDebug": false,
  "subsonic.onlineSearch": true,
  "subsonic.onlineSearchMode": "fallback",
  "subsonic.onlineSearchSources": "wy,tx,kw,kg,mg",
  "subsonic.lyricTranslation": true,

  "singer.sourcePriority": [
    "tx",
    "wy"
  ],
  "artist.maxFetchPages": 20,
  "cache.namingPattern": "simple",
  "system.allowUnsafeVM": false
}
