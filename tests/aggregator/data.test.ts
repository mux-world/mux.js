import BigNumber from 'bignumber.js'
import { decodeGmxAdapterOrderHistoryKey } from '../../src/aggregator/data'
import { DECIMALS } from '../../src/constants'
import { extendExpect } from '../helper'

extendExpect()

describe('aggregator:data', () => {
  it('decodeGmxAdapterOrderHistoryKey', () => {
    const decoded = decodeGmxAdapterOrderHistoryKey(
      '0x12030405060708090a0b0c0d0e0f10111213141516001718191a1b1c1d1e1f20',
      {
        symbol: 'test',
        decimals: 18,
        address: 'test',
        isAsset: false,
        isShortable: false,
        isStable: true,
        isNative: false,
        muxAssetId: undefined
      }
    )
    expect(decoded.category as number).toBe(0x01)
    expect(decoded.receiver as number).toBe(0x02)
    expect(decoded.gmxOrderIndex as number).toBe(0x030405060708090a)
    expect(decoded.borrow).toBeBigNumber(new BigNumber('0x0b0c0d0e0f10111213141516').shiftedBy(-DECIMALS))
    expect(decoded.placeOrderTime).toBe(0x1718191a1b1c1d1e1f20)
  })
})
