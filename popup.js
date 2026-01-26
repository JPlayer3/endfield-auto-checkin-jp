const storage = chrome.storage.local;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 데이터 로드 및 UI 초기화
    const data = await storage.get(['isGlobalActive', 'lastStatus', 'lastCheckDate', 'lastCheckTime', 'accountInfo', 'checkInLogs', 'isRunning', 'discordConfig']);

    document.getElementById('globalToggle').checked = data.isGlobalActive !== false;
    renderStatus(data);
    renderLogs(data.checkInLogs);
    renderAccountInfo(data.accountInfo);
    renderDiscordConfig(data.discordConfig);

    // 2. 이벤트 리스너
    document.getElementById('btnSettings').addEventListener('click', () => {
        const settingsView = document.getElementById('settingsView');
        const mainView = document.getElementById('mainView');
        const discordView = document.getElementById('discordView');

        // 토글: 설정 화면이 이미 열려있으면 메인으로, 아니면 설정으로
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

        // 토글: 디스코드 화면이 이미 열려있으면 메인으로, 아니면 디스코드로
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

    // 계정 연동 버튼
    document.getElementById('btnSync').addEventListener('click', handleSyncClick);

    // 데이터 초기화 버튼
    document.getElementById('btnReset').addEventListener('click', handleReset);

    // 수동 실행 버튼
    document.getElementById('runNowBtn').addEventListener('click', handleManualRun);



    // Discord event listeners
    document.getElementById('btnSaveWebhook').addEventListener('click', handleSaveWebhook);
    document.getElementById('btnTestWebhook').addEventListener('click', handleTestWebhook);
    document.getElementById('discordToggle').addEventListener('change', async (e) => {
        const data = await storage.get(['discordConfig']);
        const config = data.discordConfig || {};
        config.enabled = e.target.checked;
        await storage.set({ discordConfig: config });
        renderDiscordConfig(config);
    });

    // Webhook help button
    document.getElementById('btnWebhookHelp').addEventListener('click', async () => {
        await Modal.alert(
            "1. 디스코드 서버 → 서버 설정 → 연동\n2. 웹후크 → 새 웹후크\n3. 웹후크 URL 복사 → 위에 붙여넣기",
            "웹훅 URL 얻는 방법"
        );
    });

    // 토글 스위치
    document.getElementById('globalToggle').addEventListener('change', (e) => {
        storage.set({ isGlobalActive: e.target.checked });
        location.reload();
    });

    // 연동 해제 버튼 리스너는 renderAccountInfo에서 동적으로 등록/제거함

    // 3. 상태 변화 감지
    chrome.storage.onChanged.addListener((changes) => {
        storage.get(null, (newData) => {
            renderStatus(newData);
            if (changes.checkInLogs) renderLogs(newData.checkInLogs);
            if (changes.accountInfo) renderAccountInfo(newData.accountInfo);
            if (changes.discordConfig) renderDiscordConfig(newData.discordConfig);
        });
    });
});


// --- Modal Class ---
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
                this.btnOk.innerText = '네';
                this.btnCancel.innerText = '아니오';
            } else {
                this.btnCancel.style.display = 'none';
                this.btnOk.innerText = '확인';
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

    static async alert(msg, title = "알림") {
        return await this.show(title, msg, false);
    }

    static async confirm(msg, title = "확인") {
        return await this.show(title, msg, true);
    }
}

Modal.init();

// --- 핸들러 함수 ---

async function handleSyncClick() {
    const btn = document.getElementById('btnSync');
    btn.innerText = "분석 중...";
    btn.disabled = true;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes("skport.com")) {
        await Modal.alert("SKPORT 엔드필드 출석체크 페이지에서 실행해주세요.");
        btn.innerText = "계정 연동 갱신";
        btn.disabled = false;
        return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "getLocalStorage" }, (response) => {
        const storageData = response || {};

        chrome.runtime.sendMessage({
            action: "syncAccount",
            storageData: storageData
        }, async (res) => {
            btn.innerText = "계정 연동 갱신";
            btn.disabled = false;

            if (res && res.code === "SUCCESS") {
                renderAccountInfo(res.data);
                storage.get(['checkInLogs'], (d) => renderLogs(d.checkInLogs));
                await Modal.alert("연동 완료! 모든 인증 정보가 안전하게 저장되었습니다.", "성공");
            } else {
                await Modal.alert("연동 실패: " + (res ? res.msg : "알 수 없는 오류"), "오류");
            }
        });
    });
}

