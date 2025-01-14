import { Message, SendMessageToBackground, Task } from "../internal-api";

export function CreateTaskListItem(item: Task){
    const li = document.createElement('li')
    li.className = 'task-item';
    li.id = `item-${item.id}`;

    li.appendChild(CreateCompleteButton(item));
    li.appendChild(CreateTaskTextField(item));
    li.appendChild(CreateDeleteButton(item));

    return li;
}

function CreateTaskTextField(item: Task){
    const textarea = document.createElement('textarea');
    textarea.id = 'task-text-input';
    textarea.className = 'task-text-input';
    textarea.value = item.text;
    textarea.rows = 1;

    const adjustHeight = () => {
        textarea.style.height = 'auto'; 
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    requestAnimationFrame(adjustHeight);
    
    textarea.addEventListener('input', adjustHeight);
    textarea.addEventListener('blur', () => {
        textarea.value = textarea.value.trimEnd()
        SendMessageToBackground({
            action: 'EDIT_TASK',
            data: {
                id: item.id,
                text: textarea.value
            }
        })
    })
    // textarea.addEventListener('keyup', function(event) {
    //     if (event.key === 'Enter') {
    //         textarea.blur();
    //     }
    // });
    return textarea;
}

function CreateCompleteButton(item: Task){
    const completedButton = document.createElement('button');
    completedButton.className = 'complete-button';
    completedButton.id = `checkbox-${item.id}`;

    if (item.status) {
        alert('x')
    } else {
        completedButton.style.backgroundImage = `url(${chrome.runtime.getURL('icons/circle.png')})`
        completedButton.addEventListener('mouseout', () => {
            completedButton.style.backgroundImage = `url(${chrome.runtime.getURL('icons/circle.png')})`;
        })
        completedButton.addEventListener('mouseover', () => {
            completedButton.style.backgroundImage = `url(${chrome.runtime.getURL('icons/check-circle.png')})`;
        })
    }
    completedButton.addEventListener('click', async (ev: any) => {
        if (item.status){
            return;
        }
        const message: Message = {
            action: 'MARK_DONE',
            data: {
                id: Number.parseInt(ev.target.id.slice(9)),
                status: 1
            }
        }
        SendMessageToBackground(message);
    });
    return completedButton;
}


function CreateDeleteButton(item: Task){
    const url = chrome.runtime.getURL('icons/trash.png');
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.style.backgroundImage = `url(${url})`

    deleteButton.addEventListener('click', function() {
        SendMessageToBackground({
            'action': 'REMOVE_TASK',
            data: {
                id: item.id
            }
        })
        console.log(`Item with ID ${item.id} deleted`);
    });
    return deleteButton;
}
