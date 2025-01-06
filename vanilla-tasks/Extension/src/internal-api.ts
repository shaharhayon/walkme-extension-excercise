const MESSAGING = {
    ADD_TASK: 'add',
    EDIT_TASK: 'edit',
    REMOVE_TASK: 'remove',
    MARK_DONE: 'done'
} as const;

type InternalMessage = {
    tabId: number,
    action: string,
    data?: {
        text?: string,
        id?: number
    }
}
type AddTask = InternalMessage & {
    action: 'ADD_TASK',
    data: {
        text: string
    }
}
type EditTask = InternalMessage & {
    action: 'EDIT_TASK',
    data: {
        text: string
    }
}
type RemoveTask = InternalMessage & {
    action: 'REMOVE_TASK',
    data: {
        id: number
    }
}
type MarkDone = InternalMessage & {
    action: 'MARK_DONE',
    data: {
        id: number
    }
}
type GetAllTasks = InternalMessage & {
    action: 'GET_ALL_TASKS',
    data: undefined
}
type Message = AddTask | EditTask | RemoveTask | MarkDone | GetAllTasks
type MessageWithPath = Message & { path: string }
type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type Task = {
    id: number
    status: boolean
    text: string
}

function SendMessageToBackground(message: Message) {
    chrome.runtime.sendMessage(message);
}

function SendResponseToTab(tabId: number, tasks: Task[]) {
    chrome.tabs.sendMessage(tabId, tasks);
}