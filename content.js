// 1. 페이지 로드 시 자동 팝업 (기존 유지)
chrome.storage.local.get(['accountInfo'], (data) => {
    if (data.accountInfo && data.accountInfo.cred) return;
    showSyncPrompt();
});

// popup.js의 요청을 듣는 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getLocalStorage") {
        const data = scanForAccountData();
        sendResponse(data);
    }
});

// 정밀 데이터 탐색 함수
function scanForAccountData() {
    let cred = null;
    let role = null;

    // A. Storage (Local & Session) 정밀 스캔
    const storages = [localStorage, sessionStorage];
    const credRegex = /^[A-Za-z0-9]{32}$/; // 32자리 영문+숫자
    const roleRegex = /^\d+_\d+_\d+$/;     // 숫자_숫자_숫자

    storages.forEach(store => {
        try {
            for (let i = 0; i < store.length; i++) {
                const key = store.key(i);
                const val = store.getItem(key);

                if (!val) continue;

                if (!cred && (key === 'cred' || key === 'CRED' || key === 'sk_cred')) cred = val;
                if (!role && (key === 'sk-game-role' || key === 'current_role_id')) role = val;

                if (!cred && credRegex.test(val)) cred = val;
                if (!role && roleRegex.test(val)) role = val;

                if ((!cred || !role) && val.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(val);
                        if (!cred) {
                            if (parsed.cred) cred = parsed.cred;
                            else if (parsed.token && credRegex.test(parsed.token)) cred = parsed.token;
                        }
                        if (!role) {
                            if (parsed.role) role = parsed.role;
                            else if (parsed.gameRole) role = parsed.gameRole;
                        }
                    } catch (e) { }
                }
            }
        } catch (e) { console.error(e); }
    });

    // B. Cookie 스캔 (HttpOnly가 아닌 것들, 2차 백업)
    if (!cred || !role) {
        const cookies = document.cookie.split(';');
        for (let c of cookies) {
            const parts = c.trim().split('=');
            if (parts.length < 2) continue;
            const k = parts[0];
            const v = parts.slice(1).join('=');

            if (!cred && (k === 'cred' || k === 'sk_cred')) cred = v;
            if (!role && (k === 'sk-game-role' || k === 'sk_game_role')) role = decodeURIComponent(v);
        }
    }

    return { cred, role };
}

// 화면 좌측 하단 팝업 생성
function showSyncPrompt() {
    if (document.getElementById('endfield-sync-prompt')) return;

    const div = document.createElement('div');
    div.id = "endfield-sync-prompt";
    div.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; z-index: 10000;
        background: rgba(26, 26, 26, 0.95); border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px); padding: 16px; border-radius: 12px;
        color: white; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        display: flex; flex-direction: column; gap: 10px; width: 260px; font-size: 13px;
    `;

    div.innerHTML = `
        <div style="font-weight:700; color:#D4D94A;">⚡ 자동 출석 계정 연동</div>
        <div style="color:#ccc; line-height:1.4;">로그인된 계정으로<br>자동 출석을 설정하시겠습니까?</div>
        <div style="display:flex; gap:8px;">
            <button id="btn-sync-yes" style="flex:1; background:#D4D94A; border:none; padding:8px 0; border-radius:6px; font-weight:700; cursor:pointer; color:#1A1A1A;">네</button>
            <button id="btn-sync-no" style="flex:1; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.1); padding:8px 0; border-radius:6px; color:#fff; cursor:pointer;">아니오</button>
        </div>
    `;

    document.body.appendChild(div);

    // 안전한 메시지 전송
    document.getElementById('btn-sync-yes').addEventListener('click', async () => {
        if (!chrome.runtime?.id) {
            await showModal("연결 끊김", "확장 프로그램이 업데이트되었습니다.\n페이지를 새로고침 해주세요.", false);
            return;
        }

        const data = scanForAccountData();

        try {
            chrome.runtime.sendMessage({ action: "syncAccount", storageData: data }, async (res) => {
                if (chrome.runtime.lastError) {
                    await showModal("오류", "메시지 전송 실패: 페이지를 새로고침 하세요.", false);
                    return;
                }

                if (res && res.code === "SUCCESS") {
                    await showModal("연동 완료!", "성공적으로 계정이 연동되었습니다.");
                    div.remove();
                } else {
                    const msg = res ? res.msg : "응답 없음";
                    // 401 Unauthorized 에러 메시지 친절하게 변경
                    if (msg.includes("401") || msg.includes("로그인")) {
                        await showModal("인증 실패", "로그인 세션이 만료되었습니다.\n사이트 로그아웃 후 다시 로그인해주세요.", false);
                    } else {
                        await showModal("연동 실패", msg, false);
                    }
                }
            });
        } catch (e) {
            console.error(e);
            await showModal("오류", "확장 프로그램 연결이 끊겼습니다.\n페이지를 새로고침 해주세요.", false);
        }
    });

    document.getElementById('btn-sync-no').addEventListener('click', () => {
        div.remove();
    });
}

function showModal(title, msg, isSuccess = true) {
    return new Promise((resolve) => {
        const modalId = 'endfield-custom-modal';
        if (document.getElementById(modalId)) return;

        const overlay = document.createElement('div');
        overlay.id = modalId;
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(2px);
            z-index: 20000; display: flex; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.2s;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            background: #1A1A1A; width: 300px;
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
            padding: 24px; text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            transform: scale(0.95); transition: transform 0.2s;
        `;

        const color = isSuccess ? '#D4D94A' : '#FF3B30';

        container.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:${color}; margin-bottom:12px;">${title}</div>
            <div style="font-size:14px; color:#F0F0F0; line-height:1.5; margin-bottom:24px; white-space:pre-line;">${msg}</div>
            <button id="modal-btn-confirm" style="
                width: 100%; padding: 10px 0; border-radius: 6px; border: none;
                background: ${color}; color: #1A1A1A; font-size: 13px; font-weight: 800; cursor: pointer;
            ">확인</button>
        `;

        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Animation start
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            container.style.transform = 'scale(1)';
        });

        const close = () => {
            overlay.style.opacity = '0';
            container.style.transform = 'scale(0.95)';
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 200);
        };

        document.getElementById('modal-btn-confirm').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    });
}