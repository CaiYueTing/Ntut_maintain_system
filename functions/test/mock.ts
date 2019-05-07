import * as Types from "@line/bot-sdk/dist/types";
import * as sinon from "sinon";
import {Client, FlexMessage, Message, TextMessage} from "@line/bot-sdk";
import {ISheetService} from "../src/services/SheetService/ISheetService";

function mockModule<T extends { [K: string]: any }>(moduleToMock: T, defaultMockValuesForMock: Partial<{ [K in keyof T]: T[K] }>) {
    return (sandbox: sinon.SinonSandbox, returnOverrides?: Partial<{ [K in keyof T]: T[K] }>): void => {
        const functions = Object.keys(moduleToMock);
        const returns = returnOverrides || {};
        functions.forEach((f) => {
            sandbox.stub(moduleToMock, f).callsFake(returns[f] || defaultMockValuesForMock[f]);
        });
    };
}

class MockSheetService implements ISheetService {
    readSheet(spreadsheetId: string, range: string): Promise<Array<any>> {
        throw new Error("Not implement.");
    }

    appendSheet(spreadsheetId: string, range: string, values: any): Promise<any> {
        throw new Error("Not implement.");
    }

    writeSheet(spreadsheetId: string, range: string, values: any): Promise<any> {
        throw new Error("Not implement.");
    }

    querySheet(queryString: string, sheetId: string, gid: string): Promise<Array<any>> {
        let result = new Array<string[]>();
        if(queryString == "select \n" +
            "            A,\n" +
            "            B,\n" +
            "            C,\n" +
            "            D,\n" +
            "            E,\n" +
            "            F,\n" +
            "            G,\n" +
            "            H where A = 1") {
            result[0] = [
                "TestMaintainId",
                "TestMaintainName",
                "TestMaintainPhone",
                "TestMaintainTime",
                "TestMaintainLocate",
                "TestMaintainItem",
                "TestMaintainMaintainState",
                "TestMaintainLineId"
            ];
        } else {
            result[0] = [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
            ];
        }



        return Promise.resolve(result);
    }
}

class MockLineClient extends Client {
    pushMessage(to: string, messages: Message | Message[]): Promise<any> {
        if (to === "SomeOne" && (messages as TextMessage).text === "PushMessageSuccess") {
            return Promise.resolve("success");
        } else if (to === "SomeOne" && (messages as TextMessage).text === `《報修系統》指令如下，請多利用：\n1. 我要報修\n2. 查詢報修狀況，請輸入:\n查詢 0001(單號)`) {
            return Promise.resolve("success");
        } else if (to === "SomeGroup" && (messages as FlexMessage).altText === "請填寫管理員註冊表單") {
            return Promise.resolve("success");
        } else {
            return Promise.resolve("error");
        }
    }

    replyMessage(replyToken: string, messages: Types.Message | Types.Message[]): Promise<any> {
        if (replyToken === "SomeReplyToken" && (messages as TextMessage).text === "PushMessageSuccess") {
            return Promise.resolve("success");
        } else {
            return Promise.resolve("error");
        }
    }
}

export {
    mockModule,
    MockSheetService,
    MockLineClient
};
