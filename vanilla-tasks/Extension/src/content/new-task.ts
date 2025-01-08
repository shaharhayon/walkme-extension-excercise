import { SendMessageToBackground } from "../internal-api";
import { AddHighlightOnHover } from "./util";

export function CreateNewTaskTextField(){
    const div = document.createElement('div');
    div.style.display = 'flex'
    div.style.alignItems = 'center'
    div.style.marginTop = '20px'
    div.style.maxWidth = '100%'
    div.style.background = 'transparent'
    div.style.boxSizing = 'border-box'

    const input = document.createElement('input');
    input.type = 'text';
    input.style.border = '2px solid #ccc';
    input.style.padding = '10px';
    input.style.borderRadius = '20px'
    input.style.backgroundColor = '#f0f0f0';
    input.style.fontSize = '16px';
    input.style.fontFamily = '"Poppins", sans-serif'; 
    input.style.outline = 'none';
    input.placeholder = 'Add a new task'
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
    const addTaskButton = document.createElement('button');
    addTaskButton.style.backgroundImage = `url(${url})`
    addTaskButton.style.backgroundPosition = 'center'
    addTaskButton.style.backgroundSize = 'cover'
    addTaskButton.style.opacity = '50%'
    addTaskButton.style.marginLeft = '10px'; 
    addTaskButton.style.padding = '10px 10px';
    addTaskButton.style.cursor = 'pointer';
    addTaskButton.style.border = 'none';
    addTaskButton.style.backgroundColor = 'white'
    addTaskButton.style.width = '40px'
    addTaskButton.style.height = '40px'
    AddHighlightOnHover(addTaskButton);
    
    addTaskButton.addEventListener('click', AddTaskCommand);

    div.appendChild(input)
    div.appendChild(addTaskButton)
    return div;
}