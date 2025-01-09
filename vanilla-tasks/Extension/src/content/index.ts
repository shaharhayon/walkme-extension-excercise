import { CreateMainWindow } from "./main-window";
import { CreateStartButton } from "./start-button";
import { AddPoppinsFont } from "./util";

// <link rel="stylesheet" href="my.css">

// const link = document.createElement("link");
// const url = chrome.runtime.getURL('style.css');

// link.href = url;
// link.type = "text/css";
// link.rel = "stylesheet";
// link.media = "screen,print";

// document.head.appendChild(link);

// const style = document.createElement('style');
// style.
// const resetStyle = document.createElement('style');
// resetStyle.innerHTML = `
//   * {
//     margin: 0;
//     padding: 0;
//     box-sizing: border-box;
//     font-size: 16px; /* Ensure consistent font size */
//   }
// `;
// document.head.appendChild(resetStyle);

// const metaTag = document.createElement('meta');
// metaTag.name = 'viewport';
// metaTag.content = 'width=device-width, initial-scale=1.0';
// document.head.appendChild(metaTag);

AddPoppinsFont();

CreateStartButton();
CreateMainWindow();
