import { CreateMainWindow } from "./main-window";
import { CreateStartButton } from "./start-button";
import { AddPoppinsFont } from "./util";

AddPoppinsFont();

const startButton = CreateStartButton();
const mainWindow = CreateMainWindow();
document.body.appendChild(startButton);
