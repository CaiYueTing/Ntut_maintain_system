import {google} from "googleapis"
import axios from "axios"
import {ISheetService} from "./ISheetService";
import {IOAuth2ClientFactory} from "./IOAuth2ClientFactory";
import {OAuth2ClientFactory} from "./OAuth2ClientFactory";

export class SheetService implements ISheetService {

    private authClientFactory: IOAuth2ClientFactory;

    public constructor() {
        this.authClientFactory = new OAuth2ClientFactory();
    }

    readSheet(spreadsheetId: string, range: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            const sheets = google.sheets("v4");
            sheets.spreadsheets.values.get({
                auth: this.authClientFactory.getClient(),
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
                auth: this.authClientFactory.getClient(),
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
                auth: this.authClientFactory.getClient()
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
            const auth = await this.authClientFactory.getClient();
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
