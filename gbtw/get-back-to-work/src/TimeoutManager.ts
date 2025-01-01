import Constants from './Constants';

export class TimeoutManager {
    private _dailyExceeded: boolean = false;
    private _sessionExceeded: boolean = false;
    private _counter = {
        session_seconds: 0,
        total_seconds: 0
    }

    private _timeout: number = 0;
    private _session_cooldown: number = 0;

    constructor(private readonly _GetTabList: () => Promise<number[]>) {}

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

        for (const tabId of await this._GetTabList()) {
            chrome.tabs.sendMessage(tabId, {action: 'updateTimer', text: this._generateTimerText()});
        }
        // console.log('[' + this._counter.session_seconds + ']' + 'tabIds: ' + JSON.stringify(await GetTabList()));
    }

    private async _onSessionTimeout(){
        const tabList = await this._GetTabList();
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