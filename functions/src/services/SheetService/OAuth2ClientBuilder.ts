import {Config} from "../../configs/Config";
import {IOAuth2ClientBuilder} from "./IOAuth2ClientBuilder";
import {OAuth2Client} from "google-auth-library";
import {injectable} from "inversify";

@injectable()
export class OAuth2ClientBuilder implements IOAuth2ClientBuilder {

    public getOAuth2Client(): Promise<OAuth2Client> {

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
