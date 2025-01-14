import { Task } from "../internal-api";
import { CreateNewTaskTextField } from "./new-task";
import { CreateTaskListItem } from "./task-list-item";
import { RefreshList } from "./util";

export function CreateMainWindow(){
    const overlay = document.createElement('div');
    overlay.className = 'item-list-container'
    overlay.id = 'item-list-container';
            
    let heading = document.createElement('h1');
    heading.innerText = 'Tasks'
    
    let ul = document.createElement('ul');
    
    ul.className = 'open-tasks-list'
    ul.id = 'open-tasks-list'
    
    const newTaskField = CreateNewTaskTextField();

    overlay.appendChild(heading);
    overlay.appendChild(ul);
    overlay.appendChild(newTaskField);

    document.body.appendChild(overlay);
    
    chrome.runtime.onMessage.addListener((items: Task[], _sender, _sendResponse) => {
        const ul = document.getElementById('open-tasks-list') as HTMLUListElement;
        if (items.length === 0){
            RefreshList();
            return;
        }
        while (ul.firstChild){
            ul.removeChild(ul.firstChild)
        }
        for (const item of items) {
            const li = CreateTaskListItem(item);
            ul.appendChild(li);
        }
    })
    return overlay
}