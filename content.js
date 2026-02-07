console.log("[Endfield-Auto] Content script loaded.");

if (!window.location.search.includes('action=attendance_start')) {
    console.log("[Endfield-Auto] Standard navigation detected.");
} else {
    console.log("[Endfield-Auto] Auto check-in mode detected.");
    (async () => {
        if (typeof i18n !== 'undefined' && i18n.init) await i18n.init();
        initPageMonitor();
    })();
}

const CONFIG = {
    SELECTORS: {
        LOGIN_EMAIL: 'input[name="email"]',
        LOGIN_PASSWORD: 'input[type="password"]',
        LOTTIE_CONTAINER: '#lottie-container',
        EXPAND_BUTTON: 'div.sc-BvjM.kKHJdV',
        DAY_LABEL: 'div.sc-guPfGz',
        ITEM_CONTAINER: 'div.sc-nuIvE',
        CLICK_TARGET: 'div.sc-dltKUw',
        COMPLETED_OVERLAY: '#completed-overlay',
        ACCUMULATED_CONTAINER: 'div.sc-fRSwmW',
        ACCUMULATED_NUMBER: 'span.number',
        ITEM_COUNT: 'div.item-count',
        ITEM_IMG: 'img',
        HISTORY_BUTTON_SELECTOR: 'div.sc-fHHfTq',
        HISTORY_KEYWORDS: ['수령 기록', 'Received Records', 'History', 'Records'],
        REF_ROW_CLASS: 'sc-jAWrKc',
        REF_TEXT_CLASS: 'sc-fRSwmW',
        REF_IMG_CLASS: 'sc-bURucN'
    }
};

let pageMonitor = null;
let isWorkDone = false;
let loginStabilityCheck = null;
let capturedGridData = { image: "", qty: "", altName: "" };
let capturedSuccessName = "";

