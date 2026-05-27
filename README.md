# Auto Chat Helper

这是一个最小可用的 Chrome / Edge 浏览器扩展，用来在猎聘首页或职位页手动启动自动点击“聊一聊”的脚本。

## 安装

1. 打开浏览器扩展管理页。
2. 开启“开发者模式”。
3. 选择“加载已解压的扩展程序”。
4. 选择这个 `extension/` 目录。
5. 打开或刷新猎聘页面，让 `content.js` 注入到页面中。

## 使用

1. 打开目标页面。
2. 点击扩展图标。
3. 点 `Start` 启动。
4. 点 `Stop` 停止。

当前会自动识别两种页面：

- 首页：`https://c.liepin.com/`
- 职位页：包含 `https://www.liepin.com/zhaopin/`

职位页会按页处理：

1. 当前页逐个点“聊一聊”
2. 点击 `.ant-pagination-next`
3. 等待新页 DOM 出现
4. 继续下一页

## 可调整的地方

- 如果目标站点不是所有页面都需要，可以在 `manifest.json` 里改 `content_scripts.matches`。
- 现在已经是 `popup -> sendMessage -> content.js` 的标准结构。
