export const MESSAGING = {
    ADD_TASK: 'add',
    EDIT_TASK: 'edit',
    REMOVE_TASK: 'remove',
    MARK_DONE: 'done'
} as const;

export type InternalMessage = {
    // tabId: number,
    action: string,
    data?: {
        text?: string,
        id?: number,
        status?: 0 | 1
    }
}
export type AddTask = InternalMessage & {
    action: 'ADD_TASK',
    data: {
        text: string
    }
}
export type EditTask = InternalMessage & {
    action: 'EDIT_TASK',
    data: {
        text: string
    }
}
export type RemoveTask = InternalMessage & {
    action: 'REMOVE_TASK',
    data: {
        id: number
    }
}
export type MarkDone = InternalMessage & {
    action: 'MARK_DONE',
    data: {
        id: number,
        status: 1
    }
}
export type GetAllTasks = InternalMessage & {
    action: 'GET_ALL_TASKS',
    data: undefined
}
export type Message = AddTask | EditTask | RemoveTask | MarkDone | GetAllTasks
export type MessageWithPath = Message & { path: string }
export type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Task = {
    id: number
    status: boolean
    text: string
}

export function SendMessageToBackground(message: Message) {
    chrome.runtime.sendMessage(message);
}

export function SendResponseToTab(tabId: number, tasks: Task[]) {
    chrome.tabs.sendMessage(tabId, tasks);
}