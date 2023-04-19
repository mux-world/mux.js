import BigNumber from 'bignumber.js'
import { _0, _1 } from '../src/constants'
import { encodeSubAccountId } from '../src/data'
import { SubAccount, SubAccountComputed, Asset, PriceDict, LiquidityPool } from '../src/types'
import { extendExpect } from './helper'
import {
  computeLiquidationPrice,
  computeClosePosition,
  computeLiquidityFeeRate,
  computeOpenPosition,
  computePositionPnlUsd,
  computeSubAccount,
  computeWithdrawCollateral,
  computeWithdrawProfit
} from '../src/computations'

extendExpect()

const pool: LiquidityPool = {
  shortFundingBaseRate8H: new BigNumber('0.0001'),
  shortFundingLimitRate8H: new BigNumber('0.0008'),
  lastFundingTime: Date.now() / 1000,
  fundingInterval: 8 * 3600,
  liquidityBaseFeeRate: new BigNumber('0.00100'),
  liquidityDynamicFeeRate: new BigNumber('0.00050'),
  mlpPriceLowerBound: new BigNumber('0.9'),
  mlpPriceUpperBound: new BigNumber('1.1'),
  strictStableDeviation: new BigNumber('0.01'),
  sequence: 0
}

const assets: Asset[] = [
  {
    symbol: 'ETH',
    id: 0,
    decimals: 18,
    isStable: false,
    canAddRemoveLiquidity: true,
    isTradable: true,
    isOpenable: true,
    isShortable: true,
    useStableTokenForProfit: false,
    isEnabled: true,
    isStrictStable: false,
    tokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    muxTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1',
    referenceOracleType: 0,
    referenceOracle: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee2',
    referenceDeviation: new BigNumber(0),
    halfSpread: new BigNumber(0),
    initialMarginRate: new BigNumber('0.1'),
    maintenanceMarginRate: new BigNumber('0.05'),
    positionFeeRate: new BigNumber('0.00115'),
    minProfitRate: new BigNumber('0.001'),
    minProfitTime: 60,
    maxLongPositionSize: new BigNumber('100000'),
    maxShortPositionSize: new BigNumber('100000'),
    longFundingBaseRate8H: new BigNumber('0.0001'),
    longFundingLimitRate8H: new BigNumber('0.0008'),
    longCumulativeFundingRate: new BigNumber('0.911305096913137114'),
    shortCumulativeFunding: new BigNumber('20'),
    totalLongPosition: new BigNumber(1),
    totalShortPosition: new BigNumber(1),
    spotLiquidity: new BigNumber(1000),
    credit: new BigNumber(0),
    averageLongPrice: new BigNumber(2500),
    averageShortPrice: new BigNumber(2600),
    collectedFee: new BigNumber(100),
    spotWeight: 1,
    deduct: new BigNumber(0)
  },
  {
    symbol: 'USDC',
    id: 1,
    decimals: 6,
    isStable: true,
    canAddRemoveLiquidity: true,
    isTradable: false,
    isOpenable: false,
    isShortable: false,
    useStableTokenForProfit: false,
    isEnabled: true,
    isStrictStable: false,
    tokenAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
    muxTokenAddress: '0xccccccccccccccccccccccccccccccccccccccc1',
    referenceOracleType: 0,
    referenceOracle: '0xccccccccccccccccccccccccccccccccccccccc2',
    referenceDeviation: new BigNumber(0),
    halfSpread: new BigNumber(0),
    initialMarginRate: new BigNumber('0'),
    maintenanceMarginRate: new BigNumber('0'),
    positionFeeRate: new BigNumber('0'),
    minProfitRate: new BigNumber('0'),
    minProfitTime: 0,
    maxLongPositionSize: new BigNumber('0'),
    maxShortPositionSize: new BigNumber('0'),
    longFundingBaseRate8H: new BigNumber('0'),
    longFundingLimitRate8H: new BigNumber('0'),
    longCumulativeFundingRate: new BigNumber('0'),
    shortCumulativeFunding: new BigNumber('0'),
    totalLongPosition: new BigNumber(0),
    totalShortPosition: new BigNumber(0),
    spotLiquidity: new BigNumber(1000000),
    credit: new BigNumber(0),
    averageLongPrice: new BigNumber(0),
    averageShortPrice: new BigNumber(0),
    collectedFee: new BigNumber(10000),
    spotWeight: 2,
    deduct: new BigNumber(0)
  }
]

