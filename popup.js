const storage = chrome.storage.local;

document.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
    applyI18n();

    const data = await storage.get(['lastStatus', 'lastCheckDate', 'lastCheckTime', 'accountInfo', 'checkInLogs', 'isRunning', 'discordConfig']);

    renderStatus(data);
    renderLogs(data.checkInLogs);
    renderAccountInfo(data.accountInfo);
    renderDiscordConfig(data.discordConfig);

    document.getElementById('btnLang').addEventListener('click', async () => {
        const selectedLang = await showLanguageModal();
        if (selectedLang) {
            await i18n.setLanguage(selectedLang);
            applyI18n();
            storage.get(['lastStatus', 'lastCheckTime', 'accountInfo', 'checkInLogs', 'discordConfig'], (d) => {
                renderStatus(d);
                renderLogs(d.checkInLogs);
                renderAccountInfo(d.accountInfo);
                renderDiscordConfig(d.discordConfig);
            });
        }
    });

    document.getElementById('btnSettings').addEventListener('click', () => {
        const settingsView = document.getElementById('settingsView');
        const mainView = document.getElementById('mainView');
        const discordView = document.getElementById('discordView');
        if (settingsView.style.display === 'flex') {
            mainView.style.display = 'flex';
            settingsView.style.display = 'none';
            discordView.style.display = 'none';
        } else {
            mainView.style.display = 'none';
            settingsView.style.display = 'flex';
            discordView.style.display = 'none';
        }
    });

    document.getElementById('btnDiscord').addEventListener('click', () => {
        const settingsView = document.getElementById('settingsView');
        const mainView = document.getElementById('mainView');
        const discordView = document.getElementById('discordView');

        if (discordView.style.display === 'flex') {
            mainView.style.display = 'flex';
            settingsView.style.display = 'none';
            discordView.style.display = 'none';
        } else {
            mainView.style.display = 'none';
            settingsView.style.display = 'none';
            discordView.style.display = 'flex';
        }
    });

    document.getElementById('btnBack').addEventListener('click', () => {
        document.getElementById('settingsView').style.display = 'none';
        document.getElementById('discordView').style.display = 'none';
        document.getElementById('mainView').style.display = 'flex';
    });

    document.getElementById('btnBackFromDiscord').addEventListener('click', () => {
        document.getElementById('settingsView').style.display = 'none';
        document.getElementById('discordView').style.display = 'none';
        document.getElementById('mainView').style.display = 'flex';
    });

    document.getElementById('btnSync').addEventListener('click', handleSyncClick);

    document.getElementById('btnReset').addEventListener('click', handleReset);

    document.getElementById('runNowBtn').addEventListener('click', handleManualRun);
    document.getElementById('btnSaveWebhook').addEventListener('click', handleSaveWebhook);
    document.getElementById('btnTestWebhook').addEventListener('click', handleTestWebhook);

    document.getElementById('btnWebhookHelp').addEventListener('click', async () => {
        await Modal.alert(
            i18n.get('msg_webhook_help'),
            i18n.get('btn_webhook_help')
        );
    });

    chrome.storage.onChanged.addListener((changes) => {
        storage.get(null, (newData) => {
            renderStatus(newData);
            if (changes.checkInLogs) renderLogs(newData.checkInLogs);
            if (changes.accountInfo) renderAccountInfo(newData.accountInfo);
            if (changes.discordConfig) renderDiscordConfig(newData.discordConfig);
        });
    });
});

class Modal {
    static init() {
        this.overlay = document.getElementById('customModal');
        this.titleEl = document.getElementById('modalTitle');
        this.msgEl = document.getElementById('modalMessage');
        this.btnOk = document.getElementById('modalBtnOk');
        this.btnCancel = document.getElementById('modalBtnCancel');

        this.resolve = null;

        this.btnOk.addEventListener('click', () => this.close(true));
        this.btnCancel.addEventListener('click', () => this.close(false));
    }

