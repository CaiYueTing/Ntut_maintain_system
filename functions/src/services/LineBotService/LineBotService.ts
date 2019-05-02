import * as Dialogflow from "apiai";
import {Client, Message, TemplateMessage, TextMessage, WebhookEvent} from "@line/bot-sdk";
import {Config} from "../../configs/Config";
import {ILineBotService} from "./ILineBotService";
import {ILineClientBuilder} from "./ILineClientBuilder";
import {IMaintainService} from "../MaintainService/IMaintainService";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";

@injectable()
export class LineBotService implements ILineBotService {

    /**
     * Constructor
     */
    public constructor(
        @inject(TYPES.ILineBotClientBuilder) private lineClientBuilder: ILineClientBuilder,
        @inject(TYPES.IMaintainService) private maintainService: IMaintainService,
        private lineClient: Client
    ) {
    }

    /**
     * Line event dispatcher
     * @param event
     */
    public eventDispatcher(event: WebhookEvent): Promise<any> {
        const userId = event.source.userId;
        switch (event.type) {
            case "follow":
                return this.replyFollowMessage(event.replyToken, userId);

            case "join":
                if (event.source.type === "group") {
                    return this.replyJoinMessage(event.replyToken, event.source.groupId);
                }

                return Promise.resolve(null);

            case "message":
                if (event.message.type === "text") {
                    this.messageDispatcher(userId, event.message.text)
                }

                return Promise.resolve(null);

            default:
                return Promise.resolve(null);
        }
    };

    /**
     * Push Message
     * @param userId
     * @param lineMessage
     */
    public pushMessage(userId: string, lineMessage: Message | Array<Message>): Promise<any> {
        return this.lineClient.pushMessage(userId, lineMessage)
    }

    /**
     * Reply Message
     * @param replyToken
     * @param lineMessage
     */
    public replyMessage(replyToken: string, lineMessage: Message | Array<Message>): Promise<any> {
        return this.lineClient.replyMessage(replyToken, lineMessage)
    };

    /**
     * Reply follow message
     * @param replyToken
     * @param userId
     */
    private async replyFollowMessage (replyToken: string, userId: string): Promise<any> {
        const lineMessage: TextMessage = {
            type: "text",
            text: "歡迎使用報修系統，在這裡可以獲取每天維修報告"
        };
        await this.replyMessage(replyToken, lineMessage);

        const commandMessage: TextMessage = {
            type: "text",
            text: `《報修系統》指令如下，請多利用：\n1. 我要報修\n2. 查詢報修狀況，請輸入:\n查詢 0001(單號)`
        };

        return this.pushMessage(userId, commandMessage)
    };

    /**
     * Reply join message
     * @param replyToken
     * @param groupId
     */
    private replyJoinMessage(replyToken: string, groupId: string): Promise<any> {
        const url = `https://docs.google.com/forms/d/e/1FAIpQLScVJ6HRVM9Gnkvyb43mdxOEcB472LklXGPLBwo7RDw4i2t1GQ/viewform?usp=pp_url&entry.1321795441&entry.1527073535=${groupId}`;
        const lineMessage: TemplateMessage = {
            type: "template",
            altText: "This is a buttons template",
            template: {
                type: "buttons",
                title: "管理者人員管理",
                text: "請填寫報修資料",
                actions: [
                    {
                        type: "uri",
                        label: "點擊填表",
                        uri: url
                    }
                ]
            }
        };

        return this.pushMessage(groupId, lineMessage)
    };

    /**
     * Message dispatcher
     * @param userId
     * @param message
     */
    private messageDispatcher(userId: string, message: string) {
        const dialogFlowAgent = Dialogflow(Config.DIALOGFLOW.agentToken);
        const request = dialogFlowAgent.textRequest(message, { sessionId: userId });

        request.on("response", response => {
            this.actionDispatcher(userId, response.result).catch(err => console.log(err));
        }).end();
        request.on("error", error => console.log("Error: ", error))
    };

    /**
     * Action dispatcher
     * @param userId
     * @param result
     */
    private async actionDispatcher(userId: string, result: any): Promise<any> {
        const action = result.action;

        switch(action){
            case "requestReport":
                const requestReportMessage = this.maintainService.requestReport(userId);
                return this.pushMessage(userId, requestReportMessage);

            case "searchReport":
                const searchReportMessage = await this.maintainService.searchReport(userId, result);
                return this.pushMessage(userId, searchReportMessage);

            default:
                const errorMessage: TextMessage = {
                    type: "text",
                    text: (result.fulfillment.messages[0].speech as string).replace("{{message}}", result.resolvedQuery)
                };

                return this.pushMessage(userId, errorMessage);
        }
    };
}
