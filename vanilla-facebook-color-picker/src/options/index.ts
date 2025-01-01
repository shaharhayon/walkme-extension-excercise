// const button = document.getElementById('options-button');
// button!.addEventListener('click', async () => {
//   console.log('Sending message to service worker');
//   await chrome.runtime.sendMessage('open-options');
// });


const optionsColorPicker = document.getElementById('color-picker') as HTMLInputElement
chrome.storage.local.get('color', color => {
  optionsColorPicker!.value = color.color || '#ff0000';
});

optionsColorPicker!.addEventListener('input', async (_e) => {
  await chrome.storage.local.set({color: optionsColorPicker.value});
  await chrome.runtime.sendMessage('set-color');
});
