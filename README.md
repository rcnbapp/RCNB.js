# RCNB.js

The world is based on RC. Thus, *everything* can be encoded into RCNB.

## Install

```javascript
$ npm install --save rcnb
```

## Import

### In Browser

```html
<script src="rcnb.js"></script>
```

### node.js

```javascript
const rcnb = require('rcnb')
```

## Usage

```javascript
rcnb.encode(new TextEncoder('utf-8').encode('Who NB?')) // 'ȐȼŃƅȓčƞÞƦȻƝƃŖć'

new TextDecoder("utf-8").decode(rcnb.decode('ȐĉņþƦȻƝƃŔć')) // RCNB!
```
