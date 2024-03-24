import BigNumber from 'bignumber.js'
import { _0, _1 } from '../../src/constants'
import { extendExpect } from '../helper'
import { encodeDegenSubAccountId } from '../../src/degen/data'
import { DegenAsset, DegenPool, DegenSubAccount } from '../../src/degen/types'
import {
  computeDegenClosePosition,
  computeDegenFundingRateApy,
  computeDegenOpenPosition,
  computeDegenSubAccount
} from '../../src/degen/computations'
import { InsufficientLiquidityError } from '../../src/types'

extendExpect()

const pool: DegenPool = {
  fundingInterval: 3600,
  liquidityFeeRate: new BigNumber('0.0001'),
  liquidityCapUsd: new BigNumber('1000000'),
  borrowingRateApy: new BigNumber('0.01'),
  sequence: 0,
  lastFundingTime: 0
}

const assets: DegenAsset[] = [
  {
    id: 0,
    symbol: 'USDC',
    tokenAddress: '0xcccccccccccccccccccccccccccccccccccccc',
    decimals: 6,
    lotSize: new BigNumber(0),
    initialMarginRate: new BigNumber(0),
    maintenanceMarginRate: new BigNumber(0),
    positionFeeRate: new BigNumber(0),
    liquidationFeeRate: new BigNumber(0),
    minProfitRate: new BigNumber(0),
    minProfitTime: 0,
    maxLongPositionSize: new BigNumber(0),
    maxShortPositionSize: new BigNumber(0),
    fundingAlpha: new BigNumber(0),
    fundingBetaApy: new BigNumber(0),
    referenceOracleType: 0,
    referenceOracle: '',
    referenceDeviation: new BigNumber(0),
    adlReserveRate: new BigNumber(0),
    adlMaxPnlRate: new BigNumber(0),
    adlTriggerRate: new BigNumber(0),
    flags: 0,
    isStable: true,
    canAddRemoveLiquidity: true,
    isTradable: false,
    isOpenable: false,
    isShortable: false,
    isEnabled: true,
    isStrictStable: true,
    spotLiquidity: new BigNumber('1000000'),
    totalLongPosition: new BigNumber(0),
    totalShortPosition: new BigNumber(0),
    averageLongPrice: new BigNumber(0),
    averageShortPrice: new BigNumber(0),
    longCumulativeFunding: new BigNumber(0),
    shortCumulativeFunding: new BigNumber(0)
  },
  {
    id: 1,
    symbol: 'XXX',
    tokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    decimals: 18,
    lotSize: new BigNumber('0.1'),
    initialMarginRate: new BigNumber('0.10'),
    maintenanceMarginRate: new BigNumber('0.05'),
    positionFeeRate: new BigNumber('0.001'),
    liquidationFeeRate: new BigNumber('0.002'),
    minProfitRate: new BigNumber('0.01'),
    minProfitTime: 10,
    maxLongPositionSize: new BigNumber('10000000'),
    maxShortPositionSize: new BigNumber('10000000'),
    fundingAlpha: new BigNumber('20000'),
    fundingBetaApy: new BigNumber('0.20'),
    referenceOracleType: 0,
    referenceOracle: '',
    referenceDeviation: new BigNumber(0),
    adlReserveRate: new BigNumber('0.80'),
    adlMaxPnlRate: new BigNumber('0.50'),
    adlTriggerRate: new BigNumber('0.90'),
    flags: 0,
    isStable: false,
    canAddRemoveLiquidity: false,
    isTradable: true,
    isOpenable: true,
    isShortable: true,
    isEnabled: true,
    isStrictStable: false,
    spotLiquidity: new BigNumber(0),
    totalLongPosition: new BigNumber(0),
    totalShortPosition: new BigNumber(0),
    averageLongPrice: new BigNumber(0),
    averageShortPrice: new BigNumber(0),
    longCumulativeFunding: new BigNumber('0.000027397260273972'),
    shortCumulativeFunding: new BigNumber('0.000027397260273972')
  }
]

const longSubAccountId = encodeDegenSubAccountId('0x1111111111111111111111111111111111111111', 0, 1, true)
const longSubAccount0: DegenSubAccount = {
  collateral: new BigNumber('1000'),
  size: _0,
  lastIncreasedTime: 0,
  entryPrice: _0,
  entryFunding: _0
}

