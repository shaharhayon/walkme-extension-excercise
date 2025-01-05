const STORAGE_KEYS = {
    SESSION_SECONDS: 'session-seconds',
    TOTAL_SECONDS: 'total-seconds',
    SESSION_TIMEOUT: 'session-timeout',
    DAILY_TIMEOUT: 'daily-timeout'
} as const;

export class Storage {

    public async Initialize(): Promise<void> {
        await this.SetSessionSeconds(0);
        await this.SetTotalSeconds(0); 
        await this.SetSessionTimeoutTimestamp(0);
        await this.SetDailyTimeoutTimestamp(0);
    }

    public async GetSessionSeconds(): Promise<number> {
        return (await chrome.storage.local.get(STORAGE_KEYS.SESSION_SECONDS))[STORAGE_KEYS.SESSION_SECONDS];
    }

    public async SetSessionSeconds(seconds: number): Promise<void> {
        await chrome.storage.local.set({[STORAGE_KEYS.SESSION_SECONDS]: seconds});
    }

    public async GetTotalSeconds(): Promise<number> {
        return (await chrome.storage.local.get(STORAGE_KEYS.TOTAL_SECONDS))[STORAGE_KEYS.TOTAL_SECONDS];
    }

    public async SetTotalSeconds(seconds: number): Promise<void> {
        await chrome.storage.local.set({[STORAGE_KEYS.TOTAL_SECONDS]: seconds});
    }

    public async GetSessionTimeoutTimestamp(): Promise<number> {
        return (await chrome.storage.local.get(STORAGE_KEYS.SESSION_TIMEOUT))[STORAGE_KEYS.SESSION_TIMEOUT];
    }

    public async SetSessionTimeoutTimestamp(timestamp: number): Promise<void> {
        await chrome.storage.local.set({[STORAGE_KEYS.SESSION_TIMEOUT]: timestamp})
    }

    public async GetDailyTimeoutTimestamp(): Promise<number> {
        return (await chrome.storage.local.get(STORAGE_KEYS.DAILY_TIMEOUT))[STORAGE_KEYS.DAILY_TIMEOUT];
    }

    public async SetDailyTimeoutTimestamp(timestamp: number): Promise<void> {
        await chrome.storage.local.set({[STORAGE_KEYS.DAILY_TIMEOUT]: timestamp})
    }
}