<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.3.2-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.3.2)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Whale-orange?style=flat-square)](https://chromewebstore.google.com/detail/%EC%97%94%EB%93%9C%ED%95%84%EB%93%9C-%EC%9E%90%EB%8F%99-%EC%B6%9C%EC%84%9D%EC%B2%B4%ED%81%AC/djobkkgcmfhjbjodcdidelbmpmgalgga)

[![GitBook](https://img.shields.io/badge/Docs-GitBook-3884FF?style=for-the-badge&logo=gitbook&logoColor=white)](https://kgyujins-organization.gitbook.io/endfield/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/xog9)

<br/>

[🇺🇸 English](./README_EN.md) | [🇯🇵 日本語](./README_JA.md) | [🇨🇳 简体中文](./README_ZH.md)

<br/>

---

<br/>

**Arknights: Endfield (SKPORT) Daily Check-in Automation Extension**

Endfield Auto Check-in은  
명일방주: 엔드필드(SKPORT)의 일일 출석 체크를  
**로그인된 상태에서 백그라운드로 자동 수행**하는 Chromium 기반 브라우저 확장 프로그램입니다.

</div>

---

## 📝 개요

| 구분 | 상세 내용 |
| :--- | :--- |
| **플랫폼** | Chrome, Edge, Whale 등 Chromium 기반 브라우저 |
| **버전** | 1.3.2 |
| **동작 조건** | SKPORT 게임 사이트 로그인 상태 |
| **실행 방식** | 로컬 브라우저 백그라운드 자동화 |
| **외부 통신** | 없음 (단, 사용자 설정 시 Discord 알림 전송) |

<br/>

## ✨ 주요 기능

### 👻 보이지 않는 자동 출석
- **보이지 않는 자동화**: 브라우저 실행 시 백그라운드에서 조용히 출석을 수행합니다.
- 화면을 가리거나 작업을 방해하지 않습니다.

### ⏰ 지능형 스케줄링
- **지능형 스케줄링**: 게임 서버 리셋 시간(UTC+8 00:00)을 자동으로 계산합니다.
- 이미 출석한 날에는 불필요하게 실행되지 않습니다.

### 🔔 디스코드 알림
- **디스코드 알림 연동**: 출석 성공/실패 여부를 내 디스코드로 전송합니다.
- **웹훅 테스트 지원**: 설정한 웹훅이 정상 동작하는지 바로 확인해보세요.
- **상세 정보 표시**: 획득한 아이템 썸네일과 누적 출석일수까지 알려줍니다.

### 🔒 안전한 로컬 실행
- **안전한 로컬 실행**: 모든 동작은 사용자 브라우저 내부에서만 이루어집니다.
- 사용자가 설정한 Discord Webhook 외에는 개인정보를 외부로 전송하지 않습니다.

### ⚡ 계정 연동 시 즉시 실행
- **즉시 실행**: 계정 연동(갱신)과 동시에 출석 체크를 시도하여 편의성을 높였습니다.

### 🛡️ 상태 배지
- 상태를 직관적으로 파악할 수 있는 뱃지 시스템:
  - `(배지 없음)` : ✅ 출석 완료
  - `X` (Red) : ❌ 로그인 필요 또는 오류 발생

<br/>

## 🚀 설치 방법

크롬 웹 스토어에서 간편하게 설치할 수 있습니다.

[![Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/i7m3Xbmb9d24ZkfbZ9rA.png)](https://chromewebstore.google.com/detail/%EC%97%94%EB%93%9C%ED%95%84%EB%93%9C-%EC%9E%90%EB%8F%99-%EC%B6%9C%EC%84%9D%EC%B2%B4%ED%81%AC/djobkkgcmfhjbjodcdidelbmpmgalgga)

1. [Chrome 웹 스토어 페이지](https://chromewebstore.google.com/detail/%EC%97%94%EB%93%9C%ED%95%84%EB%93%9C-%EC%9E%90%EB%8F%99-%EC%B6%9C%EC%84%9D%EC%B2%B4%ED%81%AC/djobkkgcmfhjbjodcdidelbmpmgalgga)로 이동합니다.
2. **[Chrome에 추가]** 버튼을 클릭합니다.
3. 설치가 완료되면 브라우저 우측 상단 퍼즐 아이콘🧩을 눌러 **Endfield Auto Check-in**을 고정📌하면 편리합니다.

<br/>

## 📖 사용 방법

1. **최초 1회 로그인**: SKPORT 엔드필드 출석 페이지에 로그인해주세요.
2. **자동 실행**: 이후 브라우저를 켤 때마다 확장이 알아서 출석을 체크합니다.
3. **상태 확인**: 확장 프로그램 아이콘을 클릭하여 언제든 실행 기록과 상태를 확인할 수 있습니다.
    - `CHECK NOW` 버튼으로 수동 출석 체크도 가능합니다.

<br/>

## 🔧 문제 해결

> [!WARNING]
> **"실패" 상태나 "X" 뱃지가 사라지지 않나요?**

로그인이 풀려있거나, 데이터 꼬임 현상일 수 있습니다. 아래 순서대로 진행해보세요.

1. 확장 프로그램 아이콘 클릭
2. 우측 상단 **⚙️ 설정(톱니바퀴)** 아이콘 클릭
3. **[데이터 초기화]** 버튼 클릭 (모든 데이터가 안전하게 정리됩니다)
4. SKPORT 사이트가 새로고침되면 **다시 로그인**
5. 안내에 따라 **[계정 연동]** 재시도

<br/>

## ⚖️ 면책 조항 및 라이선스

- 본 프로젝트는 비공식 확장 프로그램입니다.
- 본 프로그램의 사용으로 인해 발생하는 모든 문제에 대한 책임은 사용자 본인에게 있습니다.
- **MIT License**