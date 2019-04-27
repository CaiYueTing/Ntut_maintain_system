import {Client, Message, TemplateMessage, TextMessage, WebhookEvent} from "@line/bot-sdk";
import {Config} from "../configs/chatbotConfig";
import {MaintainService} from "./MaintainService";
import * as Dialogflow from "apiai";

export class LineBotService {

    /**
     * Line bot client
     */
    private lineClient: Client;

    /**
     * Maintain Service
     */
    private maintainService: MaintainService;

    /**
     * Constructor
     */
    public constructor() {
        this.lineClient = new Client({
            channelSecret: Config.LINE.channelSecret,
            channelAccessToken: Config.LINE.channelAccessToken
        });

        this.maintainService = new MaintainService();
    }

    /**
     * Push Message
     * @param userId
     * @param lineMessage
     */
    public pushMessage(userId: string, lineMessage: Message | Array<Message>): Promise<any> {
        console.log(userId, lineMessage)
        return this.lineClient.pushMessage(userId, lineMessage)
    }

    /**
     * Push error message
     * @param userId
     * @param result
     */
    private async pushErrorMessage(userId: string, result: any): Promise<any> {
        const lineMessage: TextMessage = {
            type: "text",
            text: (result.fulfillment.messages[0].speech as string).replace("{{message}}", result.resolvedQuery)
        };

        return this.pushMessage(userId, lineMessage)
    };

    /**
     * Push command message
     * @param userId
     */
    private pushCommandMessage(userId: string): Promise<any> {
        const lineMessage: TextMessage = {
            type: "text",
            text: `《報修系統》指令如下，請多利用：\n1. 我要報修\n2. 查詢報修狀況，請輸入:\n查詢 0001(單號)`
        };

        return this.pushMessage(userId, lineMessage)
    };

    /**
     * Reply Message
     * @param replyToken
     * @param lineMessage
     */
    private replyMessage(replyToken: string, lineMessage: Message | Array<Message>): Promise<any> {
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

        return this.pushCommandMessage(userId)
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
     * Line event dispatcher
     * @param event
     */
    public eventDispatcher(event: WebhookEvent) {
        const userId = event.source.userId;
        switch (event.type) {
            case "follow":
                this.replyFollowMessage(event.replyToken, userId);
                break;

            case "join":
                if (event.source.type == "group")
                    this.replyJoinMessage(event.replyToken, event.source.groupId);
                break;

            case "message":
                if (event.message.type === "text") {
                    const message = event.message.text;
                    this.messageDispatcher(userId, event.message.text)
                }
                break;

            default:
                break
        }
    };

    /**
     * Message dispatcher
     * @param userId
     * @param message
     */
    private messageDispatcher(userId: string, message: string) {
        const dialogflowAgent = Dialogflow(Config.DIALOGFLOW.agentToken);
        const request = dialogflowAgent.textRequest(message, { sessionId: userId });

        request.on("response", response => {
            this.actionDispatcher(userId, response.result);
        }).end();
        request.on("error", error => console.log("Error: ", error))
    };

    /**
     * Action dispatcher
     * @param userId
     * @param result
     */
    private actionDispatcher(userId: string, result: any) {
        const action = result.action;

        switch(action){
            case "requestReport":
                this.maintainService.requestReport(userId, result);
                break;

            case "searchReport":
                this.maintainService.searchReport(userId, result);
                break;

            default:
                this.pushErrorMessage(userId, result);
                break
        }
    };
}
