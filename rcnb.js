/*!
  RCNB.js 
  Copyright (c) 2019-2022 Coxxs
  License: https://github.com/rcnbapp/RCNB.js/blob/master/LICENSE
*/

// char
const cr = 'rRŔŕŖŗŘřƦȐȑȒȓɌɍ'
const cc = 'cCĆćĈĉĊċČčƇƈÇȻȼ'
const cn = 'nNŃńŅņŇňƝƞÑǸǹȠȵ'
const cb = 'bBƀƁƃƄƅßÞþ'

// size
const sr = cr.length,
  sc = cc.length,
  sn = cn.length,
  sb = cb.length
const src = sr * sc
const snb = sn * sb
const scnb = sc * snb

function _div(a, b) {
  return Math.floor(a / b)
}

function _encodeByte(i) {
  if (i > 0xFF) throw new Error('rc/nb overflow')
  if (i > 0x7F) {
    i = i & 0x7F
    return cn.charAt(_div(i, sb)) + cb.charAt(i % sb)
  }
  return cr.charAt(_div(i, sc)) + cc.charAt(i % sc)
}

function _encodeShort(i) {
  if (i > 0xFFFF) throw new Error('rcnb overflow')
  let reverse = false
  if (i > 0x7FFF) {
    reverse = true
    i = i & 0x7FFF
  }
  let char = [
    _div(i, scnb),
    _div(i % scnb, snb),
    _div(i % snb, sb),
    i % sb
  ]
  char = [cr[char[0]], cc[char[1]], cn[char[2]], cb[char[3]]]
  if (reverse) {
    return char[2] + char[3] + char[0] + char[1]
  }
  return char.join('')
}

function _decodeByte(c) {
  let nb = false
  let idx = [cr.indexOf(c.charAt(0)), cc.indexOf(c.charAt(1))]
  if (idx[0] < 0 || idx[1] < 0) {
    idx = [cn.indexOf(c.charAt(0)), cb.indexOf(c.charAt(1))]
    nb = true
  }
  if (idx[0] < 0 || idx[1] < 0) throw new Error('not rc/nb')
  const result = nb ? idx[0] * sb + idx[1] : idx[0] * sc + idx[1]
  if (result > 0x7F) throw new Error('rc/nb overflow')
  return nb ? result | 0x80 : result
}

function _decodeShort(c) {
  let idx
  const reverse = cr.indexOf(c.charAt(0)) < 0
  if (!reverse) {
    idx = [cr.indexOf(c.charAt(0)), cc.indexOf(c.charAt(1)), cn.indexOf(c.charAt(2)), cb.indexOf(c.charAt(3))]
  } else {
    idx = [cr.indexOf(c.charAt(2)), cc.indexOf(c.charAt(3)), cn.indexOf(c.charAt(0)), cb.indexOf(c.charAt(1))]
  }
  if (idx[0] < 0 || idx[1] < 0 || idx[2] < 0 || idx[3] < 0) throw new Error('not rcnb')
  const result = idx[0] * scnb + idx[1] * snb + idx[2] * sb + idx[3]
  if (result > 0x7FFF) throw new Error('rcnb overflow')
  return reverse ? result | 0x8000 : result
}

export function encode(arr) {
  if (!(arr instanceof Uint8Array)) {
    throw new TypeError('argument is not an instance of Uint8Array')
  }
  let str = ''
  // encode every 2 bytes
  for (let i = 0; i < (arr.length >> 1); i++) {
    str += _encodeShort((arr[i * 2] << 8) | arr[i * 2 + 1])
  }
  // encode tailing byte
  if (arr.length & 1) str += _encodeByte(arr[arr.length - 1])
  return str
}

export function decode(str) {
  if (str.length & 1) throw new Error('invalid length')
  const arr = []
  // decode every 2 bytes (1 rcnb = 2 bytes)
  for (let i = 0; i < (str.length >> 2); i++) {
    const short = _decodeShort(str.substr(i * 4, 4))
    arr.push(short >> 8)
    arr.push(short & 0xFF)
  }
  // decode tailing byte (1 rc / 1 nb = 1 byte)
  if (str.length & 2) arr.push(_decodeByte(str.substr(-2, 2)))
  return Uint8Array.from(arr)
}

export default { encode, decode }