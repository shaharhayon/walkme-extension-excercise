import { CreateMainWindow } from "./main-window";
import { CreateStartButton } from "./start-button";
import { AddPoppinsFont } from "./util";

const resetStyle = document.createElement('style');
resetStyle.innerHTML = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-size: 16px; /* Ensure consistent font size */
  }
`;
document.head.appendChild(resetStyle);

// const metaTag = document.createElement('meta');
// metaTag.name = 'viewport';
// metaTag.content = 'width=device-width, initial-scale=1.0';
// document.head.appendChild(metaTag);

AddPoppinsFont();

CreateStartButton();
CreateMainWindow();

// alert(document.body.style.zoom)
// alert(document.body.style.transform )