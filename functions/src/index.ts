import * as functions from 'firebase-functions';
import { validateSignature, WebhookEvent, TextMessage } from "@line/bot-sdk"
import { Config } from "./configs/Config"
import { LineBotService } from "./services/LineBotService/LineBotService";
import {ILineBotService} from "./services/LineBotService/ILineBotService";

export const pushTextMessage = functions.https.onRequest((req, res) => {
    const lineBotService: ILineBotService = new LineBotService();
    console.log(req.body)
    const message = req.body.message;
    const lineId = req.body.lineId;
    const textMessage: TextMessage = {
        type: "text",
        text: message
    };

    lineBotService.pushMessage(lineId, textMessage);
    res.sendStatus(200)
});

export const webhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string;
    const lineBotService: ILineBotService = new LineBotService();

    if (validateSignature(JSON.stringify(req.body), Config.LINE.channelSecret, signature)) {
        const events = req.body.events as Array<WebhookEvent>;
        events.forEach(event => lineBotService.eventDispatcher(event))
    }
    res.sendStatus(200)
});


export const helloworld = functions.https.onRequest((req,res)=>{
    console.log("hello world")
    res.sendStatus(200)
})