    static show(title, msg, isConfirm = false) {
        return new Promise((resolve) => {
            this.resolve = resolve;
            this.titleEl.innerText = title;
            this.msgEl.innerText = msg;

            if (isConfirm) {
                this.btnCancel.style.display = 'block';
                this.btnOk.innerText = i18n.get('btn_yes');
                this.btnCancel.innerText = i18n.get('btn_no');
            } else {
                this.btnCancel.style.display = 'none';
                this.btnOk.innerText = i18n.get('btn_ok');
            }

            this.overlay.classList.add('active');
        });
    }

    static close(result) {
        this.overlay.classList.remove('active');
        if (this.resolve) {
            this.resolve(result);
            this.resolve = null;
        }
    }

    static async alert(msg, title = null) {
        return await this.show(title || i18n.get('modal_alert_title'), msg, false);
    }

    static async confirm(msg, title = null) {
        return await this.show(title || i18n.get('modal_confirm_title'), msg, true);
    }
}

Modal.init();

async function handleSyncClick() {
    const btn = document.getElementById('btnSync');
    btn.innerText = i18n.get('msg_sync_analyzing');
    btn.disabled = true;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes("skport.com")) {
        await Modal.alert(i18n.get('msg_req_login'));
        btn.innerText = i18n.get('btn_sync_refresh');
        btn.disabled = false;
        return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "getLocalStorage" }, (response) => {
        if (chrome.runtime.lastError) {
            console.log("Tab message error:", chrome.runtime.lastError.message);
        }
        const storageData = response || {};

        chrome.runtime.sendMessage({
            action: "syncAccount",
            storageData: storageData
        }, async (res) => {
            if (chrome.runtime.lastError) {
                await Modal.alert(i18n.get('err_prefix') + chrome.runtime.lastError.message);
                btn.innerText = i18n.get('btn_sync_refresh');
                btn.disabled = false;
                return;
            }
            btn.innerText = i18n.get('btn_sync_refresh');
            btn.disabled = false;

            if (res && res.code === "SUCCESS") {
                renderAccountInfo(res.data);
                storage.get(['checkInLogs'], (d) => renderLogs(d.checkInLogs));
                await Modal.alert(i18n.get('msg_sync_success'), i18n.get('modal_success_title'));
            } else {
                await Modal.alert(i18n.get('msg_sync_fail') + (res ? res.msg : "Unknown Error"), i18n.get('modal_error_title'));
            }
        });
    });
}

function handleManualRun() {
    chrome.runtime.sendMessage({ action: "manualRun" }, (res) => {
        if (chrome.runtime.lastError) {
            console.error("Manual Run Error:", chrome.runtime.lastError);
        }
    });
    document.getElementById('statusDisplay').innerHTML = `<span style="color:#FF9500">${i18n.get('status_checking')}</span>`;
}



async function handleReset() {
    const confirmed = await Modal.confirm(
        i18n.get('msg_reset_confirm'),
        i18n.get('modal_reset_title')
    );

    if (!confirmed) return;

    chrome.runtime.sendMessage({ action: "resetData" }, async (res) => {
        if (chrome.runtime.lastError) {
            await Modal.alert(i18n.get('err_prefix') + chrome.runtime.lastError.message);
            return;
        }
        if (res && res.code === "SUCCESS") {
            await Modal.alert(i18n.get('msg_reset_done'), i18n.get('modal_reset_title'));
            location.reload();
        } else {
            await Modal.alert(i18n.get('err_reset_fail'), i18n.get('modal_error_title'));
        }
    });
}

