import ss from "secrets.js-grempe"

//why need: https://docs.ethers.io/v5/cookbook/react-native/#cookbook-reactnative-security
import "@ethersproject/shims"
import * as ethers from 'ethers'

import { defaultPath, HDNode, entropyToMnemonic, Mnemonic } from "@ethersproject/hdnode";
import { keccak256 } from "@ethersproject/keccak256";
import { arrayify, Bytes, BytesLike, concat, hexDataSlice, isHexString, joinSignature, SignatureLike } from "@ethersproject/bytes";

export enum SecLevel {
    STRONG,
    MEDIUM,
    WEAK
}

let kSecWords = new Map<SecLevel, number>();
kSecWords.set(SecLevel.STRONG, 24);
kSecWords.set(SecLevel.MEDIUM, 15);
kSecWords.set(SecLevel.WEAK, 12);

let kShareSchema = new Map<SecLevel, [number, number]>();
kShareSchema.set(SecLevel.STRONG, [10, 7]) // 10-7
kShareSchema.set(SecLevel.MEDIUM, [5, 3]) // 5-3
kShareSchema.set(SecLevel.WEAK, [3, 2]) // 3-2

// returns hex string
export function generate_key(options?: any) : string {
    let entropy: Uint8Array = ethers.utils.randomBytes(16);
    if (!options) { options = { }; }
    if (options.extraEntropy) {
        entropy = arrayify(hexDataSlice(keccak256(concat([ entropy, options.extraEntropy ])), 0, 16));
    }
    return ethers.utils.hexValue(entropy)
}

// retrurn:
//  randomMnemonic: seperated by comma ','
export function generate_mnemonic(typ: SecLevel): string {
    let words_level = (kSecWords[typ]- 12)/3;
    let bytes = ethers.utils.randomBytes(16 + 4*words_level);

    // Select the language:
    //   - en, es, fr, ja, ko, it, zh_ch, zh_tw
    let language = ethers.wordlists.en;
    let randomMnemonic = ethers.utils.entropyToMnemonic(bytes, language)
    return randomMnemonic
}

//param:
//  secret: hex
//  if secret is password, wrap it by str2hex:
//  // convert the text into a hex string
//  var pwHex = secrets.str2hex(pw); // => hex string
//  //split into 5 shares, with a threshold of 3
//  var shares = secrets.share(pwHex, 5, 3);
//  //combine 2 shares:
//  var comb = secrets.combine( shares.slice(1,3) );
//  convert back to UTF string:
//  comb = secrets.hex2str(comb);
//  console.log( comb === pw  ); // => false
export function split(secret: string, level: SecLevel) : string[] {
    const lvl = kShareSchema.get(level)
    console.log(secret)
    let shares = ss.share(secret, lvl[0], lvl[1])
    return shares
}

export function combine(shares: string[]): string {
    return ss.combine(shares)
}
