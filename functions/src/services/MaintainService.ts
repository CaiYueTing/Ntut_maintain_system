import * as googleSheets from "../services/sheetService"
import { maintainColumn } from "../models/sheetColumn"
import { Maintain } from "../models/Maintain";

export class MaintainService {

    public async getMaintainById(maintainId: string): Promise<Maintain> {
        const auth = await googleSheets.authorize();
        const queryString =
            `select ${maintainColumn.maintainNumber},${maintainColumn.name},${maintainColumn.phone},${maintainColumn.time},${maintainColumn.locate},${maintainColumn.item},${maintainColumn.maintainState},${maintainColumn.lineId} where ${maintainColumn.maintainNumber} = ${maintainId}`;
        const value = await googleSheets.querySheet(auth, queryString, maintainColumn.sheetId, maintainColumn.gid);

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
}
