import { SendMessageToBackground } from "../internal-api";

export function AddHighlightOnHover(e: HTMLElement){
    const original = e.style.opacity;
    e.addEventListener('mouseover', (ev) => {
        const target: HTMLElement = ev.target as HTMLElement
        target.style.opacity = '100%'
    });
    e.addEventListener('mouseout', (ev) => {
        const target: HTMLElement = ev.target as HTMLElement
        target.style.opacity = original;
    })
}

export function RefreshList(){
    SendMessageToBackground({
        action: 'GET_ALL_TASKS',
        data: undefined
    })
}

export function AddPoppinsFont(){
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap';
    document.head.appendChild(link);
}