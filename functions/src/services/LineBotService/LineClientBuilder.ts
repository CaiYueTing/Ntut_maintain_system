import {Client} from "@line/bot-sdk";
import {Config} from "../../configs/Config";
import {ILineClientBuilder} from "./ILineClientBuilder";

export class LineClientBuilder implements ILineClientBuilder {

    public getLineClient(): Client {

        return new Client({
            channelSecret: Config.LINE.channelSecret,
            channelAccessToken: Config.LINE.channelAccessToken
        });
    }
}
