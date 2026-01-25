const storage = chrome.storage.local;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 데이터 로드 및 UI 초기화
    const data = await storage.get(['isGlobalActive', 'lastStatus', 'lastCheckDate', 'lastCheckTime', 'accountInfo', 'checkInLogs', 'isRunning']);

    document.getElementById('globalToggle').checked = data.isGlobalActive !== false;
    renderStatus(data);
    renderLogs(data.checkInLogs);
    renderAccountInfo(data.accountInfo);

    // 2. 이벤트 리스너
    document.getElementById('btnSettings').addEventListener('click', () => {
        document.getElementById('mainView').style.display = 'none';
        document.getElementById('settingsView').style.display = 'flex';
    });

    document.getElementById('btnBack').addEventListener('click', () => {
        document.getElementById('settingsView').style.display = 'none';
        document.getElementById('mainView').style.display = 'block';
    });

    // 계정 연동 버튼
    document.getElementById('btnSync').addEventListener('click', handleSyncClick);

    // 데이터 초기화 버튼
    document.getElementById('btnReset').addEventListener('click', handleReset);

    // 수동 실행 버튼
    document.getElementById('runNowBtn').addEventListener('click', handleManualRun);

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
        });
    });
});

// --- 핸들러 함수 ---


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

    if (!tab.url.includes("skport.com")) {
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
        return;
    }

    // [수정] '완료 (O)' -> '완료'
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

    // [중요] 기존 이벤트 리스너 제거가 어려우므로, 요소를 복제해서 교체하는 방식 사용
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

    if (info && info.cred) {
        let accountInfoText = "";
        if (info.role && typeof info.role === 'string') {
            const parts = info.role.split('_');
            if (parts.length >= 3) {
                const roleId = parts[1];
                const serverId = parts[2];
                accountInfoText = `<div style="margin-top:4px; font-size:12px; color:#D4D94A; font-weight:500;">계정 ID: ${roleId}</div><div style="font-size:11px; color:#999;">서버: ${serverId}</div>`;
            }
        }

        el.innerHTML = `연동됨 <span style="color:#34C759">●</span>${accountInfoText}<br><span style="font-size:10px;color:#888; font-weight:400">최근: ${info.lastSync}</span>`;
        btnSync.innerText = "연동 갱신";
        newBtnUnlink.style.display = "block";
    } else {
        el.innerHTML = `연동 안됨 <span style="color:#FF3B30">●</span><br><span style="font-size:10px;color:#888; font-weight:400">로그인 후 버튼을 눌러주세요</span>`;
        btnSync.innerText = "계정 연동하기";
        newBtnUnlink.style.display = "none";
    }
}