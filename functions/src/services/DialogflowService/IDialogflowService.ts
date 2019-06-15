import {Message} from "@line/bot-sdk";

export interface IDialogflowService {
    dispatchMessage(
        userId: string,
        message: string,
        lineMessageCallback: (userId: string, message: Message | Array<Message>) => void,
        errorCallback? : (error) => void);
}
