import { SheetService } from "./SheetService"
import { Maintain } from "../models/Maintain";
import { LineBotService } from "./LineBotService";
import { TemplateMessage, TextMessage, FlexMessage } from "@line/bot-sdk";

export class MaintainService {

    private readonly maintainColumn = {
        workspace: "維修表單",
        sheetId: "1NXg4N7efrk35ATI94N8j8bTRPFwVc2cZ8zYt9AwzpYs",
        gid: "0",
        maintainNumber: "A",
        name: "B",
        phone: "C",
        time: "D",
        locate: "E",
        item: "F",
        maintainState: "G",
        lineId: "H"
    };

    public async getMaintainById(maintainId: string): Promise<Maintain> {
        console.log("getMaintain id:", maintainId);
        const googleSheets = new SheetService();
        const auth = await googleSheets.authorize();
        console.log(auth);
        const queryString =
            `select 
            ${this.maintainColumn.maintainNumber},
            ${this.maintainColumn.name},
            ${this.maintainColumn.phone},
            ${this.maintainColumn.time},
            ${this.maintainColumn.locate},
            ${this.maintainColumn.item},
            ${this.maintainColumn.maintainState},
            ${this.maintainColumn.lineId} where ${this.maintainColumn.maintainNumber} = ${maintainId}`;
        console.log(queryString);
        const value = await googleSheets.querySheet(auth, queryString, this.maintainColumn.sheetId, this.maintainColumn.gid);
        console.log(value);
        let maintain = new Maintain();
        if (value.length) {
            maintain.Id = value[0][0];
            maintain.Name = value[0][1];
            maintain.Phone = value[0][2];
            maintain.Time = value[0][3];
            maintain.Locate = value[0][4];
            maintain.Item = value[0][5];
            maintain.MaintainState = value[0][6];
            maintain.LineId = value[0][7];
        }

        return maintain;
    }

    public getMaintainState(maintainState: string): string {
        if (maintainState == "0") {
            return "尚未完成"
        } else if (maintainState == "1") {
            return "已在維修中，請耐心等候"
        } else {
            return "已經完成囉，感謝您的報修"
        }
    };

    public requestReport(userId: string, result: any): Promise<any> {
        let url = `https://docs.google.com/forms/d/e/1FAIpQLSd_xr_18k4FIPjBYECcwv2fc1dOT_IuZMxAgGJUuseg9KInmw/viewform?usp=pp_url&entry.815484785&entry.534784453&entry.1173029400&entry.142495844&entry.1574186958&entry.780437475=${userId}`;
        const lineBotService = new LineBotService();
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
        const flexMessage: FlexMessage = {
            "type": "flex",
            "altText": "請填寫報修表單",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "維修系統報修",
                            "weight": "bold",
                            "size": "xxl",
                            "margin": "md"
                        },
                        {
                            "type": "text",
                            "text": "請填寫報修資料",
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
        }


        return lineBotService.pushMessage(userId, flexMessage)
    };

    public async searchReport(userId: string, result: any) {
        const maintain = await this.getMaintainById(result.parameters.number);
        const lineBotService = new LineBotService();
        if (maintain.Id == null) {
            const lineMessage: TextMessage = {
                type: "text",
                text: `您所查詢的單號不存在`
            };

            lineBotService.pushMessage(userId, lineMessage)
        } else {
            const maintainState = this.getMaintainState(maintain.MaintainState);

            const lineMessage: TextMessage = {
                type: "text",
                text: `單號：${maintain.Id}\n${maintain.Locate}樓 ${maintain.Item}\n目前的維修狀態為${maintainState}`
            };

            lineBotService.pushMessage(userId, lineMessage)
        }
    };
}
