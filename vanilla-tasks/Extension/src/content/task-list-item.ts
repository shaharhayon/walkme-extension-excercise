import { Message, SendMessageToBackground, Task } from "../internal-api";
import { AddHighlightOnHover } from "./util";

export function CreateTaskListItem(item: Task){
    const li = document.createElement('li')
    li.id = `item-${item.id}`
    li.style.display = 'flex'
    li.style.backgroundColor = '#f0f0f0';
    li.style.margin = '10px 0';
    li.style.padding = '10px';
    li.style.borderRadius = '5px';
    li.style.fontSize = '16px';
    // li.style.cursor = 'pointer';
    
    li.addEventListener('mouseover', () => {
        li.style.backgroundColor = '#e0e0e0';
    });
    
    li.addEventListener('mouseout', () => {
        li.style.backgroundColor = '#f0f0f0';
    });

    li.appendChild(CreateCheckBox(item));
    li.appendChild(CreateTaskTextField(item));
    li.appendChild(CreateDeleteButton(item));

    return li;
}

function CreateTaskTextField(item: Task){
    const input = document.createElement('input');
    input.type = 'text';
    input.value = item.text;
    input.style.border = 'none';
    input.style.backgroundColor = 'transparent';
    input.style.fontSize = '16px';
    input.style.width = '100%';
    input.style.outline = 'none';
    input.style.fontFamily = '"Poppins", sans-serif'; 

    input.addEventListener('blur', () => {
        SendMessageToBackground({
            action: 'EDIT_TASK',
            data: {
                id: item.id,
                text: input.value
            }
        })
    })
    input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            input.blur();
        }
    });
    return input;
}

function CreateCheckBox(item: Task){
    // const checkbox = document.createElement('input');
    const checkbox = document.createElement('button');
    checkbox.id = `checkbox-${item.id}`;
    checkbox.style.backgroundPosition = 'center'
    checkbox.style.backgroundSize = 'cover'
    checkbox.style.opacity = '50%'
    checkbox.style.height = '2vh'
    checkbox.style.width = '2vh'
    checkbox.style.cursor = 'pointer';
    checkbox.style.border = 'none';

    // checkbox.type = 'checkbox';
    checkbox.style.marginRight = '10px';
    // checkbox.checked = item.status;
    AddHighlightOnHover(checkbox)
    if (item.status) {
        alert('x')
    } else {
        checkbox.style.backgroundImage = `url(${chrome.runtime.getURL('icons/check.png')})`
    }
    checkbox.addEventListener('click', async (ev: any) => {
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
    return checkbox;
}


function CreateDeleteButton(item: Task){
    const url = chrome.runtime.getURL('icons/trash.png');
    
    const deleteButton = document.createElement('button');
    deleteButton.style.backgroundImage = `url(${url})`
    deleteButton.style.backgroundPosition = 'center'
    deleteButton.style.opacity = '50%'
    deleteButton.style.backgroundSize = 'cover'
    deleteButton.style.marginLeft = 'auto'; 
    deleteButton.style.padding = '10px 10px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.border = 'none';
    AddHighlightOnHover(deleteButton);
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