function renderStatus(data) {
    const statusEl = document.getElementById('statusDisplay');
    const timeEl = document.getElementById('lastRunDisplay');

    document.getElementById('btnSettings').style.display = '';
    document.getElementById('runNowBtn').style.display = '';

    if (data.lastStatus === "SUCCESS") {
        statusEl.innerHTML = `<span style="color:#34C759">${i18n.get('status_success')}</span>`;

    } else if (data.lastStatus === "FAIL" || data.lastStatus === "NOT_LOGGED_IN") {
        statusEl.innerHTML = `<span style="color:#FF3B30">${i18n.get('status_fail')}</span>`;

    } else {
        statusEl.innerHTML = `<span style="color:#FF9500">${i18n.get('status_waiting')}</span>`;

    }

    timeEl.innerText = data.lastCheckTime ? `${i18n.get('last_run_prefix')}${data.lastCheckTime}` : `${i18n.get('last_run_prefix')}-`;
}

function renderLogs(logs) {
    const list = document.getElementById('logList');
    list.innerHTML = "";

    if (!logs || logs.length === 0) {
        list.innerHTML = `<div style='text-align:center; color:#666; padding:10px;'>${i18n.get('msg_no_logs')}</div>`;
        return;
    }

    logs.forEach(log => {
        const div = document.createElement('div');
        div.className = "log-item";
        let statusText = log.status;
        if (log.status === 'SUCCESS') statusText = i18n.get('status_success');
        else if (log.status === 'FAIL') statusText = i18n.get('status_fail');

        div.innerHTML = `
            <div>
                <div class="log-date">${log.date}</div>
                <div class="log-msg">${log.msg}</div>
            </div>
            <div class="log-status ${log.status}">${statusText}</div>
        `;
        list.appendChild(div);
    });
}

function renderAccountInfo(info) {
    const el = document.getElementById('userInfo');
    const btnSync = document.getElementById('btnSync');
    const btnUnlink = document.getElementById('btnUnlink');

    const newBtnUnlink = btnUnlink.cloneNode(true);
    btnUnlink.parentNode.replaceChild(newBtnUnlink, btnUnlink);

    newBtnUnlink.addEventListener('click', async () => {
        const confirmed = await Modal.confirm(i18n.get('msg_unlink_confirm'));
        if (!confirmed) return;

        chrome.runtime.sendMessage({ action: "logout" }, async (res) => {
            if (chrome.runtime.lastError) {
                await Modal.alert(i18n.get('err_prefix') + chrome.runtime.lastError.message);
                return;
            }
            if (res && res.code === "SUCCESS") {
                await Modal.alert(i18n.get('msg_unlinked'));
                renderAccountInfo(null);
                storage.get(['checkInLogs'], (d) => renderLogs(d.checkInLogs));
            }
        });
    });

    if (info && info.cred && info.role) {
        let accountInfoText = "";

        if (info.uid && info.uid !== "Linked") {
            accountInfoText = `<div style="margin-top:4px; font-size:12px; color:#D4D94A; font-weight:500;">UID: ${info.uid}</div>`;
        }
        else if (typeof info.role === 'string') {
            const parts = info.role.split('_');
            if (parts.length >= 3) {
                const roleId = parts[1];
                accountInfoText = `<div style="margin-top:4px; font-size:12px; color:#D4D94A; font-weight:500;">UID: ${roleId}</div>`;
            } else {
                accountInfoText = `<div style="margin-top:4px; font-size:12px; color:#D4D94A; font-weight:500;">UID: ${info.role}</div>`;
            }
        }

        el.innerHTML = `${i18n.get('info_linked')} <span style="color:#34C759">●</span>${accountInfoText}<br><span style="font-size:10px;color:#888; font-weight:400">${i18n.get('last_edit')}${info.lastSync}</span>`;
        btnSync.innerText = i18n.get('btn_sync_refresh');
        newBtnUnlink.style.display = "block";
    } else {
        el.innerHTML = `${i18n.get('info_not_linked')} <span style="color:#FF3B30">●</span><br><span style="font-size:10px;color:#888; font-weight:400">${i18n.get('info_msg_not_found')}</span>`;
        btnSync.innerText = i18n.get('btn_sync_start');
        newBtnUnlink.style.display = "none";
    }
}

