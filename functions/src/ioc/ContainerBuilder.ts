import {Container} from "inversify";
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

export class ContainerBuilder {

    private static container: Container = null;

    public static getContainer(): Container {
        if (ContainerBuilder.container) {
            return ContainerBuilder.container
        }

        ContainerBuilder.container = new Container();
        ContainerBuilder.container.bind<ILineBotService>(TYPES.ILineBotService).to(LineBotService);
        ContainerBuilder.container.bind<ILineClientBuilder>(TYPES.ILineBotClientBuilder).to(LineClientBuilder);
        ContainerBuilder.container.bind<IMaintainService>(TYPES.IMaintainService).to(MaintainService);
        ContainerBuilder.container.bind<ISheetService>(TYPES.ISheetService).to(SheetService);
        ContainerBuilder.container.bind<IOAuth2ClientBuilder>(TYPES.IOAuth2ClientBuilder).to(OAuth2ClientBuilder);

        return ContainerBuilder.container;
    }
}
