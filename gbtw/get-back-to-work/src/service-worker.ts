// import { useState } from "react";
// const TRACKED_URL = 'facebook.com';
// const SESSION_TIMEOUT = 70;
// const SESSION_COOLDOWN = 5;
// const DAILY_TIMEOUT = 60 * 60;
import Constants from "./constants";

const _tabIds = new Set<number>();
SetTabList(Array.from(_tabIds));

class TimeoutManager {
    private _dailyExceeded: boolean = false;
    private _sessionExceeded: boolean = false;
    private _counter = {
        session_seconds: 0,
        total_seconds: 0
    }

    private _timeout: number = 0;
    private _session_cooldown: number = 0;

    constructor() {}

    public get AllowedStatus(): boolean {
        return !(this._dailyExceeded || this._sessionExceeded);
    }

    public StartSession(): void {
        this._onSessionStart();
    }

    public EndSession(): void {
        this._onSessionEnd();
    }

    private _onSessionStart(){
        this._timeout = setInterval(this._checkConditions.bind(this), 1000);
    }

    private _onSessionEnd(){
        clearInterval(this._timeout);
        this._counter.total_seconds += this._counter.session_seconds;
        this._counter.session_seconds = 0;
        console.log('total_seconds: ' + this._counter.total_seconds);
    }

    private async _checkConditions(){
        this._counter.session_seconds++;
        if (this._counter.total_seconds >= Constants.DAILY_TIMEOUT){
            console.log('daily timeout');
            this._onSessionTimeout();
            this._dailyExceeded = true;
        }
        if (this._counter.session_seconds >= Constants.SESSION_TIMEOUT){
            this._onSessionTimeout();
            this._sessionExceeded = true;
            console.log('Cooldown initiated');
            this._session_cooldown = setTimeout(() => {
                this._sessionExceeded = false;
                clearTimeout(this._session_cooldown);
            }, Constants.SESSION_COOLDOWN * 1000);
        }

        for (const tabId of await GetTabList()) {
            chrome.tabs.sendMessage(tabId, {action: 'updateTimer', text: this._generateTimerText()});
        }
        // console.log('[' + this._counter.session_seconds + ']' + 'tabIds: ' + JSON.stringify(await GetTabList()));
    }

    private async _onSessionTimeout(){
        const tabList = await GetTabList();
        for (const tabId of tabList) {
            chrome.scripting.executeScript<string[], void>({
                target: {tabId: tabId!},
                func: () => {
                    alert('You have been on Facebook for too long. Please get back to work.');
                }});
            chrome.tabs.update(tabId, {url: 'https://www.google.com'});
        }
        this._onSessionEnd();
    }

    private _generateTimerText(): string {
        const padLeft = (string: string, pad = '0', length = 2) => {
            return (new Array(length + 1).join(pad) + string).slice(-length);
        }
        const timeLeft = Constants.SESSION_TIMEOUT - this._counter.session_seconds;
        const minutes = Math.floor(timeLeft / 60)
        const seconds = timeLeft - minutes * 60;
        return `${padLeft(minutes.toString())}:${padLeft(seconds.toString())}`;
    }
}

const timeoutManager = new TimeoutManager();

chrome.storage.local.onChanged.addListener((changes) => {
    if (
        (changes.tabIds['newValue'] as number[]).length !== 0 &&
        (changes.tabIds['oldValue'] as number[]).length === 0) {
            timeoutManager.StartSession();
            // ShowTimer();
    } else if (
        (changes.tabIds['newValue'] as number[]).length === 0 &&
        (changes.tabIds['oldValue'] as number[]).length !== 0) {
            timeoutManager.EndSession();
    }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
    if(details.url.includes(Constants.TRACKED_URL)){
        AddTabToList(details.tabId);
    }
});
chrome.tabs.onRemoved.addListener(async (tabId) => {
    console.log(tabId + 'closed');
    RemoveTabFromList(tabId);
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.url.includes(Constants.TRACKED_URL) &&
        !timeoutManager.AllowedStatus) {
            chrome.tabs.update(details.tabId, {url: 'https://www.google.com'});
            console.log('Cooldown invoked. Redirecting to Google');
    }
})
    
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    const tabIds = (await chrome.storage.local.get(['tabIds']))['tabIds'];
    if (!tabIds.includes(tabId) ||
        (changeInfo && changeInfo.url?.includes(Constants.TRACKED_URL))) {
            return;
    }
    RemoveTabFromList(tabId);
});


// Utility

async function GetTabList(): Promise<number[]> {
    return (await chrome.storage.local.get(['tabIds']))['tabIds'];
}

async function SetTabList(tabIds: number[]): Promise<void> {
    return await chrome.storage.local.set({tabIds: [...new Set(tabIds)]});
}

async function AddTabToList(tabId: number): Promise<void> {
    const tabIds = await GetTabList();
    tabIds.push(tabId);
    await SetTabList(tabIds);
    await ShowTimer();
}

async function RemoveTabFromList(tabId: number): Promise<void> {
    const tabIds = await GetTabList();
    tabIds.splice(tabIds.indexOf(tabId), 1);
    await SetTabList(tabIds);
}

async function ShowTimer(): Promise<void> {
    const tabIds = await GetTabList();
    for (const tabId of tabIds) {
        chrome.scripting.executeScript<string[], void>({
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
            }});
    }

}