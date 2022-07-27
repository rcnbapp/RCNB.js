# RCNB.js ![Node.js CI](https://github.com/rcnbapp/RCNB.js/workflows/build/badge.svg)

The world is based on RC. Thus, *everything* can be encoded into RCNB.

RCNB is available in various languages: **JavaScript** [C](https://github.com/rcnbapp/librcnb) [PHP](https://github.com/rcnbapp/RCNB.php) [Pascal](https://github.com/rcnbapp/RCNB.pas) ([more..](https://github.com/rcnbapp/))

## Why RCNB?

### RCNB vs Base64

|           | Base64       | RCNB                                                          |
|-----------|--------------|---------------------------------------------------------------|
| Speed     | ❌ Fast       | ✔️ Slow, motivate Intel to improve their CPU                   |
| Printable | ❌ On all OS  | ✔️ Only on newer OS, motivate users to upgrade their legacy OS |
| Niubility | ❌ Not at all | ✔️ RCNB!                                                     |
| Example   | QmFzZTY0Lg== | ȐĉņþƦȻƝƃŔć                                                    |

## Install

```bash
$ npm install --save rcnb # Add RCNB.js to your package
$ npm install -g rcnb # Install RCNB.js as a global CLI
```

## Import

### In Browser

```html
<script type="module">
  import rcnb from 'https://cdn.jsdelivr.net/npm/rcnb@2/rcnb.min.js'
</script>
```

### Node.js

```javascript
import rcnb from 'rcnb'
```

## Usage

### In Code

```javascript
rcnb.encode(new Uint8Array([114, 99, 110, 98])) // 'ɌcńƁȓČņÞ'
rcnb.decode('ɌcńƁȓČņÞ') // Uint8Array [114, 99, 110, 98]

rcnb.encode(new TextEncoder('utf-8').encode('Who NB?')) // 'ȐȼŃƅȓčƞÞƦȻƝƃŖć'
new TextDecoder('utf-8').decode(rcnb.decode('ȐĉņþƦȻƝƃŔć')) // 'RCNB!'
```

### With NodeJS Stream API
```js
import fs from 'fs'
import { EncodeStream, DecodeStream } from 'rcnb'

fs.createReadStream('input.txt')
  .pipe(new EncodeStream())
  .pipe(fs.createWriteStream('rcnb.txt'))

fs.createReadStream('rcnb.txt')
  .pipe(new DecodeStream())
  .pipe(fs.createWriteStream('output.txt'))
```

#### `EncodeStream([options])` / `DecodeStream([options])`
Support all available options of [stream.Transform](https://nodejs.org/api/stream.html#stream_class_stream_transform)

> Note that only streams of **Buffer** or **string** are supported.

### CLI

```bash
$ rcnb encode "Who NB?"
#   ȐȼŃƅȓčƞÞƦȻƝƃŖć

$ rcnb decode "ȐĉņþƦȻƝƃŔć"
#   RCNB!

$ echo "The world is based on RC thus RCNB" >rcnb.txt
$ rcnb encode -- <rcnb.txt # With the option `--`, RCNB.js CLI reads from stdin.
#   ȐčnÞȒċƝÞɌČǹƄɌcŅƀȒĉȠƀȒȼȵƄŕƇŅbȒCŅßȒČnƅŕƇņƁȓċȵƀȐĉņþŕƇņÞȒȻŅBɌCňƀȐĉņþƦȻƝƃrƇ
```
