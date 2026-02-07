importScripts('i18n.js');

const CONSTANTS = {
    CHECK_IN_URL: "https://game.skport.com/endfield/sign-in?action=attendance_start",
    ALARM_NAME: "endfield_daily_scheduler",
    TIMEOUT_MS: 60000,
    OFFSETS: {
        KST: 9 * 60 * 60 * 1000,
        CST: 8 * 60 * 60 * 1000
    }
};

class AttendanceLogger {
    async get(keys) {
        return chrome.storage.local.get(keys);
    }

    async set(items) {
        return chrome.storage.local.set(items);
    }

    async log(status, message) {
        const now = new Date();
        const logEntry = {
            date: now.toLocaleString('ko-KR'),
            status: status,
            msg: message,
            timestamp: now.getTime()
        };

        const data = await this.get('checkInLogs');
        const logs = data.checkInLogs || [];
        logs.unshift(logEntry);

        if (logs.length > 50) {
            logs.pop();
        }

        const updatePatch = {
            checkInLogs: logs,
            lastLog: message
        };

        if (['SUCCESS', 'ALREADY_DONE', 'FAIL'].includes(status)) {
            updatePatch.lastStatus = status;
        }

        await this.set(updatePatch);
    }

    async recordSuccess(date, time, count, status) {
        await this.set({
            lastSuccessDate: date,
            lastCheckDate: date,
            lastCheckTime: time,
            lastSignCount: count,
            lastStatus: status,
            isRunning: false
        });
        await this.updateBadge('', '#34C759');
    }

    async recordFailure(date, time) {
        await this.set({
            lastCheckDate: date,
            lastCheckTime: time,
            lastStatus: 'FAIL',
            isRunning: false
        });
        await this.updateBadge('X', '#FF3B30');
    }

    async resetRunningState() {
        await this.set({ isRunning: true });
        await this.updateBadge('...', '#FF9500');
    }

    async updateBadge(text, color) {
        await chrome.action.setBadgeText({ text });
        await chrome.action.setBadgeBackgroundColor({ color });
    }
}

class NotificationService {
    constructor(logger) {
        this.logger = logger;
    }

    async getConfig() {
        const data = await this.logger.get('discordConfig');
        return data.discordConfig || { webhookUrl: "" };
    }

    async send(data, dateStr, options = { force: false }) {
        this.config = await this.getConfig();

        if (!this.isValidWebhook()) {
            return;
        }

        if (await this.shouldSkipNotification(dateStr, options.force)) {
            return;
        }

        if (await this.shouldSkipNotification(dateStr, options.force)) {
            return;
        }

        const embed = this.createEmbed(data);
        await this.dispatchWebhook(embed);
        await this.updateLastSent(dateStr);
    }

    isValidWebhook() {
        return this.config.webhookUrl && this.config.webhookUrl.startsWith("http");
    }

    async shouldSkipNotification(dateStr, force) {
        if (force) return false;

        const data = await this.logger.get('lastDiscordSentDate');
        return data.lastDiscordSentDate === dateStr;
    }

    createEmbed(data) {
        const isSuccess = data.status === "SUCCESS";
        const isAlreadyDone = data.status === "ALREADY_DONE";
        const isFail = data.status === "FAIL";

        let titleKey = 'embed_fail_title';
        let color = 15548997;

        if (isSuccess) {
            titleKey = 'embed_success_title';
            color = 5763719;
        } else if (isAlreadyDone) {
            titleKey = 'embed_already_title';
            color = 3447003;
        }

        const embed = {
            title: i18n.get(titleKey),
            color: color,
            fields: [
                {
                    name: i18n.get('field_date'),
                    value: new Date().toLocaleString(),
                    inline: true
                }
            ],
            footer: {
                text: i18n.get('footer_text')
            },
            timestamp: new Date().toISOString()
        };

        if (isSuccess) {
            embed.fields.push({
                name: i18n.get('field_status'),
                value: i18n.get('val_success_msg'),
                inline: false
            });
            if (data.rewardName) {
                embed.fields.push({
                    name: i18n.get('field_reward'),
                    value: data.rewardName,
                    inline: true
                });
            }
            if (data.rewardImage) {
                embed.thumbnail = { url: data.rewardImage };
            }
        } else if (isAlreadyDone) {
            embed.fields.push({
                name: i18n.get('field_status'),
                value: i18n.get('val_already_msg'),
                inline: false
            });
            if (data.rewardName) {
                embed.fields.push({
                    name: i18n.get('field_reward'),
                    value: data.rewardName,
                    inline: true
                });
            }
            if (data.rewardImage) {
                embed.thumbnail = { url: data.rewardImage };
            }
        } else if (isFail) {
            embed.fields.push({
                name: i18n.get('field_error'),
                value: data.error || "Unknown Error",
                inline: false
            });
        }

        return embed;
    }

