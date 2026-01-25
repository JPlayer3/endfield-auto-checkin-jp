<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.1.3-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.1.3)
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
| Version | 1.1.3 (Invisible Mode & Smart Schedule) |
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

## Installation (Manual)

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

---

## Architecture (For Developers)

This project follows a layered architecture for maintainability and extensibility.

- **Controller**  
  Controls overall workflow and scheduling
- **Service**  
  Business logic such as date calculation and execution checks
- **Store**  
  Local persistence using `chrome.storage`
- **Runner**  
  DOM interaction and window execution management

---

## License

MIT License
