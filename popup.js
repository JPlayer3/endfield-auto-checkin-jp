const storage = chrome.storage.local;

document.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
    applyI18n();

    const data = await storage.get(['lastStatus', 'lastCheckDate', 'lastCheckTime', 'lastSignCount', 'accountInfo', 'checkInLogs', 'isRunning', 'discordConfig']);

    renderStatus(data);
    renderLogs(data.checkInLogs);

    renderDiscordConfig(data.discordConfig);

    checkAnnouncement();

    document.getElementById('btnLang').addEventListener('click', async () => {
        const selectedLang = await showLanguageModal();
        if (selectedLang) {
            await i18n.setLanguage(selectedLang);
            applyI18n();
            storage.get(['lastStatus', 'lastCheckTime', 'accountInfo', 'checkInLogs', 'discordConfig'], (d) => {
                renderStatus(d);
                renderLogs(d.checkInLogs);

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
            if (this.useHtml) {
                this.msgEl.innerHTML = msg;
            } else {
                this.msgEl.innerText = msg;
            }

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

    static async alert(msg, title = null, useHtml = false) {
        this.useHtml = useHtml;
        return await this.show(title || i18n.get('modal_alert_title'), msg, false);
    }

    static async confirm(msg, title = null, useHtml = false) {
        this.useHtml = useHtml;
        return await this.show(title || i18n.get('modal_confirm_title'), msg, true);
    }
}

Modal.init();

function handleManualRun() {
    chrome.runtime.sendMessage({ action: "manualRun" }, (res) => {
        if (chrome.runtime.lastError) {
            console.error("Manual Run Error:", chrome.runtime.lastError);
        }
    });
    document.getElementById('statusDisplay').innerHTML = `<span style="color:#FF9500">${i18n.get('status_checking')}</span>`;
}

function renderStatus(data) {
    const statusEl = document.getElementById('statusDisplay');
    const timeEl = document.getElementById('lastRunDisplay');

    document.getElementById('btnSettings').style.display = '';
    document.getElementById('runNowBtn').style.display = '';

    document.getElementById('runNowBtn').style.display = '';

    if (data.isRunning) {
        statusEl.innerHTML = `<span style="color:#FF9500">${i18n.get('status_checking')}</span>`;

    } else if (data.lastStatus === "SUCCESS" || data.lastStatus === "ALREADY_DONE") {
        statusEl.innerHTML = `<span style="color:#34C759">${i18n.get('status_success')}</span>`;

    } else if (data.lastStatus === "FAIL" || data.lastStatus === "NOT_LOGGED_IN") {
        statusEl.innerHTML = `<span style="color:#FF3B30">${i18n.get('status_fail')}</span>`;

    } else {
        statusEl.innerHTML = `<span style="color:#FF9500">${i18n.get('status_waiting')}</span>`;

    }

    const accDaysEl = document.getElementById('accDaysDisplay');
    if (data.lastSignCount) {
        accDaysEl.innerText = `${i18n.get('field_accumulated') || 'Accumulated'}: ${data.lastSignCount}${i18n.get('val_days') || 'Days'}`;
    } else {
        accDaysEl.innerText = "";
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
        else if (log.status === 'ALREADY_DONE') statusText = i18n.get('status_success');
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

    const data = await storage.get(['discordConfig']);
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

async function checkAnnouncement() {
    try {
        const gistId = "f866bc3f043a0da3ddd231891bb1d6f7";
        const apiUrl = `https://api.github.com/gists/${gistId}?t=${new Date().getTime()}`;

        const response = await fetch(apiUrl);
        if (!response.ok) return;

        const data = await response.json();
        if (!data.files || !data.files['extension-announce-modal.json']) return;

        const fileContent = data.files['extension-announce-modal.json'].content;
        const announceData = JSON.parse(fileContent);

        if (!announceData.active) return;

        const storageData = await storage.get('lastSeenAnnouncementDate');
        const lastSeen = storageData.lastSeenAnnouncementDate;
        const updatedAt = data.updated_at;

        if (lastSeen === updatedAt) return;

        const lang = i18n.lang || 'ko';
        const content = announceData.contents[lang] || announceData.contents['ko'];

        if (!content) return;

        let messageHtml = content.message.replace(/\n/g, '<br>');

        const linkTitles = {
            'ko': "🔗 링크",
            'en': "🔗 Link",
            'ja': "🔗 リンク",
            'zh': "🔗 链接"
        };
        const linkTitle = linkTitles[lang] || linkTitles['en'];

        if (content.link) {
            messageHtml += `<br><br><a href="${content.link}" target="_blank" style="color: #4A90E2; text-decoration: none; font-weight: bold;">${linkTitle}</a>`;
        }

        await Modal.alert(messageHtml, content.title, true);

        await storage.set({ lastSeenAnnouncementDate: updatedAt });

    } catch (e) {
        console.log("Announcement check failed:", e);
    }
}
