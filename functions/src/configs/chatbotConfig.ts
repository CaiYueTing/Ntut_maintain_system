import * as env from "../env" ;

export class Config {

    public static LINE = {
        channelId: env.LINE.channelId,
        channelSecret: env.LINE.channelSecret,
        channelAccessToken: env.LINE.channelAccessToken
    };

    public static DIALOGFLOW = {
        agentToken: env.DIALOGFLOW.agentToken
    };

    public static SHEETCLIENTSECRET = {
        installed: {
            client_id: env.SHEETCLIENTSECRET.installed.client_id,
            project_id: env.SHEETCLIENTSECRET.installed.project_id,
            auth_uri: env.SHEETCLIENTSECRET.installed.auth_uri,
            token_uri: env.SHEETCLIENTSECRET.installed.token_uri,
            auth_provider_x509_cert_url: env.SHEETCLIENTSECRET.installed.auth_provider_x509_cert_url,
            client_secret: env.SHEETCLIENTSECRET.installed.client_secret,
            redirect_uris: env.SHEETCLIENTSECRET.installed.redirect_uris
        }
    };

    public static SHEETTOKEN = {
        access_token: env.SHEETTOKEN.access_token,
        refresh_token: env.SHEETTOKEN.refresh_token,
        token_type: env.SHEETTOKEN.token_type,
        expiry_date: env.SHEETTOKEN.expiry_date
    };

    public static CHATBASE = {
        apiKey: env.CHATBASE.apiKey
    };
}
