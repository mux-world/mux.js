/* istanbul ignore file */
export {}

import { BigNumber } from 'bignumber.js'

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toApproximate(expected: BigNumber): R
    }
    interface Matchers<R, T> {
      toBeBigNumber(expected: BigNumber): R
    }
  }
}
