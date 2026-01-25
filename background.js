/**
 * Endfield Auto Check-in v13.8 (Communication Fixed)
 */

const API_ATTEND = "https://zonai.skport.com/web/v1/game/endfield/attendance";
const API_BINDING = "https://zonai.skport.com/api/v1/game/player/binding";
const REFERER_URL = "https://game.skport.com/";
// [중요] 쿠키 탐색 도메인 명시
const TARGET_DOMAINS = ["skport.com", "game.skport.com", "gryphline.com"];
const ALARM_NAME = "dailyCheckIn";

class AccountStore {
    async get(key) {
        const data = await chrome.storage.local.get([key]);
        return data[key];
    }
    async set(key, value) {
        return chrome.storage.local.set({ [key]: value });
    }

    async addLog(status, message) {
        let logs = (await this.get('checkInLogs')) || [];
        const now = new Date().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        logs.unshift({ date: now, status: status, msg: message });
        if (logs.length > 3) logs = logs.slice(0, 3);
        await this.set('checkInLogs', logs);
    }

    async saveAccount(info) { await this.set('accountInfo', info); }
    async getAccount() { return await this.get('accountInfo'); }
    async isAutoRunActive() { return (await this.get('isGlobalActive')) !== false; }

    async saveResult(status, date, time) {
        const uiStatus = (status === "ALREADY_DONE") ? "SUCCESS" : status;
        await this.set('lastStatus', uiStatus);
        await this.set('lastCheckDate', date);
        await this.set('lastCheckTime', time);
        await this.set('isRunning', false);
    }
}

class CheckInService {
    constructor(store) { this.store = store; }

    getServerTodayString() {
        const now = new Date();
        const utc8Time = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3600000 * 8));
        return utc8Time.toISOString().split('T')[0];
    }

    async getHeaders(method, cred, role) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const headers = {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "ko,ko-KR;q=0.9,en-US;q=0.8,en;q=0.7",
            "Origin": "https://game.skport.com",
            "Referer": REFERER_URL,
            "User-Agent": navigator.userAgent,
            "Platform": "3",
            "Vname": "1.0.0",
            "Sk-Language": "ko",
            "Timestamp": timestamp
        };

        if (method === "POST") headers["Content-Type"] = "application/json";

        if (!cred || !role) {
            const account = await this.store.getAccount();
            if (account) {
                cred = cred || account.cred;
                role = role || account.role;
            }
        }

        if (cred) headers["cred"] = cred;
        if (role) headers["sk-game-role"] = role;

        return headers;
    }

    async fetchWithRetry(url, options, retries = 1) {
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.status === 401) throw new Error("401 Unauthorized");
                if (response.ok) return response;
                throw new Error(`HTTP ${response.status}`);
            } catch (err) {
                if (i === retries) throw err;
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }

    // [강화] 모든 도메인 쿠키 수집
    async getAllCookies() {
        let allCookies = [];
        for (const domain of TARGET_DOMAINS) {
            try {
                const cookies = await chrome.cookies.getAll({ domain: domain });
                allCookies = allCookies.concat(cookies);
            } catch (e) { }
        }
        return allCookies;
    }

    findCredInCookies(cookies) {
        // sk_cred가 cred보다 우선순위가 높을 수 있음
        const target = cookies.find(c => c.name === 'cred' || c.name === 'sk_cred');
        return target ? target.value : null;
    }

    async fetchGameRole(cred) {
        try {
            const headers = await this.getHeaders("GET", cred, null);
            const url = `${API_BINDING}?gameId=3`;
            const response = await this.fetchWithRetry(url, {
                method: "GET", headers: headers, credentials: "include"
            });
            const data = await response.json();

            if (data.code === 0 && data.data?.list?.[0]?.bindingList?.[0]?.roles?.[0]) {
                const roleData = data.data.list[0].bindingList[0].roles[0];
                return `3_${roleData.roleId}_${roleData.serverId}`;
            }
            return null;
        } catch (e) { return null; }
    }

    async syncAccountData(localStorageData) {
        try {
            const cookies = await this.getAllCookies();

            // 1. cred 찾기 (로컬스토리지 우선 -> 쿠키)
            let cred = localStorageData?.cred || this.findCredInCookies(cookies);

            if (!cred) {
                // ZIP 파일 버전처럼 정밀 스캔에도 없으면 실패
                throw new Error("로그인 정보를 찾을 수 없습니다.\n사이트에 로그인되어 있는지 확인해주세요.");
            }

            // 2. role 찾기 (로컬스토리지 우선 -> API 조회)
            let role = localStorageData?.role;
            if (!role) {
                role = await this.fetchGameRole(cred);
            }

            if (!role) {
                console.warn("캐릭터 정보(Role)를 찾지 못했습니다. (연동은 진행)");
            }

            // 3. API 테스트
            const headers = await this.getHeaders("GET", cred, role);
            const response = await this.fetchWithRetry(API_ATTEND, {
                method: "GET", headers: headers, credentials: "include"
            });

            if (!response.ok) throw new Error("API 테스트 실패");

            const accountInfo = {
                uid: "Linked",
                cred: cred,
                role: role || "",
                cookies: cookies,
                lastSync: new Date().toLocaleString('ko-KR')
            };

            await this.store.saveAccount(accountInfo);
            return { code: "SUCCESS", data: accountInfo };

        } catch (e) {
            return { code: "FAIL", msg: e.message };
        }
    }

    async executeAttendance() {
        try {
            const account = await this.store.getAccount();
            if (!account || !account.cred) return { code: "NOT_LOGGED_IN", msg: "계정 연동 필요" };

            // 1. GET (상태 확인)
            const getHeaders = await this.getHeaders("GET", account.cred, account.role);
            const getRes = await this.fetchWithRetry(API_ATTEND, {
                method: "GET", headers: getHeaders, credentials: "include"
            });
            const getData = await getRes.json();

            if (getData.code === 0 && getData.data && getData.data.hasToday) {
                return { code: "ALREADY_DONE", msg: "이미 완료됨" };
            }

            // 2. POST (출석)
            const postHeaders = await this.getHeaders("POST", account.cred, account.role);
            const postRes = await this.fetchWithRetry(API_ATTEND, {
                method: "POST", headers: postHeaders, credentials: "include", body: JSON.stringify({})
            });
            const postData = await postRes.json();

            if (postData.code === 0 || postData.message === "OK") {
                return { code: "SUCCESS", msg: "출석 성공" };
            } else if (postData.code === 10001) {
                return { code: "ALREADY_DONE", msg: "이미 완료됨" };
            } else {
                return { code: "FAIL", msg: postData.message || "오류" };
            }
        } catch (e) {
            return { code: "ERROR", msg: e.message };
        }
    }
}