const accountStorage0 = {
  subAccountId: encodeSubAccountId('0x1111111111111111111111111111111111111111', 1, 0, true),
  subAccount: {
    collateral: new BigNumber('10000'),
    size: _0,
    lastIncreasedTime: 0,
    entryPrice: _0,
    entryFunding: _0
  }
}

// long. never liquidated
const accountStorage1 = {
  subAccountId: encodeSubAccountId('0x1111111111111111111111111111111111111111', 1, 0, true),
  subAccount: {
    collateral: new BigNumber('10000'),
    size: new BigNumber('2.3'),
    lastIncreasedTime: 0,
    entryPrice: new BigNumber('1000.1'),
    entryFunding: new BigNumber('0.91')
  }
}

// long
const accountStorage2 = {
  subAccountId: encodeSubAccountId('0x1111111111111111111111111111111111111111', 1, 0, true),
  subAccount: {
    collateral: new BigNumber('2000'),
    size: new BigNumber('2.3'),
    lastIncreasedTime: 0,
    entryPrice: new BigNumber('7000'),
    entryFunding: new BigNumber('0.91')
  }
}

// short
const accountStorage3 = {
  subAccountId: encodeSubAccountId('0x1111111111111111111111111111111111111111', 1, 0, false),
  subAccount: {
    collateral: new BigNumber('14000'),
    size: new BigNumber('2.3'),
    lastIncreasedTime: 0,
    entryPrice: new BigNumber('1000.1'),
    entryFunding: new BigNumber('0.91')
  }
}

