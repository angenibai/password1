const CryptoJS = require('crypto-js');
const ROUNDS = 20;

const rotl = (a,b) => {
    return (a << b) | (a >> (32 - b));
}

const qr = (a,b,c,d) => {
    a += b; d ^= a; d = rotl(d, 16);
    c += d; b ^= c; b = rotl(b, 12);
    a += b; d ^= a; d = rotl(d, 8);
    c += d; b ^= c; b = rotl(b, 7);
}

const chacha = (in_buf) => {
    let x = in_buf.words;

    for (let i = 0; i < ROUNDS; i += 2) {
        // odd round
        qr(x[0], x[4], x[8], x[12]);
        qr(x[1], x[5], x[9], x[13]);
        qr(x[2], x[6], x[10], x[14]);
        qr(x[3], x[7], x[11], x[15]);

        // even round
        qr(x[0], x[5], x[10], x[15]);
        qr(x[1], x[6], x[11], x[12]);
        qr(x[2], x[7], x[8], x[13]);
        qr(x[3], x[4], x[9], x[14]);
    }

    let out_buf = in_buf;
    for (let i = 0; i < 16; i++) {
        out_buf.words[i] = x[i] + in_buf.words[i];
    }
    return out_buf;
}

export const chachaString = (length) => {
    const seed = CryptoJS.lib.WordArray.random(64);
    let string = chacha(seed).toString(CryptoJS.enc.Base64);
    return string.slice(0, length);
}
