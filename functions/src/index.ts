import * as functions from 'firebase-functions';
import { Client, validateSignature, WebhookEvent, Message, TextMessage, TemplateMessage } from "@line/bot-sdk"
import * as Dialogflow from "apiai"
import * as chatbaseService from "./services/chatbaseService"
import { MaintainService } from "./services/MaintainService";
import { Config } from "./configs/chatbotConfig"

const lineClient = new Client({
    channelSecret: Config.LINE.channelSecret,
    channelAccessToken: Config.LINE.channelAccessToken
});

const dialogflowAgent = Dialogflow(Config.DIALOGFLOW.agentToken);

export const webhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string;
    if (validateSignature(JSON.stringify(req.body), Config.LINE.channelSecret, signature)) {
        const events = req.body.events as Array<WebhookEvent>;
        events.forEach(event => eventDispatcher(event))
    }
    res.sendStatus(200)
});

const eventDispatcher = (event: WebhookEvent): void => {
    const userId = event.source.userId;
    switch (event.type) {
        case "follow":
            replyFollowMessage(event.replyToken, userId);
            break;
        case "join":
            if (event.source.type == "group")
                replyJoinMessage(event.replyToken, event.source.groupId);
            break;
        case "message":
            if (event.message.type === "text") {
                const message = event.message.text;
                if (event.source.type == "group")
                    chatbaseService.sendMessageToChatBase(userId, message, "discuss", "Line", "user", "Group");
                else
                    messageDispatcher(userId, event.message.text)
            }
            break;
        default:
            break
    }
};

//event follow start
const replyFollowMessage = async (replyToken: string, userId: string): Promise<any> => {
    const lineMessage: TextMessage = {
        type: "text",
        text: "歡迎使用報修系統，在這裡可以獲取每天維修報告"
    };
    await replyMessage(replyToken, lineMessage);
    return pushCommandMessage(userId)
};

const pushCommandMessage = (userId: string): Promise<any> => {
    const lineMessage: TextMessage = {
        type: "text",
        text: `《報修系統》指令如下，請多利用：\n1. 我要報修\n2. 查詢報修狀況，請輸入:\n查詢 0001(單號)`
    };
    return pushMessage(userId, lineMessage)
};
//event follow end

//event join start
const replyJoinMessage = (replyToken: string, groupId: string): Promise<any> => {
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
    return pushMessage(groupId, lineMessage)


};

//event join end


const messageDispatcher = (userId: string, message: string): void => {
    const request = dialogflowAgent.textRequest(message, { sessionId: userId });
    request.on("response", response => {
        actionDispatcher(userId, response.result);
        chatbaseService.sendMessageToChatBase(userId, response.result.resolvedQuery, response.result.metadata.intentName, "Line", "user")
    }).end();
    request.on("error", error => console.log("Error: ", error))
};

const actionDispatcher = (userId: string, result: any): void => {

    const action = result.action;
    switch(action){
        case "requestReport":

            requestReport(userId, result);
            break;
        case "searchReport":

            searchReport(userId, result);
            break;
        default:
            pushErrorMessage(userId, result);
            break
    }
};

const requestReport = (userId: string, result: any): Promise<any> => {
    let url = `https://docs.google.com/forms/d/e/1FAIpQLSd_xr_18k4FIPjBYECcwv2fc1dOT_IuZMxAgGJUuseg9KInmw/viewform?usp=pp_url&entry.815484785&entry.534784453&entry.1173029400&entry.142495844&entry.1574186958&entry.780437475=${userId}`;

    const lineMessage: TemplateMessage = {
        type: "template",
        altText: "This is a buttons template",
        template: {
            type: "buttons",
            title: "維修系統報修",
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
    return pushMessage(userId, lineMessage)
};

const searchReport = async (userId: string, result: any) => {

    const maintainService = new MaintainService();
    const maintain = await maintainService.getMaintainById(result.parameters.number);

    if (maintain.Id == null){
        const lineMessage: TextMessage = {
            type: "text",
            text: `您所查詢的單號不存在`
        };
        pushMessage(userId, lineMessage)
    }else {
        const maintainState = getMaintainState(maintain.MaintainState);

        const lineMessage: TextMessage = {
            type: "text",
            text: `單號：${maintain.Id}\n${maintain.Locate}樓 ${maintain.Item}\n目前的維修狀態為${maintainState}`
        };
        pushMessage(userId, lineMessage)
    }
};

const getMaintainState = (maintainState: string): "尚未完成" | "已在維修中，請耐心等候" | "已經完成囉，感謝您的報修" =>{
    if (maintainState == "0"){
        return "尚未完成"
    }else if (maintainState =="1"){
        return "已在維修中，請耐心等候"
    }else{
        return "已經完成囉，感謝您的報修"
    }
};


//broadcast end

//publish function
const pushErrorMessage = async (userId: string, result: any): Promise<any> => {
    const lineMessage: TextMessage = {
        type: "text",
        text: (result.fulfillment.messages[0].speech as string).replace("{{message}}", result.resolvedQuery)
    };
    pushMessage(userId, lineMessage)
};

const replyMessage = (replyToken: string, lineMessage: Message | Array<Message>): Promise<any> => {
    return lineClient.replyMessage(replyToken, lineMessage)
};

export const pushTextMessage = functions.https.onRequest((req, res) => {
    const message = req.body.message;
    const lineId = req.body.LineId;
    const textMessage: TextMessage = {
        type: "text",
        text: message
    };
    pushMessage(lineId, textMessage);
    res.sendStatus(200)
});

const pushMessage = (userId: string, lineMessage: Message | Array<Message>): Promise<any> => {
    if (Array.isArray(lineMessage)) {
        for (const message of lineMessage) {
            if (message.type === "text")
                chatbaseService.sendMessageToChatBase(userId, message.text, "reply", "Line", "agent");
            else
                chatbaseService.sendMessageToChatBase(userId, `This is a ${message.type} template message`, "reply", "Line", "agent")
        }
    } else {
        if (lineMessage.type === "text")
            chatbaseService.sendMessageToChatBase(userId, lineMessage.text, "reply", "Line", "agent");
        else
            chatbaseService.sendMessageToChatBase(userId, `This is a ${lineMessage.type} template message`, "reply", "Line", "agent")
    }
    return lineClient.pushMessage(userId, lineMessage)
};

