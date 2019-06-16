import { IDialogflowService } from "../DialogflowService/IDialogflowService";
import { ILineBotService } from "./ILineBotService";
import { IMaintainService } from "../MaintainService/IMaintainService";
import { Message, TextMessage, FlexMessage, WebhookEvent } from "@line/bot-sdk";
import { TYPES } from "../../ioc/types";
import { inject, injectable } from "inversify";
import { LineClientBuilder } from "./LineClientBuilder";

@injectable()
export class LineBotService implements ILineBotService {

    /**
     * Constructor
     */
    public constructor(
        @inject(TYPES.IDialogflowService) private dialogflowService: IDialogflowService,
        @inject(TYPES.IMaintainService) private maintainService: IMaintainService,
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
                    console.log("message content:", event.message.text)
                    this.dialogflowService.dispatchMessage(userId, event.message.text, this.pushMessage);

                    return Promise.resolve("message passed.");
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
        return LineClientBuilder.LineClient.pushMessage(userId, lineMessage);
    }

    /**
     * Reply Message
     * @param replyToken
     * @param lineMessage
     */
    public replyMessage(replyToken: string, lineMessage: Message | Array<Message>): Promise<any> {
        return LineClientBuilder.LineClient.replyMessage(replyToken, lineMessage);
    };

    /**
     * Reply follow message
     * @param replyToken
     * @param userId
     */
    private async replyFollowMessage(replyToken: string, userId: string): Promise<any> {
        const lineMessage: TextMessage = {
            type: "text",
            text: "歡迎使用報修系統，在這裡可以獲取每天維修報告"
        };
        await this.replyMessage(replyToken, lineMessage);

        const commandMessage: TextMessage = {
            type: "text",
            text: `《報修系統》指令如下，請多利用：\n1. 我要報修\n2. 查詢報修狀況，請輸入:\n查詢 0001(單號)`
        };

        return this.pushMessage(userId, commandMessage);
    };

    /**
     * Reply join message
     * @param replyToken
     * @param groupId
     */
    private replyJoinMessage(replyToken: string, groupId: string): Promise<any> {
        const url = `https://docs.google.com/forms/d/e/1FAIpQLScVJ6HRVM9Gnkvyb43mdxOEcB472LklXGPLBwo7RDw4i2t1GQ/viewform?usp=pp_url&entry.1321795441&entry.1527073535=${groupId}`;

        const flexMessage: FlexMessage = {
            "type": "flex",
            "altText": "請填寫管理員註冊表單",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "管理者人員管理",
                            "weight": "bold",
                            "size": "xxl",
                            "margin": "md"
                        },
                        {
                            "type": "text",
                            "text": "請填寫管理員資料",
                            "size": "md",
                            "color": "#aaaaaa",
                            "margin": "md",
                            "wrap": true
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "button",
                            "style": "primary",
                            "action": {
                                "type": "uri",
                                "label": "點擊填表",
                                "uri": url
                            }
                        }
                    ]
                }
            }
        };

        return this.pushMessage(groupId, flexMessage);
    };
}