describe('computeSubAccount', function () {
  const prices: PriceDict = {
    ETH: new BigNumber('6965'),
    USDC: _1
  }

  interface Case {
    subAccountId: string
    subAccount: SubAccount
    expectedOutput: SubAccountComputed
  }

  const expectOutput0: SubAccountComputed = {
    positionValueUsd: _0,
    isIMSafe: true,
    isMMSafe: true,
    isMarginSafe: true,
    fundingFeeUsd: _0,
    pendingPnlUsd: _0,
    pendingPnlAfterFundingUsd: _0,
    marginBalanceUsd: new BigNumber('10000'),
    leverage: _0,
    effectiveLeverage: _0,
    pendingRoe: _0,
    pnlUsd: _0,
    liquidationPrice: _0,
    withdrawableCollateral: new BigNumber('10000'),
    withdrawableProfit: _0
  }

  const expectOutput1: SubAccountComputed = {
    positionValueUsd: new BigNumber('16019.5'),
    isIMSafe: true,
    isMMSafe: true,
    isMarginSafe: true,
    fundingFeeUsd: new BigNumber('20.907'), // (0.911305096913137114 - 0.91) * 2.3 * 6965
    pendingPnlUsd: new BigNumber('13719.27'),
    pendingPnlAfterFundingUsd: new BigNumber('13698.363'),
    marginBalanceUsd: new BigNumber('23698.363'),
    leverage: new BigNumber('0.230023'), // 1000.1 * 2.3 / 10000
    effectiveLeverage: new BigNumber('0.67597496080214485700974366879'), // positionValueUsd / marginBalanceUsd
    pendingRoe: new BigNumber('1.3698363'),
    pnlUsd: new BigNumber('13719.27'),
    liquidationPrice: _0,
    withdrawableCollateral: new BigNumber('9749.07'), // 10000 - 1000.1 * 2.3 / 10 - fundingFeeUsd / 1
    withdrawableProfit: new BigNumber('1.96674271356783919598')
  }

  const expectOutput2: SubAccountComputed = {
    positionValueUsd: new BigNumber('16019.5'),
    isIMSafe: true,
    isMMSafe: true,
    isMarginSafe: true,
    fundingFeeUsd: new BigNumber('20.907'), // (0.911305096913137114 - 0.91) * 2.3 * 6965
    pendingPnlUsd: new BigNumber('-80.5'),
    pendingPnlAfterFundingUsd: new BigNumber('-101.407'),
    marginBalanceUsd: new BigNumber('1898.593'),
    leverage: new BigNumber('8.05'), // 7000 * 2.3 / 2000
    effectiveLeverage: new BigNumber('8.43756402767733790233083130508'), // positionValueUsd / marginBalanceUsd
    pendingRoe: new BigNumber('-0.0507035'),
    pnlUsd: new BigNumber('-80.5'),
    liquidationPrice: new BigNumber('6470.49036476650224184425'),
    withdrawableCollateral: new BigNumber('296.643'), // marginBalanceUsd - positionMarginUsd < 2000 - 7000 * 2.3 / 10 - fundingFeeUsd / 1
    withdrawableProfit: _0
  }

  const expectOutput3: SubAccountComputed = {
    positionValueUsd: new BigNumber('16019.5'),
    isIMSafe: false,
    isMMSafe: false,
    isMarginSafe: true,
    fundingFeeUsd: new BigNumber('43.907'), // (20 - 0.91) * 2.3
    pendingPnlUsd: new BigNumber('-13719.27'),
    pendingPnlAfterFundingUsd: new BigNumber('-13763.177'),
    marginBalanceUsd: new BigNumber('236.823'),
    leverage: new BigNumber('0.16430214285714'), // 1000.1 * 2.3 / 14000
    effectiveLeverage: new BigNumber('67.64334545208869070993949067'), // positionValueUsd / marginBalanceUsd
    pendingRoe: new BigNumber('-0.98308407142857142857'),
    pnlUsd: new BigNumber('-13719.27'),
    liquidationPrice: new BigNumber('6724.03227107371016009381'),
    withdrawableCollateral: _0,
    withdrawableProfit: _0
  }

  const successCases: Case[] = [
    {
      subAccountId: accountStorage0.subAccountId,
      subAccount: accountStorage0.subAccount,
      expectedOutput: expectOutput0
    },
    {
      subAccountId: accountStorage1.subAccountId,
      subAccount: accountStorage1.subAccount,
      expectedOutput: expectOutput1
    },
    {
      subAccountId: accountStorage2.subAccountId,
      subAccount: accountStorage2.subAccount,
      expectedOutput: expectOutput2
    },
    {
      subAccountId: accountStorage3.subAccountId,
      subAccount: accountStorage3.subAccount,
      expectedOutput: expectOutput3
    }
  ]

  successCases.forEach((element, index) => {
    it(`computeAccount.${index}`, function () {
      const expectedOutput = element.expectedOutput
      const { collateralPrice, assetPrice } = computeLiquidationPrice(assets, element.subAccountId, prices)
      const accountDetails = computeSubAccount(
        assets,
        element.subAccountId,
        element.subAccount,
        collateralPrice,
        assetPrice
      )
      const computed = accountDetails.computed
      expect(computed.positionValueUsd).toBeBigNumber(expectedOutput.positionValueUsd)
      expect(computed.fundingFeeUsd).toApproximate(expectedOutput.fundingFeeUsd)
      expect(computed.pendingPnlUsd).toApproximate(expectedOutput.pendingPnlUsd)
      expect(computed.pendingPnlAfterFundingUsd).toApproximate(expectedOutput.pendingPnlAfterFundingUsd)
      expect(computed.marginBalanceUsd).toApproximate(expectedOutput.marginBalanceUsd)
      expect(computed.isIMSafe).toEqual(expectedOutput.isIMSafe)
      expect(computed.isMMSafe).toEqual(expectedOutput.isMMSafe)
      expect(computed.isMarginSafe).toEqual(expectedOutput.isMarginSafe)
      expect(computed.leverage).toApproximate(expectedOutput.leverage)
      expect(computed.pendingRoe).toApproximate(expectedOutput.pendingRoe)
      expect(computed.pnlUsd).toApproximate(expectedOutput.pnlUsd)
      expect(computed.liquidationPrice).toApproximate(expectedOutput.liquidationPrice)
      expect(computed.withdrawableCollateral).toApproximate(expectedOutput.withdrawableCollateral)
      expect(computed.withdrawableProfit).toApproximate(expectedOutput.withdrawableProfit)
    })
    it(`computeWithdrawCollateral.${index}`, function () {
      const { collateralPrice, assetPrice } = computeLiquidationPrice(assets, element.subAccountId, prices)
      const accountDetails = computeSubAccount(
        assets,
        element.subAccountId,
        element.subAccount,
        collateralPrice,
        assetPrice
      )
      if (accountDetails.computed.withdrawableCollateral.eq(_0)) {
        return
      }
      const amount = accountDetails.computed.withdrawableCollateral.times('0.99999999') // relax
      const after = computeWithdrawCollateral(assets, element.subAccountId, element.subAccount, prices, amount)
      expect(after.isTradeSafe).toBeTruthy()
      expect(after.afterTrade.computed.withdrawableCollateral.lt('1e-3')).toBeTruthy()
    })
    it(`computeWithdrawProfit.${index}`, function () {
      const { collateralPrice, assetPrice } = computeLiquidationPrice(assets, element.subAccountId, prices)
      const accountDetails = computeSubAccount(
        assets,
        element.subAccountId,
        element.subAccount,
        collateralPrice,
        assetPrice
      )
      if (accountDetails.computed.withdrawableProfit.eq(_0)) {
        return
      }
      const amount = accountDetails.computed.withdrawableProfit.times('0.99999999') // relax
      const after = computeWithdrawProfit(assets, element.subAccountId, element.subAccount, 0, prices, amount)
      expect(after.isTradeSafe).toBeTruthy()
      expect(after.afterTrade.computed.withdrawableProfit.lt('1e-3')).toBeTruthy()
    })
  })
})

