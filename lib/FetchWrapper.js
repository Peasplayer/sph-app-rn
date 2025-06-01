import {Platform} from "react-native";
import { Cookie, CookieJar } from 'tough-cookie'

export default class FetchWrapper {
    _cookieJar;
    cookies;

    constructor() {
        // Fields for only this implementation
        this._cookieJar = new CookieJar();
        this.clearCookies();
    }

    async fetch(url, options = undefined) {
        console.log(`Fetch url ${url}`);
        //options.credentials = "omit";
        if (options === undefined)
            options ={}
        if (options.headers === undefined)
            options.headers = {};
        var existingCookies = await this._cookieJar.getCookies(url);
        options.headers.Cookie = existingCookies.map((cookie) => cookie.cookieString()).join(';')
        options.credentials = "omit";
        var response = await fetch(url, options);
        //console.log(url, options, response)//, url.includes("connect") ? response.text() : "");
        if (response.headers.map["set-cookie"] !== undefined) {
            var setCookieHeader = response.headers.map["set-cookie"];
            //console.log("set cookie header", setCookieHeader, setCookieHeader.split(","));
            for (const cookie of setCookieHeader.split(",")) {
                var resCookie = Cookie.parse(cookie);
                await this._cookieJar.setCookie(resCookie, url);
            }
            var cookies = await this._cookieJar.getCookies(url);
            //console.log(cookies);

            /*if (typeof response.headers["set-cookie"] === "object") {
                var cookies = response.headers["set-cookie"].map(cookie => {
                    return {name: cookie.split(";")[0].split("=")[0], value: cookie.split(";")[0].split("=")[1]}
                });
                if (cookies !== undefined) {
                    var sessionCookie = cookies.find(cookie => cookie.name === "SPH-Session");
                    if (sessionCookie) {
                        this.cookies["SPH-Session"] = sessionCookie.value;
                    }
                    var sidCookie = cookies.find(cookie => cookie.name === "sid");
                    if (sidCookie) {
                        this.cookies.sid = sidCookie.value;
                    }
                }
            }*/
        }
        return new ResponseObject(response);
    }

    async getCookie(url, name) {
        var cookies = await this._cookieJar.getCookies("https://" + url);
        //console.log(cookies);
        return cookies.find(cookie => cookie.key === name);
        return this.cookies[name];
    }

    async clearCookies() {
        await this._cookieJar.removeAllCookies();
        this.cookies = { "SPH-Session": null, "sid": undefined };
    }
}

export class ResponseObject {
    defaultObject;

    constructor(defaultObject) {
        this.defaultObject = defaultObject;
    }

    async text() {
        return this.defaultObject.text();
    }

    async json() {
        return this.defaultObject.json();
    }

    async blob() {
        return this.defaultObject.blob();
    }
}
