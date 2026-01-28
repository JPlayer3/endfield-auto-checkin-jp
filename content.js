(async () => {
    if (typeof i18n !== 'undefined') {
        await i18n.init();
    }

    chrome.storage.local.get(['accountInfo'], (data) => {
        if (data.accountInfo && data.accountInfo.cred) return;
        showSyncPrompt();
    });
})();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getLocalStorage") {
        const data = scanForAccountData();
        sendResponse(data);
    }
});

function scanForAccountData() {
    let cred = null;
    let role = null;
    const storages = [localStorage, sessionStorage];
    const credRegex = /^[A-Za-z0-9]{32}$/;
    const roleRegex = /^\d+_\d+_\d+$/;

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

async function showSyncPrompt() {
    await i18n.init();
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

    const title = i18n.get('prompt_title');
    const desc = i18n.get('prompt_desc');
    const btnYes = i18n.get('btn_yes');
    const btnNo = i18n.get('btn_no');

    div.innerHTML = `
        <div style="font-weight:700; color:#D4D94A;">${title}</div>
        <div style="color:#ccc; line-height:1.4;">${desc}</div>
        <div style="display:flex; gap:8px;">
            <button id="btn-sync-yes" style="flex:1; background:#D4D94A; border:none; padding:8px 0; border-radius:6px; font-weight:700; cursor:pointer; color:#1A1A1A;">${btnYes}</button>
            <button id="btn-sync-no" style="flex:1; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.1); padding:8px 0; border-radius:6px; color:#fff; cursor:pointer;">${btnNo}</button>
        </div>
    `;

    document.body.appendChild(div);

    document.getElementById('btn-sync-yes').addEventListener('click', async () => {
        if (!chrome.runtime?.id) {
            await showModal(i18n.get('title_conn_lost'), i18n.get('msg_update_refresh'), false);
            return;
        }

        const data = scanForAccountData();

        try {
            chrome.runtime.sendMessage({ action: "syncAccount", storageData: data }, async (res) => {
                if (chrome.runtime.lastError) {
                    await showModal(i18n.get('modal_error_title'), i18n.get('msg_send_fail'), false);
                    return;
                }

                if (res && res.code === "SUCCESS") {
                    await showModal(i18n.get('title_sync_complete'), i18n.get('msg_sync_complete_desc'));
                    div.remove();
                } else {
                    const msg = res ? res.msg : i18n.get('msg_no_response');
                    if (msg.includes("401") || msg.includes("로그인") || msg.includes("Login")) {
                        await showModal(i18n.get('title_auth_fail'), i18n.get('msg_session_expired'), false);
                    } else {
                        await showModal(i18n.get('title_sync_fail'), msg, false);
                    }
                }
            });
        } catch (e) {
            console.error(e);
            await showModal(i18n.get('modal_error_title'), i18n.get('msg_ext_lost'), false);
        }
    });

    document.getElementById('btn-sync-no').addEventListener('click', () => {
        div.remove();
    });
}

async function showModal(title, msg, isSuccess = true) {
    await i18n.init();
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
        const btnText = i18n.get('btn_ok');

        container.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:${color}; margin-bottom:12px;">${title}</div>
            <div style="font-size:14px; color:#F0F0F0; line-height:1.5; margin-bottom:24px; white-space:pre-line;">${msg}</div>
            <button id="modal-btn-confirm" style="
                width: 100%; padding: 10px 0; border-radius: 6px; border: none;
                background: ${color}; color: #1A1A1A; font-size: 13px; font-weight: 800; cursor: pointer;
            ">${btnText}</button>
        `;

        overlay.appendChild(container);
        document.body.appendChild(overlay);

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