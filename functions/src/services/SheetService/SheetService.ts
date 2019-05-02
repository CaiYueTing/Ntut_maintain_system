import axios from "axios"
import {google} from "googleapis"
import {inject, injectable} from "inversify";
import {IOAuth2ClientBuilder} from "./IOAuth2ClientBuilder";
import {ISheetService} from "./ISheetService";
import {OAuth2ClientBuilder} from "./OAuth2ClientBuilder";
import {TYPES} from "../../ioc/types";

@injectable()
export class SheetService implements ISheetService {

    public constructor(@inject(TYPES.IOAuth2ClientBuilder) private authClientFactory: IOAuth2ClientBuilder) {
        this.authClientFactory = new OAuth2ClientBuilder();
    }

    readSheet(spreadsheetId: string, range: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            const sheets = google.sheets("v4");
            sheets.spreadsheets.values.get({
                auth: this.authClientFactory.getOAuth2Client(),
                spreadsheetId: spreadsheetId,
                range: range
            }, (error, result) => {
                if (error) {
                    console.log("The API returned an error: ", error);
                    reject(error);
                } else
                    resolve(result.data.values);
            });
        });
    }

    appendSheet(spreadsheetId: string, range: string, values: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const sheets = google.sheets("v4");
            sheets.spreadsheets.values.append({
                auth: this.authClientFactory.getOAuth2Client(),
                spreadsheetId: spreadsheetId,
                range: range,
                valueInputOption: "USER_ENTERED",
                resource: {values: values}
            }, (error, result) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log("%d cells appended.", result.data.updates.updatedCells);
                    resolve(result);
                }
            })
        });
    }

    writeSheet(spreadsheetId: string, range: string, values: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const sheets = google.sheets("v4");
            const body = {values: values};
            sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: range,
                valueInputOption: "USER_ENTERED",
                resource: body,
                auth: this.authClientFactory.getOAuth2Client()
            }, (error, result) => {
                if (error) {
                    console.log("The API returned an error: ", error);
                    reject(error)
                } else {
                    console.log("%d cells updated. ", result.data.updatedCells);
                    resolve(result)
                }
            });
        });
    }

    querySheet(queryString: string, sheetId: string, gid: string): Promise<Array<any>> {
        return new Promise(async (resolve, reject) => {
            const reg = /google.visualization.Query.setResponse\((.*)\)/g;
            const query = encodeURI(queryString);
            const url = `https://spreadsheets.google.com/tq?tqx=out:json&tq=${query}&key=${sheetId}&gid=${gid}`;
            const auth = await this.authClientFactory.getOAuth2Client();
            const token = await auth.refreshAccessToken();
            const headers = {
                "Authorization": "Bearer " + token.credentials.access_token
            };

            //console.log("URL : " + url)
            axios.get(url, {headers}).then(result => {
                const data = JSON.parse(reg.exec(result.data)[1]).table.rows;

                //console.log(data)
                const formats = [];
                data.forEach(col => {
                    const format = [];
                    col.c.forEach(row => {
                        if (row) {
                            if (typeof row.v === "string") {
                                if (row.v.includes("Date")) {
                                    format.push(row.f);
                                    return
                                }
                            }
                            if (typeof row.v === "number") {
                                if (row.f.includes("%")) {
                                    format.push(row.f);
                                    return
                                }
                            }
                            if (Array.isArray(row.v)) {
                                format.push(row.f);
                                return
                            }
                            format.push(row.v);
                            return
                        }
                        format.push(null)
                    });
                    formats.push(format)
                });
                resolve(formats)
            }).catch(error => reject(error))
        })
    }
}
