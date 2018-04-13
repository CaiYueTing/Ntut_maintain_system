import * as googleSheets from "../services/sheetService"
import { maintainColumn } from "../sheetColumn"
import { Maintain } from "../model";

export const getMaintainById = async (maintainId: string) => {
    const auth = await googleSheets.authorize()
    const queryString = `select ${maintainColumn.maintainNumber},${maintainColumn.name},${maintainColumn.phone},${maintainColumn.time},${maintainColumn.locate},${maintainColumn.item},${maintainColumn.maintainState},${maintainColumn.lineId} where ${maintainColumn.maintainNumber} = ${maintainId}`
    const value = await googleSheets.querySheet(auth, queryString, maintainColumn.sheetId, maintainColumn.gid)
    
    if (value.length){
        const maintain ={
            id: value[0][0],
            name: value[0][1],
            phone: value[0][2],
            time: value[0][3],
            locate: value[0][4],
            item: value[0][5],
            maintainState: value[0][6],
            lineId: value[0][7]
        } as Maintain
        return maintain
    }else {
        const maintain ={
            id: null,
            name: null,
            phone: null,
            time: null,
            locate: null,
            item: null,
            maintainState: null,
            lineId: null
        } as Maintain
        return maintain
    }
}