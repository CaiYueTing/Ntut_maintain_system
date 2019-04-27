import 'reflect-metadata'; // import reflect-metadata in program entry.
import * as functions from 'firebase-functions';
import {Config} from "./configs/Config"
import {ContainerBuilder} from "./ioc/ContainerBuilder";
import {ILineBotService} from "./services/LineBotService/ILineBotService";
import {TYPES} from "./ioc/types";
import {validateSignature, WebhookEvent, TextMessage} from "@line/bot-sdk"

export const pushTextMessage = functions.https.onRequest((req, res) => {
    const lineBotService: ILineBotService = ContainerBuilder.getContainer().get<ILineBotService>(TYPES.ILineBotService);
    console.log(req.body);
    const message = req.body.message;
    const lineId = req.body.lineId;
    const textMessage: TextMessage = {
        type: "text",
        text: message
    };

    lineBotService.pushMessage(lineId, textMessage).then((_ => {
        res.sendStatus(200)
    })).catch(err => {
        console.log(err);
        res.sendStatus(400)
    });
});

export const webhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string;
    const lineBotService: ILineBotService = ContainerBuilder.getContainer().get<ILineBotService>(TYPES.ILineBotService);

    if (validateSignature(JSON.stringify(req.body), Config.LINE.channelSecret, signature)) {
        const events = req.body.events as Array<WebhookEvent>;
        events.forEach(event => lineBotService.eventDispatcher(event).catch(err => console.log(err)))
    }
    res.sendStatus(200)
});


export const helloworld = functions.https.onRequest((req,res)=>{
    console.log("hello world");
    res.sendStatus(200)
});
