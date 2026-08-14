
const config: LX.Config = {
  serverName: 'lxserver', // 同步服务名称
  'proxy.enabled': false, // 是否使用代理转发请求到本服务器
  'proxy.header': 'x-real-ip', // 代理转发的请求头 原始IP
  bindIP: '0.0.0.0', // 绑定IP
  port: 9527, // 端口
  'user.enablePath': true, // 是否开启用户路径
  'user.enableRoot': false, // 是否开启根路径
  'user.enablePublicRestriction': true, // 是否启用公开用户权限限制
  'user.enablePublicNonAdminLocalMusic': false, // 是否开启非管理员访问本地音乐
  'user.enablePublicFavorites': false, // 是否开启公开收藏和歌曲
  'user.enablePublicNonAdminAccess': false, // 是否开启非管理员访问公开收藏和歌曲
  'user.enableLoginCacheRestriction': false, // 是否启用登录用户缓存限制
  'user.enableCacheSizeLimit': false, // 是否启用缓存空间限制
  'user.cacheSizeLimit': 2000, // 缓存空间限制大小 (MB)

  maxSnapshotNum: 10, // 公共最大备份快照数
  'list.addMusicLocationType': 'top', // 公共添加歌曲到我的列表时的位置 top | bottom，参考客户端的「设置 → 列表设置 → 添加歌曲到列表时的位置」
  disableTelemetry: false, // 是否禁用数据收集（仅用于开源项目改进，不含敏感信息）

  users: [
    // 用户配置例子
    // {
    //   name: 'user1', // 用户名，必须，不能与其他用户名重复
    //   password: '123.def', // 是连接密码，必须，不能与其他用户密码重复，若在外网，务必增加密码复杂度
    //   maxSnapshotNum: 10, // 可选，最大备份快照数
    //   'list.addMusicLocationType': 'top', // 可选，添加歌曲到我的列表时的位置 top | bottom，参考客户端的「设置 → 列表设置 → 添加歌曲到列表时的位置」
    // },
  ],

  'frontend.password': '123456',

  // WebDAV 配置
  'webdav.enable': false,
  'webdav.url': '',
  'webdav.username': '',
  'webdav.password': '',
  'webdav.syncPath': '/lx-sync', // 增量同步远程路径
  'webdav.backupPath': '/lx-sync-backups', // 全量备份远程路径
  'sync.interval': 60, // 同步间隔（分钟）默认1小时
  'sync.backupInterval': 24, // 全量备份间隔（小时）默认24小时

  // Web播放器配置
  'player.enableAuth': false,
  'player.password': '123456',

  // 代理配置
  'proxy.all.enabled': false,
  'proxy.all.address': '',

  // 访问路径配置
  'admin.path': '', // 后台管理路径，默认为根路径 /
  'player.path': '/music', // 播放器路径
  'subsonic.enable': true, // 是否启用 Subsonic 服务
  'subsonic.path': '/rest', // Subsonic 访问路径
  'subsonic.enableDebug': true, // 是否开启 Subsonic 调试日志模式
  'subsonic.onlineSearch': true, // 是否开启 Subsonic 在线全网搜索
  'subsonic.onlineSearchMode': 'fallback', // 在线搜索模式: fallback | merge | local_only
  'subsonic.onlineSearchSources': 'wy,tx,kw,kg,mg', // 在线搜索默认平台
  'subsonic.onlinePlaylists': true, // 是否把平台在线歌单(分类/按标签)暴露到 Subsonic 歌单列表
  'subsonic.onlineRadio': true, // 是否把"分类电台"暴露到 Subsonic 电台列表(由在线歌单分类自动生成, 无需手改模板/ID/名称)
  'subsonic.onlineRadioSongCap': 200, // 单个分类电台最多聚合的歌曲数(从各分类热门歌单里随机抽歌, 连续播放)
  'subsonic.publicUrl': '', // 公网可访问地址(如 https://lx.flewrudy.pp.ua)，用于生成电台 streamUrl 等绝对链接；留空则自动用请求 Host(仅局域网可用)。手机端走隧道时必须填写，否则电台 streamUrl 指向 localhost 无法播放
  'subsonic.onlinePlaylistSources': 'wy', // 暴露哪些平台的在线歌单(逗号分隔): wy(网易云) | tx(QQ音乐) | kw | kg | mg
  'subsonic.onlinePlaylistSource': 'wy', // 单平台回退值(当 onlinePlaylistSources 未设置时生效)
  'subsonic.onlinePlaylistTags': '', // 可选: 覆盖网易云分类(逗号分隔, 如 华语,古风,欧美)，留空用内置默认分类
  'subsonic.onlinePlaylistMaxTags': 25, // 每个平台最多取多少个分类(标签)
  'subsonic.onlinePlaylistPerTag': 6, // 每个分类最多暴露多少个热门歌单
  'subsonic.onlinePlaylistCount': 150, // 歌单列表最多暴露的在线歌单总数(硬上限)
  'subsonic.onlinePlaylistSongCap': 300, // 单个在线歌单最多返回的歌曲数(防止超大 payload)
  'subsonic.lyricTranslation': true, // 是否在 Subsonic 歌词中包含翻译
  'singer.sourcePriority': ['wy', 'tx'], // 歌手信息源优先级
  'artist.maxFetchPages': 20, // 歌手歌曲最大抓取页数
  'cache.namingPattern': 'simple', // 缓存命名规则
  'system.allowUnsafeVM': false, // 是否允许运行 VM 模式自定义源脚本
}

export default config
