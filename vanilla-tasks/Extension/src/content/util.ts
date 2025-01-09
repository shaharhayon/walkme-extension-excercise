import { SendMessageToBackground } from "../internal-api";

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
