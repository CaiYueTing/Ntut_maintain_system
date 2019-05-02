import {Client} from "@line/bot-sdk";
import {Config} from "../../configs/Config";
import {ILineClientBuilder} from "./ILineClientBuilder";
import {injectable} from "inversify";

@injectable()
export class LineClientBuilder implements ILineClientBuilder {

    public getLineClient(): Client {

        return new Client({
            channelSecret: Config.LINE.channelSecret,
            channelAccessToken: Config.LINE.channelAccessToken
        });
    }
}
