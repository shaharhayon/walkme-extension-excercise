import { Message, SendMessageToBackground, Task } from "./internal-api";
    
const button = document.createElement('button');
const icon_when_open = chrome.runtime.getURL('icons/cross.png')
const icon_when_closed = chrome.runtime.getURL('icons/clipboard-list.png');

const SetButtonState = (b: HTMLButtonElement, state: 'open' | 'closed') => {
    switch (state) {
        case "open":
            b.style.height = '2vh'
            b.style.width = '2vh'
            b.style.top = '20px'; 
            b.style.left = '25px'; 
            b.style.padding = '1px'
            b.style.backgroundImage = `url(${icon_when_open})`
            break;
        case "closed":
            b.style.height = '5vh'
            b.style.width = '5vh'
            b.style.top = '25px'; 
            b.style.left = '25px'; 
            b.style.backgroundImage = `url(${icon_when_closed})`
            break;
    }
}

// button.style.backgroundImage = `url(${icon_when_closed})`
button.style.backgroundPosition = 'center'
button.style.backgroundSize = 'cover'
SetButtonState(button, 'closed')
// button.style.height = '5vh'
// button.style.width = '5vh'
// button.textContent = 'Tasks';
button.style.position = 'fixed'; 
// button.style.top = '25px'; 
// button.style.left = '25px'; 
button.style.padding = '10px 20px';
// button.style.fontSize = '16px';
// button.style.backgroundColor = '#007bff';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';
button.style.zIndex = '9999'

document.body.appendChild(button);

button.addEventListener('click', async (e) => {
    const div = document.getElementById('item-list-container');
    if (div != null) {
        switch (div.style.display){
            case 'block':
                div.style.display = 'none';
                SetButtonState(button, 'closed')
                break;
            case 'none':
                div.style.display = 'block';
                SetButtonState(button, 'open')
                break;
        }
        return;
    }
    SetButtonState(button, 'open');
    const overlay = document.createElement('div');
    overlay.style.fontFamily = 'Poppins';
    overlay.style.display = 'block'
    overlay.id = 'item-list-container';
    overlay.style.position = 'fixed';
    overlay.style.top = '10px';
    overlay.style.left = '20px';
    overlay.style.padding = '20px';
    overlay.style.backgroundColor = '#fff';
    overlay.style.border = '1px solid #ddd';
    overlay.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    overlay.style.zIndex = '9998';
    overlay.style.width = '400px';
    overlay.style.maxHeight = '90vh'
            
    let heading = document.createElement('h1');
    heading.style.height = '10px'
    
    let ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    ul.style.padding = '10px';
    ul.style.overflowY = 'scroll'
    ul.style.border = '1px solid #ddd';
    ul.style.borderRadius = '15px'
    ul.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    // ul.style.display = 'flex';
    // ul.style.flexDirection = 'column';
    // ul.style.height = '100%';
    // ul.style.overflow = 'hidden'
    ul.style.maxWidth = '100%'
    ul.style.maxHeight = '70vh'
    
    const newTaskField = CreateNewTaskTextField();

    RefreshList();

    chrome.runtime.onMessage.addListener((items: Task[], _sender, _sendResponse) => {
        if (items.length === 0){
            while (ul.firstChild){
                ul.removeChild(ul.firstChild)
            }
    
            RefreshList();
            return;
        }

            for (const item of items) {
            const li = CreateListItem(item);

            const input = CreateTextField(item);
            const checkbox = CreateCheckBox(item);
            const deleteButton = CreateDeleteButton(item);

            li.appendChild(checkbox);
            li.appendChild(input);
            li.appendChild(deleteButton)
            ul.appendChild(li);
        }
    })
    overlay.appendChild(heading);
    overlay.appendChild(ul);
    overlay.appendChild(newTaskField);
    // newTaskField.appendChild(addTaskButton);
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
    li.style.fontFamily = 'Poppins';
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
    const div = document.createElement('div');
    div.style.display = 'flex'
    div.style.alignItems = 'center'
    div.style.marginTop = '20px'

    const input = document.createElement('input');
    input.type = 'text';
    input.style.border = '2px solid #ccc';
    input.style.padding = '10px';
    input.style.borderRadius = '20px'
    input.style.backgroundColor = '#f0f0f0';
    input.style.fontSize = '16px';
    // input.style.width = '100px'; 
    input.style.outline = 'none';
    input.placeholder = 'Add a new task'
    // input.style.marginTop = '20px'
    input.style.flexGrow = '1'

    const AddTaskCommand = () => {
        if (input.value == '') 
            return;

        SendMessageToBackground({
            action: 'ADD_TASK',
            data: {
                text: input.value
            }
        })
        input.value = ''
    }
 
    input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            AddTaskCommand();
        }
    });
    const url = chrome.runtime.getURL('icons/add.png');
    // alert(`url(${url})`)
    const addTaskButton = document.createElement('button');
    addTaskButton.style.backgroundImage = `url(${url})`
    addTaskButton.style.backgroundPosition = 'center'
    addTaskButton.style.backgroundSize = 'cover'
    // addTaskButton.innerText = '+';
    addTaskButton.style.marginLeft = '10px'; 
    addTaskButton.style.padding = '10px 10px';
    addTaskButton.style.cursor = 'pointer';
    // addTaskButton.style.width = input.style.height 
    // addTaskButton.style.height = input.style.height 
    addTaskButton.style.width = '40px'
    addTaskButton.style.height = '40px'
    // addTaskButton.style.backgroundImage = url



    
    addTaskButton.addEventListener('click', AddTaskCommand);

    div.appendChild(input)
    div.appendChild(addTaskButton)
    return div;
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
    checkbox.style.backgroundImage = `url(${chrome.runtime.getURL('icons/check.png')})`
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

function CreateDeleteButton(item: Task){
    const url = chrome.runtime.getURL('icons/trash.png');
    
    const deleteButton = document.createElement('button');
    deleteButton.style.backgroundImage = `url(${url})`
    deleteButton.style.backgroundPosition = 'center'
    deleteButton.style.backgroundSize = 'cover'
    deleteButton.style.marginLeft = 'auto'; 
    deleteButton.style.padding = '10px 10px';
    deleteButton.style.cursor = 'pointer';

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