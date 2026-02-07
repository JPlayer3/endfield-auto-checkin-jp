<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.5.0-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.5.0)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/xog9)

<br/>

[🇰🇷 Korean](./README.md) | [🇯🇵 日本語](./README_JA.md) | [🇨🇳 简体中文](./README_ZH.md)

<br/>

---

<br/>

**Arknights: Endfield (SKPORT) Daily Check-in Automation Extension**

Endfield Auto Check-in is a Chromium-based browser extension that  
automatically performs the daily check-in for  
**Arknights: Endfield (SKPORT)** in the background while the user is logged in.

</div>

---

## 📝 Overview

| Feature | Description |
| :--- | :--- |
| **Platform** | Chromium-based browsers (Chrome, Edge, Whale, etc.) |
| **Version** | 1.5.0 |
| **Condition** | Must be logged in to SKPORT website |
| **Execution** | Local background automation (Hidden Window) |
| **Network** | None (Except optional Discord Webhook) |



## ✨ Key Features

### 👻 Invisible Auto Check-in
- **Hidden Automation**: A minimized window opens briefly to perform the check-in and closes automatically.
- **Safe & Secure**: Simulates user interaction instead of using sensitive APIs directly.

### ⏰ Smart Scheduling
- **Intelligent Timer**: Automatically calculates the game server reset time (UTC+8 00:00).
- Skips execution if you have already checked in for the day.

### 🔔 Discord Notification
- **Webhook Integration**: receive success/failure notifications directly in your Discord.
- **Rich Embeds**: Displays actual reward names and cumulative attendance days.
- **Test Mode**: Verify your webhook setup instantly.

### 🔒 Secure & Private
- **Local Execution**: All operations run locally within your browser.
- No personal data is sent to external servers (except optional Discord Webhook).

### 🛡️ Status Badge
- Visual status indicator on the extension icon:
  - `(No Badge)` : ✅ Check-in Complete
  - `...` (Orange) : ⏳ Check-in in Progress
  - `!` (Red) : ❌ Error

<br/>

<br/>

## 📖 Usage

1. **Login**: Log in to the Arknights: Endfield check-in page on SKPORT.
2. **Auto Run**: The extension will automatically check in every time you open the browser.
3. **Check Status**: Click the extension icon to view logs or status.
    - You can also use the `CHECK NOW` button for manual execution.

<br/>

## 🔧 Troubleshooting

> [!WARNING]
> **Is the "Failure" or "!" badge persistent?**

1. Check if you are logged out of the SKPORT website.
2. Try clicking `CHECK NOW` manually.
3. If issues persist, go to Settings (Gear icon) and click **[Reset Data]**.

<br/>

## ⚖️ Disclaimer & License

- This project is an unofficial extension.
- **The user is solely responsible for any issues (including account bans) arising from the use of this program.**
- **Use at your own risk.**
- **MIT License**