class CheckInController {
    constructor() {
        this.store = new AccountStore();
        this.service = new CheckInService(this.store);
    }
    init() {
        chrome.alarms.create(ALARM_NAME, { periodInMinutes: 30 });
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === ALARM_NAME) this.run(false);
        });

        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (msg.action === "manualRun") {
                this.run(true);
            }
            else if (msg.action === "syncAccount") {
                this.service.syncAccountData(msg.storageData).then(async res => {
                    if (res.code === "SUCCESS") {
                        this.store.addLog("SYNC", "계정 연동 성공");
                        const result = await this.service.executeAttendance();
                        this.handleResult(result);
                    }
                    else this.store.addLog("ERROR", res.msg);
                    sendResponse(res);
                });
                return true;
            }
            else if (msg.action === "logout") {
                this.store.set('accountInfo', null).then(() => {
                    this.store.addLog("LOGOUT", "연동 해제");
                    sendResponse({ code: "SUCCESS" });
                });
                return true;
            }
            else if (msg.action === "resetData") {
                this.resetAllData().then(() => {
                    sendResponse({ code: "SUCCESS" });
                });
                return true;
            }
        });
        this.run(false);
    }

    async run(force) {
        const isActive = await this.store.isAutoRunActive();
        if (!force && !isActive) { this.clearBadge(); return; }

        const lastDate = await this.store.get('lastCheckDate');
        const serverToday = this.service.getServerTodayString();
        const lastStatus = await this.store.get('lastStatus');

        if (!force && lastDate === serverToday && lastStatus === "SUCCESS") {
            this.clearBadge(); return;
        }

        await this.store.set('isRunning', true);
        const result = await this.service.executeAttendance();
        this.handleResult(result);
    }

    async handleResult(result) {
        const serverToday = this.service.getServerTodayString();
        const timeString = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

        await this.store.addLog(result.code, result.msg);

        if (result.code === "SUCCESS" || result.code === "ALREADY_DONE") {
            this.clearBadge();
            await this.store.saveResult("SUCCESS", serverToday, timeString);
            if (result.code === "SUCCESS") {
                // this.notify("출석 완료", "보상 지급됨"); // [삭제] 사용자 요청으로 알림 제거
            }
        } else {
            this.setBadgeX();
            await this.store.saveResult("FAIL", serverToday, timeString);

            // [수정] "계정 연동 필요" (NOT_LOGGED_IN) 상태일 때는 알림을 띄우지 않음
            if (result.code === "NOT_LOGGED_IN") {
                // 조용히 실패 처리 (UI에는 빨간불 들어옴)
            } else if (result.msg.includes("401") || result.code === "FAIL") {
                // this.notify("오류", "로그를 확인하세요."); // [삭제] 사용자 요청으로 알림 제거
            }
        }
    }

    clearBadge() { chrome.action.setBadgeText({ text: "" }); }
    setBadgeX() { chrome.action.setBadgeText({ text: "X" }); chrome.action.setBadgeBackgroundColor({ color: "#FF3B30" }); }

    async resetAllData() {
        // 1. 저장소 초기화
        await chrome.storage.local.clear();

        // 2. 관련 도메인 쿠키 삭제
        for (const domain of TARGET_DOMAINS) {
            try {
                const cookies = await chrome.cookies.getAll({ domain: domain });
                for (const cookie of cookies) {
                    const protocol = cookie.secure ? "https:" : "http:";
                    const url = `${protocol}//${cookie.domain}${cookie.path}`;
                    await chrome.cookies.remove({ url: url, name: cookie.name, storeId: cookie.storeId });
                }
            } catch (e) {
                console.error(`Failed to clear cookies for ${domain}:`, e);
            }
        }

        // 3. 뱃지 초기화
        this.clearBadge();
    }
}

const controller = new CheckInController();
controller.init();