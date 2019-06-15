import Client from "@line/bot-sdk/dist/client";
import {Config} from "../../configs/Config";

export class LineClientBuilder {
    public static LineClient: Client = new Client({
        channelSecret: Config.LINE.channelSecret,
        channelAccessToken: Config.LINE.channelAccessToken
    });
}
