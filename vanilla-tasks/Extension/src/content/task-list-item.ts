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
    const input = document.createElement('input');
    input.id = 'task-text-input'
    input.className = 'task-text-input';
    input.type = 'text';
    input.value = item.text;

    // autoScrollText(input);

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

// function autoScrollText(element: HTMLElement) {
//     const textWidth = element.scrollWidth; // Width of the text inside the container
//     const containerWidth = element.clientWidth; // Width of the container

//     if (textWidth > containerWidth) {
//         let scrollPosition = containerWidth;
//         element.style.whiteSpace = 'nowrap'; // Prevent line breaks

//         function scrollText() {
//             if (scrollPosition <= -textWidth) {
//                 scrollPosition = containerWidth; // Reset scroll position once it has fully scrolled off
//             }
//             scrollPosition -= 1; // Decrease to scroll left
//             element.style.transform = `translateX(${scrollPosition}px)`; // Move the text
//             requestAnimationFrame(scrollText); // Keep animating
//         }
//         scrollText(); // Start scrolling
//     }
// }
