/**
 * Encode a string into rcnb-encoded
 * @param arr The original string/buffer, converted into Uint8Array
 */
export declare function encode(arr: Uint8Array): string

/**
 * Decode a rcnb-encoded string
 * @param str The rcnb-encoded string
 */
export declare function decode(str: string): Uint8Array
