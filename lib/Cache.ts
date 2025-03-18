import BackgroundTasker from "@/lib/BackgroundTasker";

export default class Cache {
    static CryptoTasker: BackgroundTasker;
    static currentSession: any;
    static debugLog: any[] = [];
}