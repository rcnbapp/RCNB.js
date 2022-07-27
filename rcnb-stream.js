import { encode, decode } from './rcnb.js'
import { Transform } from 'node:stream'

export class EncodeStream extends Transform {
  constructor(options) {
    super(options)
  }
  _transform(chunk, encoding, callback) {
    let buf
    if (typeof chunk === 'string') {
      buf = Buffer.from(chunk, encoding)
    } else if (Buffer.isBuffer(chunk)) {
      buf = chunk
    } else {
      callback(new Error('unsupported stream'))
      return
    }
    if (this._remain) {
      buf = Buffer.concat([this._remain, buf])
      this._remain = null
    }
    // put trailing byte into _remain
    if (buf.length & 1) {
      this._remain = buf.subarray(buf.length - 1)
      buf = buf.subarray(0, buf.length - 1)
    }
    if (buf) {
      this.push(encode(buf))
    }
    callback()
  }
  _flush(callback) {
    if (this._remain) {
      this.push(encode(this._remain))
      this._remain = null
    }
    callback()
  }
}

export class DecodeStream extends Transform {
  constructor(options) {
    super(options)
  }
  _transform(chunk, _, callback) {
    let str
    if (typeof chunk === 'string') {
      str = chunk
    } else if (Buffer.isBuffer(chunk)) {
      str = chunk.toString()
    } else {
      callback(new Error('unsupported stream'))
      return
    }
    if (this._remain) {
      str = this._remain + str
      this._remain = null
    }
    // put remaining chars into _remain
    if (str.length & 3) { // <=> if (length % 4)
      this._remain = str.slice(-(str.length & 3))
      str = str.slice(0, -(str.length & 3))
    }
    if (str) {
      this.push(decode(str))
    }
    callback()
  }
  _flush(callback) {
    if (this._remain) {
      if (this._remain.length & 1) { // <=> length === 1 || length === 3
        callback(new Error('invalid length'))
        return
      }
      this.push(decode(this._remain))
      this._remain = null
    }
    callback()
  }
}