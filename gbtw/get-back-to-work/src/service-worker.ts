// import { useState } from "react";
const TRACKED_URL = 'facebook.com';

const _tabIds = new Set<number>();
// _tabIds.add(1);
chrome.storage.local.set({tabIds: Array.from(_tabIds)});

chrome.webNavigation.onCompleted.addListener(async (details) => {
    if(details.url.includes(TRACKED_URL)){
        AddTabToList(details.tabId);
    }
});
chrome.tabs.onRemoved.addListener(async (tabId) => {
    console.log(tabId + 'closed');
    RemoveTabFromList(tabId);
});

    
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    // const tabIds = await _getRelevantTabArr();
    const tabIds = (await chrome.storage.local.get(['tabIds']))['tabIds'];
    if (!tabIds.includes(tabId) ||
        (changeInfo && changeInfo.url?.includes(TRACKED_URL))) {
            console.log('returning');
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
    console.log('tabids before: ' + JSON.stringify(tabIds));
    tabIds.push(tabId);
    await SetTabList(tabIds);
    const after = (await chrome.storage.local.get(['tabIds']))['tabIds'];
    console.log(JSON.stringify('tabids after: ' + after));
}

async function RemoveTabFromList(tabId: number): Promise<void> {
    const tabIds = await GetTabList();
    console.log('executing');
    tabIds.splice(tabIds.indexOf(tabId), 1);
    await SetTabList(tabIds);
    const after = (await chrome.storage.local.get(['tabIds']))['tabIds'];
    console.log('tabids after: ' + JSON.stringify(after));
}