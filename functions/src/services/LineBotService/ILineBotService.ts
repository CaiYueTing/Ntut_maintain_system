import {Message, WebhookEvent} from "@line/bot-sdk";

export interface ILineBotService {

    pushMessage(userId: string, lineMessage: Message | Array<Message>): Promise<any>;

    replyMessage(replyToken: string, lineMessage: Message | Array<Message>): Promise<any>

    eventDispatcher(event: WebhookEvent): Promise<any>;
}
