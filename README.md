# RCNB.js

The world is based on RC. Thus, *everything* can be encoded into RCNB.

## Install

```javascript
$ npm install --save rcnb
```

## Usage

rcnb.encode(new TextEncoder('utf-8').encode('Who NB?')) // 'ȐȼŃƅȓčƞÞƦȻƝƃŖć'

new TextDecoder("utf-8").decode(rcnb.decode('ȐĉņþƦȻƝƃŔć')) // RCNB!