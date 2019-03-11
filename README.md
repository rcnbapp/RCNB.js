# RCNB.js [![Build Status](https://travis-ci.com/rcnbapp/RCNB.js.svg?branch=master)](https://travis-ci.com/rcnbapp/RCNB.js)

The world is based on RC. Thus, *everything* can be encoded into RCNB.

See also: [librcnb](https://github.com/rcnbapp/librcnb) [RCNB.php](https://github.com/rcnbapp/RCNB.php)

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
<script src="rcnb.js"></script>
```

### Node.js

```javascript
const rcnb = require('rcnb')
```

## Usage

### In Code

```javascript
rcnb.encode(new Uint8Array([114, 99, 110, 98])) // 'ɌcńƁȓČņÞ'
rcnb.decode('ɌcńƁȓČņÞ') // Uint8Array [114, 99, 110, 98]

rcnb.encode(new TextEncoder('utf-8').encode('Who NB?')) // 'ȐȼŃƅȓčƞÞƦȻƝƃŖć'
new TextDecoder("utf-8").decode(rcnb.decode('ȐĉņþƦȻƝƃŔć')) // 'RCNB!'
```

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
