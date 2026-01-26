<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.2.1-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.2.1)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Whale-orange?style=flat-square)](https://chromewebstore.google.com/)

[![GitBook](https://img.shields.io/badge/Docs-GitBook-3884FF?style=for-the-badge&logo=gitbook&logoColor=white)](https://kgyujins-organization.gitbook.io/endfield/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/xog9)

<br/>

[🇺🇸 English Version](./README_EN.md)

<br/>

### 현재 확장 프로그램은 검토 대기 중이므로 웹 스토어에서 설치할 수 없습니다.
### 스토어 외의 설치 및 방법은 아래를 참고해주세요.

<br/>

---

<br/>

**Arknights: Endfield (SKPORT) Daily Check-in Automation Extension**

Endfield Auto Check-in은  
명일방주: 엔드필드(SKPORT)의 일일 출석 체크를  
**로그인된 상태에서 백그라운드로 자동 수행**하는 Chromium 기반 브라우저 확장 프로그램입니다.

</div>

---

## Overview

| 항목 | 내용 |
|---|---|
| 플랫폼 | Chrome, Edge, Whale 등 Chromium 기반 브라우저 |
| 버전 | 1.2.1 |
| 동작 조건 | SKPORT 게임 사이트 로그인 상태 필요 |
| 실행 방식 | 로컬 브라우저 내부 자동화 |
| 외부 통신 | 없음 |

---

## Key Features

### Invisible Auto Check-in
- 브라우저 실행 시 자동으로 출석 수행
- 작업 표시줄에만 잠시 표시되며 화면을 가리지 않음

### Smart Scheduling
- 게임 서버 리셋 시간(UTC+8 00:00) 기준으로 실행 여부 판단
- 이미 출석 완료된 경우 실행하지 않음

### Account Info Display
- 계정 연동 시 Role ID와 서버 정보 표시
- "Linked" 상태 아래에 계정 정보 확인 가능

### Instant Check-in on Sync
- 계정 연동(갱신) 성공 시 즉시 출석 체크 시도
- 별도의 버튼 클릭 없이 바로 출석 완료 가능

### Status Badge
- 확장 아이콘을 통해 실행 결과를 직관적으로 표시  
  - `표시 없음` : 출석 완료  
  - `X` : 로그인 필요 또는 실패

### Login Detection
- 로그인 상태가 아닐 경우 자동 실행을 중단
- 불필요한 페이지 열기 없이 알림으로 안내

---

## Installation

1. 이 저장소에서 **Code → Download ZIP** 선택
2. 압축 해제
3. 브라우저 주소창에 `chrome://extensions` 입력
4. **개발자 모드** 활성화
5. **압축 해제된 확장 프로그램 로드** 선택 후 폴더 지정

---

## Usage

1. SKPORT 엔드필드 출석 페이지에 **한 번 로그인**
2. 이후 브라우저 실행 시 자동으로 출석 처리
3. 확장 아이콘 클릭 시 상태 확인 또는 `CHECK NOW`로 즉시 실행 가능

## Troubleshooting

> **⚠️ "실패" 또는 "X" 뱃지가 계속 표시되는 경우 해결 방법**

아래와 같은 상황에서는 계정 연동이 정상적으로 진행되지 않을 수 있습니다.
- **로그인하지 않은 상태**에서 계정 연동을 시도한 경우
- 계정 연동을 시도했으나 알 수 없는 오류로 실패가 지속되는 경우

**🌟 해결 방법**
1. 확장 프로그램 아이콘 클릭 → 우측 상단의 **⚙️ 설정(톱니바퀴)** 아이콘 클릭
2. **[데이터 초기화]** 버튼을 눌러 저장된 데이터를 모두 삭제
3. SKPORT 사이트가 새로고침되면 **다시 로그인**
4. 팝업 안내에 따라 **계정 연동** 재시도

**문제가 발생할 경우 반드시 '데이터 초기화'를 먼저 시도해주시기 바랍니다.**

## Disclaimer

- 본 프로젝트는 **개발자의 개인적인 편의를 위해 개발**된 확장 프로그램입니다.
- 개발자가 가능한 기술적 영역과 시간적 여유 내에서 유지보수 및 기능 개선이 진행됩니다.

## License

MIT License
