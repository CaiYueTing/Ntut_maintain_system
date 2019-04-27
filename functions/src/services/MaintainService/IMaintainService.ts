import {Maintain} from "../../models/Maintain";
import {TemplateMessage, TextMessage} from "@line/bot-sdk";

export interface IMaintainService {
    getMaintainById(maintainId: string): Promise<Maintain>;

    getMaintainState(maintainState: string): string;

    requestReport(userId: string): TemplateMessage;

    searchReport(userId: string, result: any): Promise<TextMessage>;
}
