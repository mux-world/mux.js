import { _0, _1 } from '../src/constants'
import { and64, decodeSubAccountId, encodeSubAccountId, test64 } from '../src/data'
import { extendExpect } from './helper'

extendExpect()

describe('data', () => {
  it('encode / decode subAccountId', () => {
    let encoded = encodeSubAccountId('0x5b38da6a701c568545dcfcb03fcb875f56beddc4', 1, 2, true)
    expect(encoded).toBe('0x5b38da6a701c568545dcfcb03fcb875f56beddc4010201000000000000000000')

    let decoded = decodeSubAccountId(encoded)
    expect(decoded.account).toBe('0x5b38da6a701c568545dcfcb03fcb875f56beddc4')
    expect(decoded.collateralId).toBe(1)
    expect(decoded.assetId).toBe(2)
    expect(decoded.isLong).toBe(true)
  })

  it('and64, test64', () => {
    expect(and64(0x01010000000003, 0x00000000000001)).toBe(0x00000000000001)
    expect(and64(0x01010000000003, 0x00000000000100)).toBe(0x0)
    expect(and64(0x01010000000003, 0x00010000000000)).toBe(0x00010000000000)
    expect(and64(0x01010000000003, 0x01000000000000)).toBe(0x01000000000000)
    expect(test64(0x01010000000003, 0x00000000000001)).toBe(true)
    expect(test64(0x01010000000003, 0x00000000000100)).toBe(false)
    expect(test64(0x01010000000003, 0x00010000000000)).toBe(true)
    expect(test64(0x01010000000003, 0x01000000000000)).toBe(true)
  })
})
