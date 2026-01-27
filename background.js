importScripts('i18n.js');

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
        const now = new Date().toLocaleString(i18n.locale, { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        logs.unshift({ date: now, status: status, msg: message });
        if (logs.length > 50) logs = logs.slice(0, 50);
        await this.set('checkInLogs', logs);
    }

    async saveAccount(info) { await this.set('accountInfo', info); }
    async getAccount() { return await this.get('accountInfo'); }
    async isAutoRunActive() { return true; }

    async saveResult(status, date, time) {
        const uiStatus = (status === "ALREADY_DONE") ? "SUCCESS" : status;
        await this.set('lastStatus', uiStatus);
        await this.set('lastCheckDate', date);
        await this.set('lastCheckTime', time);
        await this.set('isRunning', false);
    }

    async getDeviceId() {
        let dId = await this.get('dId');
        if (!dId) {
            dId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            await this.set('dId', dId);
        }
        return dId;
    }

    async getDiscordConfig() { return await this.get('discordConfig'); }
    async setDiscordConfig(config) { await this.set('discordConfig', config); }

    async addDiscordLog(status, message) {
        let logs = (await this.get('discordLogs')) || [];
        const now = new Date().toLocaleString(i18n.locale, { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        logs.unshift({ date: now, status: status, msg: message });
        if (logs.length > 20) logs = logs.slice(0, 20);
        await this.set('discordLogs', logs);
    }

    async shouldSendDiscordNotification(serverDate) {
        const lastSent = await this.get('lastDiscordSentDate');
        return lastSent !== serverDate;
    }

    async markDiscordSent(serverDate) {
        await this.set('lastDiscordSentDate', serverDate);
    }

    async updateCredential(newCred, newCookies) {
        const info = await this.getAccount();
        if (info) {
            info.cred = newCred;
            if (newCookies) {
                info.cookies = newCookies;
            }
            info.lastSync = new Date().toLocaleString(i18n.locale);
            await this.saveAccount(info);
            return true;
        }
        return false;
    }
}

class CheckInService {
    constructor(store) { this.store = store; }

    getServerTodayString() {
        const now = new Date();
        const utc8Time = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3600000 * 8));
        return utc8Time.toISOString().split('T')[0];
    }

    async getHeaders(cred, role) {
        const langHeader = i18n.lang === 'en'
            ? "en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7"
            : "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7";
        const skLang = i18n.lang === 'en' ? 'en' : 'ko';

        const headers = {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": langHeader,
            "origin": "https://game.skport.com",
            "referer": "https://game.skport.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "platform": "3",
            "sk-language": skLang
        };

        if (cred) headers["cred"] = cred;
        return headers;
    }

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
        const targets = ['SK_OAUTH_CRED_KEY', 'cred', 'sk_cred'];
        for (const t of targets) {
            const found = cookies.find(c => c.name === t);
            if (found && found.value) return found.value;
        }
        return null;
    }

    async fetchGameRole(cred) {
        try {
            const headers = await this.getHeaders(cred, null);
            const url = "https://zonai.skport.com/api/v1/game/player/binding?gameId=3";

            const response = await fetch(url, {
                method: "GET",
                headers: headers
            });
            const data = await response.json();

            if (data.code === 0 && data.data?.list?.[0]?.bindingList?.[0]?.roles?.[0]) {
                const roleData = data.data.list[0].bindingList[0].roles[0];
                return {
                    roleValue: `3_${roleData.roleId}_${roleData.serverId}`,
                    roleId: roleData.roleId,
                    server: roleData.serverId
                };
            }
            return null;
        } catch (e) {
            console.error("Fetch Role Error:", e);
            return null;
        }
    }

    async refreshSession(cred) {
        try {
            const url = "https://game.skport.com/endfield/sign-in";
            await fetch(url, {
                method: "GET",
                headers: await this.getHeaders(cred, null)
            });
        } catch (e) {
        }
    }

    async syncAccountData(localStorageData) {
        try {
            const cookies = await this.getAllCookies();
            let cred = localStorageData?.cred || this.findCredInCookies(cookies);

            if (!cred) {
                throw new Error("로그인 정보를 찾을 수 없습니다.\n사이트에 로그인되어 있는지 확인해주세요.");
            }

            if (cred) {
                cred = decodeURIComponent(cred).replace(/^"|"$/g, '');
            }

            const roleData = await this.fetchGameRole(cred);
            if (!roleData) {
                return { code: "FAIL", msg: "캐릭터 정보(UID)를 찾을 수 없습니다.\n게임에 캐릭터가 생성되어 있는지 확인해주세요." };
            }

            const accountInfo = {
                uid: roleData.roleId,
                cred: cred,
                role: roleData.roleValue,
                cookies: cookies,
                lastSync: new Date().toLocaleString(i18n.locale)
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
            if (!account || !account.cred) return { code: "NOT_LOGGED_IN", msg: i18n.get('log_req_login') };

            await this.refreshSession(account.cred);

            let role = account.role;
            if (!role || !account.uid) {
                const roleData = await this.fetchGameRole(account.cred);
                if (roleData) {
                    account.role = roleData.roleValue;
                    account.uid = roleData.roleId;
                    await this.store.saveAccount(account);
                    role = account.role;
                }
            }

            if (!role) {
                return { code: "FAIL", msg: i18n.get('log_char_not_found') };
            }

            const url = "https://zonai.skport.com/web/v1/game/endfield/attendance";
            const commonHeaders = await this.getHeaders(account.cred, null);
            const headers = { ...commonHeaders, "sk-game-role": role };

            const checkRes = await fetch(url, { method: "GET", headers: headers });
            const checkData = await checkRes.json();

            if (checkData.code === 0 && checkData.data?.hasToday) {
                return { code: "ALREADY_DONE", msg: i18n.get('log_check_already'), rawData: checkData };
            }

            const postRes = await fetch(url, {
                method: "POST",
                headers: { ...headers, "content-type": "application/json" },
                body: JSON.stringify({})
            });
            const postData = await postRes.json();

            if (postData.code === 0 || postData.code === 10001) {
                return { code: "SUCCESS", msg: i18n.get('log_check_success'), rawData: postData };
            } else {
                return { code: "FAIL", msg: postData.message || i18n.get('log_unknown_error'), rawData: postData };
            }

        } catch (e) {
            return { code: "ERROR", msg: e.message };
        }
    }
}

