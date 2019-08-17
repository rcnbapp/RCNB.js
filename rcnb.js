/*
  RCNB.js 
  Copyright (c) 2019 Coxxs
  License: https://github.com/rcnbapp/RCNB.js/blob/master/LICENSE
*/

var rcnb = (function() {
  // char
  var cr = 'rRŔŕŖŗŘřƦȐȑȒȓɌɍ'
  var cc = 'cCĆćĈĉĊċČčƇƈÇȻȼ'
  var cn = 'nNŃńŅņŇňƝƞÑǸǹȠȵ'
  var cb = 'bBƀƁƃƄƅßÞþ'
  console.log(cr)
  console.log(cc)
  console.log(cn)
  console.log(cb)

  // size
  var sr = cr.length,
      sc = cc.length,
      sn = cn.length,
      sb = cb.length
  var src = sr * sc
  var snb = sn * sb
  var scnb = sc * snb
  console.log(sr)
  console.log(sc)
  console.log(sn)
  console.log(sb)
  console.log(src)
  console.log(snb)
  console.log(scnb)

  function _div(a, b) {
    return Math.floor(a / b)
  }
  console.log(_div(3, 4))
  console.log(_div(9, 4))

  function _encodeByte(i) {
    if (i > 0xFF) throw new Error('rc/nb overflow')
    if (i > 0x7F) {
      i = i & 0x7F
      return cn.charAt(_div(i, sb)) + cb.charAt(i % sb)
    }
    return cr.charAt(_div(i, sc)) + cc.charAt(i % sc)
  }
  var t1 = _encodeByte(0x80)
  var t2 = _encodeByte(0x20)
  console.log(t1)
  console.log(t2)

  function _encodeShort(i) {
    if (i > 0xFFFF) throw new Error('rcnb overflow')
    var reverse = false
    if (i > 0x7FFF) {
      reverse = true
      i = i & 0x7FFF
    }
    var char = [
      _div(i, scnb),
      _div(i % scnb, snb),
      _div(i % snb, sb),
      i % sb
    ]
    // console.log(char)
    char = [cr[char[0]], cc[char[1]], cn[char[2]], cb[char[3]]]
    // console.log(char)
    if (reverse) {
      return char[2] + char[3] + char[0] + char[1]
    }
    return char.join('')
  }
  var t3 = _encodeShort(0x8000)
  var t4 = _encodeShort(0x2000)
  console.log(t3)
  console.log(t4)

  function _decodeByte(c) {
    var nb = false
    var idx = [cr.indexOf(c.charAt(0)), cc.indexOf(c.charAt(1))]
    // console.log(idx)
    if (idx[0] < 0 || idx[1] < 0) {
      idx = [cn.indexOf(c.charAt(0)), cb.indexOf(c.charAt(1))]
      nb = true
    }
    if (idx[0] < 0 || idx[1] < 0) throw new Error('not rc/nb')
    var result = nb ? idx[0] * sb + idx[1] : idx[0] * sc + idx[1]
    if (result > 0x7F) throw new Error('rc/nb overflow')
    // console.log(nb)
    return nb ? result | 0x80 : result
  }
  console.log(_decodeByte(t1))
  console.log(_decodeByte(t2))

  function _decodeShort(c) {
    var idx
    var reverse = cr.indexOf(c.charAt(0)) < 0
    if (!reverse) {
      idx = [cr.indexOf(c.charAt(0)), cc.indexOf(c.charAt(1)), cn.indexOf(c.charAt(2)), cb.indexOf(c.charAt(3))]
    } else {
      idx = [cr.indexOf(c.charAt(2)), cc.indexOf(c.charAt(3)), cn.indexOf(c.charAt(0)), cb.indexOf(c.charAt(1))]
    }
    if (idx[0] < 0 || idx[1] < 0 || idx[2] < 0 || idx[3] < 0) throw new Error('not rcnb')
    var result = idx[0] * scnb + idx[1] * snb + idx[2] * sb + idx[3]
    if (result > 0x7FFF) throw new Error('rcnb overflow')
    // console.log(reverse)
    return reverse ? result | 0x8000 : result
  }
  console.log(_decodeShort(t3))
  console.log(_decodeShort(t4))

  var rcnb = {
    encode: function(arr) {
      var str = ''
      // encode every 2 bytes
      for (var i = 0; i < (arr.length >> 1); i++) {
        str += _encodeShort((arr[i * 2] << 8) | arr[i * 2 + 1])
      }
      // encode tailing byte
      if (arr.length & 1) str += _encodeByte(arr[arr.length - 1])
      return str
    },
    decode: function(str) {
      if (str.length & 1) throw new Error('invalid length')
      var arr = []
      // decode every 2 bytes (1 rcnb = 2 bytes)
      for (var i = 0; i < (str.length >> 2); i++) {
        var short = _decodeShort(str.substr(i * 4, 4))
        arr.push(short >> 8)
        arr.push(short & 0xFF)
      }
      // decode tailing byte (1 rc / 1 nb = 1 byte)
      if (str.length & 2) arr.push(_decodeByte(str.substr(-2, 2)))
      return Uint8Array.from(arr)
    }
  }

  return rcnb
})()

var s = [104, 101, 108, 108, 111]
var es = rcnb.encode(s)
console.log(es)
var ds = rcnb.decode(es)
console.log(ds)

if (typeof module !== 'undefined' && module != null) {
  module.exports = rcnb
}
