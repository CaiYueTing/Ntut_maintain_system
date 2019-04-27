import {IOAuth2ClientFactory} from "./IOAuth2ClientFactory";
import {OAuth2Client} from "google-auth-library";
import {Config} from "../../configs/Config";

export class OAuth2ClientFactory implements IOAuth2ClientFactory {

    getClient(): Promise<OAuth2Client> {

        return new Promise(resolve => {
            const secret = Config.SHEETCLIENTSECRET.installed.client_secret;
            const clientId = Config.SHEETCLIENTSECRET.installed.client_id;
            const redirectUrl = Config.SHEETCLIENTSECRET.installed.redirect_uris[0];
            const oauth2Client = new OAuth2Client(clientId, secret, redirectUrl);
            oauth2Client.setCredentials({
                access_token: Config.SHEETTOKEN.access_token,
                refresh_token: Config.SHEETTOKEN.refresh_token
            });
            resolve(oauth2Client)
        });
    }
}