function handleManualRun() {
    chrome.runtime.sendMessage({ action: "manualRun" });
    document.getElementById('statusDisplay').innerHTML = '<span style="color:#FF9500">Checking...</span>';
}



async function handleReset() {
    const confirmed = await Modal.confirm(
        "확장 프로그램의 모든 설정과 로그를 삭제하고,\nSKPORT/엔드필드 사이트의 로그인 정보(쿠키)도 삭제합니다.\n\n401 오류가 계속될 때 사용하세요.\n정말 초기화하시겠습니까?",
        "데이터 초기화"
    );

    if (!confirmed) return;

    chrome.runtime.sendMessage({ action: "resetData" }, async (res) => {
        if (res && res.code === "SUCCESS") {
            await Modal.alert("모든 데이터가 초기화되었습니다.\n사이트에 다시 로그인해주세요.", "초기화 완료");
            location.reload();
        } else {
            await Modal.alert("초기화 실패", "오류");
        }
    });
}

// --- 렌더링 함수 ---

function renderStatus(data) {
    const statusEl = document.getElementById('statusDisplay');
    const timeEl = document.getElementById('lastRunDisplay');

    if (data.isGlobalActive === false) {
        statusEl.innerHTML = '<span style="color:#666">OFF</span>';

        // OFF 상태일 때 주요 버튼 숨김
        document.getElementById('btnSettings').style.display = 'none';
        document.getElementById('runNowBtn').style.display = 'none';

        return;
    }

    // ON 상태: 버튼 다시 표시
    document.getElementById('btnSettings').style.display = '';
    document.getElementById('runNowBtn').style.display = '';

    if (data.lastStatus === "SUCCESS") {
        statusEl.innerHTML = '<span style="color:#34C759">완료</span>';

    } else if (data.lastStatus === "FAIL" || data.lastStatus === "NOT_LOGGED_IN") {
        statusEl.innerHTML = '<span style="color:#FF3B30">실패</span>';

    } else {
        statusEl.innerHTML = '<span style="color:#FF9500">대기 중</span>';

    }

    timeEl.innerText = data.lastCheckTime ? `마지막 실행: ${data.lastCheckTime}` : "마지막 실행: -";
}

function renderLogs(logs) {
    const list = document.getElementById('logList');
    list.innerHTML = "";

    if (!logs || logs.length === 0) {
        list.innerHTML = "<div style='text-align:center; color:#666; padding:10px;'>기록 없음</div>";
        return;
    }

    logs.forEach(log => {
        const div = document.createElement('div');
        div.className = "log-item";
        div.innerHTML = `
            <div>
                <div class="log-date">${log.date}</div>
                <div class="log-msg">${log.msg}</div>
            </div>
            <div class="log-status ${log.status}">${log.status}</div>
        `;
        list.appendChild(div);
    });
}

