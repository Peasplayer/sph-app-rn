export default class Utils {
    // Credits: https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript#answer-16348977
    static stringToColour(str: string|undefined) {
        if (str == undefined)
            return undefined;

        let hash = 0;
        str.split('').forEach(char => {
            hash = char.charCodeAt(0) + ((hash << 5) - hash)
        })
        let colour = '#'
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff
            colour += value.toString(16).padStart(2, '0')
        }
        return colour
    }

    // Credits: https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black#answer-51567564
    static wc_hex_is_dark(color: string|undefined) {
        if (color == undefined)
            return false;

        const hex = color.replace('#', '');
        const c_r = parseInt(hex.substring(0, 0 + 2), 16);
        const c_g = parseInt(hex.substring(2, 2 + 2), 16);
        const c_b = parseInt(hex.substring(4, 4 + 2), 16);
        const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
        return brightness < 155;
    }

    static invertHexColor(color: string|undefined) {
        if (color == undefined)
            return undefined;

        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 0 + 2), 16);
        const g = parseInt(hex.substring(2, 2 + 2), 16);
        const b = parseInt(hex.substring(4, 4 + 2), 16);
        return "#" + (255 - r).toString(16).padStart(2, '0') + (255 - g).toString(16).padStart(2, '0') + (255 - b).toString(16).padStart(2, '0');
    }
}