async function handleSaveWebhook() {
    const webhookUrl = document.getElementById('webhookUrl').value.trim();

    if (!webhookUrl) {
        const config = { webhookUrl: "" };
        await storage.set({ discordConfig: config });
        await Modal.alert(i18n.get('msg_webhook_disabled'), i18n.get('modal_alert_title'));
        renderDiscordConfig(config);
        return;
    }

    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
        await Modal.alert(i18n.get('msg_webhook_invalid'), i18n.get('modal_error_title'));
        return;
    }

    const config = {
        webhookUrl: webhookUrl,
        lastSync: new Date().toLocaleString('ko-KR')
    };

    await storage.set({ discordConfig: config });
    await Modal.alert(i18n.get('msg_webhook_saved'), i18n.get('modal_success_title'));
    renderDiscordConfig(config);
}



async function handleTestWebhook() {
    const webhookUrl = document.getElementById('webhookUrl').value.trim();

    if (!webhookUrl) {
        await Modal.alert(i18n.get('msg_webhook_req_save'), i18n.get('modal_error_title'));
        return;
    }

    const data = await storage.get(['discordConfig', 'accountInfo']);
    const config = data.discordConfig || {};

    const testType = await showTestTypeModal();
    if (!testType) return;

    const btn = document.getElementById('btnTestWebhook');
    const originalText = btn.innerText;
    btn.innerText = i18n.get('msg_test_sending');
    btn.disabled = true;

    try {
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "sendTestWebhook", testType: testType }, resolve);
        });

        if (response && response.code === "SUCCESS") {
            await Modal.alert(i18n.get('msg_test_success'), i18n.get('modal_success_title'));
        } else {
            const errorMsg = response ? response.msg : "Unknown Error";
            await Modal.alert(i18n.get('msg_test_fail') + errorMsg, i18n.get('modal_error_title'));
        }
    } catch (error) {
        await Modal.alert(i18n.get('msg_test_fail') + error.message, i18n.get('modal_error_title'));
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}


