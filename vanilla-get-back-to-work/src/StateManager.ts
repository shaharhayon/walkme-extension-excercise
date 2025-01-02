import Constants from "./Constants";
import { TimeoutManager } from "./TimeoutManager";

export class StateManager {
    private readonly _timeoutManager: TimeoutManager;
    constructor() {
        this._timeoutManager = new TimeoutManager();
    }

    public Init(): void {
        this._InitiateTabEventHandlers();
    }

    private _navigatedCallback(details: chrome.webNavigation.WebNavigationFramedCallbackDetails | chrome.tabs.TabActiveInfo): void {
        if (!this._timeoutManager.AllowedStatus){
            console.log('Cooldown invoked. Redirecting to Google');
            chrome.scripting.executeScript({
                target: { tabId: details.tabId! },
                func: () => {
                    return new Promise<void>((resolve) => {
                        alert('Blocked.');
                        resolve();
                    });
                }
            }, () => {
                chrome.tabs.update(details.tabId, { url: 'https://www.google.com' });
            });
        } else {
            this._timeoutManager.AddTabToList(details.tabId);
            this._ShowTimer(details.tabId);
        }
    }

    private _InitiateTabEventHandlers(): void {
        chrome.webNavigation.onCompleted.addListener(async (details) => {
            if(details.url.includes(Constants.TRACKED_URL)){
                this._navigatedCallback(details);
            } else {
                await this._timeoutManager.RemoveTabFromList(details.tabId);
            }
        });

        chrome.tabs.onRemoved.addListener(async (tabId) => {
            console.log(tabId + 'closed');
            await this._timeoutManager.RemoveTabFromList(tabId);
        });
            
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
            if(changeInfo.url?.includes(Constants.TRACKED_URL)){
                this._ShowTimer(tabId);
            }
        });

        chrome.tabs.onActivated.addListener(async (activeInfo) => {
            if(await this._isTabOnTarget(activeInfo.tabId)){
                this._navigatedCallback(activeInfo);
            } else {
                this._timeoutManager.ActiveTabId = activeInfo.tabId;
            }
        });
    }
    private async _isTabOnTarget(tabId: number): Promise<boolean> {
        const tab = await chrome.tabs.get(tabId);
            if (tab.url!.includes(Constants.TRACKED_URL)) {
                return true;
        }
        return false;
    }

    private async _ShowTimer(tabId: number): Promise<void> {
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