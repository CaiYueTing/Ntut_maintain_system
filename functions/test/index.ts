import "reflect-metadata";
import 'mocha';
import * as TypeMoq from 'typemoq';
import * as should from 'should'
import {Group, ImageEventMessage, MessageEvent, TextEventMessage, User, WebhookEvent} from "@line/bot-sdk";
import {LineBotService} from "../src/services/LineBotService/LineBotService";
import {MaintainService} from "../src/services/MaintainService/MaintainService";
import {Maintain} from '../src/models/Maintain';
import {MockDialogflowBuilder, MockLineClientBuilder, MockSheetService} from './mock';
import {OAuth2ClientBuilder} from "../src/services/SheetService/OAuth2ClientBuilder";

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

    it('測試searchReport取得message報修完成', async function () {
        const maintainService = new MaintainService(new MockSheetService());

        let mockResult = {
            parameters: {
                number: "1"
            }
        };
        const message = await maintainService.searchReport("unittest123", mockResult);

        should(message.text).be.equal(
            "單號：TestMaintainId\n" +
            "TestMaintainLocate樓 TestMaintainItem\n" +
            "目前的維修狀態為已經完成囉，感謝您的報修");
    });

    it('測試searchReport取得message查詢單號不存在', async function () {
        const maintainService = new MaintainService(new MockSheetService());

        let mockResult = {
            parameters: {
                number: "0"
            }
        };
        const message = await maintainService.searchReport("unittest123", mockResult);

        should(message.text).be.equal("您所查詢的單號不存在");
    });
});

describe("測試OAuth2ClientBuilder", function () {
    it("測試OAuth2ClientBuilder取得OAuth2Client", async function () {
        const builder = new OAuth2ClientBuilder();
        const client = await builder.getOAuth2Client();

        should(client.generateAuthUrl()).be.equal("https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=246850699012-k3uum4t90m63pj65qio6qfmd0ot98fg3.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob");
    });
});

