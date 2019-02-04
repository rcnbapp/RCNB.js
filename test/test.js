const assert = require('assert')
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

  it('should error', function() {
    // length & 1 == true
    assert.throws(() => rcnb.decode('ɌcńƁȓČņ'))

    // not RCNB
    assert.throws(() => rcnb.decode('cɌńƁ'))
    assert.throws(() => rcnb.decode('BcńƁ'))

    // overflow
    assert.throws(() => rcnb.decode('ɍȼȵþ'))
    assert.throws(() => rcnb.decode('ɍȼ'))
    assert.throws(() => rcnb.decode('ȵþ'))
  });
  
});