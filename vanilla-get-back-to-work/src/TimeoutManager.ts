import Constants from './Constants';
import { Storage } from './Storage';


export class TimeoutManager {
    private _running: boolean = false;
    private _timeout: NodeJS.Timeout | null = null;
    private _targetTabIds: Set<number> = new Set();

    private readonly _storage: Storage = new Storage();

    constructor() {
        chrome.runtime.onInstalled.addListener(async () => {
            console.log(`Init TimeoutManager. Daily timeout: ${Constants.DAILY_TIMEOUT}, Session timeout: ${Constants.SESSION_TIMEOUT}`);
            console.log(`session seconds: ${await this._storage.GetSessionSeconds()}, total seconds: ${await this._storage.GetTotalSeconds()}`); 
            this._storage.Initialize();
        });
    }

    public async AllowedStatus(): Promise<boolean> {
        const dailyExceeded = await this._storage.GetDailyTimeoutTimestamp();
        const sessionExceeded = await this._storage.GetSessionTimeoutTimestamp();
        console.log(`daily exceeded: ${new Date(dailyExceeded).toUTCString()}, session exceeded: ${new Date(sessionExceeded).toUTCString()}`);
        const dailyAllowed = Date.now() >= dailyExceeded;
        const sessionAllowed = Date.now() >= sessionExceeded;
        return (dailyAllowed && sessionAllowed);
    }

    public PauseSession(): void {
        console.log('paused')
        clearInterval(this._timeout!);
        this._running = false;
    }

    public AddTabToList(tabId: number): void {
        this._targetTabIds.add(tabId);
        console.log(`tabs: ${JSON.stringify(Array.from(this._targetTabIds))}`);
        if (!this._running){ {
            this._onSessionStart();
            this._running = true;
        }}
    }

    public async RemoveTabFromList(tabId: number): Promise<void> {
        this._targetTabIds.delete(tabId);
        console.log(`tabs: ${JSON.stringify(Array.from(this._targetTabIds))}`);
        if(this._targetTabIds.size === 0){
            await this._onSessionEnd();
        }
    }

    set ActiveTabId(tabId: number) {
        this._setActiveTabId(tabId);
    }

    private _setActiveTabId(tabId: number): void {
        if (!this._targetTabIds.has(tabId)){
            this.PauseSession();
        }
    }

    private _onSessionStart(){
        console.log('started')
        this._timeout = setInterval(this._checkConditions.bind(this), 1000);
        this._running = true;
    }

    private async _onSessionEnd(){
        this.PauseSession();
        await this._storage.SetSessionSeconds(0);
        console.log('total_seconds: ' + await this._storage.GetTotalSeconds());
    }

    private async _checkConditions(){
        await this._storage.SetSessionSeconds(await this._storage.GetSessionSeconds() + 1);
        await this._storage.SetTotalSeconds(await this._storage.GetTotalSeconds() + 1);
        if (await this._storage.GetTotalSeconds() >= Constants.DAILY_TIMEOUT){
            await this._onDailyTimeout();
        }
        if (await this._storage.GetSessionSeconds() >= Constants.SESSION_TIMEOUT){
            await this._onSessionTimeout();
        }

        for (const tabId of this._targetTabIds) {
            try{
                await chrome.tabs.sendMessage(tabId, {action: 'updateTimer', text: await this._generateTimerText()});
            } catch {}
        }
        console.log('[' + await this._storage.GetSessionSeconds() + ']' + 'tabIds: ' + JSON.stringify(Array.from(this._targetTabIds)));
    }

    private async _onSessionTimeout() {
        console.log('Session timeout');
        this._initSessionTimeout();
        const tabList = this._targetTabIds;
        for (const tabId of tabList) {
            chrome.scripting.executeScript({
                target: { tabId: tabId! },
                func: () => {
                    return new Promise<void>((resolve) => {
                        alert('You have been on Facebook for too long. Please get back to work.');
                        resolve();
                    });
                }
            }, () => {
                chrome.tabs.update(tabId, { url: 'https://www.google.com' });
            });
        }
        await this._onSessionEnd();
    }

    private async _onDailyTimeout() {
        console.log('daily timeout');
        this._initDailyTimeout();
        const tabList = this._targetTabIds;
        for (const tabId of tabList) {
            chrome.scripting.executeScript({
                target: { tabId: tabId! },
                func: () => {
                    return new Promise<void>((resolve) => {
                        alert('You have been on Facebook for too long today. Please get back to work.\nYou will regain access tomorrow.');
                        resolve();
                    });
                }
            }, () => {
                chrome.tabs.update(tabId, { url: 'https://www.google.com' });
            });
        }
        await this._onSessionEnd();
    }

    private _initSessionTimeout(){
        const timeoutUntilTimestamp = new Date().getTime() + 1000 * Constants.SESSION_COOLDOWN
        this._storage.SetSessionTimeoutTimestamp(timeoutUntilTimestamp)
    }

    private _initDailyTimeout(){
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        this._storage.SetDailyTimeoutTimestamp(midnight.getTime());
        console.log(`setting daily timeout for ${midnight.toString()}`);
    }
    
    private async _generateTimerText(): Promise<string> {
        const padLeft = (string: string, pad = '0', length = 2) => {
            return (new Array(length + 1).join(pad) + string).slice(-length);
        }
        const timeLeft = Constants.SESSION_TIMEOUT - await this._storage.GetSessionSeconds();
        const minutes = Math.floor(timeLeft / 60)
        const seconds = timeLeft - minutes * 60;
        return `${padLeft(minutes.toString())}:${padLeft(seconds.toString())}`;
    }
}