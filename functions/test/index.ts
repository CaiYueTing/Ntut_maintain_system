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
    });

    it('測試getMaintainState尚未完成', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const state = maintainService.getMaintainState("0");
        should(state).be.equal("尚未完成");
    });

    it('測試getMaintainState已在維修中', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const state = maintainService.getMaintainState("1");
        should(state).be.equal("已在維修中，請耐心等候");
    });

    it('測試getMaintainState已經完成', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const state = maintainService.getMaintainState("2");
        should(state).be.equal("已經完成囉，感謝您的報修");
    });

    it('測試requestReport取得message', async function () {
        const maintainService = new MaintainService(new MockSheetService());
        const message = maintainService.requestReport("unittest123");

        should(message.altText).be.equal("請填寫報修表單");
    });

    it('測試searchReport取得message', async function () {
        const maintainService = new MaintainService(new MockSheetService());

        let mockResult = {
            parameters: {
                numbers: "1"
            }
        };
        const message = await maintainService.searchReport("unittest123", mockResult);

        should(message.text).be.equal(
            "單號：TestMaintainId\n" +
            "TestMaintainLocate樓 TestMaintainItem\n" +
            "目前的維修狀態為已經完成囉，感謝您的報修");
    });
});
