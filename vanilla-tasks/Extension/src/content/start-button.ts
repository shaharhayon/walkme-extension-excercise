import { AddHighlightOnHover, RefreshList } from "./util";

export type StartButtonPosition = {
    top: string,
    left: string
}

export async function CreateStartButton(){
    const button = document.createElement('button');
    const icon_when_closed = chrome.runtime.getURL('icons/clipboard-list.png');
    const startButtonPos: StartButtonPosition = (await chrome.storage.local.get('start-button-pos'))['start-button-pos'];

    button.style.top = startButtonPos.top
    button.style.left = startButtonPos.left
    button.style.height = '5vh'
    button.style.width = '5vh'
    button.style.opacity = '20%'
    button.style.backgroundImage = `url(${icon_when_closed})`
    button.style.backgroundColor = 'transparent'
    button.style.backgroundPosition = 'center'
    button.style.backgroundSize = 'cover'
    SetButtonState(button, 'closed')
    button.style.position = 'fixed'; 
    button.style.padding = '10px 20px';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9999'
    AddHighlightOnHover(button);

    AddDragging(button);

    document.body.appendChild(button);
    return button;
}

function SetButtonState (b: HTMLButtonElement, state: 'open' | 'closed') {
    if (state === 'open') {
        RefreshList();
    }
}

function onClick(e: MouseEvent) {

    const b = (e.target as HTMLButtonElement);
        if (b.dataset.isDragging === 'true'){
            return;
        }
        const div = document.getElementById('item-list-container');
        if (div != null) {
            switch (div.style.display){
                case 'flex':
                    div.style.display = 'none';
                    SetButtonState(b, 'closed')
                    break;
                case 'none':
                    div.style.display = 'flex';
                    SetButtonState(b, 'open')
                    break;
            }
            return;
        }
}

function AddDragging(button: HTMLButtonElement) {
    button.dataset.isDragging = 'false';
    let offsetX = 0;
    let offsetY = 0;

    button.addEventListener('mousedown', (e) => {
        // const mainWindowDiv = document.getElementById('item-list-container');
        // const restrictedRect = mainWindowDiv!.getBoundingClientRect();
        
        offsetX = e.clientX - button.offsetLeft;
        offsetY = e.clientY - button.offsetTop;

        const startX = e.clientX;
        const startY = e.clientY
        const threshold = 5

        button.style.cursor = 'grabbing';

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        async function onMouseMove(e: MouseEvent) {
            const distX = e.clientX - startX;
            const distY = e.clientY - startY;

            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;

            // const isInsideRestrictedArea =
            //     newX + button.offsetWidth > restrictedRect.left &&
            //     newX < restrictedRect.right &&
            //     newY + button.offsetHeight > restrictedRect.top &&
            //     newY < restrictedRect.bottom;

            // if (isInsideRestrictedArea) {
            //     // Prevent moving the button into the restricted area
            //     return;
            // }

            if (Math.abs(distX) > threshold || Math.abs(distY) > threshold) {
                if (button.dataset.isDragging === 'false') {
                    button.dataset.isDragging = 'true';
                    console.log('dragging start')
                }
                button.style.left = `${e.clientX - offsetX}px`;
                button.style.top = `${e.clientY - offsetY}px`;
                const pos: StartButtonPosition = {
                    left: button.style.left,
                    top: button.style.top
                }
                await chrome.storage.local.set({'start-button-pos': pos});
            }
        }

        function onMouseUp(e: MouseEvent) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            button.style.cursor = 'pointer';

            if (button.dataset.isDragging !== 'true') {
                onClick(e)
            } else {
                console.log('dragging end')
                button.dataset.isDragging = 'false'
            }
        }
    });

}