function isVisible(el) { return el && el.offsetParent !== null; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function finish(result) {
    if (isWorkDone) return;
    isWorkDone = true;
    if (pageMonitor) pageMonitor.disconnect();

    console.log("[Endfield-Auto] Finished:", result);
    chrome.runtime.sendMessage({
        action: "checkInResult",
        result: result
    });
}

function getSignCount() {
    try {
        let count = null;
        const container = document.querySelector(CONFIG.SELECTORS.ACCUMULATED_CONTAINER);
        if (container) {
            const numSpan = container.querySelector(CONFIG.SELECTORS.ACCUMULATED_NUMBER);
            if (numSpan) { count = numSpan.innerText.trim(); }
            else { const match = container.innerText.match(/(\d+)/); if (match) count = match[1]; }
        }
        if (!count) {
            const allDivs = Array.from(document.querySelectorAll('div'));
            const broadContainer = allDivs.find(div => {
                const text = div.innerText.trim();
                return (text.includes("Accumulated") || text.includes("누적")) && /\d+/.test(text);
            });
            if (broadContainer) {
                const match = broadContainer.innerText.match(/(\d+)/);
                if (match) count = match[1];
            }
        }
        if (count && !isNaN(parseInt(count))) return count;
    } catch (e) {
        console.error("SignCount Error:", e);
    }
    return null;
}

function getTodayDatePatterns() {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const M = now.getMonth() + 1;
    const D = now.getDate();

    return [
        `${YYYY}-${MM}-${DD}`,
        `${YYYY}.${MM}.${DD}`,
        `${YYYY}. ${MM}. ${DD}`,
        `${YYYY}.${M}.${D}`,
        `${YYYY}. ${M}. ${D}`,
        `${MM}-${DD}`,
        `${MM}.${DD}`,
        `${M}월 ${D}일`
    ];
}

const REWARD_MAP = {
    "921A397E2765462C009B939E0CD92606": "중급 작전 기록",
    "0c1e8cf15711a7d59aa7d8786b533cf1": "프로토콜 프리즘",
    "0dea0bc0fd87138df322e8a254a6999f": "무기 점검 장치",
    "8ed434a6cdb173c96ed0572115112f93": "오로베릴",
    "2a58a0e85f39092433842ccd62324785": "탈로시안 화폐"
};

function resolveRewardName(imgSrc, fallbackQty) {
    if (!imgSrc) return "Item";
    const match = imgSrc.match(/\/([a-zA-Z0-9]+)\.png/);
    if (match && REWARD_MAP[match[1]]) {
        return `${REWARD_MAP[match[1]]}${fallbackQty ? ' x' + fallbackQty : ''}`;
    }
    return "Item";
}

async function scrapeFromHistory() {
    console.log("[Endfield-Auto] Starting History Scrape...");
    try {
        let historyBtn = null;
        const candidates = document.querySelectorAll(CONFIG.SELECTORS.HISTORY_BUTTON_SELECTOR);
        if (candidates.length > 0) {
            historyBtn = Array.from(candidates).find(el => el.classList.contains('jVnAxq')) || candidates[0];
        }
        if (!historyBtn) {
            const allDivs = Array.from(document.querySelectorAll('div, span, button'));
            historyBtn = allDivs.find(el => {
                const t = el.innerText ? el.innerText.trim() : "";
                return CONFIG.SELECTORS.HISTORY_KEYWORDS.some(kw => t === kw) && isVisible(el);
            });
        }

        if (!historyBtn) {
            console.log("History button not found.");
            if (capturedGridData.image) {
                const mapped = resolveRewardName(capturedGridData.image, capturedGridData.qty);
                if (mapped !== "Item") return { rewardName: mapped, rewardImage: capturedGridData.image };
            }
            return null;
        }

        historyBtn.click();

        const datePatterns = getTodayDatePatterns();
        let foundRow = null;

        for (let i = 0; i < 20; i++) {
            await sleep(400);

            const allImages = Array.from(document.querySelectorAll('img'));
            for (const img of allImages) {
                if (!isVisible(img)) continue;
                if (img.src.includes("favicon") || img.src.includes("avatar")) continue;
                const mapName = resolveRewardName(img.src);

                let scrapedName = "";
                let scrapedQty = "";

                let row = img.parentElement;
                let safety = 0;
                while (row && safety < 5) {
                    if (row.innerHTML.includes(CONFIG.SELECTORS.REF_TEXT_CLASS)) {
                        const textCandidates = Array.from(row.querySelectorAll(`div[class*="${CONFIG.SELECTORS.REF_TEXT_CLASS}"]`));
                        const nameEl = textCandidates.find(el =>
                            !el.innerText.includes("수령 기록") &&
                            !el.innerText.includes("Records") &&
                            el.innerText.length > 1
                        );

                        if (nameEl) {
                            const txt = nameEl.innerText.trim();
                            const qtyMatch = txt.match(/[*xX×]\s*(\d+)$/);
                            if (qtyMatch) {
                                scrapedQty = qtyMatch[1];
                                scrapedName = txt.replace(qtyMatch[0], "").trim();
                            } else {
                                scrapedName = txt;
                            }
                        }
                    }
                    if (scrapedName) break;

                    if (datePatterns.some(p => row.innerText.includes(p))) {
                        foundRow = row;
                    }

                    row = row.parentElement;
                    safety++;
                }

                if (foundRow) {
                    let finalName = "Item";

                    if (mapName !== "Item") {
                        finalName = mapName.split(' x')[0];
                    } else if (scrapedName) {
                        finalName = scrapedName;
                    }
                    let finalQty = scrapedQty || capturedGridData.qty;
                    if (!finalQty) {
                        const m = foundRow.innerText.match(/[xX×*]\s*(\d+)/);
                        if (m) finalQty = m[1];
                    }

                    console.log(`History Found: ${finalName} x${finalQty}`);
                    return {
                        rewardName: `${finalName}${finalQty ? ' x' + finalQty : ''}`,
                        rewardImage: img.src
                    };
                }
            }
        }

    } catch (e) { console.error("History Scrape Error:", e); }
    return null;
}

async function scrapeSuccessModal() {
    console.log("Scanning Success Modal...");
    for (let i = 0; i < 10; i++) {
        await sleep(200);

        const dialogs = Array.from(document.querySelectorAll('div'));
        const successModal = dialogs.find(d => {
            if (!isVisible(d)) return false;
            const t = d.innerText || "";
            return (t.includes("획득") || t.includes("Acquired")) &&
                d.querySelector('img') &&
                d.innerText.length < 200 &&
                window.getComputedStyle(d).zIndex > 50;
        });

        if (successModal) {
            console.log("--- SUCCESS MODAL HTML START ---");
            console.log(successModal.innerHTML);
            console.log("--- SUCCESS MODAL HTML END ---");

            const lines = successModal.innerText.split('\n')
                .map(l => l.trim())
                .filter(l =>
                    l.length > 1 &&
                    !["확인", "OK", "Confirm", "획득", "Acquired", "Touch to Close"].includes(l)
                );

            if (lines.length > 0) {
                const nonNumberLines = lines.filter(l => isNaN(parseInt(l)));
                if (nonNumberLines.length > 0) {
                    capturedSuccessName = nonNumberLines.reduce((a, b) => a.length > b.length ? a : b);
                    console.log("Captured Success Name:", capturedSuccessName);
                    return;
                }
            }
        }
    }
}


function captureItemData(container) {
    const countDiv = container.querySelector(CONFIG.SELECTORS.ITEM_COUNT);
    if (countDiv) capturedGridData.qty = countDiv.innerText.trim();
    const imgTag = container.querySelector(CONFIG.SELECTORS.ITEM_IMG);
    if (imgTag) {
        capturedGridData.image = imgTag.src;
        if (imgTag.alt) capturedGridData.altName = imgTag.alt;
    }
}

function findActionTarget() {
    const lottie = document.querySelector(CONFIG.SELECTORS.LOTTIE_CONTAINER);
    if (lottie && isVisible(lottie)) {
        const container = lottie.closest(CONFIG.SELECTORS.ITEM_CONTAINER);
        if (container) {
            captureItemData(container);
            if (container.querySelector(CONFIG.SELECTORS.COMPLETED_OVERLAY)) {
                return { type: "ALREADY_DONE" };
            }
        }
        return { type: "CLICK", element: lottie };
    }

    const dayItems = Array.from(document.querySelectorAll(CONFIG.SELECTORS.ITEM_CONTAINER));
    for (let c of dayItems) {
        if (!c.querySelector(CONFIG.SELECTORS.COMPLETED_OVERLAY)) {
            captureItemData(c);
            break;
        }
    }

    const expandBtn = document.querySelector(CONFIG.SELECTORS.EXPAND_BUTTON);
    if (expandBtn && isVisible(expandBtn)) expandBtn.click();

    for (const container of dayItems) {
        if (!container.querySelector(CONFIG.SELECTORS.COMPLETED_OVERLAY)) {
            const target = container.querySelector(CONFIG.SELECTORS.CLICK_TARGET);
            if (target) return { type: "CLICK", element: target };
        }
    }

    if (dayItems.length > 0) {
        return { type: "ALREADY_DONE" };
    }

    return null;
}

async function runCheckInSequence() {
    if (isWorkDone) return true;

    const emailInput = document.querySelector(CONFIG.SELECTORS.LOGIN_EMAIL);
    const passInput = document.querySelector(CONFIG.SELECTORS.LOGIN_PASSWORD);

    if ((emailInput && isVisible(emailInput)) || (passInput && isVisible(passInput))) {
        if (loginStabilityCheck === null) {
            console.log("🤔 Monitor: Login fields detected. Holding for stability check (2.5s)...");
            loginStabilityCheck = setTimeout(() => {
                const emailCheck = document.querySelector(CONFIG.SELECTORS.LOGIN_EMAIL);
                const passCheck = document.querySelector(CONFIG.SELECTORS.LOGIN_PASSWORD);
                if ((emailCheck && isVisible(emailCheck)) || (passCheck && isVisible(passCheck))) {
                    console.log("🚨 Monitor: Login confirmed.");
                    finish({ success: false, message: "LOGIN_REQUIRED" });
                } else {
                    console.log("😅 Monitor: Login fields vanished.");
                    loginStabilityCheck = null;
                }
            }, 2500);
        }
        return false;
    } else {
        if (loginStabilityCheck !== null) {
            console.log("😅 Monitor: Login check cancelled.");
            clearTimeout(loginStabilityCheck);
            loginStabilityCheck = null;
        }
    }

    if (document.body.innerText.includes("이미 출석") || document.body.innerText.includes("Checked in today")) {
        await finalizeSequence(true);
        return true;
    }
    const target = findActionTarget();

    if (target) {
        if (target.type === "ALREADY_DONE") {
            await finalizeSequence(true);
            return true;
        }
        if (target.type === "CLICK" && target.element) {
            target.element.click();
            await scrapeSuccessModal();

            const closeBtns = Array.from(document.querySelectorAll('button'))
                .filter(el => ["Confirm", "확인", "OK"].includes(el.innerText));
            if (closeBtns.length > 0) closeBtns[0].click();

            await finalizeSequence(false);
            return true;
        }
    }

    return false;
}

async function finalizeSequence(alreadyDone) {
    if (!alreadyDone) await sleep(1200);

    const historyData = await scrapeFromHistory();
    let finalRewardName = "";
    let finalRewardImage = "";

    if (historyData) {
        finalRewardName = historyData.rewardName;
        finalRewardImage = historyData.rewardImage;
    } else {
        let mapName = "Item";
        if (capturedGridData.image) {
            const mn = resolveRewardName(capturedGridData.image);
            if (mn !== "Item") mapName = mn;
        }

        const fallbackName = capturedSuccessName || capturedGridData.altName || mapName;
        const fallbackQty = capturedGridData.qty ? `x${capturedGridData.qty}` : "";
        finalRewardName = `${fallbackName} ${fallbackQty}`;
        finalRewardImage = capturedGridData.image;
    }

    const signCount = getSignCount();
    let finalCount = signCount ? signCount : "0";

    finish({
        success: true,
        alreadyDone: alreadyDone,
        signCount: finalCount,
        rewardName: finalRewardName,
        rewardImage: finalRewardImage
    });
}

function initPageMonitor() {
    runCheckInSequence().then(done => {
        if (done) return;
        pageMonitor = new MutationObserver(async () => {
            if (await runCheckInSequence()) pageMonitor.disconnect();
        });
        pageMonitor.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => { if (!isWorkDone) finalizeSequence(false); }, 18000);
    });
}