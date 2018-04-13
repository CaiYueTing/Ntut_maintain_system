"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const bot_sdk_1 = require("@line/bot-sdk");
const Dialogflow = require("apiai");
const chatbaseService = require("./services/chatbaseService");
const maintainService = require("./services/maintainService");
const chatbotConfig_1 = require("./chatbotConfig");
const lineClient = new bot_sdk_1.Client({
    channelSecret: chatbotConfig_1.LINE.channelSecret,
    channelAccessToken: chatbotConfig_1.LINE.channelAccessToken
});
const dialogflowAgent = Dialogflow(chatbotConfig_1.DIALOGFLOW.agentToken);
exports.webhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"];
    if (bot_sdk_1.validateSignature(JSON.stringify(req.body), chatbotConfig_1.LINE.channelSecret, signature)) {
        const events = req.body.events;
        events.forEach(event => eventDispatcher(event));
    }
    res.sendStatus(200);
});
const eventDispatcher = (event) => {
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
                    messageDispatcher(userId, event.message.text);
            }
            break;
        default:
            break;
    }
};
//event follow start 
const replyFollowMessage = (replyToken, userId) => __awaiter(this, void 0, void 0, function* () {
    const lineMessage = {
        type: "text",
        text: "歡迎使用報修系統，在這裡可以獲取每天維修報告"
    };
    yield replyMessage(replyToken, lineMessage);
    return pushCommandMessage(userId);
});
const pushCommandMessage = (userId) => {
    const lineMessage = {
        type: "text",
        text: `《報修系統》指令如下，請多利用：\n1. 我要報修\n2. 查詢報修狀況，請輸入:\n查詢 0001(單號)`
    };
    return pushMessage(userId, lineMessage);
};
//event follow end
//event join start 
const replyJoinMessage = (replyToken, groupId) => {
    const url = `https://docs.google.com/forms/d/e/1FAIpQLScVJ6HRVM9Gnkvyb43mdxOEcB472LklXGPLBwo7RDw4i2t1GQ/viewform?usp=pp_url&entry.1321795441&entry.1527073535=${groupId}`;
    const lineMessage = {
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
    return pushMessage(groupId, lineMessage);
};
//event join end 
const messageDispatcher = (userId, message) => {
    const request = dialogflowAgent.textRequest(message, { sessionId: userId });
    request.on("response", response => {
        actionDispatcher(userId, response.result);
        chatbaseService.sendMessageToChatBase(userId, response.result.resolvedQuery, response.result.metadata.intentName, "Line", "user");
    }).end();
    request.on("error", error => console.log("Error: ", error));
};
const actionDispatcher = (userId, result) => {
    const action = result.action;
    switch (action) {
        case "requestReport":
            requestReport(userId, result);
            break;
        case "searchReport":
            searchReport(userId, result);
            break;
        default:
            pushErrorMessage(userId, result);
            break;
    }
};
const requestReport = (userId, result) => {
    let url = `https://docs.google.com/forms/d/e/1FAIpQLSd_xr_18k4FIPjBYECcwv2fc1dOT_IuZMxAgGJUuseg9KInmw/viewform?usp=pp_url&entry.815484785&entry.534784453&entry.1173029400&entry.142495844&entry.1574186958&entry.780437475=${userId}`;
    const lineMessage = {
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
    return pushMessage(userId, lineMessage);
};
const searchReport = (userId, result) => __awaiter(this, void 0, void 0, function* () {
    const responseText = result.fulfillment.speech;
    const maintain = yield maintainService.getMaintainById(result.parameters.number);
    if (maintain.id == null) {
        const lineMessage = {
            type: "text",
            text: `您所查詢的單號不存在`
        };
        pushMessage(userId, lineMessage);
    }
    else {
        const maintainState = getMaintainState(maintain.maintainState);
        const lineMessage = {
            type: "text",
            text: `單號：${maintain.id}\n${maintain.locate}樓 ${maintain.item}\n目前的維修狀態為${maintainState}`
        };
        pushMessage(userId, lineMessage);
    }
});
const getMaintainState = (maintainState) => {
    if (maintainState == "0") {
        return "尚未完成";
    }
    else if (maintainState == "1") {
        return "已在維修中，請耐心等候";
    }
    else {
        return "已經完成囉，感謝您的報修";
    }
};
//broadcast end 
//publish function 
const pushErrorMessage = (userId, result) => __awaiter(this, void 0, void 0, function* () {
    const lineMessage = {
        type: "text",
        text: result.fulfillment.messages[0].speech.replace("{{message}}", result.resolvedQuery)
    };
    pushMessage(userId, lineMessage);
});
const replyMessage = (replyToken, lineMessage) => {
    return lineClient.replyMessage(replyToken, lineMessage);
};
exports.pushTextMessage = functions.https.onRequest((req, res) => {
    const message = req.body.message;
    const lineId = req.body.lineId;
    const textMessage = {
        type: "text",
        text: message
    };
    pushMessage(lineId, textMessage);
    res.sendStatus(200);
});
const pushMessage = (userId, lineMessage) => {
    if (Array.isArray(lineMessage)) {
        for (const message of lineMessage) {
            if (message.type === "text")
                chatbaseService.sendMessageToChatBase(userId, message.text, "reply", "Line", "agent");
            else
                chatbaseService.sendMessageToChatBase(userId, `This is a ${message.type} template message`, "reply", "Line", "agent");
        }
    }
    else {
        if (lineMessage.type === "text")
            chatbaseService.sendMessageToChatBase(userId, lineMessage.text, "reply", "Line", "agent");
        else
            chatbaseService.sendMessageToChatBase(userId, `This is a ${lineMessage.type} template message`, "reply", "Line", "agent");
    }
    return lineClient.pushMessage(userId, lineMessage);
};
//# sourceMappingURL=index.js.map