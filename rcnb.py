#!/usr/bin/env python3
#-*- encoding=utf-8 -*-

import math
import sys

cr = 'rRŔŕŖŗŘřƦȐȑȒȓɌɍ'
cc = 'cCĆćĈĉĊċČčƇƈÇȻȼ'
cn = 'nNŃńŅņŇňƝƞÑǸǹȠȵ'
cb = 'bBƀƁƃƄƅßÞþ'
# print(cr)
# print(cc)
# print(cn)
# print(cb)

sr = len(cr)
sc = len(cc)
sn = len(cn)
sb = len(cb)
# print(sr)
# print(sc)
# print(sn)
# print(sb)

src = sr * sc
snb = sn * sb
scnb = sc * snb
# print(src)
# print(snb)
# print(scnb)

def _div(a, b):
	return math.floor(a / b)
# print(_div(3, 4))
# print(_div(9, 4))

def _encodeByte(i):
	if i > 0xFF:
		print('rc/nb overflow')
		sys.exit(-1)
	if i > 0x7F:
		i = i & 0x7F
		return cn[_div(i, sb)] + cb[i % sb]
	return cr[_div(i, sc)] + cc[i % sc]
# t1 = _encodeByte(0x80)
# t2 = _encodeByte(0x20)
# print(t1)
# print(t2)

def _encodeShort(i):
	if i > 0xFFFF:
		print('rcnb overflow')
		sys.exit(-1)
	reverse = False
	if i > 0x7FFF:
		reverse = True
		i = i & 0x7FFF
	ch = [_div(i, scnb), _div(i % scnb, snb), _div(i % snb, sb), i % sb]
# 	print(ch)
	res = [cr[ch[0]], cc[ch[1]], cn[ch[2]], cb[ch[3]]]
# 	print(res)
	if reverse:
		return res[2] + res[3] + res[0] + res[1]
	return ''.join(res)
# t3 = _encodeShort(0x8000)
# t4 = _encodeShort(0x2000)
# print(t3)
# print(t4)

def _decodeByte(c):
	nb = False
	idx = [cr.find(c[0]), cc.find(c[1])]
# 	print(idx)
	if idx[0] < 0 or idx[1] < 0:
		idx = [cn.find(c[0]), cb.find(c[1])]
		nb = True
	if idx[0] < 0 or idx[1] < 0:
		print('not rc/nb')
		sys.exit(-1)
	result = (idx[0] * sb + idx[1]) if nb else (idx[0] * sc + idx[1])
	if result > 0x7F:
		print('rc/nb overflow')
		sys.exit(-1)
# 	print(nb)
	return (result | 0x80) if nb else result
# print(_decodeByte(t1))
# print(_decodeByte(t2))

def _decodeShort(c):
	idx = 0
	reverse = cr.find(c[0]) < 0
	if not reverse:
		idx = [cr.find(c[0]), cc.find(c[1]), cn.find(c[2]), cb.find(c[3])]
	else:
		idx = [cr.find(c[2]), cc.find(c[3]), cn.find(c[0]), cb.find(c[1])]
	if idx[0] < 0 or idx[1] < 0 or idx[2] < 0 or idx[3] < 0:
		print('not rcnb')
		sys.exit(-1)
	result = idx[0] * scnb + idx[1] * snb + idx[2] * sb + idx[3]
	if result > 0x7FFF:
		print('rcnb overflow')
		sys.exit(-1)
# 	print(reverse)
	return (reverse | 0x8000) if reverse else result
# print(_decodeShort(t3))
# print(_decodeShort(t4))

def encode(m):
	res = ''
	for i in range(len(m) >> 1):
		res += _encodeShort(ord(m[2 * i]) << 8 | ord(m[2 * i + 1]))
	if len(m) & 1 == 1:
		res += _encodeByte(ord(m[-1]))
	return res

def decode(c):
	if len(c) & 1 == 1:
		print('invalid length')
		sys.exit(-1)
	res = ''
	for i in range(len(c) >> 2):
		short = _decodeShort(c[4 * i:4 * i + 4])
		res += chr(short >> 8)
		res += chr(short & 0xFF)
	if len(c) & 2 == 2:
		res += chr(_decodeByte(c[-2:]))
	return res

# s = 'hello'
# es = encode(s)
# print(es)
# ds = decode(es)
# print(ds)

if __name__ == '__main__':
	if len(sys.argv) != 3:
		print('Usage:', sys.argv[0], 'encode [PLAIN]')
		print('      ', sys.argv[0], 'decode [ENCRYPTED]')
		sys.exit(-1)
	if sys.argv[1] == 'encode':
		res = encode(sys.argv[2])
		print('Result:', res)
		sys.exit(0)
	if sys.argv[1] == 'decode':
		res = decode(sys.argv[2])
		print('Result:', res)
		sys.exit(0)
	else:
		print('arg wrong')
		sys.exit(-1)

