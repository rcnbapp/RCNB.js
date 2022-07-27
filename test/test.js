import { strictEqual, deepStrictEqual, throws } from 'assert'
import { Readable } from 'stream'
import { promisify } from 'util'

const nextTick = promisify(process.nextTick)
import { encode, decode, EncodeStream, DecodeStream } from '../index.js'

describe('RCNB', function() {
  it('should encode', function() {
    strictEqual(encode(new Uint8Array([114, 99, 110, 98])), 'ɌcńƁȓČņÞ')
    strictEqual(encode(new Uint8Array([222, 233, 111, 122, 222])), 'ȵßȑƈȓƇńÞƞƃ')
    strictEqual(encode(new TextEncoder('utf-8').encode('Who NB?')), 'ȐȼŃƅȓčƞÞƦȻƝƃŖć')
  })
  
  it('should decode', function() {
    deepStrictEqual(decode('ɌcńƁȓČņÞ'), new Uint8Array([114, 99, 110, 98]))
    deepStrictEqual(decode('ȵßȑƈȓƇńÞƞƃ'), new Uint8Array([222, 233, 111, 122, 222]))
    strictEqual(new TextDecoder("utf-8").decode(decode('ȐĉņþƦȻƝƃŔć')), 'RCNB!')
  })

  it('should error', async function() {
    // length & 1 == true
    throws(() => decode('ɌcńƁȓČņ'))

    // not RCNB
    throws(() => decode('cɌńƁ'))
    throws(() => decode('BcńƁ'))

    // overflow
    throws(() => decode('ɍȼȵþ'))
    throws(() => decode('ɍȼ'))
    throws(() => decode('ȵþ'))
  })
})

describe('RCNB stream', function() {
  async function waitAndRead(stream, arr) {
    await nextTick()
    arr.push(stream.read())
  }

  it('should encode from stream (partial)', async function() {
    let input = new Readable
    input._read = () => {}

    let output = input.pipe(new EncodeStream())
    output.setEncoding('utf-8')

    let results = []
    input.push(Buffer.of(222, 233))
    await waitAndRead(output, results)

    strictEqual(results.join(''), 'ȵßȑƈ')
  })

  it('should encode from stream (2+3)', async function() {
    let input = new Readable
    input._read = () => {}

    let output = input.pipe(new EncodeStream())
    output.setEncoding('utf-8')

    let results = []
    input.push(Buffer.of(222, 233))
    await waitAndRead(output, results)
    input.push(Buffer.of(111, 122, 222))
    input.push(null) // indicates EOF
    await waitAndRead(output, results)

    strictEqual(results.join(''), 'ȵßȑƈȓƇńÞƞƃ')
  })

  it('should encode from stream (3+2)', async function() {
    let input = new Readable
    input._read = () => {}

    let output = input.pipe(new EncodeStream())
    output.setEncoding('utf-8')

    let results = []
    input.push(Buffer.of(222, 233, 111))
    await waitAndRead(output, results)
    input.push(Buffer.of(122, 222))
    input.push(null) // indicates EOF
    await waitAndRead(output, results)

    strictEqual(results.join(''), 'ȵßȑƈȓƇńÞƞƃ')
  })

  it('should encode from stream (1+1+1+1+1)', async function() {
    let input = new Readable
    input._read = () => {}

    let output = input.pipe(new EncodeStream())
    output.setEncoding('utf-8')

    let results = []
    input.push(Buffer.of(222))
    await waitAndRead(output, results)
    input.push(Buffer.of(233))
    await waitAndRead(output, results)
    input.push(Buffer.of(111))
    await waitAndRead(output, results)
    input.push(Buffer.of(122))
    await waitAndRead(output, results)
    input.push(Buffer.of(222))
    input.push(null) // indicates EOF
    await waitAndRead(output, results)

    strictEqual(results.join(''), 'ȵßȑƈȓƇńÞƞƃ')
  })

  it('should encode from stream 2', async function() {
    let input = new Readable
    input._read = () => {}

    let output = input.pipe(new EncodeStream())
    output.setEncoding('utf-8')

    let results = []
    input.push(Buffer.from(new TextEncoder('utf-8').encode('Who')))
    await waitAndRead(output, results)
    input.push(Buffer.from(new TextEncoder('utf-8').encode(' NB?')))
    input.push(null) // indicates EOF
    await waitAndRead(output, results)

    strictEqual(results.join(''), 'ȐȼŃƅȓčƞÞƦȻƝƃŖć')
  })
  
  it('should decode from stream (2+3)', async function() {
    let input = new Readable
    input._read = () => {}

    let output = input.pipe(new DecodeStream())

    let results = []
    input.push(Buffer.from('ȵßȑƈ', 'utf-8'))
    await waitAndRead(output, results)
    input.push('ȓƇńÞƞƃ')
    input.push(null) // indicates EOF
    await waitAndRead(output, results)

    results = results.filter(n => n) // remove null results
    deepStrictEqual(Buffer.concat(results), Buffer.of(222, 233, 111, 122, 222))
  })

  it('should decode from stream (2.5+2.5)', async function() {
    let input = new Readable
    input._read = () => {}

    let output = input.pipe(new DecodeStream())

    let results = []
    input.push(Buffer.from('ȵßȑƈȓ', 'utf-8'))
    await waitAndRead(output, results)
    input.push('ƇńÞƞƃ')
    input.push(null) // indicates EOF
    await waitAndRead(output, results)

    results = results.filter(n => n) // remove null results
    deepStrictEqual(Buffer.concat(results), Buffer.of(222, 233, 111, 122, 222))
  })

  it('should decode from stream (3+2)', async function() {
    let input = new Readable
    input._read = () => {}

    let output = input.pipe(new DecodeStream())

    let results = []
    input.push('ȵßȑƈȓƇ')
    await waitAndRead(output, results)
    input.push('ńÞƞƃ')
    input.push(null) // indicates EOF
    await waitAndRead(output, results)

    results = results.filter(n => n) // remove null results
    deepStrictEqual(Buffer.concat(results), Buffer.of(222, 233, 111, 122, 222))
  })
})