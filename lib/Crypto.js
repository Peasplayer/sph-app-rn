import CryptoJS from "react-native-crypto-js";
import {JSEncrypt} from 'jsencrypt';

export default class Crypto {
    randomUUID() {
        var d, r, uuid;
        d = Number.parseInt("16160449445400");
        uuid = "";
        for (var c, _pj_c = 0, _pj_a = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx-xxxxxx3xx", _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            c = _pj_a[_pj_c];
            r = (((d + (Number.parseInt((Math.random() * 16)))) % 16) | 0);
            d = Math.floor((d / 16));
            if ((c === "x")) {
                uuid = (uuid + (r).toString(16));
            } else {
                if ((c === "y")) {
                    uuid = (uuid + (((r & 3) | 8)).toString(16));
                } else {
                    uuid = (uuid + c);
                }
            }
        }
        return uuid;
    }

    encryptAES(value, key) {
        return CryptoJS.AES.encrypt(value, key).toString();
    }
    decryptAES(value, key) {
        return CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
    }
    encryptRSA(value, publicKey) {
        var rsa = new JSEncrypt();
        rsa.setPublicKey(publicKey);
        return rsa.encrypt(value);
    }
}
