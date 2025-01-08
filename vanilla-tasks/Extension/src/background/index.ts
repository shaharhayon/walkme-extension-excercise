import { Message, MessageWithPath, RestMethod, SendResponseToTab, Task } from "../internal-api";

const SERVER_URL = 'http://localhost:3000';


chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
    // if (message.data?.id != undefined) {
    //     message.data.id = Number.parseInt((message.data.id as unknown as string).slice(9));
    // }
    const messageWithPath = {
        ...message,
        path: '/task'
    }
    console.log('message received ׳with added path: ' + JSON.stringify(messageWithPath))
    switch (message.action){
        case 'ADD_TASK': {
            const task = await SendRest('POST', messageWithPath);
            SendResponseToTab(sender.tab?.id!, [])
            break;
        }
        case 'EDIT_TASK': {
            const task = await SendRest('PUT', messageWithPath);
            console.log(JSON.stringify(task))
            SendResponseToTab(sender.tab?.id!, [])
            break;
        }
        case 'REMOVE_TASK': {
            const task = await SendRest('DELETE', messageWithPath);
            SendResponseToTab(sender.tab?.id!, [])
            break;
        }
        case 'MARK_DONE': {
            const task = await SendRest('PUT', messageWithPath);
            console.log(JSON.stringify(task))
            SendResponseToTab(sender.tab?.id!, [])
            break;
        }
        case "GET_ALL_TASKS":{
            messageWithPath.path = '/tasks';
            const tasks = await SendRest('GET', messageWithPath);
            SendResponseToTab(sender.tab?.id!, tasks);
            break;
        }
    }
})

async function SendRest(method: RestMethod, body: MessageWithPath): Promise<Task[]> {
    try {
        const res = await fetch(`${SERVER_URL}${body.path}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method,
            body: body.data !== undefined ? JSON.stringify(body.data) : undefined
        });
        return await res.json();  
    } catch (e) {
        console.error(e)
        throw 'e'
    }
}