describe('computePositionPnlUsd', function () {
  let position: SubAccount = {
    collateral: _0,
    size: _1,
    entryPrice: new BigNumber(1000),
    entryFunding: _0,
    lastIncreasedTime: Math.ceil(Date.now() / 1000)
  }

  it('long, large profit', () => {
    const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(assets[0], position, true, _1, new BigNumber('1001'))
    expect(pendingPnlUsd).toBeBigNumber(new BigNumber('1'))
    expect(pnlUsd).toBeBigNumber(new BigNumber('1'))
  })

  it('long, small profit', () => {
    const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(assets[0], position, true, _1, new BigNumber('1000.1'))
    expect(pendingPnlUsd).toBeBigNumber(new BigNumber('0.1'))
    expect(pnlUsd).toBeBigNumber(new BigNumber('0'))
  })

  it('long, small profit, older', () => {
    const olderPosition = { ...position, lastIncreasedTime: Math.ceil(Date.now() / 1000 - 86400) }
    const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(assets[0], olderPosition, true, _1, new BigNumber('1000.1'))
    expect(pendingPnlUsd).toBeBigNumber(new BigNumber('0.1'))
    expect(pnlUsd).toBeBigNumber(new BigNumber('0.1'))
  })

  it('long, loss', () => {
    const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(assets[0], position, true, _1, new BigNumber('999.9'))
    expect(pendingPnlUsd).toBeBigNumber(new BigNumber('-0.1'))
    expect(pnlUsd).toBeBigNumber(new BigNumber('-0.1'))
  })

  it('short, large profit', () => {
    const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(assets[0], position, false, _1, new BigNumber('999'))
    expect(pendingPnlUsd).toBeBigNumber(new BigNumber('1'))
    expect(pnlUsd).toBeBigNumber(new BigNumber('1'))
  })

  it('short, small profit', () => {
    const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(assets[0], position, false, _1, new BigNumber('999.9'))
    expect(pendingPnlUsd).toBeBigNumber(new BigNumber('0.1'))
    expect(pnlUsd).toBeBigNumber(new BigNumber('0'))
  })

  it('short, small profit, older', () => {
    const olderPosition = { ...position, lastIncreasedTime: Math.ceil(Date.now() / 1000 - 86400) }
    const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(assets[0], olderPosition, false, _1, new BigNumber('999.9'))
    expect(pendingPnlUsd).toBeBigNumber(new BigNumber('0.1'))
    expect(pnlUsd).toBeBigNumber(new BigNumber('0.1'))
  })

  it('short, loss', () => {
    const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(assets[0], position, false, _1, new BigNumber('1000.1'))
    expect(pendingPnlUsd).toBeBigNumber(new BigNumber('-0.1'))
    expect(pnlUsd).toBeBigNumber(new BigNumber('-0.1'))
  })
})