describe("測試LineBotService", function () {
    it("測試LineBotService成功PushMessage", async function () {
        const service = new LineBotService(new MockDialogflowBuilder(), new MockLineClientBuilder(), new MaintainService(new MockSheetService()));
        const result = await service.pushMessage("SomeOne", {type: "text", text: "PushMessageSuccess"});

        should(result).be.equal("success");
    });

    it("測試LineBotService成功ReplyMessage", async function () {
        const service = new LineBotService(new MockDialogflowBuilder(), new MockLineClientBuilder(), new MaintainService(new MockSheetService()));
        const result = await service.replyMessage("SomeReplyToken", {type: "text", text: "PushMessageSuccess"});

        should(result).be.equal("success");
    });

    it("測試LineBotService eventDispatcher之FollowEvent", async function () {
        const service = new LineBotService(new MockDialogflowBuilder(), new MockLineClientBuilder(), new MaintainService(new MockSheetService()));

        const mockEventSource = TypeMoq.Mock.ofType<User>();
        mockEventSource.setup(x => x.type).returns(() => "user");
        mockEventSource.setup(x => x.userId).returns(() => "SomeOne");

        const mockEvent =  TypeMoq.Mock.ofType<WebhookEvent>();
        mockEvent.setup(x => x.type).returns(() => "follow");
        mockEvent.setup(x => x.source).returns(() => mockEventSource.object);

        const result = await service.eventDispatcher(mockEvent.object);
        should(result).be.equal("success");
    });

    it("測試LineBotService eventDispatcher之JoinEvent", async function () {
        const service = new LineBotService(new MockDialogflowBuilder(), new MockLineClientBuilder(), new MaintainService(new MockSheetService()));

        const mockEventSource = TypeMoq.Mock.ofType<Group>();
        mockEventSource.setup(x => x.type).returns(() => "group");
        mockEventSource.setup(x => x.groupId).returns(() => "SomeGroup");

        const mockEvent =  TypeMoq.Mock.ofType<WebhookEvent>();
        mockEvent.setup(x => x.type).returns(() => "join");
        mockEvent.setup(x => x.source).returns(() => mockEventSource.object);

        const result = await service.eventDispatcher(mockEvent.object);
        should(result).be.equal("success");
    });

    it("測試LineBotService eventDispatcher之JoinEvent失敗", async function () {
        const service = new LineBotService(new MockDialogflowBuilder(), new MockLineClientBuilder(), new MaintainService(new MockSheetService()));

        const mockEventSource = TypeMoq.Mock.ofType<User>();
        mockEventSource.setup(x => x.type).returns(() => "user");
        mockEventSource.setup(x => x.userId).returns(() => "SomeGroup");

        const mockEvent =  TypeMoq.Mock.ofType<WebhookEvent>();
        mockEvent.setup(x => x.type).returns(() => "join");
        mockEvent.setup(x => x.source).returns(() => mockEventSource.object);

        const result = await service.eventDispatcher(mockEvent.object);
        should(result).be.equal(null);
    });

    it("測試LineBotService之MessageEvent", async function () {
        const service = new LineBotService(new MockDialogflowBuilder(), new MockLineClientBuilder(), new MaintainService(new MockSheetService()));

        const mockEventSource = TypeMoq.Mock.ofType<User>();
        mockEventSource.setup(x => x.type).returns(() => "user");
        mockEventSource.setup(x => x.userId).returns(() => "SomeOne");

        const mockEventMessage = TypeMoq.Mock.ofType<TextEventMessage>();
        mockEventMessage.setup(x => x.type).returns(() => "text");
        mockEventMessage.setup(x => x.text).returns(() => "requestReport");

        const mockEvent =  TypeMoq.Mock.ofType<MessageEvent>();
        mockEvent.setup(x => x.type).returns(() => "message");
        mockEvent.setup(x => x.source).returns(() => mockEventSource.object);
        mockEvent.setup(x => x.message).returns(() => mockEventMessage.object);

        const result = await service.eventDispatcher(mockEvent.object);
        should(result).be.equal("message passed.");
    });

    it("測試LineBotService eventDispatcher之MessageEvent非text message", async function () {
        const service = new LineBotService(new MockDialogflowBuilder(), new MockLineClientBuilder(), new MaintainService(new MockSheetService()));

        const mockEventSource = TypeMoq.Mock.ofType<User>();
        mockEventSource.setup(x => x.type).returns(() => "user");
        mockEventSource.setup(x => x.userId).returns(() => "SomeOne");

        const mockEventMessage = TypeMoq.Mock.ofType<ImageEventMessage>();
        mockEventMessage.setup(x => x.type).returns(() => "image");

        const mockEvent =  TypeMoq.Mock.ofType<MessageEvent>();
        mockEvent.setup(x => x.type).returns(() => "message");
        mockEvent.setup(x => x.source).returns(() => mockEventSource.object);
        mockEvent.setup(x => x.message).returns(() => mockEventMessage.object);

        const result = await service.eventDispatcher(mockEvent.object);
        should(result).be.equal(null);
    });

    it("測試LineBotService eventDispatcher之無可用dispatch", async function () {
        const service = new LineBotService(new MockDialogflowBuilder(), new MockLineClientBuilder(), new MaintainService(new MockSheetService()));

        const mockEventSource = TypeMoq.Mock.ofType<User>();
        mockEventSource.setup(x => x.type).returns(() => "user");
        mockEventSource.setup(x => x.userId).returns(() => "SomeOne");

        const mockEvent =  TypeMoq.Mock.ofType<WebhookEvent>();
        mockEvent.setup(x => x.type).returns(() => "unfollow");
        mockEvent.setup(x => x.source).returns(() => mockEventSource.object);

        const result = await service.eventDispatcher(mockEvent.object);
        should(result).be.equal(null);
    });
});
