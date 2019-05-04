import {ISheetService} from "../src/services/SheetService/ISheetService";

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

        return Promise.resolve(result);
    }
}

export {
    MockSheetService
};
