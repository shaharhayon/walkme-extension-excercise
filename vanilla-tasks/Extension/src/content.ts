import { Message, SendMessageToBackground, Task } from "./internal-api";

const button = document.createElement('button');
button.textContent = 'Click Me!';
button.style.position = 'fixed'; 
button.style.bottom = '20px'; 
button.style.right = '20px'; 
button.style.padding = '10px 20px';
button.style.fontSize = '16px';
button.style.backgroundColor = '#007bff';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';

document.body.appendChild(button);

button.addEventListener('click', async (e) => {
    const div = document.getElementById('item-list-container');
    if (div != null) {
        switch (div.style.display){
            case 'block':
                div.style.display = 'none';
                break;
            case 'none':
                div.style.display = 'block';
                break;
        }
        return;
    }
    const overlay = document.createElement('div');
        overlay.style.display = 'block'
        overlay.id = 'item-list-container';
        overlay.style.position = 'fixed';
        overlay.style.top = '20px';
        overlay.style.left = '20px';
        overlay.style.padding = '20px';
        overlay.style.backgroundColor = '#fff';
        overlay.style.border = '1px solid #ddd';
        overlay.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        overlay.style.zIndex = '9999';
        overlay.style.maxWidth = '300px';
            
    let heading = document.createElement('h1');
        heading.innerText = 'Tasks';
        heading.style.fontSize = '18px';
        heading.style.color = '#333';
        overlay.appendChild(heading);
    const newTaskField = CreateNewTaskTextField();
    overlay.appendChild(newTaskField);

    let ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.padding = '20px';
        ul.style.overflowY = 'scroll'
        ul.style.maxHeight = '300px'
        // ul.style.overflowY = 'scroll'
    
    RefreshList();

    chrome.runtime.onMessage.addListener((items: Task[], sender, sendResponse) => {
        if (items.length === 0){
            while (ul.firstChild){
                ul.removeChild(ul.firstChild)
            }
    
            RefreshList();
            return;
        }
        
        for (let i = 0; i < items.length; i++){
            const item = items[i];
            const li = CreateListItem(item);

            const input = CreateTextField(item);
            const checkbox = CreateCheckBox(item);
            const deleteButton = CreateDeleteButton(li, item);

            li.appendChild(checkbox);
            li.appendChild(input);
            li.appendChild(deleteButton)
            ul.appendChild(li);
        }
    })
    overlay.appendChild(ul);
    document.body.appendChild(overlay);
})

function RefreshList(){
    SendMessageToBackground({
        action: 'GET_ALL_TASKS',
        data: undefined
    })
}

function CreateListItem(item: Task){
    const li = document.createElement('li')
    li.id = `item-${item.id}`
    li.style.display = 'flex'
    li.style.backgroundColor = '#f0f0f0';
    li.style.margin = '10px 0';
    li.style.padding = '10px';
    li.style.borderRadius = '5px';
    li.style.fontSize = '16px';
    li.style.cursor = 'pointer';
    
    li.addEventListener('mouseover', () => {
        li.style.backgroundColor = '#e0e0e0';
    });
    
    li.addEventListener('mouseout', () => {
        li.style.backgroundColor = '#f0f0f0';
    });
    return li;
}

function CreateNewTaskTextField(){
    const input = document.createElement('input');
    input.type = 'text';
    input.style.border = 'none';
    input.style.backgroundColor = 'transparent';
    input.style.fontSize = '16px';
    input.style.width = '100%'; 
    input.style.outline = 'none';
    input.placeholder = 'Create a new task'
 
    input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            SendMessageToBackground({
                action: 'ADD_TASK',
                data: {
                    text: input.value
                }
            })
            input.value = ''
        }
    });
    return input;
}

function CreateTextField(item: Task){
    const input = document.createElement('input');
    input.type = 'text';
    input.value = item.text;
    input.style.border = 'none';
    input.style.backgroundColor = 'transparent';
    input.style.fontSize = '16px';
    input.style.width = '100%';
    input.style.outline = 'none';

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
    const checkbox = document.createElement('input');
    checkbox.id = `checkbox-${item.id}`
    checkbox.type = 'checkbox';
    checkbox.style.marginRight = '10px';
    checkbox.checked = item.status;
    checkbox.addEventListener('change', async (ev: any) => {
        if (!ev.target.checked){
            ev.target.checked = true;
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

function CreateDeleteButton(li: HTMLLIElement, item: Task){
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.style.marginLeft = 'auto'; 
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.backgroundColor = '#ff4d4d';
    deleteButton.style.border = 'none';
    deleteButton.style.color = 'white';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.borderRadius = '5px';

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