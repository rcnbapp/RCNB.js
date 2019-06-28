const assert = require('assert')
const {createReadStream} = require('streamifier')
const streamEqual = require('stream-equal')
const rcnb = require('../rcnb')

describe('RCNB', function() {
  it('should encode', function() {
    assert.strictEqual(rcnb.encode(new Uint8Array([114, 99, 110, 98])), 'ɌcńƁȓČņÞ')
    assert.strictEqual(rcnb.encode(new Uint8Array([222, 233, 111, 122, 222])), 'ȵßȑƈȓƇńÞƞƃ')
    assert.strictEqual(rcnb.encode(new TextEncoder('utf-8').encode('Who NB?')), 'ȐȼŃƅȓčƞÞƦȻƝƃŖć')
  });
  
  it('should decode', function() {
    assert.deepStrictEqual(rcnb.decode('ɌcńƁȓČņÞ'), new Uint8Array([114, 99, 110, 98]))
    assert.deepStrictEqual(rcnb.decode('ȵßȑƈȓƇńÞƞƃ'), new Uint8Array([222, 233, 111, 122, 222]))
    assert.strictEqual(new TextDecoder("utf-8").decode(rcnb.decode('ȐĉņþƦȻƝƃŔć')), 'RCNB!')
  });

  it('should encode from stream', async function() {
    var promises = []
    var src1 = createReadStream(Buffer.of(114, 99, 110, 98)).pipe(rcnb.encodeStream())
    var expected1 = createReadStream('ɌcńƁȓČņÞ')
    promises.push(streamEqual(src1, expected1))
    var src2 = createReadStream(Buffer.of(222, 233, 111, 122, 222)).pipe(rcnb.encodeStream())
    var expected2 = createReadStream('ȵßȑƈȓƇńÞƞƃ')
    promises.push(streamEqual(src2, expected2))
    var src3 = createReadStream(Buffer.from(new TextEncoder('utf-8').encode('Who NB?'))).pipe(rcnb.encodeStream())
    var expected3 = createReadStream('ȐȼŃƅȓčƞÞƦȻƝƃŖć')
    promises.push(streamEqual(src3, expected3))

    var results
    var timer
    var timerPromise = new Promise(function(_, reject) {
      timer = setImmediate(function() {
        reject(new Error('encoding timeout'))
      })
    })
    try {
      results = await Promise.race([
        Promise.all(promises),
        timerPromise
      ])
    } catch (err) {
      assert.strict.fail(err)
      return
    }
    clearImmediate(timer)
    assert.strict(results.every(equal => equal === true))
  });
  
  it('should decode from stream', async function() {
    var promises = []
    var src1 = createReadStream('ɌcńƁȓČņÞ').pipe(rcnb.decodeStream())
    var expected1 = createReadStream(Buffer.of(114, 99, 110, 98))
    promises.push(streamEqual(src1, expected1))
    var src2 = createReadStream('ȵßȑƈȓƇńÞƞƃ').pipe(rcnb.decodeStream())
    var expected2 = createReadStream(Buffer.of(222, 233, 111, 122, 222))
    promises.push(streamEqual(src2, expected2))
    var src3 = createReadStream('ȐĉņþƦȻƝƃŔć').pipe(rcnb.decodeStream())
    var expected3 = createReadStream(Buffer.from(new TextEncoder("utf-8").encode('RCNB!')))
    promises.push(streamEqual(src3, expected3))

    var results
    var timer
    var timerPromise = new Promise(function(_, reject) {
      timer = setImmediate(function() {
        reject(new Error('encoding timeout'))
      })
    })
    try {
      results = await Promise.race([
        Promise.all(promises),
        timerPromise
      ])
    } catch (err) {
      assert.strict.fail(err)
      return
    }
    clearImmediate(timer)
    assert.strict(results.every(equal => equal === true))
  });

  it('should error', async function() {
    // length & 1 == true
    assert.throws(() => rcnb.decode('ɌcńƁȓČņ'))

    // not RCNB
    assert.throws(() => rcnb.decode('cɌńƁ'))
    assert.throws(() => rcnb.decode('BcńƁ'))

    // overflow
    assert.throws(() => rcnb.decode('ɍȼȵþ'))
    assert.throws(() => rcnb.decode('ɍȼ'))
    assert.throws(() => rcnb.decode('ȵþ'))

    // non Buffer or string stream
    var promises = []
    promises.push(new Promise(function(resolve) {
      createReadStream({}).pipe(rcnb.encodeStream()).on('error', resolve)
    }))
    promises.push(new Promise(function(resolve) {
      createReadStream({}).pipe(rcnb.decodeStream()).on('error', resolve)
    }))
    var results = await Promise.all(promises)
    assert.strict(results.every(err => err instanceof Error))
  });
});