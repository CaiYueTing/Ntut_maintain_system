import {Container} from "inversify";
import {DialogflowBuilder} from "../services/LineBotService/DialogflowBuilder";
import {IDialogflowBuilder} from "../services/LineBotService/IDialogflowBuilder";
import {ILineBotService} from "../services/LineBotService/ILineBotService";
import {ILineClientBuilder} from "../services/LineBotService/ILineClientBuilder";
import {IMaintainService} from "../services/MaintainService/IMaintainService";
import {IOAuth2ClientBuilder} from "../services/SheetService/IOAuth2ClientBuilder";
import {ISheetService} from "../services/SheetService/ISheetService";
import {LineBotService} from "../services/LineBotService/LineBotService";
import {LineClientBuilder} from "../services/LineBotService/LineClientBuilder";
import {MaintainService} from "../services/MaintainService/MaintainService";
import {OAuth2ClientBuilder} from "../services/SheetService/OAuth2ClientBuilder";
import {SheetService} from "../services/SheetService/SheetService";
import {TYPES} from "./types";

const CONTAINER = new Container();
CONTAINER.bind<ILineBotService>(TYPES.ILineBotService).to(LineBotService);
CONTAINER.bind<ILineClientBuilder>(TYPES.ILineBotClientBuilder).to(LineClientBuilder);
CONTAINER.bind<IDialogflowBuilder>(TYPES.IDialogflowBuilder).to(DialogflowBuilder);
CONTAINER.bind<IMaintainService>(TYPES.IMaintainService).to(MaintainService);
CONTAINER.bind<ISheetService>(TYPES.ISheetService).to(SheetService);
CONTAINER.bind<IOAuth2ClientBuilder>(TYPES.IOAuth2ClientBuilder).to(OAuth2ClientBuilder);

export {
    CONTAINER
};
