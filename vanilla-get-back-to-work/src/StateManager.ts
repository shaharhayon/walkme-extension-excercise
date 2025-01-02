import Constants from "./Constants";
import { TimeoutManager } from "./TimeoutManager";

export class StateManager {
    private readonly _timeoutManager: TimeoutManager;
    constructor() {
        this._SetTabList(Array.from(new Set<number>()));

        this._timeoutManager = new TimeoutManager(this._GetTabList.bind(this));
    }

    public Init(): void {
        this._InitiateTabEventHandlers();
    }

    private _InitiateTabEventHandlers(): void {
        chrome.storage.local.onChanged.addListener((changes) => {
            if (
                (changes.tabIds['newValue'] as number[]).length !== 0 &&
                (changes.tabIds['oldValue'] as number[]).length === 0) {
                    this._timeoutManager.StartSession();
                    // ShowTimer();
            } else if (
                (changes.tabIds['newValue'] as number[]).length === 0 &&
                (changes.tabIds['oldValue'] as number[]).length !== 0) {
                    this._timeoutManager.EndSession();
            }
        });
        
        chrome.webNavigation.onCompleted.addListener(async (details) => {
            if(details.url.includes(Constants.TRACKED_URL)){
                this._AddTabToList(details.tabId);
            }
        });
        chrome.tabs.onRemoved.addListener(async (tabId) => {
            console.log(tabId + 'closed');
            this._RemoveTabFromList(tabId);
        });
        
        chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
            if (details.url.includes(Constants.TRACKED_URL) &&
                !this._timeoutManager.AllowedStatus) {
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
            this._RemoveTabFromList(tabId);
        });
        
    }

    private async _GetTabList(): Promise<number[]> {
        return (await chrome.storage.local.get(['tabIds']))['tabIds'];
    }

    private async _SetTabList(tabIds: number[]): Promise<void> {
        return await chrome.storage.local.set({tabIds: [...new Set(tabIds)]});
    }    

    private async _AddTabToList(tabId: number): Promise<void> {
        const tabIds = await this._GetTabList();
        tabIds.push(tabId);
        await this._SetTabList(tabIds);
        await this._ShowTimer();
    }
    
    private async _RemoveTabFromList(tabId: number): Promise<void> {
        const tabIds = await this._GetTabList();
        tabIds.splice(tabIds.indexOf(tabId), 1);
        await this._SetTabList(tabIds);
    }

    private async _ShowTimer(): Promise<void> {
        const tabIds = await this._GetTabList();
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
                }
            });
        }
    }
    
}