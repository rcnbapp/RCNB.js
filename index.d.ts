import { Transform, TransformOptions } from 'stream'

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

declare class EncodeStream extends Transform { }
declare class DecodeStream extends Transform { }

/**
 * Encode input streams into rcnb-encoded streams
 * @param options Transform options
 */
export declare function encodeStream(options: TransformOptions): EncodeStream

/**
 * Decode rcnb-encoded streams
 * @param options Transform options
 */
export declare function decodeStream(options: TransformOptions): DecodeStream