    async dispatchWebhook(embed) {
        try {
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [embed]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await this.logger.log("DISCORD", i18n.get('log_discord_sent'));
        } catch (error) {
            await this.logger.log("DISCORD_FAIL", `${i18n.get('log_discord_fail')} ${error.message}`);
        }
    }

    async updateLastSent(dateStr) {
        await this.logger.set({ lastDiscordSentDate: dateStr });
    }

    async sendTest(type) {
        this.config = await this.getConfig();
        if (!this.isValidWebhook()) throw new Error(i18n.get('err_no_webhook'));

        const testData = this.getTestData(type);
        const embed = this.createEmbed(testData);

        if (type === 'SUCCESS') embed.title = i18n.get('embed_test_success_title');
        else if (type === 'ALREADY_DONE') embed.title = i18n.get('embed_test_already_title');
        else embed.title = i18n.get('embed_test_fail_title');

        await this.dispatchWebhook(embed);
        return { code: "SUCCESS" };
    }

    getTestData(type) {
        if (type === 'SUCCESS') {
            return { status: "SUCCESS", rewardName: `${i18n.get('val_test_item')} x1`, signCount: 99, rewardImage: "https://game.skport.com/favicon.ico" };
        } else if (type === 'ALREADY_DONE') {
            return { status: "ALREADY_DONE", signCount: 99 };
        } else {
            return { status: "FAIL", error: i18n.get('val_test_error') };
        }
    }
}

class AttendanceExecutor {
    constructor(logger, notifier) {
        this.logger = logger;
        this.notifier = notifier;
        this.activeTabId = null;
    }

    async execute(isManual = false) {
        await this.prepareExecution(isManual);

        try {
            await this.createHiddenTab();
        } catch (error) {
            await this.handleExecutionError(error);
        }
    }

    async prepareExecution(isManual) {
        if (this.activeTabId) {
            if (isManual) {
                this.closeTab();
                await this.wait(500);
            } else {
                return;
            }
        }

        if (isManual) {
            await this.logger.set({ manualRunPending: true });
        }

        await this.logger.resetRunningState();
        await this.logger.log("START", i18n.get('log_start_checkin'));
    }

    async createHiddenTab() {
        const tab = await chrome.tabs.create({
            url: CONSTANTS.CHECK_IN_URL,
            active: false
        });
        this.activeTabId = tab.id;
    }

    async processResult(result) {
        if (result.message === "LOGIN_REQUIRED") {
            await this.handleLoginRequired();
            return;
        }

        this.closeTab();

        const now = new Date();
        const dates = {
            localDate: now.toLocaleDateString(),
            localTime: now.toLocaleTimeString(),
            serverDate: this.getServerDate(now)
        };

        const isManual = await this.getManualFlag();

        if (result.success) {
            await this.handleSuccess(result, dates, isManual);
        } else {
            await this.handleFailure(result, dates, isManual);
        }
    }

