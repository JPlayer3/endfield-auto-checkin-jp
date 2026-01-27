<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.3.0-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.3.0)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Whale-orange?style=flat-square)](https://chromewebstore.google.com/)

[![GitBook](https://img.shields.io/badge/Docs-GitBook-3884FF?style=for-the-badge&logo=gitbook&logoColor=white)](https://kgyujins-organization.gitbook.io/endfield/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/xog9)

<br/>

[🇰🇷 Korean Version](./README.md)

<br/>

**Arknights: Endfield (SKPORT) Daily Check-in Automation Extension**

Endfield Auto Check-in is a Chromium-based browser extension that  
automatically performs the daily check-in for  
**Arknights: Endfield (SKPORT)** in the background while the user is logged in.

</div>

---

## 📝 Overview

> **✅ Supports both Korean and English interfaces.**

| Feature | Description |
| :--- | :--- |
| **Platform** | Chromium-based browsers (Chrome, Edge, Whale, etc.) |
| **Version** | 1.3.0 |
| **Condition** | Must be logged in to SKPORT website |
| **Execution** | Local background automation |
| **Network** | None (Except optional Discord Webhook) |

<br/>

## ✨ Key Features

### 👻 Invisible Auto Check-in
- **Silent Automation**: Runs in the background on browser startup.
- Does not interrupt your workflow or cover the screen.

### ⏰ Smart Scheduling
- **Intelligent Timer**: Automatically calculates the game server reset time (UTC+8 00:00).
- Skips execution if you have already checked in for the day.

### 🔔 Discord Notification
- **Webhook Integration**: receive success/failure notifications directly in your Discord.
- **Rich Embeds**: Displays reward thumbnails and cumulative attendance days.
- **Test Mode**: Verify your webhook setup instantly.

### 🔒 Secure & Private
- **Local Execution**: All operations run locally within your browser.
- No personal data is sent to external servers (except optional Discord Webhook).

### ⚡ Instant Check-in on Sync
- **Immediate Action**: Triggers a check-in attempt immediately when you sync/update your account credentials.

### 🛡️ Status Badge
- Visual status indicator on the extension icon:
  - `(No Badge)` : ✅ Check-in Complete
  - `X` (Red) : ❌ Login Required or Error

<br/>

## 🚀 Installation

1. Click the **[Code]** button at the top of this repo → Select **Download ZIP**
2. Extract the downloaded archive
3. Open `chrome://extensions` in your browser address bar
4. Enable **[Developer mode]** toggle at the top right
5. Click **[Load unpacked]** at the top left
6. Select the extracted folder to finish installation!

<br/>

## 📖 Usage

1. **One-time Login**: Log in to the Arknights: Endfield check-in page on SKPORT.
2. **Auto Run**: The extension will automatically check in every time you open the browser.
3. **Check Status**: Click the extension icon to view logs or status.
    - You can also use the `CHECK NOW` button for manual execution.

<br/>

## 🔧 Troubleshooting

> [!WARNING]
> **Is the "Failure" or "X" badge persistent?**

This may be due to session expiration or corrupted data. Please follow these steps:

1. Click the extension icon
2. Click the **⚙️ Settings (Gear)** icon at the top right
3. Click **[Reset Data]** (This safely clears all stored extension data)
4. When the SKPORT site reloads, **Log in again**
5. Follow the popup to retry **[Account Sync]**

<br/>

## ⚖️ Disclaimer & License

- This project is an unofficial extension.
- The user is solely responsible for any issues arising from the use of this program.
- **MIT License**