class DiscordWebhookService {
    constructor(store) { this.store = store; }

    async sendAttendanceNotification(attendanceData, serverDate) {
        try {
            const config = await this.store.getDiscordConfig();

            if (!config || !config.webhookUrl) {
                return { code: "DISABLED", msg: "Discord notifications disabled" };
            }

            const shouldSend = await this.store.shouldSendDiscordNotification(serverDate);
            if (!shouldSend) {
                return { code: "ALREADY_SENT", msg: "Already sent today" };
            }

            const embed = await this.formatAttendanceEmbed(attendanceData, serverDate);
            const response = await fetch(config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });

            if (response.ok) {
                await this.store.markDiscordSent(serverDate);
                await this.store.addDiscordLog("SUCCESS", i18n.get('log_discord_sent'));
                return { code: "SUCCESS", msg: "Discord notification sent" };
            } else {
                const errorText = await response.text();
                await this.store.addDiscordLog("FAIL", `${i18n.get('log_discord_fail')}${response.status}`);
                return { code: "FAIL", msg: `HTTP ${response.status}: ${errorText}` };
            }
        } catch (error) {
            await this.store.addDiscordLog("ERROR", error.message);
            return { code: "ERROR", msg: error.message };
        }
    }

    async sendErrorNotification(errorMsg) {
        try {
            const config = await this.store.getDiscordConfig();
            if (!config || !config.webhookUrl) {
                return;
            }

            const now = new Date();
            const dateTimeStr = now.toLocaleDateString(i18n.locale, {
                year: 'numeric', month: '2-digit', day: '2-digit'
            });

            const account = await this.store.getAccount();
            const footerText = (account && account.uid)
                ? `${account.uid}`
                : "Endfield Auto Check-in";

            const embed = {
                title: i18n.get('embed_fail_title'),
                color: 16711680,
                fields: [
                    {
                        name: i18n.get('field_date'),
                        value: dateTimeStr,
                        inline: true
                    },
                    {
                        name: i18n.get('field_error'),
                        value: errorMsg,
                        inline: false
                    }
                ],
                footer: {
                    text: footerText
                },
                timestamp: now.toISOString()
            };

            await fetch(config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch (e) {
            console.error("Error sending error notification:", e);
        }
    }

    async sendAlreadyDoneNotification(result) {
        try {
            const config = await this.store.getDiscordConfig();
            if (!config || !config.webhookUrl) {
                return;
            }

            const now = new Date();
            const kstTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3600000 * 9));
            const serverDate = kstTime.toISOString().split('T')[0];

            const embed = await this.formatAttendanceEmbed(result, serverDate, {
                title: i18n.get('embed_already_title'),
                color: 3447003
            });

            await fetch(config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });

            await this.store.addDiscordLog("SUCCESS", i18n.get('log_already_sent'));
        } catch (e) {
            console.error("Error sending already done notification:", e);
        }
    }

    async formatAttendanceEmbed(data, serverDate, options = {}) {
        const now = new Date();
        const dateTimeStr = now.toLocaleDateString(i18n.locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const account = await this.store.getAccount();
        const footerText = (account && account.uid)
            ? `${account.uid}`
            : "Endfield Auto Check-in";

        const title = options.title || i18n.get('embed_success_title');
        const color = options.color || 13883715;

        const embed = {
            title: title,
            color: color,
            fields: [
                {
                    name: i18n.get('field_date'),
                    value: dateTimeStr,
                    inline: true
                }
            ],
            footer: {
                text: footerText
            },
            timestamp: now.toISOString()
        };

        if (data && data.rawData && data.rawData.data) {
            const apiData = data.rawData.data;
            let rewardName = "";
            let rewardCount = "";
            let rewardIcon = "";

            if (apiData.calendar) {
                const doneItems = apiData.calendar.filter(item => item.done === true);

                if (doneItems.length > 0) {
                    const latestReward = doneItems[doneItems.length - 1];

                    if (apiData.resourceInfoMap && latestReward.awardId) {
                        const info = apiData.resourceInfoMap[latestReward.awardId];
                        if (info) {
                            rewardName = info.name ? info.name.split('|')[0] : i18n.get('val_unknown_reward');
                            rewardCount = info.count;
                            rewardIcon = info.icon;
                        }
                    }

                    const calculatedSignCount = doneItems.length;

                    embed.fields.push({
                        name: i18n.get('field_accumulated'),
                        value: `${calculatedSignCount}${i18n.get('val_days')}`,
                        inline: true
                    });
                }
            }
            else {
                const signCount = apiData.signCount || apiData.sign_count || apiData.totalSignCount || apiData.currentSignCount;
                if (signCount !== undefined) {
                    embed.fields.push({
                        name: i18n.get('field_accumulated'),
                        value: `${signCount}${i18n.get('val_days')}`,
                        inline: true
                    });
                }

                if (apiData.rewards && apiData.rewards.length > 0) {
                    const r = apiData.rewards[0];
                    rewardName = r.name;
                    rewardCount = r.count;
                    rewardIcon = r.icon;
                }
            }

            if (rewardName) {
                let rewardText = rewardName;
                if (rewardCount) {
                    rewardText += ` x${rewardCount}`;
                }

                embed.fields.push({
                    name: i18n.get('field_reward'),
                    value: rewardText,
                    inline: true
                });

                if (rewardIcon) {
                    embed.thumbnail = {
                        url: rewardIcon
                    };
                }
            } else {
            }
        }

        return embed;
    }
}

