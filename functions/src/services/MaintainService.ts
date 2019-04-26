import { SheetService } from "./SheetService"
import { maintainColumn } from "../models/sheetColumn"
import { Maintain } from "../models/Maintain";
import {LineBotService} from "./LineBotService";
import {TemplateMessage, TextMessage} from "@line/bot-sdk";

export class MaintainService {

    public async getMaintainById(maintainId: string): Promise<Maintain> {
        console.log("getMaintain id:", maintainId)
        const googleSheets = new SheetService();
        const auth = await googleSheets.authorize();
        console.log(auth)
        const queryString =
            `select ${maintainColumn.maintainNumber},${maintainColumn.name},${maintainColumn.phone},${maintainColumn.time},${maintainColumn.locate},${maintainColumn.item},${maintainColumn.maintainState},${maintainColumn.lineId} where ${maintainColumn.maintainNumber} = ${maintainId}`;
        console.log(queryString)
        const value = await googleSheets.querySheet(auth, queryString, maintainColumn.sheetId, maintainColumn.gid);
        console.log(value)
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
        if (maintainState == "0"){
            return "尚未完成"
        }else if (maintainState =="1"){
            return "已在維修中，請耐心等候"
        }else{
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

        return lineBotService.pushMessage(userId, lineMessage)
    };

    public async searchReport (userId: string, result: any) {
        const maintain = await this.getMaintainById(result.parameters.number);
        const lineBotService = new LineBotService();
        if (maintain.Id == null){
            const lineMessage: TextMessage = {
                type: "text",
                text: `您所查詢的單號不存在`
            };

            lineBotService.pushMessage(userId, lineMessage)
        }else {
            const maintainState = this.getMaintainState(maintain.MaintainState);

            const lineMessage: TextMessage = {
                type: "text",
                text: `單號：${maintain.Id}\n${maintain.Locate}樓 ${maintain.Item}\n目前的維修狀態為${maintainState}`
            };

            lineBotService.pushMessage(userId, lineMessage)
        }
    };
}
