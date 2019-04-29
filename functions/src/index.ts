import 'reflect-metadata'; // import reflect-metadata in program entry.
import * as functions from 'firebase-functions';
import {Config} from "./configs/Config"
import {CONTAINER} from "./ioc/container";
import {ILineBotService} from "./services/LineBotService/ILineBotService";
import {TYPES} from "./ioc/types";
import {validateSignature, WebhookEvent, TextMessage} from "@line/bot-sdk"

export const pushTextMessage = functions.https.onRequest((req, res) => {
    const lineBotService: ILineBotService = CONTAINER.get<ILineBotService>(TYPES.ILineBotService);
    console.log(req.body);
    const message = req.body.message;
    const lineId = req.body.lineId;
    const textMessage: TextMessage = {
        type: "text",
        text: message
    };

    lineBotService.pushMessage(lineId, textMessage).then((() => {
        return res.sendStatus(200)
    })).catch(err => {
        console.log(err);
        return res.sendStatus(400)
    });
});

export const webhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string;
    const lineBotService: ILineBotService = CONTAINER.get<ILineBotService>(TYPES.ILineBotService);

    if (validateSignature(JSON.stringify(req.body), Config.LINE.channelSecret, signature)) {
        const events = req.body.events as Array<WebhookEvent>;
        events.forEach(event => lineBotService.eventDispatcher(event).catch(err => console.log(err)));

        return res.sendStatus(200)
    } else {

        return res.sendStatus(401);
    }

});


export const helloworld = functions.https.onRequest((req,res)=>{
    console.log("hello world");

    return res.sendStatus(200)
});