const shortSubAccountId = encodeDegenSubAccountId('0x1111111111111111111111111111111111111111', 0, 1, false)
const shortSubAccount0: DegenSubAccount = {
  collateral: new BigNumber('1000'),
  size: _0,
  lastIncreasedTime: 0,
  entryPrice: _0,
  entryFunding: _0
}

describe('compute degen pool', function() {
  it('empty', function() {
    const collateralPrice = new BigNumber(1)
    const markPrice = new BigNumber(1000)
    const accountDetails = computeDegenSubAccount(assets, longSubAccountId, longSubAccount0, collateralPrice, markPrice)
    const computed = accountDetails.computed
    expect(computed.positionValueUsd).toBeBigNumber(_0)
    expect(computed.marginBalanceUsd).toBeBigNumber(new BigNumber('1000'))
    expect(computed.isIMSafe).toEqual(true)
    expect(computed.isMMSafe).toEqual(true)
    expect(computed.isMarginSafe).toEqual(true)
    expect(computed.leverage).toApproximate(_0)
    expect(computed.fundingFeeUsd).toApproximate(_0)
    expect(computed.pendingPnlUsd).toApproximate(_0)
    expect(computed.pendingPnlAfterFundingUsd).toApproximate(_0)
    expect(computed.pendingRoe).toApproximate(_0)
    expect(computed.pnlUsd).toApproximate(_0)
    expect(computed.liquidationPrice).toApproximate(_0)
    expect(computed.withdrawableCollateral).toApproximate(new BigNumber('1000'))
  })

  it('open short + close short', function() {
    // open
    const assets1 = [
      {
        ...assets[0],
        spotLiquidity: new BigNumber('999899')
      },
      {
        ...assets[1],
        longCumulativeFunding: new BigNumber('0.000054794520547944'),
        shortCumulativeFunding: new BigNumber('0.000054794520547944')
      }
    ]
    const afterOpen = computeDegenOpenPosition(
      assets1,
      shortSubAccountId,
      shortSubAccount0,
      new BigNumber('2000'), // tradingPrice
      {
        USDC: _1,
        XXX: new BigNumber('2001')
      },
      new BigNumber(1), // amount
      _0 // brokerGasFee: BigNumber
    )
    expect(afterOpen.isTradeSafe).toEqual(true)
    expect(afterOpen.fundingFeeUsd).toBeBigNumber(_0)
    expect(afterOpen.feeUsd).toBeBigNumber(new BigNumber('2')) // 2000 * 1 * 0.1% = 2
    expect(afterOpen.afterTrade.subAccount.collateral).toBeBigNumber(new BigNumber('998')) // 10000 - 2
    expect(afterOpen.afterTrade.subAccount.size).toBeBigNumber(new BigNumber('1'))
    expect(afterOpen.afterTrade.subAccount.entryFunding).toBeBigNumber(new BigNumber('0.000054794520547944'))
    expect(afterOpen.afterTrade.subAccount.entryPrice).toBeBigNumber(new BigNumber('2000'))
    expect(afterOpen.afterTrade.computed.positionValueUsd).toBeBigNumber(new BigNumber('2001')) // 2001 * 1
    expect(afterOpen.afterTrade.computed.fundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(afterOpen.afterTrade.computed.pendingPnlUsd).toApproximate(new BigNumber('-1')) // (2000 - 2001) * 1
    expect(afterOpen.afterTrade.computed.pendingPnlAfterFundingUsd).toApproximate(new BigNumber('-1'))
    expect(afterOpen.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('-1'))
    expect(afterOpen.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('997')) // collateral + pnl
    expect(afterOpen.afterTrade.computed.isIMSafe).toEqual(true)
    expect(afterOpen.afterTrade.computed.isMMSafe).toEqual(true)
    expect(afterOpen.afterTrade.computed.isMarginSafe).toEqual(true)
    expect(afterOpen.afterTrade.computed.leverage).toApproximate(new BigNumber('2.00400801603206412825651302605')) // entry * size / collateral
    expect(afterOpen.afterTrade.computed.pendingRoe).toApproximate(new BigNumber('-0.00100200400801603206412825651303')) // pnl / collateral
    // close with funding
    const assets2 = [
      {
        ...assets[0],
        spotLiquidity: new BigNumber('999899')
      },
      {
        ...assets[1],
        longCumulativeFunding: new BigNumber('0.000575342465753422'),
        shortCumulativeFunding: new BigNumber('0.000082191780821916')
      }
    ]
    const afterClose = computeDegenClosePosition(
      assets2,
      shortSubAccountId,
      afterOpen.afterTrade.subAccount,
      0, // profitAssetId
      new BigNumber('1900'), // tradingPrice, pnlUsd = (2000 - 1900) * 1 = 100
      {
        USDC: _1,
        XXX: new BigNumber('1910')
      },
      new BigNumber(1), // amount
      _0 // brokerGasFee: BigNumber
    )
    expect(afterClose.isTradeSafe).toEqual(true)
    expect(afterClose.fundingFeeUsd).toBeBigNumber(new BigNumber('0.054794520547944')) // 2000 * 1 * 1% / 365
    expect(afterClose.feeUsd).toBeBigNumber(new BigNumber('1.954794520547944000')) // 1900 * 1 * 0.1% + 0 + 2000 * 1 * 1% / 365
    expect(afterClose.profitAssetTransferred).toBeBigNumber(new BigNumber('98.045205479452056')) // pnl - fee = 100 - 1.954794520547944000 = 98.045205479452056
    expect(afterClose.afterTrade.subAccount.collateral).toBeBigNumber(new BigNumber('998')) // unchanged, because pnl was sent
    expect(afterClose.afterTrade.subAccount.size).toBeBigNumber(new BigNumber('0'))
    expect(afterClose.afterTrade.subAccount.entryFunding).toBeBigNumber(new BigNumber('0'))
    expect(afterClose.afterTrade.subAccount.entryPrice).toBeBigNumber(new BigNumber('0'))
  })

  it('short withdrawableCollateral', function() {
    const assets2 = [
      {
        ...assets[0],
        spotLiquidity: new BigNumber('999899')
      },
      {
        ...assets[1],
        longCumulativeFunding: new BigNumber('0.000575342465753422'),
        shortCumulativeFunding: new BigNumber('0.000082191780821916')
      }
    ]
    const account: DegenSubAccount = {
      collateral: new BigNumber('998'),
      size: new BigNumber('1'),
      entryFunding: new BigNumber('0.000054794520547944'),
      entryPrice: new BigNumber('2000'),
      lastIncreasedTime: 0
    }
    const estimate = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      account,
      new BigNumber('1'),
      new BigNumber('2000') // pnl = 0, funding = 2000 * 1 * 1% / 365 = 0.054794520547944
    )
    // verify
    expect(estimate.computed.withdrawableCollateral).toApproximate(new BigNumber('797.945205479452056'))
    const afterWithdraw1 = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      {
        ...account,
        collateral: account.collateral.minus('797.94')
      },
      new BigNumber('1'),
      new BigNumber('2000')
    )
    expect(afterWithdraw1.computed.isIMSafe).toEqual(true)
    expect(afterWithdraw1.computed.withdrawableCollateral).toEqual(new BigNumber('0.005205479452056'))
    const afterWithdraw2 = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      {
        ...account,
        collateral: account.collateral.minus('797.95')
      },
      new BigNumber('1'),
      new BigNumber('2000')
    )
    expect(afterWithdraw2.computed.isIMSafe).toEqual(false)
    expect(afterWithdraw2.computed.withdrawableCollateral).toEqual(new BigNumber('0'))
  })

  it('short liquidate because of funding', function() {
    const assets2 = [
      {
        ...assets[0],
        spotLiquidity: new BigNumber('999899')
      },
      {
        ...assets[1],
        longCumulativeFunding: new BigNumber('0.489827625570776254'), // longCumulativeFunding, 0.000027397260273972 + 0.01 * (48 + 357/365 + 17/24/365)
        shortCumulativeFunding: new BigNumber('2.449028538812785386') // shortCumulativeFunding, 0.000027397260273972 + 0.05 * (48 + 357/365 + 17/24/365)
      }
    ]
    const account: DegenSubAccount = {
      collateral: new BigNumber('9996'),
      size: new BigNumber('2'),
      entryFunding: new BigNumber('0.000027397260273972'),
      entryPrice: new BigNumber('2000'),
      lastIncreasedTime: 0
    }
    const estimate = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      account,
      new BigNumber('1'),
      new BigNumber('1900')
    )
    expect(estimate.computed.liquidationPrice).toApproximate(new BigNumber('1999.99782561426397333333'))
    // verify
    const afterWithdraw1 = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      account,
      new BigNumber('1'),
      new BigNumber('2000')
    )
    expect(afterWithdraw1.computed.fundingFeeUsd).toApproximate(new BigNumber('9796.004566210045656'))
    expect(afterWithdraw1.computed.pendingPnlAfterFundingUsd).toApproximate(new BigNumber('-9796.004566210045656'))
    expect(afterWithdraw1.computed.isMMSafe).toEqual(false)
  })

  it('short liquidate 0 < fee < margin < MM', function() {
    const assets2 = assets
    const account: DegenSubAccount = {
      collateral: new BigNumber('9996'),
      size: new BigNumber('2'),
      entryFunding: new BigNumber('0.000027397260273972'),
      entryPrice: new BigNumber('2000'),
      lastIncreasedTime: 0
    }
    const estimate = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      account,
      new BigNumber('1'),
      new BigNumber('1900')
    )
    expect(estimate.computed.liquidationPrice).toApproximate(new BigNumber('6664.76190476190476190476'))
    // verify
    const afterWithdraw1 = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      account,
      new BigNumber('1'),
      new BigNumber('6664.7')
    )
    expect(afterWithdraw1.computed.isMMSafe).toEqual(true)
    const afterWithdraw2 = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      account,
      new BigNumber('1'),
      new BigNumber('6664.8')
    )
    expect(afterWithdraw2.computed.fundingFeeUsd).toApproximate(_0)
    expect(afterWithdraw2.computed.pendingPnlUsd).toApproximate(new BigNumber('-9329.6'))
    expect(afterWithdraw2.computed.isMMSafe).toEqual(false)
  })

  it('computeDegenFundingRateApy', function() {
    const asset1 = {
      ...assets[1],
      totalLongPosition: new BigNumber('10'),
      averageLongPrice: new BigNumber('2000'),
      totalShortPosition: new BigNumber('1'),
      averageShortPrice: new BigNumber('2000')
    }
    // skew = (10 - 1) * 2000 = $18000
    // funding = skew / alpha * beta = $18000 / 20000 * apy 20% = apy 18%
    const { longFundingRateApy, shortFundingRateApy, borrowingRateApy } = computeDegenFundingRateApy(pool, asset1)
    expect(longFundingRateApy).toApproximate(new BigNumber('0.18'))
    expect(shortFundingRateApy).toApproximate(new BigNumber('0'))
    expect(borrowingRateApy).toApproximate(new BigNumber('0.01'))
  })

  it('open position cause reserved > spotLiquidity', function() {
    const assets1 = [
      {
        ...assets[0],
        spotLiquidity: new BigNumber('0')
      },
      {
        ...assets[1]
      }
    ]
    expect(() => {
      return computeDegenOpenPosition(
        assets1,
        shortSubAccountId,
        shortSubAccount0,
        _1, // tradingPrice
        {
          USDC: _1,
          XXX: _1
        },
        new BigNumber(1), // amount
        _0 // brokerGasFee: BigNumber
      )
    }).toThrow(InsufficientLiquidityError)
  })

  it('short capped pnl', function() {
    const assets2 = assets
    const account: DegenSubAccount = {
      collateral: new BigNumber('9996'),
      size: new BigNumber('2'),
      entryFunding: new BigNumber('0.000027397260273972'),
      entryPrice: new BigNumber('2000'),
      lastIncreasedTime: 0
    }
    // mlp price should handle capped pnl
    // entry value = 2000 * 2 = 4000, maxProfit = 50% = 2000
    // assume mark price = 999, uncappedPnlUsd = (2000 - 999) * 2 = 2002
    const estimate = computeDegenSubAccount(
      assets2,
      shortSubAccountId,
      account,
      new BigNumber('1'),
      new BigNumber('999')
    )
    expect(estimate.computed.uncappedPnlUsd).toApproximate(new BigNumber('2002'))
    expect(estimate.computed.pnlUsd).toApproximate(new BigNumber('2000'))
    // verify
    const afterTrade = computeDegenClosePosition(
      assets2,
      shortSubAccountId,
      account,
      0, // profitAssetId
      new BigNumber('999'), // tradingPrice
      {
        USDC: _1,
        XXX: new BigNumber('999')
      },
      new BigNumber(1), // amount
      _0 // brokerGasFee: BigNumber
    )
    // capped pnl = 1000
    // fee = 999 * 1 * 0.1% = 0.999
    // received = 1000 - 0.999 = 999.001
    expect(afterTrade.profitAssetTransferred).toApproximate(new BigNumber('999.001'))
    expect(afterTrade.isTradeSafe).toEqual(true)
  })
})
