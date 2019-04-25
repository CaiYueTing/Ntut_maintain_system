import * as functions from 'firebase-functions';
import { validateSignature, WebhookEvent, TextMessage } from "@line/bot-sdk"
import { Config } from "./configs/chatbotConfig"
import { LineBotService } from "./services/LineBotService";

export const pushTextMessage = functions.https.onRequest((req, res) => {
    const lineBotService = new LineBotService();
    const message = req.body.message;
    const lineId = req.body.LineId;
    const textMessage: TextMessage = {
        type: "text",
        text: message
    };

    lineBotService.pushMessage(lineId, textMessage);
    res.sendStatus(200)
});

export const webhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string;
    const lineBotService = new LineBotService();

    if (validateSignature(JSON.stringify(req.body), Config.LINE.channelSecret, signature)) {
        const events = req.body.events as Array<WebhookEvent>;
        events.forEach(event => lineBotService.eventDispatcher(event))
    }
    res.sendStatus(200)
});
