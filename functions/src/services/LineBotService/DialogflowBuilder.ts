import * as Dialogflow from "apiai";
import {Application} from "apiai";
import {Config} from "../../configs/Config";
import {IDialogflowBuilder} from "./IDialogflowBuilder";
import {injectable} from "inversify";

@injectable()
export class DialogflowBuilder implements IDialogflowBuilder {
    getDialogflow(): Application {
        return Dialogflow(Config.DIALOGFLOW.agentToken);
    }
}
