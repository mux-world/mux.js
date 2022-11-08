import BigNumber from 'bignumber.js'
import { _0, _1 } from '../src/constants'

import { extendExpect } from './helper'

extendExpect()

describe('utils', () => {
  it('toApproximate', () => {
    expect(_0).toBeBigNumber(_0)
    expect(new BigNumber('0.00000000001')).not.toApproximate(_0)
    expect(new BigNumber('0.000000000001')).toApproximate(_0)
  })
})
