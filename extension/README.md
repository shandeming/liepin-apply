# Auto Chat Helper

这是一个最小可用的 Chrome / Edge 浏览器扩展，用来在当前页面手动启动你那段自动点击“聊一聊”的脚本。

## 安装

1. 打开浏览器扩展管理页。
2. 开启“开发者模式”。
3. 选择“加载已解压的扩展程序”。
4. 选择这个 `extension/` 目录。

## 使用

1. 打开目标页面。
2. 点击扩展图标。
3. 点 `Start` 启动。
4. 点 `Stop` 停止。

## 可调整的地方

- 如果目标站点不是所有页面都需要，可以在 `manifest.json` 里改 `host_permissions`。
- 如果你想改成自动进入页面就运行，可以把注入逻辑改成 background + content script 模式。