function showTestTypeModal() {
    return new Promise((resolve) => {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay active';
        modalOverlay.style.zIndex = '10000';

        modalOverlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-title">${i18n.get('test_modal_title')}</div>
                <div class="modal-message" style="text-align: left;">
                    <button id="tempTestSuccess" class="btn-primary full-width" style="margin-bottom: 8px;">${i18n.get('test_btn_success')}</button>
                    <button id="tempTestAlready" class="btn-primary full-width" style="margin-bottom: 8px; background: rgba(52, 112, 219, 0.3); color: #3498db;">${i18n.get('test_btn_already')}</button>
                    <button id="tempTestFail" class="btn-primary full-width" style="margin-bottom: 8px; background: rgba(255, 59, 48, 0.3); color: #FF3B30;">${i18n.get('test_btn_fail')}</button>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="tempTestCancel">${i18n.get('btn_cancel')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        const close = (result) => {
            document.body.removeChild(modalOverlay);
            resolve(result);
        };

        document.getElementById('tempTestSuccess').onclick = () => close('SUCCESS');
        document.getElementById('tempTestAlready').onclick = () => close('ALREADY_DONE');
        document.getElementById('tempTestFail').onclick = () => close('FAIL');
        document.getElementById('tempTestCancel').onclick = () => close(null);
    });
}

function showLanguageModal() {
    return new Promise((resolve) => {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay active';
        modalOverlay.style.zIndex = '10000';

        modalOverlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-title">${i18n.get('modal_lang_title')}</div>
                <div class="modal-message" style="text-align: center;">
                    <button id="langKo" class="btn-primary full-width" style="margin-bottom: 8px; background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);">한국어</button>
                    <button id="langEn" class="btn-primary full-width" style="margin-bottom: 8px; background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);">English</button>
                    <button id="langJa" class="btn-primary full-width" style="margin-bottom: 8px; background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);">日本語</button>
                    <button id="langZh" class="btn-primary full-width" style="margin-bottom: 8px; background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);">简体中文</button>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="langCancel">${i18n.get('btn_cancel')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        const close = (result) => {
            document.body.removeChild(modalOverlay);
            resolve(result);
        };

        document.getElementById('langKo').onclick = () => close('ko');
        document.getElementById('langEn').onclick = () => close('en');
        document.getElementById('langJa').onclick = () => close('ja');
        document.getElementById('langZh').onclick = () => close('zh');
        document.getElementById('langCancel').onclick = () => close(null);
    });
}

function createTestEmbed(type, accountInfo) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kstDate = new Date(utc + (3600000 * 9));

    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getDate()).padStart(2, '0');
    const hours = String(kstDate.getHours()).padStart(2, '0');
    const minutes = String(kstDate.getMinutes()).padStart(2, '0');
    const dateTimeStr = `${year}-${month}-${day} ${hours}:${minutes}`;

    const randomDays = Math.floor(Math.random() * 30) + 1;

    const footerText = (accountInfo && accountInfo.uid)
        ? `UID: ${accountInfo.uid}`
        : i18n.get('footer_text');
    if (type === 'SUCCESS') {
        return {
            title: i18n.get('embed_test_success_title'),
            color: 13883715,
            fields: [
                { name: i18n.get('field_date'), value: dateTimeStr, inline: false },
                { name: i18n.get('field_accumulated'), value: `${randomDays}${i18n.get('val_days')}`, inline: true },
                { name: i18n.get('field_reward'), value: `${i18n.get('val_test_item')} x1`, inline: true }
            ],
            thumbnail: {
                url: "https://img.icons8.com/color/96/gift--v1.png"
            },
            footer: { text: footerText },
            timestamp: now.toISOString()
        };
    } else if (type === 'ALREADY_DONE') {
        return {
            title: i18n.get('embed_test_already_title'),
            color: 3447003,
            fields: [
                { name: i18n.get('field_date'), value: dateTimeStr, inline: false },
                { name: i18n.get('field_status'), value: i18n.get('val_already_msg'), inline: false }
            ],
            footer: { text: footerText },
            timestamp: now.toISOString()
        };
    } else {
        return {
            title: i18n.get('embed_test_fail_title'),
            color: 16711680,
            fields: [
                { name: i18n.get('field_date'), value: dateTimeStr, inline: false },
                { name: i18n.get('field_error'), value: i18n.get('val_test_error'), inline: false }
            ],
            footer: { text: footerText },
            timestamp: now.toISOString()
        };
    }
}

function renderDiscordConfig(config) {
    const webhookUrlInput = document.getElementById('webhookUrl');
    const statusDiv = document.getElementById('discordStatus');

    if (config) {
        webhookUrlInput.value = config.webhookUrl || '';

        if (config.webhookUrl) {
            const status = i18n.get('status_active');
            const color = '#34C759';
            statusDiv.innerHTML = `<span style="color:${color}">●</span> ${status}<br><span style="font-size:10px; color:#888;">${i18n.get('last_edit')}${config.lastSync || '-'}</span>`;
        } else {
            const status = i18n.get('status_disabled');
            const color = '#888';
            statusDiv.innerHTML = `<span style="color:${color}">●</span> ${status}`;
        }
    } else {
        webhookUrlInput.value = '';
        const status = i18n.get('status_not_set');
        const color = '#888';
        statusDiv.innerHTML = `<span style="color:${color}">●</span> ${status}`;
    }
}

function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerText = i18n.get(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = i18n.get(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = i18n.get(el.dataset.i18nHtml);
    });

    const btnLang = document.getElementById('btnLang');
    if (btnLang) btnLang.innerText = i18n.lang.toUpperCase();
}
