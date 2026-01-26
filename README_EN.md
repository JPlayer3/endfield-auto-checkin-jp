<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.2.2-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.2.2)
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

## Overview

| Item | Description |
|---|---|
| Platform | Chromium-based browsers (Chrome, Edge, Whale, etc.) |
| Version | 1.2.2 |
| Requirement | User must be logged in to the SKPORT website |
| Execution | Local browser automation |
| External Network | None |

---

## Key Features

### Invisible Auto Check-in
- Automatically performs daily check-in on browser startup
- Runs silently without blocking or covering the screen

### Smart Scheduling
- Determines execution based on the game server reset time (UTC+8 00:00)
- Skips execution if the daily check-in is already completed

### Account Info Display
- Displays Role ID and Server ID when account is linked
- Information shown below the "Linked" status

### Discord Notification
- Send check-in results via Discord Webhook
- Includes webhook testing functionality
- Easy integration using Webhook URL

### Instant Check-in on Sync
- Automatically triggers check-in immediately after successful account sync
- No need to click extra buttons after linking

### Status Badge
- Displays execution status via the extension icon  
  - `no badge` : Check-in completed  
  - `X` : Login required or execution failed

### Login Detection
- Automatically stops execution if the user is not logged in
- Notifies the user instead of force-opening pages

---

## Installation

1. Select **Code → Download ZIP** from this repository
2. Extract the downloaded archive
3. Open `chrome://extensions` in the browser
4. Enable **Developer mode**
5. Click **Load unpacked** and select the extracted folder

---

## Usage

1. Log in once to the Arknights: Endfield check-in page on SKPORT
2. The extension will automatically perform the daily check-in on browser startup
3. Click the extension icon to check status or run immediately using `CHECK NOW`

## Troubleshooting

> **⚠️ If "Failure" or the "X" badge persists**

Account synchronization may fail in the following situations:
- Attempting to sync without being **logged in**
- Persistent failure due to unknown errors even after attempting synchronization

**🌟 Solution**
1. Click the extension icon → Click the **⚙️ Settings (Gear)** icon in the top right
2. Click the **[Reset Data]** button to clear all stored data
3. When the SKPORT site refreshes, **Log in again**
4. Retry **Account Sync** following the popup instructions

**If you encounter any issues, please try 'Reset Data' first.**

## Disclaimer

- This project was developed for the **developer's personal convenience**.
- Maintenance and feature improvements will be provided within the developer's available technical scope and time.

---

## License

MIT License
