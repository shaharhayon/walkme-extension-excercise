const button = document.getElementById('options-button');
button!.addEventListener('click', async () => {
  console.log('Sending message to service worker');
  await chrome.runtime.sendMessage('open-options');
});


const colorPicker = document.getElementById('color-picker') as HTMLInputElement
chrome.storage.local.get('color', color => {
  colorPicker!.value = color.color || '#ff0000';
});

colorPicker!.addEventListener('input', async (_e) => {
  await chrome.storage.local.set({color: colorPicker.value});
  await chrome.runtime.sendMessage('set-color');
});
