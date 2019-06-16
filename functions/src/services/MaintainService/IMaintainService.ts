import {Maintain} from "../../models/Maintain";
import {FlexMessage, TextMessage, FileEventMessage} from "@line/bot-sdk";

export interface IMaintainService {
    getMaintainById(maintainId: string): Promise<Maintain>;

    getMaintainState(maintainState: string): string;

    requestReport(userId: string): FlexMessage;

    searchReport(userId: string, result: any): Promise<TextMessage>;

    getAllMaintain();

    downloadForm(userId: string): Promise<FlexMessage>;
}
