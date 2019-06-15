import {Container} from "inversify";
import {DialogflowService} from "../services/DialogflowService/DialogflowService";
import {IDialogflowService} from "../services/DialogflowService/IDialogflowService";
import {ILineBotService} from "../services/LineBotService/ILineBotService";
import {IMaintainService} from "../services/MaintainService/IMaintainService";
import {IOAuth2ClientBuilder} from "../services/SheetService/IOAuth2ClientBuilder";
import {ISheetService} from "../services/SheetService/ISheetService";
import {LineBotService} from "../services/LineBotService/LineBotService";
import {MaintainService} from "../services/MaintainService/MaintainService";
import {OAuth2ClientBuilder} from "../services/SheetService/OAuth2ClientBuilder";
import {SheetService} from "../services/SheetService/SheetService";
import {TYPES} from "./types";

const CONTAINER = new Container();
CONTAINER.bind<ILineBotService>(TYPES.ILineBotService).to(LineBotService);
CONTAINER.bind<IDialogflowService>(TYPES.IDialogflowService).to(DialogflowService);
CONTAINER.bind<IMaintainService>(TYPES.IMaintainService).to(MaintainService);
CONTAINER.bind<ISheetService>(TYPES.ISheetService).to(SheetService);
CONTAINER.bind<IOAuth2ClientBuilder>(TYPES.IOAuth2ClientBuilder).to(OAuth2ClientBuilder);

export {
    CONTAINER
};
