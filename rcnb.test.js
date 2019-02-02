const rcnb = require('./rcnb')

let a = rcnb.encode(new TextEncoder("utf-8").encode('rcnb'))

let b = new TextDecoder("utf-8").decode(rcnb.decode(a))

console.log(a,b);