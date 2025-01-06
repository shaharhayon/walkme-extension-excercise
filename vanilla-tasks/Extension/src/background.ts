
const SERVER_URL = 'http://localhost:3000';


chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
    console.log('message received: ' + JSON.stringify(message))
    const messageWithPath = {
        ...message,
        path: '/task'
    }
    switch (message.action){
        case 'ADD_TASK': {
            const task = await SendRest('POST', messageWithPath);
            SendResponseToTab(message.tabId, [task])
            break;
        }
        case 'EDIT_TASK': {
            const task = await SendRest('PUT', messageWithPath);
            SendResponseToTab(message.tabId, [task])
            break;
        }
        case 'REMOVE_TASK': {
            const task = await SendRest('DELETE', messageWithPath);
            SendResponseToTab(message.tabId, [task])
            break;
        }
        case 'MARK_DONE': {
            const task = await SendRest('PUT', messageWithPath);
            SendResponseToTab(message.tabId, [task])
            break;
        }
        case "GET_ALL_TASKS":{
            messageWithPath.path = '/tasks';
            const tasks = await SendRest('GET', messageWithPath);

            console.log(JSON.stringify(task))
            break;
        }
    }
})
async function SendRest<T extends >(method: RestMethod, body: MessageWithPath): Promise<Task>{
    try {
        const res = await fetch(`${SERVER_URL}${body.path}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method,
            body: body.data !== undefined ? JSON.stringify(body.data) : undefined
        });
        return res.json();  
    } catch (e) {
        console.error(e)
        throw 'e'
    }
}