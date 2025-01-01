
chrome.webNavigation.onCompleted.addListener(async (details) => {
    if(details.url.includes('facebook.com')) {
        console.log('Facebook page loaded');
        SetBackgroundColor();
    }
})

chrome.runtime.onMessage.addListener(async (message, _sender, _sendResponse) => {
    if(message === 'set-color') {
            SetBackgroundColor();
    } else if (message === 'open-options') {
        await chrome.runtime.openOptionsPage();
    }
    return true;
})

async function SetBackgroundColor() {
    const targetColor: string = (await chrome.storage.local.get('color')).color;
    for (const tabId of await getTabIdsByUrl('facebook.com')) {
        console.log(`Changing background color of tab ${tabId} to ${targetColor}`);
        chrome.scripting.executeScript<string[], void>({
            target: {tabId: tabId!},
            args: [targetColor],
            func: (_color) => {
            document.body.style.backgroundColor = _color;
        }});
    }
}

async function getTabIdsByUrl(url: string) {
    return (await chrome.tabs.query({}))
        .filter(tab => tab.url && tab.url.includes(url))
        .map(tab => tab.id);
}