describe('trade fail', function () {
  const prices: PriceDict = {
    ETH: new BigNumber('6965'),
    USDC: _1
  }

  it('decrease flat', function () {
    expect((): void => {
      computeClosePosition(assets, accountStorage0.subAccountId, accountStorage0.subAccount, 1, prices, _1, _0)
    }).toThrow('invalid amount 1')
  })

  it('decrease zero price', function () {
    expect((): void => {
      computeClosePosition(
        assets,
        accountStorage1.subAccountId,
        accountStorage1.subAccount,
        1,
        {
          ETH: _0,
          USDC: _0
        },
        _1,
        _0
      )
    }).toThrow('invalid price[USDC]')
  })

  it('decrease zero amount', function () {
    expect((): void => {
      computeClosePosition(assets, accountStorage1.subAccountId, accountStorage1.subAccount, 1, prices, _0, _0)
    }).toThrow('invalid amount 0')
  })

  it('decrease large amount', function () {
    expect((): void => {
      computeClosePosition(
        assets,
        accountStorage1.subAccountId,
        accountStorage1.subAccount,
        1,
        prices,
        new BigNumber(3),
        _0
      )
    }).toThrow('invalid amount 3')
  })

  it('decrease negated', function () {
    expect((): void => {
      computeClosePosition(
        assets,
        accountStorage1.subAccountId,
        accountStorage1.subAccount,
        1,
        prices,
        new BigNumber(-1),
        _0
      )
    }).toThrow('invalid amount -1')
  })

  it('decrease USDC', function () {
    expect((): void => {
      computeClosePosition(
        assets,
        encodeSubAccountId('0x1111111111111111111111111111111111111111', 0, 1, true),
        accountStorage1.subAccount,
        1,
        prices,
        _1,
        _0
      )
    }).toThrow('not tradable')
  })

  it('increase zero price', function () {
    expect((): void => {
      computeOpenPosition(
        assets,
        accountStorage1.subAccountId,
        accountStorage1.subAccount,
        {
          ETH: _0,
          USDC: _0
        },
        _1,
        _0
      )
    }).toThrow('invalid price[USDC]')
  })

  it('increase zero amount', function () {
    expect((): void => {
      computeOpenPosition(assets, accountStorage1.subAccountId, accountStorage1.subAccount, prices, _0, _0)
    }).toThrow('invalid amount 0')
  })

  it('increase negated', function () {
    expect((): void => {
      computeOpenPosition(
        assets,
        accountStorage1.subAccountId,
        accountStorage1.subAccount,
        prices,
        new BigNumber(-1),
        _0
      )
    }).toThrow('invalid amount -1')
  })

  it('increase USDC', function () {
    expect((): void => {
      computeOpenPosition(
        assets,
        encodeSubAccountId('0x1111111111111111111111111111111111111111', 0, 1, true),
        accountStorage1.subAccount,
        prices,
        _1,
        _0
      )
    }).toThrow('not tradable')
  })
})

