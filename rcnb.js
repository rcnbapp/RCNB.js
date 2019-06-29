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

  // size
  var sr = cr.length,
      sc = cc.length,
      sn = cn.length,
      sb = cb.length
  var src = sr * sc
  var snb = sn * sb
  var scnb = sc * snb

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
    char = [cr[char[0]], cc[char[1]], cn[char[2]], cb[char[3]]]
    if (reverse) {
      return char[2] + char[3] + char[0] + char[1]
    }
    return char.join('')
  }

  function _decodeByte(c) {
    var nb = false
    var idx = [cr.indexOf(c.charAt(0)), cc.indexOf(c.charAt(1))]
    if (idx[0] < 0 || idx[1] < 0) {
      idx = [cn.indexOf(c.charAt(0)), cb.indexOf(c.charAt(1))]
      nb = true
    }
    if (idx[0] < 0 || idx[1] < 0) throw new Error('not rc/nb')
    var result = nb ? idx[0] * sb + idx[1] : idx[0] * sc + idx[1]
    if (result > 0x7F) throw new Error('rc/nb overflow')
    return nb ? result | 0x80 : result
  }

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
    return reverse ? result | 0x8000 : result
  }

  function streamFactory(_rcnb) {
    if (!streamFactory._ret) {
      var Transform = require('stream').Transform

      function EncodeStream(options) {
        if (!(this instanceof EncodeStream)) return new EncodeStream(options);
        // the function is supported only if `require('stream')` is supported
        Transform.call(this, options);
      }

      EncodeStream.prototype = Object.create(Transform.prototype)
      EncodeStream.prototype._transform = function(chunk, encoding, callback) {
        var buf
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
          this._remain = buf.slice(buf.length - 1)
          buf = buf.slice(0, buf.length - 1)
        }
        if (buf) {
          this.push(_rcnb.encode(buf))
        }
        callback()
      }
      EncodeStream.prototype._flush = function(callback) {
        if (this._remain) {
          this.push(_rcnb.encode(this._remain))
          this._remain = null
        }
        callback()
      }

      function DecodeStream(options) {
        if (!(this instanceof DecodeStream)) return new DecodeStream(options);
        // the function is supported only if `require('stream')` is supported
        Transform.call(this, options);
      }

      DecodeStream.prototype = Object.create(Transform.prototype)
      DecodeStream.prototype._transform = function(chunk, _, callback) {
        var str
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
          this.push(_rcnb.decode(str))
        }
        callback()
      }
      DecodeStream.prototype._flush = function(callback) {
        if (this._remain) {
          if (this._remain.length & 1) { // <==> length === 1 || length === 3
            callback(new Error('invalid length'))
            return
          }
          this.push(_rcnb.decode(this._remain))
          this._remain = null
        }
        callback()
      }

      streamFactory._ret = {
        EncodeStream: EncodeStream,
        DecodeStream: DecodeStream
      }
    }
    return streamFactory._ret
  }

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
    },
    encodeStream: function(options) {
      var EncodeStream = streamFactory(rcnb).EncodeStream
      return new EncodeStream(options)
    },
    decodeStream: function(options) {
      var DecodeStream = streamFactory(rcnb).DecodeStream
      return new DecodeStream(options)
    }
  }

  return rcnb
})()

if (typeof module !== 'undefined' && module != null) {
  module.exports = rcnb
}
