import "reflect-metadata";
import 'mocha';
import * as should from 'should'
import {Maintain} from '../src/models/Maintain';
import {MockSheetService} from './mock';
import {MaintainService} from "../src/services/MaintainService/MaintainService";

describe('測試MaintainService', function () {
    it('測試querySheet成功取得Maintain資料', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const result: Maintain = await maintainService.getMaintainById("1");
        should(result.Id).be.equal("TestMaintainId");
    })
});

describe('測試MaintainService', function () {
    it('測試getMaintainState尚未完成', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const state = maintainService.getMaintainState("0");
        should(state).be.equal("尚未完成");
    })
});

describe('測試MaintainService', function () {
    it('測試getMaintainState已在維修中', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const state = maintainService.getMaintainState("1");
        should(state).be.equal("已在維修中，請耐心等候");
    })
});

describe('測試MaintainService', function () {
    it('測試getMaintainState已經完成', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const state = maintainService.getMaintainState("2");
        should(state).be.equal("已經完成囉，感謝您的報修");
    })
});

describe('測試MaintainService', function () {
    it('測試requestReport取得message', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const message = maintainService.requestReport("unittest123");

        should(message.altText).be.equal("請填寫報修表單");
    })
});
