<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.4.0-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.4.0)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Whale-orange?style=flat-square)](https://chromewebstore.google.com/detail/%EC%97%94%EB%93%9C%ED%95%84%EB%93%9C-%EC%9E%90%EB%8F%99-%EC%B6%9C%EC%84%9D%EC%B2%B4%ED%81%AC/djobkkgcmfhjbjodcdidelbmpmgalgga)

[![GitBook](https://img.shields.io/badge/Docs-GitBook-3884FF?style=for-the-badge&logo=gitbook&logoColor=white)](https://kgyujins-organization.gitbook.io/endfield/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/xog9)

<br/>

[🇰🇷 한국어](./README.md) | [🇺🇸 English](./README_EN.md) | [🇯🇵 日本語](./README_JA.md)

<br/>

**明日方舟：终末地 (SKPORT) 每日自动签到扩展**

Endfield Auto Check-in 是一款基于 Chromium 的浏览器扩展，  
可以在已登录状态下，在后台**自动执行**  
**明日方舟：终末地 (SKPORT)** 的每日签到。

</div>

---

## 📝 概述

| 项目 | 说明 |
| :--- | :--- |
| **平台** | Chrome, Edge, Whale 等基于 Chromium 的浏览器 |
| **版本** | 1.4.0 |
| **运行条件** | SKPORT 游戏官网登录状态 |
| **运行方式** | 本地浏览器后台自动化 |
| **外部通信** | 无 (除用户设置的 Discord 通知外) |

<br/>

## ✨ 主要功能

### 👻 隐形自动签到
- **静默自动化**: 浏览器启动时在后台静默运行。
- 不会干扰您的工作或遮挡屏幕。

### ⏰ 智能调度
- **智能定时器**: 自动计算游戏服务器重置时间 (UTC+8 00:00)。
- 如果当天已签到，不会重复运行。

### 🔔 Discord 通知
- **Webhook 集成**: 将签到成功/失败的消息直接发送到您的 Discord。
- **丰富的 Embed**: 显示获得的奖励缩略图和累计签到天数。
- **测试模式**: 立即验证您的 Webhook 设置是否正常工作。

### 🔒 安全的本地运行
- **本地运行**: 所有操作仅在您的浏览器内部进行。
- 除了您设置的 Discord Webhook 外，不会向外部发送任何个人信息。

### ⚡ 同步时立即运行
- **即时响应**: 账号绑定（更新）的同时尝试签到，提高便利性。

### 🛡️ 状态徽章
- 通过扩展图标直观地查看状态:
  - `(无徽章)` : ✅ 签到完成
  - `X` (红色) : ❌ 需要登录或发生错误

<br/>

## 🚀 安装方法

您可以直接从 Chrome 应用商店安装。

[![Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/i7m3Xbmb9d24ZkfbZ9rA.png)](https://chromewebstore.google.com/detail/%EC%97%94%EB%93%9C%ED%95%84%EB%93%9C-%EC%9E%90%EB%8F%99-%EC%B6%9C%EC%84%9D%EC%B2%B4%ED%81%AC/djobkkgcmfhjbjodcdidelbmpmgalgga)

1. 前往 [Chrome 应用商店页面](https://chromewebstore.google.com/detail/%EC%97%94%EB%93%9C%ED%95%84%EB%93%9C-%EC%9E%90%EB%8F%99-%EC%B6%9C%EC%84%9D%EC%B2%B4%ED%81%AC/djobkkgcmfhjbjodcdidelbmpmgalgga)。
2. 点击 **[添加至 Chrome]** 按钮。
3. 安装完成后，点击浏览器右上角的拼图图标🧩，固定📌 **Endfield Auto Check-in** 以便使用。

<br/>

## 📖 使用方法

1. **首次登录**: 请登录 SKPORT 终末地签到页面。
2. **自动运行**: 此后每次打开浏览器，扩展程序都会自动检查签到。
3. **查看状态**: 点击扩展程序图标即可查看运行日志和状态。
    - 也可以使用 `CHECK NOW` 按钮手动签到。

<br/>

## 🔧 故障排除

> [!WARNING]
> **"失败"状态或 "X" 徽章一直不消失？**

可能是登录会话过期或数据不同步导致的。请尝试以下步骤：

1. 点击扩展程序图标
2. 点击右上角的 **⚙️ 设置 (齿轮)** 图标
3. 点击 **[重置数据]** 按钮（安全清除所有扩展数据）
4. SKPORT 页面刷新后，**重新登录**
5. 按照弹窗提示重新进行 **[账号绑定]**

<br/>

## ⚖️ 免责声明与许可

- 本项目为非官方扩展程序。
- 用户需自行承担因使用本程序而产生的任何问题。
- **MIT License**
