import {OAuth2Client} from "google-auth-library";

export interface IOAuth2ClientFactory {
    getClient(): Promise<OAuth2Client>;
}