    async handleSuccess(result, dates, isManual) {
        const status = result.alreadyDone ? "ALREADY_DONE" : "SUCCESS";
        const msg = result.alreadyDone ? i18n.get('log_check_already') : i18n.get('log_check_success');

        await this.logger.log(status, msg);
        await this.logger.recordSuccess(dates.localDate, dates.localTime, result.signCount, status);

        const notificationData = {
            status: status,
            signCount: result.signCount,
            rewardName: result.rewardName,
            rewardImage: result.rewardImage
        };

        await this.notifier.send(notificationData, dates.serverDate, { force: isManual });
    }

    async handleFailure(result, dates, isManual) {
        const errorMsg = result.message || "Unknown Error";

        await this.logger.log("FAIL", errorMsg);
        await this.logger.recordFailure(dates.localDate, dates.localTime);

        await this.notifier.send({ status: "FAIL", error: errorMsg }, dates.serverDate, { force: isManual });
    }

    closeTab() {
        if (this.activeTabId) {
            chrome.tabs.remove(this.activeTabId).catch(() => { });
            this.activeTabId = null;
        }
    }

    async handleLoginRequired() {
        if (this.activeTabId) {
            await chrome.tabs.update(this.activeTabId, { active: true });
            this.activeTabId = null;
            await this.logger.log("FAIL", i18n.get('log_req_login'));
            await this.logger.updateBadge('!', '#FF3B30');
        }
    }

    async handleExecutionError(error) {
        const now = new Date();
        await this.logger.log("ERROR", error.message);
        await this.logger.recordFailure(now.toLocaleDateString(), now.toLocaleTimeString());
    }

    async getManualFlag() {
        const data = await this.logger.get('manualRunPending');
        await this.logger.set({ manualRunPending: false });
        return data.manualRunPending;
    }

    getServerDate(date) {
        const utc8 = new Date(date.getTime() + (date.getTimezoneOffset() * 60000) + CONSTANTS.OFFSETS.CST);
        return utc8.toISOString().split('T')[0];
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class ApplicationController {
    constructor() {
        this.logger = new AttendanceLogger();
        this.notifier = new NotificationService(this.logger);
        this.executor = new AttendanceExecutor(this.logger, this.notifier);
    }

    async start() {
        this.setupEventHandlers();
        await i18n.init();
        this.scheduleDailyTask();
    }

    setupEventHandlers() {
        chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
        chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
        chrome.tabs.onRemoved.addListener(this.handleTabRemoval.bind(this));
    }

    async handleAlarm(alarm) {
        await i18n.init();
        if (alarm.name === CONSTANTS.ALARM_NAME) {
            this.executor.execute();
        }
    }

    async handleStartup() {
        await i18n.init();
    }

    handleMessage(msg, sender, sendResponse) {
        this.processMessage(msg).then(sendResponse);
        return true;
    }

    async processMessage(msg) {
        await i18n.init();

        if (msg.action === "manualRun") {
            await this.executor.execute(true);
            return { code: "STARTED" };
        }

        if (msg.action === "checkInResult") {
            await this.executor.processResult(msg.result);
            return { code: "RECEIVED" };
        }

        if (msg.action === "resetData") {
            await this.logger.set({
                checkInLogs: [],
                lastStatus: null,
                lastCheckDate: null,
                lastCheckTime: null
            });
            return { code: "SUCCESS" };
        }

        if (msg.action === "sendTestWebhook") {
            return await this.notifier.sendTest(msg.testType);
        }
    }

    handleTabRemoval(tabId) {
        if (this.executor.activeTabId === tabId) {
            this.executor.activeTabId = null;
        }
    }

    scheduleDailyTask() {
        const nextRun = this.calculateNextRunTime();
        chrome.alarms.create(CONSTANTS.ALARM_NAME, {
            when: nextRun,
            periodInMinutes: 1440
        });
    }

    calculateNextRunTime() {
        const now = new Date();
        const next = new Date(now);
        next.setHours(1, 15, 0, 0);

        if (now >= next) {
            next.setDate(next.getDate() + 1);
        }
        return next.getTime();
    }
}

const app = new ApplicationController();
app.start();