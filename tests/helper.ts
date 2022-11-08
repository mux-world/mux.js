import { BigNumber } from 'bignumber.js'
import { _0 } from '../src/constants'
import './jtest.d'

export function extendExpect() {
  expect.extend({
    toApproximate(received: BigNumber, expected: BigNumber) {
      const expectError: BigNumber = new BigNumber('1e-12')
      let pass: boolean
      let error: BigNumber
      if (received.isFinite() && expected.isFinite()) {
        error = received.minus(expected).abs()
        pass = error.isLessThanOrEqualTo(expectError)
      } else if (received.toString() === expected.toString()) {
        pass = true
        error = _0
      } else {
        pass = false
        error = new BigNumber('NaN')
      }

      const message = pass
        ? () =>
            this.utils.matcherHint('.not.toApproximate') +
            '\n\n' +
            `Expected value to not approximate:\n` +
            `  ${this.utils.printExpected(expected)}\n` +
            `Received:\n` +
            `  ${this.utils.printReceived(received)}` +
            `Error:\n` +
            `  ${error.toString()}`
        : () => {
            return (
              this.utils.matcherHint('.toApproximate') +
              '\n\n' +
              `Expected value to approximate:\n` +
              `  ${this.utils.printExpected(expected)}\n` +
              `Received:\n` +
              `  ${this.utils.printReceived(received)}`
            )
          }

      return { pass, message }
    },
    toBeBigNumber(received: BigNumber, expected: BigNumber) {
      let pass = received.isEqualTo(expected)
      const message = pass
        ? () =>
            this.utils.matcherHint('.not.toBeBigNumber') +
            '\n\n' +
            `Expected value to not be BigNumber:\n` +
            `  ${this.utils.printExpected(expected)}\n` +
            `Received:\n` +
            `  ${this.utils.printReceived(received)}`
        : () => {
            return (
              this.utils.matcherHint('.toBeBigNumber') +
              '\n\n' +
              `Expected value to be BigNumber:\n` +
              `  ${this.utils.printExpected(expected)}\n` +
              `Received:\n` +
              `  ${this.utils.printReceived(received)}`
            )
          }
      return { pass, message }
    }
  })
}
