const TRANSLATIONS = {
    ko: {
        title_main: "ENDFIELD<br>CHECK-IN",
        btn_discord_title: "디스코드 알림 설정",
        btn_settings_title: "설정 및 기록",
        status_header: "오늘의 상태",
        last_run_prefix: "마지막 실행: ",
        btn_check_now: "지금 확인",
        link_site: "출석 사이트 바로가기 ↗",

        section_account: "계정 연동 상태",
        info_no_info: "정보 없음",
        btn_sync_refresh: "연동 갱신",
        btn_sync_start: "계정 연동하기",
        btn_unlink: "해제",
        btn_reset: "초기화",
        section_logs: "최근 기록",
        msg_no_logs: "기록 없음",
        btn_back: "← 돌아가기",

        title_discord: "디스코드 웹훅 설정",
        btn_webhook_help: "웹훅 URL 얻는 방법",
        label_webhook_url: "웹훅 URL",
        btn_save: "저장",
        btn_test: "테스트",
        status_not_set: "설정되지 않음",
        status_active: "활성화됨",
        status_disabled: "비활성화됨",
        last_edit: "최근 수정: ",

        status_success: "완료",
        status_fail: "실패",
        status_waiting: "대기 중",
        status_checking: "확인 중...",

        modal_alert_title: "알림",
        modal_confirm_title: "확인",
        modal_error_title: "오류",
        modal_success_title: "성공",
        modal_reset_title: "데이터 초기화",
        btn_yes: "네",
        btn_no: "아니오",
        btn_ok: "확인",
        btn_cancel: "취소",

        msg_webhook_help: "1. 디스코드 서버 → 서버 설정 → 연동\n2. 웹후크 → 새 웹후크\n3. 웹후크 URL 복사 → 위에 붙여넣기",
        msg_sync_analyzing: "분석 중...",
        msg_req_login: "SKPORT 엔드필드 출석체크 페이지에서 실행해주세요.",
        msg_sync_success: "연동 완료! 모든 인증 정보가 안전하게 저장되었습니다.",
        msg_sync_fail: "연동 실패: ",
        msg_reset_confirm: "확장 프로그램의 모든 설정과 로그를 삭제하고,\nSKPORT/엔드필드 사이트의 로그인 정보(쿠키)도 삭제합니다.\n\n401 오류가 계속될 때 사용하세요.\n정말 초기화하시겠습니까?",
        msg_reset_done: "모든 데이터가 초기화되었습니다.\n사이트에 다시 로그인해주세요.",
        msg_unlink_confirm: "정말 계정 연동을 해제하시겠습니까?\n자동 출석이 중단됩니다.",
        msg_unlinked: "연동이 해제되었습니다.",
        msg_webhook_disabled: "디스코드 연동이 비활성화되었습니다.",
        msg_webhook_invalid: "올바른 디스코드 웹훅 URL이 아닙니다.",
        msg_webhook_saved: "디스코드 웹훅이 저장되었습니다!",
        msg_webhook_req_save: "먼저 웹훅 URL을 입력하고 저장해주세요.",
        msg_test_sending: "전송 중...",
        msg_test_success: "테스트 메시지가 성공적으로 전송되었습니다!\n디스코드 채널을 확인해보세요.",
        msg_test_fail: "전송 실패: ",

        info_linked: "연동됨",
        info_not_linked: "연동 안됨",
        info_msg_not_found: "캐릭터 ID 정보를 찾을 수 없습니다.<br>로그아웃 후 재로그인하고 다시 진행해주세요",

        log_check_success: "출석 성공",
        log_check_already: "이미 완료됨",
        log_check_fail: "출석 실패",
        log_req_login: "계정 연동 필요",
        log_char_not_found: "캐릭터 정보 없음",
        log_unknown_error: "알 수 없는 오류",
        log_discord_sent: "출석 완료 알림 전송",
        log_discord_fail: "전송 실패: ",
        log_sync_success: "계정 연동 성공",
        log_logout: "연동 해제",
        log_cookie_update: "쿠키 감지: 인증 정보 및 전체 쿠키 갱신됨",
        log_already_sent: "이미 완료됨 알림 전송",

        embed_success_title: "🎉 엔드필드 출석 체크 완료!",
        embed_already_title: "✅ 출석 체크 이미 완료됨",
        embed_fail_title: "⚠️ 엔드필드 출석 체크 실패",
        embed_test_success_title: "[테스트] 🎉 엔드필드 출석 체크 완료!",
        embed_test_already_title: "[테스트] ✅ 출석 체크 이미 완료됨",
        embed_test_fail_title: "[테스트] ⚠️ 엔드필드 출석 체크 실패",
        field_date: "📅 일시",
        field_accumulated: "📊 누적 출석",
        field_reward: "🎁 오늘의 보상",
        field_status: "ℹ️ 상태",
        field_error: "❌ 오류 내용",
        val_days: "일",
        val_success_msg: "출석 성공",
        val_already_msg: "오늘 출석 체크가 이미 완료되었습니다.",
        val_unknown_reward: "알 수 없는 보상",
        val_test_item: "테스트 아이템",
        val_test_error: "테스트 오류 메시지입니다.",

        test_modal_title: "테스트 메시지 유형 선택",
        test_btn_success: "✅ 출석 성공",
        test_btn_already: "ℹ️ 이미 완료됨",
        test_btn_fail: "❌ 출석 실패",

        // Content Script (Sync Prompt)
        prompt_title: "⚡ 자동 출석 계정 연동",
        prompt_desc: "로그인된 계정으로<br>자동 출석을 설정하시겠습니까?",
        title_conn_lost: "연결 끊김",
        msg_update_refresh: "확장 프로그램이 업데이트되었습니다.\n페이지를 새로고침 해주세요.",
        msg_send_fail: "메시지 전송 실패: 페이지를 새로고침 하세요.",
        title_sync_complete: "연동 완료!",
        msg_sync_complete_desc: "성공적으로 계정이 연동되었습니다.",
        msg_no_response: "응답 없음",
        title_auth_fail: "인증 실패",
        msg_session_expired: "로그인 세션이 만료되었습니다.\n사이트 로그아웃 후 다시 로그인해주세요.",
        title_sync_fail: "연동 실패",
        msg_ext_lost: "확장 프로그램 연결이 끊겼습니다.\n페이지를 새로고침 해주세요."
    },
    en: {
        title_main: "ENDFIELD<br>CHECK-IN",
        btn_discord_title: "Discord Notification Settings",
        btn_settings_title: "Settings & Logs",
        status_header: "TODAY'S STATUS",
        last_run_prefix: "Last Run: ",
        btn_check_now: "CHECK NOW",
        link_site: "Go to Check-in Site ↗",

        section_account: "Account Sync Status",
        info_no_info: "No Information",
        btn_sync_refresh: "Refresh Sync",
        btn_sync_start: "Sync Account",
        btn_unlink: "Unlink",
        btn_reset: "Reset Data",
        section_logs: "Recent Logs",
        msg_no_logs: "No logs found",
        btn_back: "← Back",

        title_discord: "Discord Webhook Settings",
        btn_webhook_help: "How to get Webhook URL",
        label_webhook_url: "Webhook URL",
        btn_save: "Save",
        btn_test: "Test",
        status_not_set: "Not Configured",
        status_active: "Active",
        status_disabled: "Disabled",
        last_edit: "Last Modified: ",

        status_success: "Success",
        status_fail: "Fail",
        status_waiting: "Waiting",
        status_checking: "Checking...",

        modal_alert_title: "Alert",
        modal_confirm_title: "Confirm",
        modal_error_title: "Error",
        modal_success_title: "Success",
        modal_reset_title: "Reset Data",
        btn_yes: "Yes",
        btn_no: "No",
        btn_ok: "OK",
        btn_cancel: "Cancel",

        msg_webhook_help: "1. Discord Server → Server Settings → Integrations\n2. Webhooks → New Webhook\n3. Copy Webhook URL → Paste above",
        msg_sync_analyzing: "Analyzing...",
        msg_req_login: "Please run this on the SKPORT Endfield Check-in page.",
        msg_sync_success: "Synced successfully! All credentials saved safely.",
        msg_sync_fail: "Sync failed: ",
        msg_reset_confirm: "This will delete all settings and logs of this extension,\nand also delete login info (cookies) for SKPORT/Endfield sites.\n\nUse this if 401 errors persist.\nAre you sure you want to reset?",
        msg_reset_done: "All data reset.\nPlease log in to the site again.",
        msg_unlink_confirm: "Are you sure you want to unlink?\nAuto check-in will run.",
        msg_unlinked: "Account unlinked.",
        msg_webhook_disabled: "Discord integration disabled.",
        msg_webhook_invalid: "Invalid Discord Webhook URL.",
        msg_webhook_saved: "Discord Webhook saved!",
        msg_webhook_req_save: "Please enter and save a Webhook URL first.",
        msg_test_sending: "Sending...",
        msg_test_success: "Test message sent successfully!\nCheck your Discord channel.",
        msg_test_fail: "Send failed: ",

        info_linked: "Linked",
        info_not_linked: "Not Linked",
        info_msg_not_found: "Character ID not found.<br>Please logout and login again.",

        log_check_success: "Check-in Success",
        log_check_already: "Already Done",
        log_check_fail: "Check-in Failed",
        log_req_login: "Account Sync Required",
        log_char_not_found: "Character Not Found",
        log_unknown_error: "Unknown Error",
        log_discord_sent: "Discord Notification Sent",
        log_discord_fail: "Send Failed: ",
        log_sync_success: "Account Sync Success",
        log_logout: "Unlinked",
        log_cookie_update: "Cookie Update: Credentials refreshed",
        log_already_sent: "Already Done Notification Sent",

        embed_success_title: "🎉 Endfield Check-in Complete!",
        embed_already_title: "✅ Check-in Already Done",
        embed_fail_title: "⚠️ Endfield Check-in Failed",
        embed_test_success_title: "[Test] 🎉 Endfield Check-in Complete!",
        embed_test_already_title: "[Test] ✅ Check-in Already Done",
        embed_test_fail_title: "[Test] ⚠️ Endfield Check-in Failed",
        field_date: "📅 Date",
        field_accumulated: "📊 Total Days",
        field_reward: "🎁 Today's Reward",
        field_status: "ℹ️ Status",
        field_error: "❌ Error Details",
        val_days: "days",
        val_success_msg: "Check-in Success",
        val_already_msg: "Check-in was already completed today.",
        val_unknown_reward: "Unknown Reward",
        val_test_item: "Test Item",
        val_test_error: "This is a test error message.",

        test_modal_title: "Select Test Message Type",
        test_btn_success: "✅ Success",
        test_btn_already: "ℹ️ Already Done",
        test_btn_fail: "❌ Failed",

        // Content Script (Sync Prompt)
        prompt_title: "⚡ Auto Check-in Account Sync",
        prompt_desc: "Do you want to set up auto check-in<br>with the logged-in account?",
        title_conn_lost: "Connection Lost",
        msg_update_refresh: "Extension updated.\nPlease refresh the page.",
        msg_send_fail: "Message send failed: Please refresh.",
        title_sync_complete: "Sync Complete!",
        msg_sync_complete_desc: "Account successfully synced.",
        msg_no_response: "No Response",
        title_auth_fail: "Auth Failed",
        msg_session_expired: "Login session expired.\nPlease logout and login again.",
        title_sync_fail: "Sync Failed",
        msg_ext_lost: "Extension connection lost.\nPlease refresh the page."
    }
};

class I18nService {
    constructor() {
        this.language = 'ko';
    }

    async init() {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.language) {
                this.language = changes.language.newValue || 'ko';
            }
        });

        return new Promise((resolve) => {
            chrome.storage.local.get(['language'], (result) => {
                if (result.language && (result.language === 'ko' || result.language === 'en')) {
                    this.language = result.language;
                }
                resolve(this.language);
            });
        });
    }

    async setLanguage(lang) {
        if (lang !== 'ko' && lang !== 'en') return;
        this.language = lang;
        await chrome.storage.local.set({ language: lang });
    }

    get(key, params = {}) {
        const langInfo = TRANSLATIONS[this.language] || TRANSLATIONS['ko'];
        return langInfo[key] || key;
    }

    get lang() {
        return this.language;
    }

    get locale() {
        return this.language === 'ko' ? 'ko-KR' : 'en-US';
    }
}

const i18n = new I18nService();