function renderAccountInfo(info) {
    const el = document.getElementById('userInfo');
    const btnSync = document.getElementById('btnSync');
    const btnUnlink = document.getElementById('btnUnlink');

    // 기존 이벤트 리스너 제거가 어려우므로, 요소를 복제해서 교체하는 방식 사용
    const newBtnUnlink = btnUnlink.cloneNode(true);
    btnUnlink.parentNode.replaceChild(newBtnUnlink, btnUnlink);

    // 새 리스너 등록
    newBtnUnlink.addEventListener('click', async () => {
        const confirmed = await Modal.confirm("정말 계정 연동을 해제하시겠습니까?\n자동 출석이 중단됩니다.");
        if (!confirmed) return;

        chrome.runtime.sendMessage({ action: "logout" }, async (res) => {
            if (res && res.code === "SUCCESS") {
                await Modal.alert("연동이 해제되었습니다.");
                renderAccountInfo(null);
                storage.get(['checkInLogs'], (d) => renderLogs(d.checkInLogs));
            }
        });
    });

    if (info && info.cred && info.role) {
        let accountInfoText = "";
        if (typeof info.role === 'string') {
            const parts = info.role.split('_');
            if (parts.length >= 3) {
                const roleId = parts[1];
                const serverId = parts[2];
                accountInfoText = `<div style="margin-top:4px; font-size:12px; color:#D4D94A; font-weight:500;">계정 ID: ${roleId}</div><div style="font-size:11px; color:#999;">서버: ${serverId}</div>`;
            } else {
                accountInfoText = `<div style="margin-top:4px; font-size:12px; color:#D4D94A; font-weight:500;">계정 ID: ${info.role}</div>`;
            }
        }

        el.innerHTML = `연동됨 <span style="color:#34C759">●</span>${accountInfoText}<br><span style="font-size:10px;color:#888; font-weight:400">최근: ${info.lastSync}</span>`;
        btnSync.innerText = "연동 갱신";
        newBtnUnlink.style.display = "block";
    } else {
        el.innerHTML = `연동 안됨 <span style="color:#FF3B30">●</span><br><span style="font-size:10px;color:#888; font-weight:400">캐릭터 ID 정보를 찾을 수 없습니다.<br>로그아웃 후 재로그인하고 다시 진행해주세요</span>`;
        btnSync.innerText = "계정 연동하기";
        newBtnUnlink.style.display = "none";
    }
}

// --- Discord 핸들러 함수 ---

async function handleSaveWebhook() {
    const webhookUrl = document.getElementById('webhookUrl').value.trim();

    if (!webhookUrl) {
        await Modal.alert("웹훅 URL을 입력해주세요.", "오류");
        return;
    }

    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
        await Modal.alert("올바른 디스코드 웹훅 URL이 아닙니다.", "오류");
        return;
    }

    const config = {
        enabled: document.getElementById('discordToggle').checked,
        webhookUrl: webhookUrl,
        lastSync: new Date().toLocaleString('ko-KR')
    };

    await storage.set({ discordConfig: config });
    await Modal.alert("디스코드 웹훅이 저장되었습니다!", "성공");
    renderDiscordConfig(config);
}

async function handleTestWebhook() {
    // 테스트 메시지는 알림 활성화 여부 및 출석 상태와 무관하게 전송
    const webhookUrl = document.getElementById('webhookUrl').value.trim();

    if (!webhookUrl) {
        await Modal.alert("먼저 웹훅 URL을 입력하고 저장해주세요.", "오류");
        return;
    }

    // 토글 상태 확인
    const data = await storage.get(['discordConfig']);
    const config = data.discordConfig || {};

    if (!config.enabled) {
        await Modal.alert("알림 활성화를 먼저 켜주세요.", "알림");
        return;
    }

    // 테스트 유형 선택
    const testType = await showTestTypeModal();
    if (!testType) return; // 취소한 경우

    const btn = document.getElementById('btnTestWebhook');
    const originalText = btn.innerText;
    btn.innerText = "전송 중...";
    btn.disabled = true;

    try {
        const testEmbed = createTestEmbed(testType);

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ embeds: [testEmbed] })
        });

        if (response.ok) {
            await Modal.alert("테스트 메시지가 성공적으로 전송되었습니다!\n디스코드 채널을 확인해보세요.", "성공");
        } else {
            const errorText = await response.text();
            await Modal.alert(`전송 실패: ${response.status} ${response.statusText}\n${errorText}`, "오류");
        }
    } catch (error) {
        await Modal.alert(`전송 중 오류 발생: ${error.message}`, "오류");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}