describe('openPosition', function () {
  interface Case {
    name: string
    input: {
      subAccountId: string
      subAccount: SubAccount
      price: BigNumber
      amount: BigNumber
      feeRate: BigNumber
    }
    expectedOutput: {
      collateral: BigNumber
      marginBalanceUsd: BigNumber
      size: BigNumber
      entryPrice: BigNumber
      entryFunding: BigNumber
      isTradeSafe: boolean
      feeUsd: BigNumber
    }
  }

  const successCases: Case[] = [
    {
      name: 'open long, profit',
      input: {
        subAccountId: accountStorage1.subAccountId,
        subAccount: accountStorage1.subAccount,
        price: new BigNumber('2000'),
        amount: new BigNumber('1'),
        feeRate: new BigNumber('0.01')
      },
      expectedOutput: {
        // 2000 * 1 * 0.01 + (0.911305096913137114 - 0.91) * 2.3 * 2000
        feeUsd: new BigNumber('26.00344580043072440000000000'),
        // 10000 - fee
        collateral: new BigNumber('9973.99655419956927560000000000'),
        // collateral + (2000 - 1000.1) * 2.3
        marginBalanceUsd: new BigNumber('12273.7665541995692756000000000'),
        size: new BigNumber('3.3'),
        entryPrice: new BigNumber('1303.1'),
        entryFunding: new BigNumber('0.911305096913137114'),
        isTradeSafe: true
      }
    }
  ]

  successCases.forEach(element => {
    it(element.name, function () {
      const expectedOutput = element.expectedOutput
      const tradeAssets = [
        {
          ...assets[0],
          positionFeeRate: element.input.feeRate
        },
        assets[1]
      ]
      const tradePrices = {
        ETH: element.input.price,
        USDC: _1
      }
      const result = computeOpenPosition(
        tradeAssets,
        element.input.subAccountId,
        element.input.subAccount,
        tradePrices,
        element.input.amount,
        _0
      )
      expect(result.feeUsd).toApproximate(element.expectedOutput.feeUsd)
      expect(result.afterTrade.subAccount.collateral).toApproximate(element.expectedOutput.collateral)
      expect(result.afterTrade.computed.marginBalanceUsd).toApproximate(element.expectedOutput.marginBalanceUsd)
      expect(result.afterTrade.subAccount.size).toApproximate(element.expectedOutput.size)
      expect(result.afterTrade.subAccount.entryPrice).toApproximate(element.expectedOutput.entryPrice)
      expect(result.afterTrade.subAccount.entryFunding).toApproximate(element.expectedOutput.entryFunding)
      expect(result.isTradeSafe).toEqual(expectedOutput.isTradeSafe)
    })
  })
})

