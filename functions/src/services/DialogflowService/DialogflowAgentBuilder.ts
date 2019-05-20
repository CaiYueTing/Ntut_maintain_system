import * as Dialogflow from "apiai";
import {Config} from "../../configs/Config";

export class DialogflowAgentBuilder {
    public static DialogflowAgent: Dialogflow.Application = Dialogflow(Config.DIALOGFLOW.agentToken)
}
