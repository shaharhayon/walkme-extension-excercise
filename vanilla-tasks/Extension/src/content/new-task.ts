import { SendMessageToBackground } from "../internal-api";

export function CreateNewTaskTextField(){
    const div = document.createElement('div');
    div.className = 'new-task-container'

    const input = document.createElement('input');
    input.className = 'new-task-text'
    input.type = 'text';

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
    addTaskButton.className = 'add-task-button';
    addTaskButton.style.backgroundImage = `url(${url})`;

    addTaskButton.addEventListener('click', AddTaskCommand);

    div.appendChild(input)
    div.appendChild(addTaskButton)
    return div;
}