class CheckInController {
    constructor() {
        this.store = new AccountStore();
        this.service = new CheckInService(this.store);
        this.discordService = new DiscordWebhookService(this.store);
    }
    async init() {
        this.registerListeners();

        await i18n.init();
        this.scheduleNextRun();
        this.checkOnStartup();
    }

    registerListeners() {
        chrome.alarms.onAlarm.addListener(async (alarm) => {
            await i18n.init();
            if (alarm.name === ALARM_NAME) {
                this.run(false);
            }
        });

        chrome.runtime.onStartup.addListener(async () => {
            await i18n.init();
            this.checkOnStartup();
        });

        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            (async () => {
                await i18n.init();
                if (msg.action === "manualRun") {
                    this.run(true);
                    sendResponse({ code: "STARTED" });
                }
                else if (msg.action === "syncAccount") {
                    this.service.syncAccountData(msg.storageData).then(async res => {
                        if (res.code === "SUCCESS") {
                            this.store.addLog("SYNC", i18n.get('log_sync_success'));
                            const result = await this.service.executeAttendance();
                            this.handleResult(result);
                        }
                        else this.store.addLog("ERROR", res.msg);
                        sendResponse(res);
                    });
                }
                else if (msg.action === "logout") {
                    this.store.set('accountInfo', null).then(() => {
                        this.store.addLog("LOGOUT", i18n.get('log_logout'));
                        sendResponse({ code: "SUCCESS" });
                    });
                }
                else if (msg.action === "resetData") {
                    this.resetAllData().then(() => {
                        sendResponse({ code: "SUCCESS" });
                    });
                } else {
                    sendResponse({ code: "IGNORED" });
                }
            })();
            return true;
        });

        this.initCookieListener();
    }

    getNextRunTime() {
        const now = new Date();
        const nextRun = new Date(now);
        nextRun.setHours(1, 5, 0, 0);

        if (now >= nextRun) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        return nextRun.getTime();
    }

    scheduleNextRun() {
        const nextRunTime = this.getNextRunTime();

        chrome.alarms.clear(ALARM_NAME, () => {
            chrome.alarms.create(ALARM_NAME, {
                when: nextRunTime,
                periodInMinutes: 1440
            });
        });
    }

    async checkOnStartup() {
        const now = new Date();
        const todayTarget = new Date();
        todayTarget.setHours(1, 5, 0, 0);

        if (now > todayTarget) {
            await this.run(false);
        }
    }

    initCookieListener() {
        chrome.cookies.onChanged.addListener(async (changeInfo) => {
            if (changeInfo.removed) return;

            const domain = changeInfo.cookie.domain;
            const isTargetDomain = TARGET_DOMAINS.some(d => domain.includes(d));
            if (!isTargetDomain) return;

            await i18n.init();

            const name = changeInfo.cookie.name;
            const value = changeInfo.cookie.value;

            const isTargetCookie = ['SK_OAUTH_CRED_KEY', 'cred', 'sk_cred'].includes(name);

            if (isTargetCookie) {
                const allCookies = await this.service.getAllCookies();
                const updated = await this.store.updateCredential(value, allCookies);

                if (updated) {
                    this.store.addLog("INFO", i18n.get('log_cookie_update'));
                }
            }
        });
    }

    async run(force) {
        const lastDate = await this.store.get('lastCheckDate');
        const serverToday = this.service.getServerTodayString();
        const lastStatus = await this.store.get('lastStatus');

        if (!force && lastDate === serverToday && lastStatus === "SUCCESS") {
            this.clearBadge(); return;
        }

        await this.store.set('isRunning', true);
        const result = await this.service.executeAttendance();
        this.handleResult(result, force);
    }

    async handleResult(result, isManual = false) {
        const serverToday = this.service.getServerTodayString();
        const timeString = new Date().toLocaleTimeString(i18n.locale, { hour: '2-digit', minute: '2-digit' });

        await this.store.addLog(result.code, result.msg);

        if (result.code === "SUCCESS" || result.code === "ALREADY_DONE") {
            this.clearBadge();
            await this.store.saveResult("SUCCESS", serverToday, timeString);

            if (result.code === "SUCCESS") {
                await this.discordService.sendAttendanceNotification(result, serverToday);
            } else if (result.code === "ALREADY_DONE" && isManual) {
                await this.discordService.sendAlreadyDoneNotification(result);
            }
        } else {
            this.setBadgeX();
            await this.store.saveResult("FAIL", serverToday, timeString);

            await this.discordService.sendErrorNotification(result.msg || i18n.get('log_check_fail'));
        }
    }

    clearBadge() { chrome.action.setBadgeText({ text: "" }); }
    setBadgeX() { chrome.action.setBadgeText({ text: "X" }); chrome.action.setBadgeBackgroundColor({ color: "#FF3B30" }); }

    async resetAllData() {
        await chrome.storage.local.clear();
        for (const domain of TARGET_DOMAINS) {
            try {
                const cookies = await chrome.cookies.getAll({ domain: domain });
                for (const cookie of cookies) {
                    const protocol = cookie.secure ? "https:" : "http:";
                    let domain = cookie.domain;
                    if (domain.startsWith('.')) domain = domain.substring(1);
                    const url = `${protocol}//${domain}${cookie.path}`;
                    await chrome.cookies.remove({ url: url, name: cookie.name, storeId: cookie.storeId });
                }
            } catch (e) { }
        }
        this.clearBadge();
    }
}

const controller = new CheckInController();
controller.init();