import {Maintain} from "../../models/Maintain";

export interface IMaintainService {
    getMaintainById(maintainId: string): Promise<Maintain>;

    getMaintainState(maintainState: string): string;

    requestReport(userId: string, result: any): Promise<any>;

    searchReport(userId: string, result: any): Promise<void>;
}
