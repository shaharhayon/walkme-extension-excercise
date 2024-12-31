// import { useState } from "react";
const TRACKED_URL = 'facebook.com';
const SESSION_TIMEOUT = 5 * 1;
const SESSION_COOLDOWN = 5 * 1;
const DAILY_TIMEOUT = 60 * 60;

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
        if (this._counter.total_seconds >= DAILY_TIMEOUT){
            console.log('daily timeout');
            this._onSessionTimeout();
            this._dailyExceeded = true;
        }
        if (this._counter.session_seconds >= SESSION_TIMEOUT){
            this._onSessionTimeout();
            this._sessionExceeded = true;
            console.log('Cooldown initiated');
            this._session_cooldown = setTimeout(() => {
                this._sessionExceeded = false;
                clearTimeout(this._session_cooldown);
            }, SESSION_COOLDOWN * 1000);
        }
        console.log('[' + this._counter.session_seconds + ']' + 'tabIds: ' + JSON.stringify(await GetTabList()));
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
}

const timeoutManager = new TimeoutManager();

chrome.storage.local.onChanged.addListener((changes) => {
    if (
        (changes.tabIds['newValue'] as number[]).length !== 0 &&
        (changes.tabIds['oldValue'] as number[]).length === 0) {
            timeoutManager.StartSession();
    } else if (
        (changes.tabIds['newValue'] as number[]).length === 0 &&
        (changes.tabIds['oldValue'] as number[]).length !== 0) {
            timeoutManager.EndSession();
    }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
    if(details.url.includes(TRACKED_URL)){
        AddTabToList(details.tabId);
    }
});
chrome.tabs.onRemoved.addListener(async (tabId) => {
    console.log(tabId + 'closed');
    RemoveTabFromList(tabId);
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.url.includes(TRACKED_URL) &&
        !timeoutManager.AllowedStatus) {
            chrome.tabs.update(details.tabId, {url: 'https://www.google.com'});
            console.log('Cooldown invoked. Redirecting to Google');
    }
})
    
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    const tabIds = (await chrome.storage.local.get(['tabIds']))['tabIds'];
    if (!tabIds.includes(tabId) ||
        (changeInfo && changeInfo.url?.includes(TRACKED_URL))) {
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
}

async function RemoveTabFromList(tabId: number): Promise<void> {
    const tabIds = await GetTabList();
    tabIds.splice(tabIds.indexOf(tabId), 1);
    await SetTabList(tabIds);
}