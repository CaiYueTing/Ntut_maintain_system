"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleSheets = require("../services/sheetService");
const sheetColumn_1 = require("../sheetColumn");
exports.getMaintainById = (maintainId) => __awaiter(this, void 0, void 0, function* () {
    const auth = yield googleSheets.authorize();
    const queryString = `select ${sheetColumn_1.maintainColumn.maintainNumber},${sheetColumn_1.maintainColumn.name},${sheetColumn_1.maintainColumn.phone},${sheetColumn_1.maintainColumn.time},${sheetColumn_1.maintainColumn.locate},${sheetColumn_1.maintainColumn.item},${sheetColumn_1.maintainColumn.maintainState},${sheetColumn_1.maintainColumn.lineId} where ${sheetColumn_1.maintainColumn.maintainNumber} = ${maintainId}`;
    const value = yield googleSheets.querySheet(auth, queryString, sheetColumn_1.maintainColumn.sheetId, sheetColumn_1.maintainColumn.gid);
    if (value.length) {
        const maintain = {
            id: value[0][0],
            name: value[0][1],
            phone: value[0][2],
            time: value[0][3],
            locate: value[0][4],
            item: value[0][5],
            maintainState: value[0][6],
            lineId: value[0][7]
        };
        return maintain;
    }
    else {
        const maintain = {
            id: null,
            name: null,
            phone: null,
            time: null,
            locate: null,
            item: null,
            maintainState: null,
            lineId: null
        };
        return maintain;
    }
});
//# sourceMappingURL=maintainService.js.map