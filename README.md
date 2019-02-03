# RCNB.js

The world is based on RC. Thus, *everything* can be encoded into RCNB.

## Why RCNB?

### RCNB vs Base64

|           | Base64       | RCNB                                                          |
|-----------|--------------|---------------------------------------------------------------|
| Speed     | ❌ Fast       | ✔️ Slow, motivate Intel to improve their CPU                   |
| Printable | ❌ On all OS  | ✔️ Only on newer OS, motivate users to upgrade their legacy OS |
| Niubility | ❌ Not at all | ✔️ RCNB!                                                     |
| Example   | QmFzZTY0Lg== | ȐĉņþƦȻƝƃŔć                                                    |

## Install

```javascript
$ npm install --save rcnb
```

## Import

### In Browser

```html
<script src="rcnb.js"></script>
```

### Node.js

```javascript
const rcnb = require('rcnb')
```

## Usage

```javascript
rcnb.encode(new Uint8Array([114, 99, 110, 98])) // 'ɌcńƁȓČņÞ'
rcnb.decode('ɌcńƁȓČņÞ') // Uint8Array [114, 99, 110, 98]

rcnb.encode(new TextEncoder('utf-8').encode('Who NB?')) // 'ȐȼŃƅȓčƞÞƦȻƝƃŖć'
new TextDecoder("utf-8").decode(rcnb.decode('ȐĉņþƦȻƝƃŔć')) // 'RCNB!'
```
