export interface ISheetService {
    readSheet(spreadsheetId: string, range: string): Promise<Array<any>>;

    appendSheet(spreadsheetId: string, range: string, values: any): Promise<any>;

    writeSheet(spreadsheetId: string, range: string, values: any): Promise<any>;

    querySheet(queryString: string, sheetId: string, gid: string): Promise<Array<any>>;
}
