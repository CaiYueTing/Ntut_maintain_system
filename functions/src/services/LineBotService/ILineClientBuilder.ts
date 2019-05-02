import {Client} from "@line/bot-sdk";

export interface ILineClientBuilder {
    getLineClient(): Client;
}
