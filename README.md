<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.5.0-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.5.0)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
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
| **버전** | 1.5.0 |
| **동작 조건** | SKPORT 게임 사이트 로그인 상태 |
| **실행 방식** | 로컬 브라우저 백그라운드 자동화 (Hidden Window) |
| **외부 통신** | 없음 (단, 사용자 설정 시 Discord 알림 전송) |



## ✨ 주요 기능

### 👻 보이지 않는 자동 출석
- **최소화된 창**: 출석 체크 시 최소화된 창이 잠깐 열렸다가 출석 후 자동으로 닫힙니다.
- **안전한 자동화**: API를 직접 조작하지 않고 실제 웹페이지 클릭을 시뮬레이션하여 안전합니다.

### ⏰ 지능형 스케줄링
- **지능형 스케줄링**: 게임 서버 리셋 시간(UTC+8 00:00)을 자동으로 계산합니다.
- 이미 출석한 날에는 불필요하게 실행되지 않습니다.

### 🔔 디스코드 알림
- **디스코드 알림 연동**: 출석 성공/실패 여부를 내 디스코드로 전송합니다.
- **웹훅 테스트 지원**: 설정한 웹훅이 정상 동작하는지 바로 확인해보세요.
- **상세 정보 표시**: 획득한 보상 내용과 누적 출석일수까지 알려줍니다.

### 🔒 안전한 로컬 실행
- **안전한 로컬 실행**: 모든 동작은 사용자 브라우저 내부에서만 이루어집니다.
- 사용자가 설정한 Discord Webhook 외에는 개인정보를 외부로 전송하지 않습니다.

### 🛡️ 상태 배지
- 상태를 직관적으로 파악할 수 있는 뱃지 시스템:
  - `(배지 없음)` : ✅ 출석 완료
  - `...` (Orange) : ⏳ 출석 진행 중
  - `!` (Red) : ❌ 오류 발생

<br/>

<br/>

## 📖 사용 방법

1. **로그인**: SKPORT 엔드필드 출석 페이지에 로그인해주세요.
2. **자동 실행**: 매일 브라우저를 사용할 때 확장이 알아서 출석을 체크합니다.
3. **상태 확인**: 확장 프로그램 아이콘을 클릭하여 언제든 실행 기록과 상태를 확인할 수 있습니다.
    - `CHECK NOW` 버튼으로 수동 출석 체크도 가능합니다.

<br/>

## 🔧 문제 해결

> [!WARNING]
> **"실패" 상태나 "!" 뱃지가 떴나요?**

1. SKPORT 사이트에서 로그인이 풀려있는지 확인해주세요.
2. `CHECK NOW`를 눌러 수동으로 다시 시도해보세요.
3. 문제가 지속되면 설정(톱니바퀴) > **[데이터 초기화]**를 진행해보세요.

<br/>

## ⚖️ 면책 조항 및 라이선스

- 본 프로젝트는 비공식 확장 프로그램입니다.
- **본 프로그램의 사용으로 인해 발생하는 모든 문제(계정 제재 등)에 대한 책임은 전적으로 사용자 본인에게 있습니다.**
- **Use at your own risk.**
- **MIT License**