describe('closePosition', function () {
  interface Case {
    name: string
    input: {
      subAccountId: string
      subAccount: SubAccount
      price: BigNumber
      profitAssetId: number
      amount: BigNumber
      feeRate: BigNumber
    }
    expectedOutput: {
      collateral: BigNumber
      marginBalanceUsd: BigNumber
      size: BigNumber
      entryPrice: BigNumber
      entryFunding: BigNumber
      isTradeSafe: boolean
      feeUsd: BigNumber
      profitAssetTransferred: BigNumber
      muxTokenTransferred: BigNumber
    }
  }

  const successCases: Case[] = [
    {
      name: 'close long, profit',
      input: {
        subAccountId: accountStorage1.subAccountId,
        subAccount: accountStorage1.subAccount,
        price: new BigNumber('2000'),
        profitAssetId: 1,
        amount: new BigNumber('1'),
        feeRate: new BigNumber('0.01')
      },
      expectedOutput: {
        // 2000 * 1 * 0.01 + (0.911305096913137114 - 0.91) * 2.3 * 2000
        feeUsd: new BigNumber('26.00344580043072440000000000'),
        collateral: new BigNumber('10000'),
        // collateral + (2000 - 1000.1) * 1.3
        marginBalanceUsd: new BigNumber('11299.87'),
        size: new BigNumber('1.3'),
        entryPrice: new BigNumber('1000.1'),
        entryFunding: new BigNumber('0.911305096913137114'),
        isTradeSafe: true,
        // ((2000 - 1000.1) * 1 - fee) / 2000
        profitAssetTransferred: new BigNumber('0.48694827709978463780000000000'),
        muxTokenTransferred: new BigNumber('0')
      }
    },
    {
      name: 'close long, loss',
      input: {
        subAccountId: accountStorage1.subAccountId,
        subAccount: accountStorage1.subAccount,
        price: new BigNumber('900'),
        profitAssetId: 1,
        amount: new BigNumber('1'),
        feeRate: new BigNumber('0.01')
      },
      expectedOutput: {
        // 900 * 1 * 0.01 + (0.911305096913137114 - 0.91) * 2.3 * 900
        feeUsd: new BigNumber('11.70155061019382598000000000'),
        // 10000 - fee + (900 - 1000.1) * 1
        collateral: new BigNumber('9888.19844938980617402000000000'),
        // collateral + (900 - 1000.1) * 1.3
        marginBalanceUsd: new BigNumber('9758.06844938980617402000000000'),
        size: new BigNumber('1.3'),
        entryPrice: new BigNumber('1000.1'),
        entryFunding: new BigNumber('0.911305096913137114'),
        isTradeSafe: true,
        profitAssetTransferred: new BigNumber('0'),
        muxTokenTransferred: new BigNumber('0')
      }
    },
    {
      name: 'close short, profit',
      input: {
        subAccountId: accountStorage3.subAccountId,
        subAccount: accountStorage3.subAccount,
        price: new BigNumber('900'),
        profitAssetId: 1,
        amount: new BigNumber('1'),
        feeRate: new BigNumber('0.01')
      },
      expectedOutput: {
        // 900 * 1 * 0.01 + (20 - 0.91) * 2.3
        feeUsd: new BigNumber('52.907'),
        collateral: new BigNumber('14000'),
        // collateral + (1000.1 - 900) * 1.3
        marginBalanceUsd: new BigNumber('14130.13'),
        size: new BigNumber('1.3'),
        entryPrice: new BigNumber('1000.1'),
        entryFunding: new BigNumber('20'),
        isTradeSafe: true,
        // ((1000.1 - 900) * 1 - fee)
        profitAssetTransferred: new BigNumber('47.193'),
        muxTokenTransferred: new BigNumber('0')
      }
    },
    {
      name: 'close short, loss',
      input: {
        subAccountId: accountStorage3.subAccountId,
        subAccount: accountStorage3.subAccount,
        price: new BigNumber('2000'),
        profitAssetId: 1,
        amount: new BigNumber('1'),
        feeRate: new BigNumber('0.01')
      },
      expectedOutput: {
        // 2000 * 1 * 0.01 + (20 - 0.91) * 2.3
        feeUsd: new BigNumber('63.907'),
        // 14000 - (2000 - 1000.1) * 1 - fee
        collateral: new BigNumber('12936.193'),
        // collateral - (2000 - 1000.1) * 1.3
        marginBalanceUsd: new BigNumber('11636.323'),
        size: new BigNumber('1.3'),
        entryPrice: new BigNumber('1000.1'),
        entryFunding: new BigNumber('20'),
        isTradeSafe: true,
        profitAssetTransferred: new BigNumber('0'),
        muxTokenTransferred: new BigNumber('0')
      }
    }
  ]

  successCases.forEach(element => {
    it(element.name, function () {
      const expectedOutput = element.expectedOutput
      const tradeAssets = [
        {
          ...assets[0],
          positionFeeRate: element.input.feeRate
        },
        assets[1]
      ]
      const tradePrices = {
        ETH: element.input.price,
        USDC: _1
      }
      const result = computeClosePosition(
        tradeAssets,
        element.input.subAccountId,
        element.input.subAccount,
        element.input.profitAssetId,
        tradePrices,
        element.input.amount,
        _0
      )
      expect(result.feeUsd).toApproximate(element.expectedOutput.feeUsd)
      expect(result.afterTrade.subAccount.collateral).toApproximate(element.expectedOutput.collateral)
      expect(result.afterTrade.computed.marginBalanceUsd).toApproximate(element.expectedOutput.marginBalanceUsd)
      expect(result.afterTrade.subAccount.size).toApproximate(element.expectedOutput.size)
      expect(result.afterTrade.subAccount.entryPrice).toApproximate(element.expectedOutput.entryPrice)
      expect(result.afterTrade.subAccount.entryFunding).toApproximate(element.expectedOutput.entryFunding)
      expect(result.isTradeSafe).toEqual(expectedOutput.isTradeSafe)
      expect(result.profitAssetTransferred).toApproximate(element.expectedOutput.profitAssetTransferred)
      expect(result.muxTokenTransferred).toApproximate(element.expectedOutput.muxTokenTransferred)
    })
  })
})