function showTestTypeModal() {
    return new Promise((resolve) => {
        // Create a temporary modal element
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay active'; // Use the same CSS class for styling
        modalOverlay.style.zIndex = '10000'; // Ensure it's on top

        modalOverlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-title">테스트 메시지 유형 선택</div>
                <div class="modal-message" style="text-align: left;">
                    <button id="tempTestSuccess" class="btn-primary full-width" style="margin-bottom: 8px;">✅ 출석 성공</button>
                    <button id="tempTestAlready" class="btn-primary full-width" style="margin-bottom: 8px; background: rgba(52, 112, 219, 0.3); color: #3498db;">ℹ️ 이미 완료됨</button>
                    <button id="tempTestFail" class="btn-primary full-width" style="margin-bottom: 8px; background: rgba(255, 59, 48, 0.3); color: #FF3B30;">❌ 출석 실패</button>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="tempTestCancel">취소</button>
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

function createTestEmbed(type) {
    const now = new Date();
    // YYYY-MM-DD HH:MM 형식 (KST)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kstDate = new Date(utc + (3600000 * 9));

    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getDate()).padStart(2, '0');
    const hours = String(kstDate.getHours()).padStart(2, '0');
    const minutes = String(kstDate.getMinutes()).padStart(2, '0');
    const dateTimeStr = `${year}-${month}-${day} ${hours}:${minutes}`;

    // Random accumulated days (1 ~ 30)
    const randomDays = Math.floor(Math.random() * 30) + 1;

    if (type === 'SUCCESS') {
        return {
            title: "[테스트] 🎉 엔드필드 출석 체크 완료!",
            color: 13883715, // #d3d943
            fields: [
                { name: "📅 일시", value: dateTimeStr, inline: false },
                { name: "📊 누적 출석", value: `${randomDays}일`, inline: true },
                { name: "🎁 오늘의 보상", value: "테스트 아이템 x1", inline: true }
            ],
            thumbnail: {
                url: "https://img.icons8.com/color/96/gift--v1.png"
            },
            footer: { text: "Endfield Auto Check-in" },
            timestamp: now.toISOString()
        };
    } else if (type === 'ALREADY_DONE') {
        return {
            title: "[테스트] ✅ 출석 체크 이미 완료됨",
            color: 3447003, // Blue
            fields: [
                { name: "📅 일시", value: dateTimeStr, inline: false },
                { name: "ℹ️ 상태", value: "오늘 출석 체크가 이미 완료되었습니다.", inline: false }
            ],
            footer: { text: "Endfield Auto Check-in" },
            timestamp: now.toISOString()
        };
    } else { // FAIL
        return {
            title: "[테스트] ⚠️ 엔드필드 출석 체크 실패",
            color: 16711680, // Red
            fields: [
                { name: "📅 일시", value: dateTimeStr, inline: false },
                { name: "❌ 오류 내용", value: "테스트 오류 메시지입니다.", inline: false }
            ],
            footer: { text: "Endfield Auto Check-in" },
            timestamp: now.toISOString()
        };
    }
}

function renderDiscordConfig(config) {
    const webhookUrlInput = document.getElementById('webhookUrl');
    const discordToggle = document.getElementById('discordToggle');
    const statusDiv = document.getElementById('discordStatus');

    // 토글 상태는 config가 있으면 항상 설정 (URL 여부와 무관)
    if (config) {
        discordToggle.checked = config.enabled !== false;
        webhookUrlInput.value = config.webhookUrl || '';

        if (config.webhookUrl) {
            const status = config.enabled ? '활성화됨' : '비활성화됨';
            const color = config.enabled ? '#34C759' : '#FF9500';
            statusDiv.innerHTML = `<span style="color:${color}">●</span> ${status}<br><span style="font-size:10px; color:#888;">최근 수정: ${config.lastSync || '-'}</span>`;
        } else {
            statusDiv.innerHTML = '웹훅 URL을 설정해주세요';
        }
    } else {
        webhookUrlInput.value = '';
        discordToggle.checked = false;
        statusDiv.innerHTML = '설정되지 않음';
    }
}
