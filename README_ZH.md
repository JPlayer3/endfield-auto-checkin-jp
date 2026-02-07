<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.5.0-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.5.0)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/xog9)

<br/>

[🇰🇷 한국어](./README.md) | [🇺🇸 English](./README_EN.md) | [🇯🇵 日本語](./README_JA.md)

<br/>

---

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
| **版本** | 1.5.0 |
| **运行条件** | SKPORT 游戏官网登录状态 |
| **运行方式** | 本地浏览器后台自动化 (Hidden Window) |
| **外部通信** | 无 (除用户设置的 Discord 通知外) |



## ✨ 主要功能

### 👻 隐形自动签到
- **隐藏窗口自动化**: 签到时会短暂打开一个最小化的窗口，完成后自动关闭。
- **安全模拟**: 模拟真实点击操作，而不是直接调用 API，因此更加安全。

### ⏰ 智能调度
- **智能定时器**: 自动计算游戏服务器重置时间 (UTC+8 00:00)。
- 如果当天已签到，不会重复运行。

### 🔔 Discord 通知
- **Webhook 集成**: 将签到成功/失败的消息直接发送到您的 Discord。
- **丰富的 Embed**: 显示实际获得的奖励名称和累计签到天数。
- **测试模式**: 立即验证您的 Webhook 设置是否正常工作。

### 🔒 安全的本地运行
- **本地运行**: 所有操作仅在您的浏览器内部进行。
- 除了您设置的 Discord Webhook 外，不会向外部发送任何个人信息。

### 🛡️ 状态徽章
- 通过扩展图标直观地查看状态:
  - `(无徽章)` : ✅ 签到完成
  - `...` (橙色) : ⏳ 正在签到
  - `!` (红色) : ❌ 发生错误

<br/>

<br/>

## 📖 使用方法

1. **登录**: 请登录 SKPORT 终末地签到页面。
2. **自动运行**: 此后每次打开浏览器，扩展程序都会自动检查签到。
3. **查看状态**: 点击扩展程序图标即可查看运行日志和状态。
    - 也可以使用 `CHECK NOW` 按钮手动签到。

<br/>

## 🔧 故障排除

> [!WARNING]
> **"失败"状态或 "!" 徽章一直不消失？**

1. 请检查 SKPORT 网站是否已退出登录。
2. 点击 `CHECK NOW` 按钮手动重试。
3. 如果问题持续存在，请进入设置（齿轮图标）并点击 **[重置数据]**。

<br/>

## ⚖️ 免责声明与许可

- 本项目为非官方扩展程序。
- **用户需自行承担因使用本程序而产生的任何问题（包括账号封禁等）。**
- **Use at your own risk.**
- **MIT License**
