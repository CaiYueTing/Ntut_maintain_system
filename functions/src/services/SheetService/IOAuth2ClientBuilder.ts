import {OAuth2Client} from "google-auth-library";

export interface IOAuth2ClientBuilder {
    getOAuth2Client(): Promise<OAuth2Client>;
}
