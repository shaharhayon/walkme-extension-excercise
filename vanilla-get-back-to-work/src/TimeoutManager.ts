import Constants from './Constants';



export class TimeoutManager {
    private _dailyExceeded: boolean = false;
    private _sessionExceeded: boolean = false;
    private _running: boolean = false;
    private _timeout: NodeJS.Timeout | null = null;
    private _session_cooldown: NodeJS.Timeout | null = null;

    private _targetTabIds: Set<number> = new Set();

    constructor() {
        chrome.runtime.onInstalled.addListener(async () => {
            console.log(`Init TimeoutManager. Daily timeout: ${Constants.DAILY_TIMEOUT}, Session timeout: ${Constants.SESSION_TIMEOUT}`);
            console.log(`session seconds: ${await this._getSessionSeconds()}, total seconds: ${await this._getTotalSeconds()}`); 
            await this._setSessionSeconds(0);
            await this._setTotalSeconds(0); 
        });
        setInterval(() => {
            console.log(`tabs: ${JSON.stringify(Array.from(this._targetTabIds))}`);
        }, 1000);
    }

    public get AllowedStatus(): boolean {
        console.log(`daily exceeded: ${this._dailyExceeded}, session exceeded: ${this._sessionExceeded}`);
        return !(this._dailyExceeded || this._sessionExceeded);
    }

    public PauseSession(): void {
        clearInterval(this._timeout!);
        this._running = false;
    }

    public AddTabToList(tabId: number): void {
        this._targetTabIds.add(tabId);
        if (!this._running){ {
            this._onSessionStart();
            this._running = true;
        }}
    }

    public async RemoveTabFromList(tabId: number): Promise<void> {
        this._targetTabIds.delete(tabId);
        // this._targetTabIds.clear();
        if(this._targetTabIds.size === 0){
            await this._onSessionEnd();
            // this.PauseSession();
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
        this._timeout = setInterval(this._checkConditions.bind(this), 1000);
        this._running = true;
    }

    private async _onSessionEnd(){
        this._running = false;
        clearInterval(this._timeout!);
        await this._setSessionSeconds(0);
        console.log('total_seconds: ' + await this._getTotalSeconds());
    }

    private async _checkConditions(){
        await this._setSessionSeconds(await this._getSessionSeconds() + 1);
        await this._setTotalSeconds(await this._getTotalSeconds() + 1);
        if (await this._getTotalSeconds() >= Constants.DAILY_TIMEOUT){
            await this._onDailyTimeout();
        }
        if (await this._getSessionSeconds() >= Constants.SESSION_TIMEOUT){
            await this._onSessionTimeout();
        }

        for (const tabId of this._targetTabIds) {
            try{
                await chrome.tabs.sendMessage(tabId, {action: 'updateTimer', text: await this._generateTimerText()});
            } catch {}
        }
        console.log('[' + await this._getSessionSeconds() + ']' + 'tabIds: ' + JSON.stringify(Array.from(this._targetTabIds)));
    }

    private async _onSessionTimeout() {
        console.log('Session timeout');
        this._sessionExceeded = true;
        this._session_cooldown = setTimeout(() => {
            console.log('Session cooldown ended');
            this._sessionExceeded = false;
            clearTimeout(this._session_cooldown!);
        }, Constants.SESSION_COOLDOWN * 1000);
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
        this._dailyExceeded = true;
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


    private _initDailyTimeout(){
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        console.log(`setting daily timeout for ${midnight.toString()}`);
        setTimeout(() => {
            this._dailyExceeded = false;
        }, midnight.getTime() - Date.now());
    }

    private async _setSessionSeconds(seconds: number){
        await chrome.storage.local.set({session_seconds: seconds});
    }

    private async _getSessionSeconds(): Promise<number> {
        return (await chrome.storage.local.get('session_seconds'))['session_seconds'];
    }

    private async _setTotalSeconds(seconds: number){
        await chrome.storage.local.set({total_seconds: seconds});
    }

    private async _getTotalSeconds(): Promise<number> {
        return (await chrome.storage.local.get('total_seconds'))['total_seconds'];
    }
    
    private async _generateTimerText(): Promise<string> {
        const padLeft = (string: string, pad = '0', length = 2) => {
            return (new Array(length + 1).join(pad) + string).slice(-length);
        }
        const timeLeft = Constants.SESSION_TIMEOUT - await this._getSessionSeconds();
        const minutes = Math.floor(timeLeft / 60)
        const seconds = timeLeft - minutes * 60;
        return `${padLeft(minutes.toString())}:${padLeft(seconds.toString())}`;
    }
}