import { encode, decode } from './rcnb.js'
import { EncodeStream, DecodeStream } from './rcnb-stream.js'

export { encode, decode, EncodeStream, DecodeStream }

export function encodeStream(options) {
  return new EncodeStream(options)
}

export function decodeStream(options) {
  return new DecodeStream(options)
}