import Config from "./config";
import { StartSession, StopSession } from "./session-handler";

/*
    Allowed SESSION_TIMEOUT seconds in a session
    Session restarts if SESSION_COOLDOWN has passed, and no active session is present 
    Conditions to start a session:
    1. Switching to tab: check if tab url is the target url
    2. When active tab switches url: check if the tab url is the target url

    Daily timer will only reset when a new session is started. 
    Session that started just before midnight will count as the previous day.
*/

export function AddTabHandlers(){
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
        if (changeInfo.url === undefined) return;
        StopSession();
        console.log('Tab onUpdated' + JSON.stringify(changeInfo));
        const tab = await chrome.tabs.get(tabId);
        const window = await chrome.windows.get(tab.windowId)
        if (IsUrlOnTarget(changeInfo.url) &&
            tab.active &&
            window.focused) {
                await StartSession(tabId);
                ShowTimer(tabId);
        }
    });
        
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
        console.log('Tab onActivated');
        StopSession();
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (IsUrlOnTarget(tab.url!)){ // Start Session
            console.log('start session')
            await StartSession(activeInfo.tabId);
            ShowTimer(activeInfo.tabId);
        }
    });
}

function ShowTimer(tabId: number): void {
    console.log('showTimer')
    chrome.scripting.executeScript({
        target: {tabId: tabId!},
        func: () => {
            const overlay = document.createElement('div');
            overlay.style.position = "fixed";
            overlay.style.top = "10px";
            overlay.style.right = "10px";
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            overlay.style.color = "white";
            overlay.style.fontSize = "14px";
            overlay.style.fontWeight = "bold";
            overlay.style.padding = "5px 10px";
            overlay.style.borderRadius = "5px";
            overlay.style.zIndex = "9999";
            overlay.style.pointerEvents = "none";
            overlay.textContent = "--:--";

            document.body.appendChild(overlay);
            
            chrome.runtime.onMessage.addListener((message) => {
                if (message.action === 'updateTimer'){
                    overlay.textContent = message.text;
                }
            });
        }
    });
}

function IsUrlOnTarget(url: string): boolean {
    return url.includes(Config.TRACKED_URL);
}
