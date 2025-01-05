const MESSAGING = {
    ADD_TASK: 'add',
    EDIT_TASK: 'edit',
    REMOVE_TASK: 'remove',
    MARK_DONE: 'done'
} as const;
type AddTask = {
    action: 'ADD_TASK',
    data: {
        text: string
    }
}
type EditTask = {
    action: 'EDIT_TASK',
    data: {
        text: string
    }
}
type RemoveTask = {
    action: 'REMOVE_TASK',
    data: {
        id: number
    }
}
type MarkDone = {
    action: 'MARK_DONE',
    data: {
        id: number
    }
}
type Message = AddTask | EditTask | RemoveTask | MarkDone
type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type Task = {
    id: number
    status: boolean
    text: string
}

const SERVER_URL = 'http://localhost:3000';


chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
    switch (message.action){
        case 'ADD_TASK': {
            await SendRest('POST', message.data)
            break;
        }
        case 'EDIT_TASK': {
            await SendRest('PUT', message.data)
            break;
        }
        case 'REMOVE_TASK': {
            await SendRest('DELETE', message.data)
            break;
        }
        case 'MARK_DONE': {
            await SendRest('PUT', message.data)
            break;
        }
    }
})
async function SendRest(method: 'POST', body: Message['data']): Promise<Task>
async function SendRest(method: 'PUT', body: Message['data']): Promise<Task>
async function SendRest(method: 'DELETE', body: Message['data']): Promise<Task>
async function SendRest(method: 'PUT', body: Message['data']): Promise<Task>
async function SendRest(method: RestMethod, body: Message['data']): Promise<Task>{
    const res = await fetch(SERVER_URL, {
        method,
        body: JSON.stringify(body)
    });
    return res.json();
}