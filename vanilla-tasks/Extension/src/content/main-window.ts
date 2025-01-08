import { Task } from "../internal-api";
import { CreateNewTaskTextField } from "./new-task";
import { CreateTaskListItem } from "./task-list-item";
import { RefreshList } from "./util";

export function CreateMainWindow(){
    const overlay = document.createElement('div');
    overlay.style.fontFamily = '"Poppins", sans-serif'; 
    // overlay.style.fontFamily = 'Poppins';
    overlay.style.display = 'none'
    overlay.style.padding = '20px'
    overlay.style.flexDirection = 'column'
    overlay.id = 'item-list-container';
    overlay.style.position = 'fixed';
    overlay.style.top = '10px';
    overlay.style.left = '20px';
    // overlay.style.padding = '20px';
    overlay.style.backgroundColor = '#fff';
    overlay.style.border = '1px solid #ddd';
    overlay.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    overlay.style.zIndex = '9998';
    overlay.style.width = '400px';
    overlay.style.maxHeight = '90%'
            
    let heading = document.createElement('h1');
    heading.style.paddingTop = '0px'
    heading.style.paddingBottom = '30px'
    heading.style.fontFamily = '"Poppins", sans-serif'; 
    heading.style.color = 'lightgrey'
    heading.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.1)'
    heading.style.textAlign = 'center'
    heading.innerText = 'Tasks'
    heading.style.height = '10px'
    heading.style.flexGrow = '1'

    
    let ul = document.createElement('ul');
    ul.id = 'open-tasks-list'
    ul.style.listStyleType = 'none';
    ul.style.padding = '20px';
    ul.style.overflowY = 'scroll'
    ul.style.border = '1px solid #ddd';
    ul.style.borderRadius = '15px'
    ul.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    ul.style.maxWidth = '100%'
    ul.style.maxHeight = '70%'

    
    const newTaskField = CreateNewTaskTextField();

    overlay.appendChild(heading);
    overlay.appendChild(ul);
    overlay.appendChild(newTaskField);

    document.body.appendChild(overlay);
    
    chrome.runtime.onMessage.addListener((items: Task[], _sender, _sendResponse) => {
        const ul = document.getElementById('open-tasks-list') as HTMLUListElement;
        if (items.length === 0){
            while (ul.firstChild){
                ul.removeChild(ul.firstChild)
            }
            
            RefreshList();
            return;
        }
        
        for (const item of items) {
            const li = CreateTaskListItem(item);
            ul.appendChild(li);
        }
    })
    return overlay
}