describe('computeLiquidityFeeRate', () => {
  interface Case {
    input: {
      current: BigNumber
      target: BigNumber
      isAdd: boolean
      amount: BigNumber
    }
    expectedOutput: BigNumber
  }

  const successCases: Case[] = [
    // current 29700, target 29700
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('29700'),
        isAdd: true,
        amount: new BigNumber('1000')
      },
      expectedOutput: new BigNumber('0.00100')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('29700'),
        isAdd: true,
        amount: new BigNumber('5000')
      },
      expectedOutput: new BigNumber('0.00104')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('29700'),
        isAdd: false,
        amount: new BigNumber('1000')
      },
      expectedOutput: new BigNumber('0.00100')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('29700'),
        isAdd: false,
        amount: new BigNumber('5000')
      },
      expectedOutput: new BigNumber('0.00104')
    },
    // current 29700, target 14850
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('14850'),
        isAdd: true,
        amount: new BigNumber('1000')
      },
      expectedOutput: new BigNumber('0.00150')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('14850'),
        isAdd: true,
        amount: new BigNumber('20000')
      },
      expectedOutput: new BigNumber('0.00150')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('14850'),
        isAdd: false,
        amount: new BigNumber('1000')
      },
      expectedOutput: new BigNumber('0.00050')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('14850'),
        isAdd: false,
        amount: new BigNumber('25000')
      },
      expectedOutput: new BigNumber('0.00050')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('14850'),
        isAdd: false,
        amount: new BigNumber('29700')
      },
      expectedOutput: new BigNumber('0.00150')
    },
    // current 29700, target 37270
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('37270'),
        isAdd: true,
        amount: new BigNumber('1000')
      },
      expectedOutput: new BigNumber('0.00090')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('37270'),
        isAdd: true,
        amount: new BigNumber('10000')
      },
      expectedOutput: new BigNumber('0.00090')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('37270'),
        isAdd: false,
        amount: new BigNumber('1000')
      },
      expectedOutput: new BigNumber('0.00110')
    },
    {
      input: {
        current: new BigNumber('29700'),
        target: new BigNumber('37270'),
        isAdd: false,
        amount: new BigNumber('10000')
      },
      expectedOutput: new BigNumber('0.00116')
    }
  ]
  successCases.forEach(element => {
    it(`${element.input.current}-${element.input.target}, ${element.input.amount}`, function () {
      const fee = computeLiquidityFeeRate(
        pool,
        element.input.current,
        element.input.target,
        element.input.isAdd,
        element.input.amount
      )
      expect(fee).toBeBigNumber(element.expectedOutput)
    })
  })
})
