#! /usr/bin/env node
import { encode, decode } from '../rcnb.js'
import { TextEncoder, TextDecoder } from 'util'
import readline from 'readline'

function runWith(transform) {
  // input from: argv or stdin
  if (process.argv[3] === '--') {
    const cli = readline.createInterface({
      input: process.stdin,
      crlfDelay: Infinity
    })
    let input = ''
    cli.on('line', function(line) { input = input + line + '\n' })
    cli.on('close', function() { console.log(transform(input)) })
  } else if (process.argv[3]) {
    console.log(transform(process.argv[3]))
  } else {
    console.error('No input detected. Please give a string for ' + transform.name + ' or input through stdin with the `--` option.')
  }
}
// encode or decode
switch (process.argv[2]) {
  case 'e':
  case 'encode':
    runWith(function encoding(str) { return encode(new TextEncoder().encode(str)) })
    break
  case 'd':
  case 'decode':
    runWith(function decoding(str) { return new TextDecoder().decode(decode(str)) })
    break
  default:
    console.error('Expected one of ["encode", "decode"], received "' + process.argv[2] + '"')
    break
}