# Joker-dog-uni

一个基于 `uni-app` + Vue 3 的“每日舔狗语录”小应用。

应用当前提供单页体验，支持：

- 拉取远端舔狗语录，并在接口失败时回退到本地语录
- 背景音乐循环播放与手动开关
- 打字机式语录展示效果
- 将当前语录导出为图片
- 兼容 `H5` 与部分小程序 / App 场景的安全区与平台差异

## 功能预览

首页包含以下核心交互：

- `再舔一句`：请求最新语录
- `保存成图片`：将当前语录导出为海报图片
- 左上角音乐按钮：控制背景音乐播放 / 暂停

语录获取会依次尝试以下接口：

- `https://v2.xxapi.cn/api/dog`
- `https://api.lvxiaodong.com/api/dog`

如果所有远端接口都失败，会自动切换到内置离线语录，保证页面始终可用。

## 技术栈

- `uni-app`
- `Vue 3`
- `SCSS`
- `uni.request` / `canvas` / `InnerAudioContext`

## 项目结构

```text
.
├── App.vue                  # 应用生命周期与全局样式
├── main.js                  # Vue 3 应用入口
├── manifest.json            # uni-app 平台配置
├── pages.json               # 页面路由与全局导航配置
├── pages/
│   └── index/
│       └── index.vue        # 主页面：语录展示、音乐控制、导出图片
├── static/                  # 静态资源（图片、音频、图标）
├── utils/
│   └── index.js             # 语录归一化、请求封装、离线兜底、导图逻辑
└── unpackage/               # 构建产物（不要手动修改）
```

## 本地开发

使用 `HBuilderX` 打开项目进行开发。

### 启动方式

1. 使用 `HBuilderX` 打开项目根目录
2. 通过运行菜单选择目标平台：
   - `运行到浏览器（H5）`
   - `运行到微信开发者工具`
   - `运行到手机或模拟器`

### 说明

- `unpackage/` 是生成目录，不是源码
- 代码改动应以 `pages/`、`utils/`、`static/` 等源文件为准
- H5 路由模式当前配置为 `history`

## 实现说明

### 1. 语录获取与兜底

语录请求逻辑位于 `utils/index.js`，会对不同接口返回结构做归一化处理。当前支持自动从常见字段中提取文本，例如：

- `data`
- `text`
- `content`
- `msg`
- `result`
- `quote`
- `dog`
- `sentence`
- `hitokoto`

这意味着新增语录接口时，通常只需要在页面里的 `endpoints` 数组中追加地址，不必重写渲染逻辑。

### 2. 背景音乐

页面加载时会创建 `InnerAudioContext`，并在页面可用后尝试自动播放：

- 音频资源：`static/lei.mp3`
- 支持循环播放
- 页面卸载时会销毁音频实例，避免资源泄漏

### 3. 图片导出

“保存成图片”功能由页面状态与工具函数共同完成：

- 页面提供当前语录、图片资源、画布尺寸
- `utils/index.js` 负责绘制导出海报
- `H5` 端通过下载链接导出 PNG
- 非 `H5` 端调用 `uni.saveImageToPhotosAlbum` 保存到相册

如果你要调整海报布局，请同步检查：

- 页面中的隐藏 `canvas` 尺寸状态
- `utils/index.js` 内部绘制尺寸与排版参数

## 主要配置文件

### `pages.json`

当前仅注册了一个页面：

- `pages/index/index`

导航栏标题为“每日舔狗语录”，并使用自定义导航样式。

### `manifest.json`

包含以下平台相关配置：

- 应用基础信息（名称、版本号、AppID）
- `H5` 标题与路由模式
- 微信小程序 `appid`
- Android / iOS 打包资源配置
