const assert = require('assert')
const rcnb = require('../rcnb')

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should encode', function() {
      assert.equal(rcnb.encode(new Uint8Array([114, 99, 110, 98])), 'ɌcńƁȓČņÞ')
	  assert.equal(rcnb.encode(new TextEncoder('utf-8').encode('Who NB?')), 'ȐȼŃƅȓčƞÞƦȻƝƃŖć')
    });
    it('should decode', function() {
      assert.deepEqual(rcnb.decode('ɌcńƁȓČņÞ'), new Uint8Array([114, 99, 110, 98]))
      assert.equal(new TextDecoder("utf-8").decode(rcnb.decode('ȐĉņþƦȻƝƃŔć')), 'RCNB!')
    });
  });
});