import Constants from './Constants';

export class TimeoutManager {
    private _dailyExceeded: boolean = false;
    private _sessionExceeded: boolean = false;
    private _counter = {
        session_seconds: 0,
        total_seconds: 0
    }
    private _running: boolean = false;
    private _timeout: NodeJS.Timeout | null = null;
    private _session_cooldown: NodeJS.Timeout | null = null;

    private _targetTabIds: Set<number> = new Set();
    // private _activeTabId: number | null = null;

    constructor() {}

    public get AllowedStatus(): boolean {
        return !(this._dailyExceeded || this._sessionExceeded);
    }

    public async Init(): Promise<void> {
        await this._loadCounters();
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

    public RemoveTabFromList(tabId: number): void {
        this._targetTabIds.delete(tabId);
        // this._targetTabIds.clear();
        if(this._targetTabIds.size === 0){
            this._onSessionEnd();
            // this.PauseSession();
        }
    }

    set ActiveTabId(tabId: number) {
        this._setActiveTabId(tabId);
    }

    private _setActiveTabId(tabId: number): void {
        // this._activeTabId = tabId;
        if (!this._targetTabIds.has(tabId)){
            this.PauseSession();
        }
    }

    /*
     private async _GetSessionSeconds(): Promise<number> {
        return new Promise<number>((resolve, _reject) => {
            chrome.storage.local.get('session_seconds', (result) => {
                resolve(result['session_seconds']);
            });
        })
    }

    private _SetSessionSeconds(value: number) {
        return new Promise<void>((resolve, _reject) => {
            chrome.storage.local.set({session_seconds: value}, () => {
                resolve();
            })
        });
    }

    private _GetTotalSeconds(): Promise<number> {
        return new Promise<number>((resolve, _reject) => {
            chrome.storage.local.get('total_seconds', (result) => {
                resolve(result['total_seconds']);
            });
        });
    }

    private _SetTotalSeconds(value: number) {
        return new Promise<void>((resolve, _reject) => {
            chrome.storage.local.set({total_seconds: value}, () => {
                resolve();
            })
        });
    }
    */
    

    private _onSessionStart(){
        this._timeout = setInterval(this._checkConditions.bind(this), 1000);
        this._running = true;
    }

    private _onSessionEnd(){
        clearInterval(this._timeout!);
        this._counter.session_seconds = 0;
        console.log('total_seconds: ' + this._counter.total_seconds);
    }

    private async _checkConditions(){
        this._counter.session_seconds++;
        this._counter.total_seconds++;
        await this._syncCounters();
        if (this._counter.total_seconds >= Constants.DAILY_TIMEOUT){
            this._onDailyTimeout();
        }
        if (this._counter.session_seconds >= Constants.SESSION_TIMEOUT){
            this._onSessionTimeout();
        }

        for (const tabId of this._targetTabIds) {
            await chrome.tabs.sendMessage(tabId, {action: 'updateTimer', text: this._generateTimerText()});
        }
        console.log('[' + this._counter.session_seconds + ']' + 'tabIds: ' + JSON.stringify(Array.from(this._targetTabIds)));
    }

    private async _onSessionTimeout() {
        console.log('Session timeout');
        this._sessionExceeded = true;
        this._session_cooldown = setTimeout(() => {
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
        this._onSessionEnd();
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
        this._onSessionEnd();
    }


    private _initDailyTimeout(){
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        console.log(`setting daily timeout for ${midnight.toString()}`);
        setTimeout(() => {
            this._dailyExceeded = false;
        }, midnight.getTime() - Date.now());
    }

    private async _syncCounters(){
        await chrome.storage.local.set({
            session_seconds: this._counter.session_seconds,
            total_seconds: this._counter.total_seconds
        });
    }

    private async _loadCounters(){
        const fromStorage = await chrome.storage.local.get(['session_seconds', 'total_seconds']);
        this._counter.session_seconds = fromStorage['session_seconds'] || 0;
        this._counter.total_seconds = fromStorage['total_seconds'] || 0;
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