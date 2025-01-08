import { AddHighlightOnHover, RefreshList } from "./util";

export function CreateStartButton(){
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
                b.style.opacity = '50%'
                b.style.backgroundImage = `url(${icon_when_open})`;
                RefreshList();

                break;
            case "closed":
                b.style.height = '5vh'
                b.style.width = '5vh'
                b.style.top = '25px'; 
                b.style.left = '25px'; 
                b.style.opacity = '20%'

                b.style.backgroundImage = `url(${icon_when_closed})`
                break;
        }
    }

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
    button.addEventListener('click', async (e) => {
        const div = document.getElementById('item-list-container');
        if (div != null) {
            switch (div.style.display){
                case 'flex':
                    div.style.display = 'none';
                    SetButtonState(button, 'closed')
                    break;
                case 'none':
                    div.style.display = 'flex';
                    SetButtonState(button, 'open')
                    break;
            }
            return;
        }
    })
    return button;
}