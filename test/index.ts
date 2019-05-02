import 'mocha';
import "reflect-metadata";
import {MaintainService} from "../functions/src/services/MaintainService/MaintainService";
import * as should from 'should'
import { MockSheetService } from './mock';
import { Maintain } from '../functions/src/models/Maintain';

describe('測試MaintainService', function () {
    it('測試querySheet成功取得Maintain資料', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const result:Maintain = await maintainService.getMaintainById("1");
        should(result.Id).be.equal("TestMaintainId");
    })
});