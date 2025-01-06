
const button = document.createElement('button');
// button.style.position = "fixed";
// button.style.top = "10px";
// button.style.left = "10px";
// button.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
// button.style.color = "white";
// button.style.fontSize = "14px";
// button.style.fontWeight = "bold";
// button.style.padding = "5px 10px";
// button.style.borderRadius = "5px";
// button.style.zIndex = "9999";
// button.style.pointerEvents = "none";
// button.textContent = "--:--";
button.textContent = 'Click Me!';
button.style.position = 'fixed';  // Fix position on the page
button.style.bottom = '20px';     // Place the button 20px from the bottom
button.style.right = '20px';      // Place the button 20px from the right
button.style.padding = '10px 20px';
button.style.fontSize = '16px';
button.style.backgroundColor = '#007bff';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';

document.body.appendChild(button);

button.addEventListener('click', async (e) => {
    // alert('clicked')
    // const msg: Message = {
    //     action: 'ADD_TASK',
    //     data: {
    //         text: 'ext'
    //     }
    // }
    // const msg2: Message = {
    //     action: 'GET_ALL_TASKS',
    //     data: undefined
    // }
    // const a = await chrome.runtime.sendMessage(msg);
    // const b = await chrome.runtime.sendMessage(msg2);
    // alert(JSON.stringify(b))

    document.createElement('div');

    const overlay = document.createElement('div');
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
        // heading.style.paddingBottom = '20px'
        overlay.appendChild(heading);

    let ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.padding = '20px';
    
    // const msg2: Message = {
    //     action: 'GET_ALL_TASKS',
    //     data: undefined
    // }
    // const items = await chrome.runtime.sendMessage(msg2);
    const items = [{"id":1,"text":"aa","status":false},{"id":2,"text":"test1","status":false},{"id":3,"text":"aaaaaa","status":false},{"id":4,"text":"aaaaaa","status":false},{"id":5,"text":"aaaaaa","status":false},{"id":6,"text":"aaaaaa","status":false},{"id":7,"text":"aaaaaa","status":false},{"id":8,"text":"aaaaaa","status":false},{"id":9,"text":"aaaaaa","status":false},{"id":10,"text":"aaaaaa","status":false},{"id":11,"text":"aaaaaa","status":false},{"id":12,"text":"aaaaaa","status":false},{"id":13,"text":"aaaaaa","status":false},{"id":14,"text":"aaaaaa","status":false},{"id":15,"text":"aaaaaa","status":false},{"id":16,"text":"localtext","status":false},{"id":17,"text":"localtext","status":false},{"id":18,"text":"aaaaaa","status":false},{"id":19,"text":"aaaaaa","status":false},{"id":20,"text":"bbbbbb","status":false},{"id":21,"text":"aaaaaa","status":false},{"id":22,"text":"aaaaaa","status":false},{"id":23,"text":"ac","status":false},{"id":24,"text":"ext","status":false},{"id":25,"text":"ext","status":false},{"id":26,"text":"ext","status":false},{"id":27,"text":"ext","status":false},{"id":28,"text":"ext","status":false}]
    const MAX_ITEMS = 10;
    let nitems = 0
    // for (const item of items) {
    // for (let i = items.length-1; i > MAX_ITEMS; i--){
    for (let i = 0; i < MAX_ITEMS; i++){
        const item = items[i];
        // if (nitems > MAX_ITEMS) break;
        const li = document.createElement('li')
        li.innerText = item.text;
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

        let checkbox = document.createElement('input');
        checkbox.id = `checkbox-${item.id}`
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '10px';
        checkbox.checked = item.status;
        checkbox.addEventListener('change', async (ev: any) => {
            if (!ev.target.checked){
                ev.target.checked = true;
                return;
            }
            // const id = document.getElementById(ev.target!['id'])
            const message: Message = {
                tabId: (await chrome.tabs.getCurrent())?.id!,
                action: 'MARK_DONE',
                data: {
                    id: ev.target.id
                }
            }
            SendMessageToBackground(message);
        });
        li.appendChild(checkbox);
        ul.appendChild(li);
    }
    overlay.appendChild(ul);
    document.body.appendChild(overlay);
})

