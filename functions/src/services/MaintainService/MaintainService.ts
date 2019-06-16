import { IMaintainService } from "./IMaintainService";
import { inject, injectable } from "inversify";
import { ISheetService } from "../SheetService/ISheetService";
import { Maintain, Admin } from "../../models/Maintain";
import { FlexMessage, TextMessage, FileEventMessage } from "@line/bot-sdk";
import { TYPES } from "../../ioc/types";
import { exists } from "fs";

@injectable()
export class MaintainService implements IMaintainService {

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

    private readonly adminColumn = {
        workspace: "維修表單",
        sheetId: "1NXg4N7efrk35ATI94N8j8bTRPFwVc2cZ8zYt9AwzpYs",
        gid: "436125657",
        adminId: "A",
        name: "B",
        groupId: "C"
    }

    public constructor(@inject(TYPES.ISheetService) private sheetService: ISheetService) {
    }

    public async getMaintainById(maintainId: string): Promise<Maintain> {
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
        const value = await this.sheetService.querySheet(queryString, this.maintainColumn.sheetId, this.maintainColumn.gid);
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

    public async getAllMaintain(): Promise<Array<any>> {
        const queryString =
            `select 
            ${this.maintainColumn.maintainNumber},
            ${this.maintainColumn.name},
            ${this.maintainColumn.phone},
            ${this.maintainColumn.time},
            ${this.maintainColumn.locate},
            ${this.maintainColumn.item},
            ${this.maintainColumn.maintainState},
            ${this.maintainColumn.lineId}`;
        const value = await this.sheetService.querySheet(queryString, this.maintainColumn.sheetId, this.maintainColumn.gid);
        // console.log("the line of form : ", value.length)
        let arr = [];
        if (value.length) {
            value.forEach(element => {
                let maintain = {} as Maintain;
                maintain.Name = element[1];
                maintain.Phone = element[2];
                maintain.Time = element[3];
                maintain.Locate = element[4];
                maintain.Item = element[5];
                maintain.MaintainState = this.getMaintainState(element[6]);
                arr.push(maintain)
            });
        }
        return arr;
    }

    public async getAdminById(adminId: string): Promise<Boolean> {
        const queryString =
            `select 
            ${this.adminColumn.adminId},
            ${this.adminColumn.name},
            ${this.adminColumn.groupId}`;
        const value = await this.sheetService.querySheet(queryString, this.adminColumn.sheetId, this.adminColumn.gid);
        let arr = []
        if (value.length) {
            value.forEach(element => {
                let admin = {} as Admin;
                admin.Name = element[1];
                admin.GroupId = element[2];
                arr.push(admin)
            });
        }
        // console.log(value)
        var isAdmin = arr.find(function(item, index, array){
            return item.GroupId == adminId
        })
        return isAdmin;
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

    public requestReport(userId: string): FlexMessage {
        let url = `https://docs.google.com/forms/d/e/1FAIpQLSd_xr_18k4FIPjBYECcwv2fc1dOT_IuZMxAgGJUuseg9KInmw/viewform?usp=pp_url&entry.815484785&entry.534784453&entry.1173029400&entry.142495844&entry.1574186958&entry.780437475=${userId}`;

        return {
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
        };
    };

    public async searchReport(userId: string, result: any): Promise<TextMessage> {
        const maintain = await this.getMaintainById(result.parameters.number);

        if (maintain.Id == null) {
            return {
                type: "text",
                text: `您所查詢的單號不存在`
            };
        } else {
            const maintainState = this.getMaintainState(maintain.MaintainState);

            return {
                type: "text",
                text: `單號：${maintain.Id}\n${maintain.Locate}樓 ${maintain.Item}\n目前的維修狀態為${maintainState}`
            };
        }
    };

    public async downloadForm(userId: string): Promise<FlexMessage> {
        const isAdmin = await this.getAdminById(userId)
        let url = `https://docs.google.com/spreadsheets/d/1NXg4N7efrk35ATI94N8j8bTRPFwVc2cZ8zYt9AwzpYs/edit#gid=0`;
        if (isAdmin) {
            return {
                "type": "flex",
                "altText": "完整表單",
                "contents": {
                    "type": "bubble",
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": "完整表單",
                                "weight": "bold",
                                "size": "xxl",
                                "margin": "md"
                            },
                            {
                                "type": "text",
                                "text": "完整表單連結",
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
                                    "label": "點擊查看",
                                    "uri": url
                                }
                            }
                        ]
                    }
                }
            };
        }
        return {
            "type": "flex",
            "altText": "您非管理者，無權查看此表單",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "無權查看此表單",
                            "size": "md",
                            "color": "#ff2530",
                            "margin": "md",
                            "wrap": true
                        }
                    ]
                }
            }
        }
    }
}
