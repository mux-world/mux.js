import BigNumber from 'bignumber.js'
import {
  AggregatorOrderCategory,
  AggregatorProjectId,
  GmxAdapterStorage,
  GmxAdapterOrderReceiver,
  AggregatorSubAccount
} from '../../src/aggregator/types'
import { _0, _1 } from '../../src/constants'
import { Asset } from '../../src/types'
import { extendExpect } from '../helper'
import { gmxStorage1 } from './gmxCore.test'
import {
  calculateGmxAdapterOpenPositionWithCost,
  calculateGmxAdapterOpenPositionWithSize,
  computeGmxAdapterAccount,
  computeGmxAdapterClosePosition,
  computeGmxAdapterOpenPosition,
  computeGmxAdapterWithdrawCollateral,
  computeGmxAdapterMaxWithdrawCollateral,
  calculateGmxAdapterClosePositionCollateralUsd,
  computeGmxAdapterAccountSimulateKeeper
} from '../../src/aggregator/gmxAdapter'
import { computeGmxCoreDecrease } from '../../src/aggregator/gmxCore'

extendExpect()

const wbtc = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
const weth = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const uni = '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0'
const usdc = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'

// this case is based on arbitrum block number 30928378
const assets1: Asset[] = []
assets1.push({
  symbol: 'USDC',
  id: 0,
  decimals: 6,
  isStable: true,
  canAddRemoveLiquidity: true,
  isTradable: false,
  isOpenable: false,
  isShortable: false,
  useStableTokenForProfit: false,
  isEnabled: true,
  isStrictStable: true,
  referenceOracleType: 1,
  referenceOracle: '0x50834f3163758fcc1df9973b6e91f0f0f0434ad3',
  referenceDeviation: _0,
  halfSpread: _0,
  tokenAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
  muxTokenAddress: '0x458cd4bd5ae8fcf602a910423c30323997e497c3',
  initialMarginRate: _0,
  maintenanceMarginRate: _0,
  positionFeeRate: _0,
  minProfitRate: _0,
  minProfitTime: 0,
  maxLongPositionSize: _0,
  maxShortPositionSize: _0,
  spotWeight: 30,
  longFundingBaseRate8H: _0,
  longFundingLimitRate8H: _0,
  longCumulativeFundingRate: _0,
  shortCumulativeFunding: _0,
  spotLiquidity: new BigNumber('1112756.616434367696668975'),
  credit: new BigNumber(0),
  totalLongPosition: _0,
  averageLongPrice: _0,
  totalShortPosition: _0,
  averageShortPrice: _0,
  collectedFee: new BigNumber('57676.633365182191207961'),
  deduct: _0
})
assets1.push(assets1[0]) // unused
assets1.push(assets1[0]) // unused
assets1.push({
  symbol: 'ETH',
  id: 3,
  decimals: 18,
  isStable: false,
  canAddRemoveLiquidity: true,
  isTradable: true,
  isOpenable: true,
  isShortable: true,
  useStableTokenForProfit: false,
  isEnabled: true,
  isStrictStable: false,
  referenceOracleType: 1,
  referenceOracle: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
  referenceDeviation: new BigNumber('0.03'),
  halfSpread: new BigNumber('0'),
  tokenAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  muxTokenAddress: '0xE03b9Bf45B8b717237380AB934C5A6a5CA4C2Af1',
  initialMarginRate: new BigNumber('0.006'),
  maintenanceMarginRate: new BigNumber('0.005'),
  positionFeeRate: new BigNumber('0.001'),
  minProfitRate: new BigNumber('0'),
  minProfitTime: 0,
  maxLongPositionSize: new BigNumber('9999999999'),
  maxShortPositionSize: new BigNumber('1200'),
  spotWeight: 135,
  longFundingBaseRate8H: new BigNumber('0.00008'),
  longFundingLimitRate8H: new BigNumber('0.0002'),
  longCumulativeFundingRate: new BigNumber('0.03081'),
  shortCumulativeFunding: new BigNumber('50.460957'),
  spotLiquidity: new BigNumber('1035.767290003340633667'),
  credit: new BigNumber(0),
  totalLongPosition: new BigNumber('53.0201'),
  averageLongPrice: new BigNumber('1438.777138389403253393'),
  totalShortPosition: new BigNumber('69.2812'),
  averageShortPrice: new BigNumber('1312.062270139662705872'),
  collectedFee: new BigNumber('7.1240996243486359'),
  deduct: new BigNumber('999997000000000002.88')
})
assets1.push({
  symbol: 'BTC',
  id: 4,
  decimals: 8,
  isStable: false,
  canAddRemoveLiquidity: true,
  isTradable: true,
  isOpenable: true,
  isShortable: true,
  useStableTokenForProfit: false,
  isEnabled: true,
  isStrictStable: false,
  referenceOracleType: 1,
  referenceOracle: '0x6ce185860a4963106506C203335A2910413708e9',
  referenceDeviation: new BigNumber('0.03'),
  halfSpread: new BigNumber('0'),
  tokenAddress: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  muxTokenAddress: '0x2aC61dd4fBb11919b20A3859D4dDc4Fa192c8ba1',
  initialMarginRate: new BigNumber('0.006'),
  maintenanceMarginRate: new BigNumber('0.005'),
  positionFeeRate: new BigNumber('0.001'),
  minProfitRate: new BigNumber('0'),
  minProfitTime: 0,
  maxLongPositionSize: new BigNumber('9999999999'),
  maxShortPositionSize: new BigNumber('78'),
  spotWeight: 5,
  longFundingBaseRate8H: new BigNumber('0.00008'),
  longFundingLimitRate8H: new BigNumber('0.0002'),
  longCumulativeFundingRate: new BigNumber('0.02914'),
  shortCumulativeFunding: new BigNumber('750.28618'),
  spotLiquidity: new BigNumber('0.216109424610438445'),
  credit: new BigNumber(0),
  totalLongPosition: new BigNumber('0.08494'),
  averageLongPrice: new BigNumber('19548.63503649635031495'),
  totalShortPosition: new BigNumber('1.271'),
  averageShortPrice: new BigNumber('18783.595310778914240552'),
  collectedFee: new BigNumber('0.186437172207521233'),
  deduct: new BigNumber('999997000000000002.99152693655667301')
})

const gmxAggregatorStorage1: GmxAdapterStorage = {
  gmx: gmxStorage1,
  collaterals: {
    [usdc]: {
      boostFeeRate: new BigNumber('0.005'),
      initialMarginRate: new BigNumber('0.006'),
      maintenanceMarginRate: new BigNumber('0.005'),
      liquidationFeeRate: new BigNumber('0.002'),
      totalBorrow: _0,
      borrowLimit: new BigNumber('100000')
    },
    [weth]: {
      boostFeeRate: new BigNumber('0.005'),
      initialMarginRate: new BigNumber('0.006'),
      maintenanceMarginRate: new BigNumber('0.005'),
      liquidationFeeRate: new BigNumber('0.002'),
      totalBorrow: _0,
      borrowLimit: new BigNumber('100')
    },
    [wbtc]: {
      boostFeeRate: new BigNumber('0.005'),
      initialMarginRate: new BigNumber('0.006'),
      maintenanceMarginRate: new BigNumber('0.005'),
      liquidationFeeRate: new BigNumber('0.002'),
      totalBorrow: _0,
      borrowLimit: new BigNumber('10')
    },
    [uni]: {
      boostFeeRate: new BigNumber('0.005'),
      initialMarginRate: new BigNumber('0.006'),
      maintenanceMarginRate: new BigNumber('0.005'),
      liquidationFeeRate: new BigNumber('0.002'),
      totalBorrow: _0,
      borrowLimit: _0
    }
  },
  shortFundingAssetId: 3 // weth
}

// 24 hour later. the same as helper.time.increase(3600 * 24)
const gmxAggregatorStorage2: GmxAdapterStorage = {
  ...gmxAggregatorStorage1,
  gmx: {
    ...gmxAggregatorStorage1.gmx,
    tokens: {
      ...gmxAggregatorStorage1.gmx.tokens,
      [weth]: {
        ...gmxAggregatorStorage1.gmx.tokens[weth],
        cumulativeFundingRate: new BigNumber('0.330050')
      },
      [wbtc]: {
        ...gmxAggregatorStorage1.gmx.tokens[wbtc],
        cumulativeFundingRate: new BigNumber('0.256039')
      },
      [usdc]: {
        ...gmxAggregatorStorage1.gmx.tokens[usdc],
        cumulativeFundingRate: new BigNumber('0.212828')
      }
    }
  }
}

// 24 hour later. the same as helper.time.increase(3600 * 24)
const assets2: Asset[] = [...assets1]
assets2[3] = {
  ...assets1[3],
  longCumulativeFundingRate: new BigNumber('0.03111'),
  shortCumulativeFunding: new BigNumber('51.0495615')
}
assets2[4] = {
  ...assets1[4],
  longCumulativeFundingRate: new BigNumber('0.02944'),
  shortCumulativeFunding: new BigNumber('758.6942275')
}

const longEthPos0: AggregatorSubAccount = {
  proxyAddress: '',
  projectId: AggregatorProjectId.Gmx,
  account: '',
  collateralTokenAddress: weth,
  assetTokenAddress: weth,
  isLong: true,
  isLiquidating: false,
  cumulativeDebt: _0,
  cumulativeFee: _0,
  debtEntryFunding: _0,
  proxyCollateralBalance: _0,
  proxyEthBalance: _0,
  gmx: {
    collateralTokenAddress: weth,
    assetTokenAddress: weth,
    isLong: true,
    sizeUsd: _0,
    collateralUsd: _0,
    lastIncreasedTime: 0,
    entryPrice: _0,
    entryFundingRate: _0
  },
  gmxOrders: []
}

const shortEthPos0: AggregatorSubAccount = {
  ...longEthPos0,
  collateralTokenAddress: usdc,
  isLong: false,
  gmx: {
    ...longEthPos0.gmx,
    collateralTokenAddress: usdc,
    isLong: false
  }
}

const longUniPos0: AggregatorSubAccount = {
  proxyAddress: '',
  projectId: AggregatorProjectId.Gmx,
  account: '',
  collateralTokenAddress: uni,
  assetTokenAddress: uni,
  isLong: true,
  isLiquidating: false,
  cumulativeDebt: _0,
  cumulativeFee: _0,
  debtEntryFunding: _0,
  proxyCollateralBalance: _0,
  proxyEthBalance: _0,
  gmx: {
    collateralTokenAddress: uni,
    assetTokenAddress: uni,
    isLong: true,
    sizeUsd: _0,
    collateralUsd: _0,
    lastIncreasedTime: 0,
    entryPrice: _0,
    entryFundingRate: _0
  },
  gmxOrders: []
}

const shortUniPos0: AggregatorSubAccount = {
  ...longUniPos0,
  collateralTokenAddress: usdc,
  isLong: false,
  gmx: {
    ...longUniPos0.gmx,
    collateralTokenAddress: usdc,
    isLong: false
  }
}

describe('aggregator:gmxAggregator', () => {
  it('plan for open long ETH, specify positionSize(eth), swapIn = USDC', () => {
    // plan for open
    const plan1 = calculateGmxAdapterOpenPositionWithSize(
      assets1,
      gmxAggregatorStorage1,
      weth, // collateral
      weth, // asset
      true, // long
      new BigNumber('1296.5'), // asset price
      new BigNumber('100'), // leverage
      new BigNumber('1'), // size = 1ETH
      usdc, // swapIn token
      true // enableBorrow
    )
    expect(plan1.sizeDeltaUsd).toApproximate(new BigNumber('1296.5')) // 1 * price
    expect(plan1.borrowUsd).toApproximate(new BigNumber('6.4825')) // price * 0.5%
    expect(plan1.borrowCollateral).toApproximate(new BigNumber('0.005')) // borrowUsd / price
    expect(plan1.swapOutUsd).toApproximate(new BigNumber('14.29484598')) // >= 1 * price / 100 + 1 * price * 0.001 + borrowUsd * 0.005
    expect(plan1.swapOutCollateral).toApproximate(new BigNumber('0.01102572')) // >= 1/100 + 0.001 = 0.011
    expect(plan1.swapInAmount).toApproximate(new BigNumber('14.345613'))
  })

  it('plan for open long ETH, specify swapInAmount(usdc)', () => {
    // plan for open
    const plan1 = calculateGmxAdapterOpenPositionWithCost(
      assets1,
      gmxAggregatorStorage1,
      weth, // collateral
      weth, // asset
      true, // long
      new BigNumber('1296.5'), // asset price
      new BigNumber('100'), // leverage
      usdc, // swapIn token
      new BigNumber('14.345613'), // swap in usdc
      true // enableBorrow
    )
    expect(plan1.sizeDeltaUsd).toApproximate(new BigNumber('1296.58466938775510204082')) // >= 1 * price
    expect(plan1.borrowUsd).toApproximate(new BigNumber('6.482923346938775510192175')) // price * 0.5%
    expect(plan1.borrowCollateral).toApproximate(new BigNumber('0.005000326530612245')) // borrowUsd / price
    expect(plan1.swapOutUsd).toApproximate(new BigNumber('14.29484598')) // 1 * price / 100 + 1 * price * 0.001 + borrowUsd * 0.005
    expect(plan1.swapOutCollateral).toApproximate(new BigNumber('0.01102572')) // >= 1/100 + 0.001 = 0.011
  })

  it('plan for open short ETH, specify positionSize(eth), swapIn = USDC', () => {
    // plan for open
    const plan1 = calculateGmxAdapterOpenPositionWithSize(
      assets1,
      gmxAggregatorStorage1,
      usdc, // collateral
      weth, // asset
      false, // long
      new BigNumber('1296.5'), // asset price
      new BigNumber('100'), // leverage
      new BigNumber('1'), // size = 1ETH
      usdc, // swapIn token
      true // enableBorrow
    )
    expect(plan1.sizeDeltaUsd).toApproximate(new BigNumber('1296.5')) // 1 * price
    expect(plan1.borrowUsd).toApproximate(new BigNumber('6.4825')) // price * 0.5%
    expect(plan1.borrowCollateral).toApproximate(new BigNumber('6.4825')) // borrowUsd.dp(6)
    expect(plan1.swapOutUsd).toApproximate(new BigNumber('14.293913')) // 1 * price / 100 + 1 * price * 0.001 + borrowUsd * 0.005
    expect(plan1.swapOutCollateral).toApproximate(new BigNumber('14.293913'))
    expect(plan1.swapInAmount).toApproximate(new BigNumber('14.293913'))
  })

  it('assets in in-flight orders', () => {
    // after placing market order
    const longEthPos0WithOrders: AggregatorSubAccount = {
      ...longEthPos0,
      cumulativeDebt: new BigNumber('0.023333333333333334'), // see borrowCollateral above
      cumulativeFee: new BigNumber('0'), // open position fee is already deduct from borrow
      debtEntryFunding: new BigNumber('0.03081'),
      gmxOrders: [
        {
          orderHistoryKey: 'xx',
          category: AggregatorOrderCategory.Open,
          receiver: GmxAdapterOrderReceiver.MarketIncreasing,
          gmxOrderIndex: 1,
          borrow: new BigNumber('0.023333333333333334'),
          placeOrderTime: 0,
          isFillOrCancel: false,
          account: '0x1234',
          collateralToken: weth,
          indexToken: weth,
          isLong: true,
          amountIn: new BigNumber('0.023333333333333334').plus('0.01'), // increase only. borrowCollateral + swapOutCollateral
          collateralDeltaUsd: _0, // decrease only
          sizeDeltaUsd: new BigNumber('1296.5'),
          triggerPrice: _0, // 0 if market order
          triggerAboveThreshold: false,
          tpOrderHistoryKey: '',
          slOrderHistoryKey: '',
        }
      ]
    }
    const account = computeGmxAdapterAccount(
      assets1,
      gmxAggregatorStorage1,
      longEthPos0WithOrders,
      new BigNumber('1296.5') // asset price
    )
    expect(account.account.cumulativeDebt).toApproximate(new BigNumber('0.023333333333333334'))
    expect(account.account.debtEntryFunding).toApproximate(new BigNumber('0.03081'))
    expect(account.account.isLiquidating).toBe(false)
    expect(account.account.gmx.sizeUsd).toApproximate(new BigNumber('0'))
    expect(account.account.gmx.collateralUsd).toApproximate(new BigNumber('0'))
    expect(account.computed.marginBalanceUsd).toApproximate(new BigNumber('0'))
  })

  it('assets in in-flight orders, accFunding changes', () => {
    // after placing market order
    const longEthPos0WithOrders: AggregatorSubAccount = {
      ...longEthPos0,
      cumulativeDebt: new BigNumber('0.023333333333333334'), // see borrowCollateral above
      cumulativeFee: new BigNumber('0'), // open position fee is already deduct from borrow
      debtEntryFunding: new BigNumber('0.03081'),
      gmxOrders: [
        {
          orderHistoryKey: 'xx',
          category: AggregatorOrderCategory.Open,
          receiver: GmxAdapterOrderReceiver.MarketIncreasing,
          gmxOrderIndex: 1,
          borrow: new BigNumber('0.023333333333333334'),
          placeOrderTime: 0,
          isFillOrCancel: false,
          account: '0x1234',
          collateralToken: weth,
          indexToken: weth,
          isLong: true,
          amountIn: new BigNumber('0.023333333333333334').plus('0.01'), // increase only. borrowCollateral + swapOutCollateral
          collateralDeltaUsd: _0, // decrease only
          sizeDeltaUsd: new BigNumber('1296.5'),
          triggerPrice: _0, // 0 if market order
          triggerAboveThreshold: false,
          tpOrderHistoryKey: '',
          slOrderHistoryKey: '',
        }
      ]
    }
    // after 24 hours, this order still exists
    const account = computeGmxAdapterAccount(
      assets2,
      gmxAggregatorStorage2,
      longEthPos0WithOrders,
      new BigNumber('1296.5') // asset price
    )
    expect(account.account.cumulativeDebt).toApproximate(new BigNumber('0.023333333333333334'))
    expect(account.account.debtEntryFunding).toApproximate(new BigNumber('0.03081'))
    expect(account.account.isLiquidating).toBe(false)
    expect(account.account.gmx.sizeUsd).toApproximate(new BigNumber('0'))
    expect(account.account.gmx.collateralUsd).toApproximate(new BigNumber('0'))
    expect(account.computed.marginBalanceUsd).toApproximate(new BigNumber('0'))
  })

  it('long, collateral = USDC. pnl > 0', () => {
    // open
    let assetPrice = new BigNumber('1296.5')
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      longEthPos0,
      assetPrice,
      new BigNumber('0.023333333333333334'), // borrow eth
      new BigNumber('1296.5'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('14.464836') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result1.swapFeeRate).toApproximate(new BigNumber('0.004'))
    expect(result1.swapFeeUsd).toApproximate(new BigNumber('0.0578593432'))
    expect(result1.swapOutCollateral).toApproximate(new BigNumber('0.011117352')) // should >= 0.011. 14.464836 / 1308.01 .dp6 * (1 - swapFeeRate)
    expect(result1.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('0.023333333333333334'))
    expect(result1.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('0.03081'))
    expect(result1.afterTrade.account.isLiquidating).toBe(false)
    expect(result1.gmxAmountIn).toApproximate(new BigNumber('0.03433401866666666733')) // swapOut + cumulativeDebt - boostFee
    expect(result1.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('43.217555201333334193345')) // (swapOutCollateral + borrow * (1 - 0.005)) * 1296.5 * 1296.5 - gmxPosFeeUsd
    expect(result1.afterTrade.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(result1.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.329642'))
    expect(result1.sizeDeltaUsd).toApproximate(new BigNumber('1296.5'))
    expect(result1.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.gmxPosFeeUsd).toApproximate(new BigNumber('1.2965'))
    expect(result1.boostFeeUsd).toApproximate(new BigNumber('0.151258333333333337655')) // 0.023333333333333334 * 1296.5 * 0.005
    expect(result1.feeUsd).toApproximate(new BigNumber('1.505617676533333337655'))
    expect(result1.isTradeSafe).toBeTruthy()
    expect(result1.afterTrade.computed.size).toApproximate(new BigNumber('1'))
    expect(result1.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('12.965888534666666662345')) // collateralUsd - (cumulativeDebt + cumulativeFee) * 1296.5
    expect(result1.afterTrade.computed.collateral).toApproximate(new BigNumber('0.03333401866666666733')) // collateralUsd / entry
    expect(result1.afterTrade.computed.minPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.computed.maxPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.computed.markPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.computed.isIMSafe).toBeTruthy()
    expect(result1.afterTrade.computed.isMMSafe).toBeTruthy()
    expect(result1.afterTrade.computed.fundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.gmxFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.pendingPnlUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.pendingPnlAfterFundingUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.pendingRoe).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('12.965888534666666662345'))
    expect(result1.afterTrade.computed.leverage).toApproximate(new BigNumber('99.99314713631625782579'))
    expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1290.016611465333332469'))

    {
      // can not withdraw when it is already 100x
      const withdrawable = computeGmxAdapterMaxWithdrawCollateral(
        assets1,
        gmxAggregatorStorage1,
        result1.afterTrade.account,
        assetPrice
      )
      expect(withdrawable.collateralOut).toApproximate(new BigNumber('0.000000685333324295'))
      expect(withdrawable.collateralDeltaUsd).toApproximate(new BigNumber('0.0008885346549490437'))
    }

    // close after 24 hours. take profit
    assetPrice = new BigNumber('1298.5')
    const beforeClose = computeGmxAdapterAccount(assets2, gmxAggregatorStorage2, result1.afterTrade.account, assetPrice)
    expect(beforeClose.account.cumulativeDebt).toApproximate(new BigNumber('0.023333333333333334'))
    expect(beforeClose.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(beforeClose.account.debtEntryFunding).toApproximate(new BigNumber('0.03081'))
    expect(beforeClose.account.isLiquidating).toBe(false)
    expect(beforeClose.account.gmx.sizeUsd).toApproximate(new BigNumber('1296.5'))
    expect(beforeClose.account.gmx.collateralUsd).toApproximate(new BigNumber('43.217555201333334193345')) // not changed
    expect(beforeClose.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(beforeClose.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5'))
    expect(beforeClose.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.329642'))
    expect(beforeClose.computed.size).toApproximate(new BigNumber('1'))
    expect(result1.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('12.965888534666666662345')) // collateralUsd - (cumulativeDebt + cumulativeFee) * 1296.5
    expect(beforeClose.computed.collateral).toApproximate(new BigNumber('0.03333401866666666733')) // not changed
    expect(beforeClose.computed.minPrice).toApproximate(new BigNumber('1298.5'))
    expect(beforeClose.computed.maxPrice).toApproximate(new BigNumber('1298.5'))
    expect(beforeClose.computed.markPrice).toApproximate(new BigNumber('1298.5'))
    expect(beforeClose.computed.isIMSafe).toBeTruthy()
    expect(beforeClose.computed.isMMSafe).toBeTruthy()
    expect(beforeClose.computed.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0.0090895000000000002597'))
    expect(beforeClose.computed.gmxFundingFeeUsd).toApproximate(new BigNumber('0.528972'))
    expect(beforeClose.computed.fundingFeeUsd).toApproximate(new BigNumber('0.5380615000000000002597'))
    expect(beforeClose.computed.pendingPnlUsd).toApproximate(new BigNumber('2'))
    expect(beforeClose.computed.pendingPnlAfterFundingUsd).toApproximate(new BigNumber('1.4619525'))
    expect(beforeClose.computed.pendingRoe).toApproximate(new BigNumber('0.11275374580702304985'))
    expect(beforeClose.computed.pnlUsd).toApproximate(new BigNumber('2'))
    expect(beforeClose.computed.marginBalanceUsd).toApproximate(new BigNumber('14.427841034666667531')) // traderInitialCostUsd + upnl - aggregatorFundingFeeUsd - gmxFundingFeeUsd
    expect(beforeClose.computed.leverage).toApproximate(new BigNumber('99.99314713631625782579')) // not changed
    expect(beforeClose.computed.liquidationPrice).toApproximate(new BigNumber('1290.554658965333332469'))

    {
      // can not withdraw upnl
      const withdrawable = computeGmxAdapterMaxWithdrawCollateral(
        assets2,
        gmxAggregatorStorage2,
        result1.afterTrade.account,
        assetPrice
      )
      expect(withdrawable.collateralOut).toApproximate(new BigNumber('0'))
      expect(withdrawable.collateralDeltaUsd).toApproximate(new BigNumber('0'))
    }

    const result2 = computeGmxAdapterClosePosition(
      assets2,
      gmxAggregatorStorage2,
      result1.afterTrade.account,
      assetPrice, // asset price
      new BigNumber('1296.5'), // sizeUsd
      new BigNumber('0') // withdrawCollateralUsd
    )
    expect(result2.realizedPnlUsd).toApproximate(new BigNumber('2'))
    expect(result2.gmxUsdOutAfterFee).toApproximate(new BigNumber('43.392083201333334193345'))
    expect(result2.gmxCollateralOutAfterFee).toApproximate(new BigNumber('0.033417083713002183')) // / assetPrice
    expect(result2.repayCollateral).toApproximate(new BigNumber('0.023333333333333334'))
    expect(result2.boostFeeUsd).toApproximate(new BigNumber('0.151491666666666670995')) // repayCollateral * assetPrice * 0.005
    expect(result2.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0.0090895'))
    expect(result2.feeUsd).toApproximate(new BigNumber('1.9860531666666666712547'))
    expect(result2.collateralOut).toApproximate(new BigNumber('0.00996008371300218133')) // (43.392083201333334193345 - 0.151491666666666670995 - 0.0090895) / 1296.5 - 0.023333333333333334
    expect(result2.isTradeSafe).toBeTruthy()
    expect(result2.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('0.03111'))
    expect(result2.afterTrade.account.isLiquidating).toBe(false)
    expect(result2.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.gmx.lastIncreasedTime).toBe(0)
    expect(result2.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.size).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.collateral).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.minPrice).toApproximate(new BigNumber('1298.5'))
    expect(result2.afterTrade.computed.maxPrice).toApproximate(new BigNumber('1298.5'))
    expect(result2.afterTrade.computed.markPrice).toApproximate(new BigNumber('1298.5'))
    expect(result2.afterTrade.computed.isIMSafe).toBeTruthy()
    expect(result2.afterTrade.computed.isMMSafe).toBeTruthy()
    expect(result2.afterTrade.computed.fundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.gmxFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.pendingPnlUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.pendingPnlAfterFundingUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.pendingRoe).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.leverage).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('0'))
  })

  it('withdraw', () => {
    const assetPrice = new BigNumber('1296.5')
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      longEthPos0,
      assetPrice,
      new BigNumber('0.023333333333333334'), // borrow eth
      new BigNumber('1296.5'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('14.464836').plus('1.2965') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result1.swapFeeRate).toBeBigNumber(new BigNumber('0.004'))
    {
      const withdrawable = computeGmxAdapterMaxWithdrawCollateral(
        assets1,
        gmxAggregatorStorage1,
        result1.afterTrade.account,
        assetPrice
      )
      expect(withdrawable.collateralOut).toApproximate(new BigNumber('0.000996685323587705'))
      expect(withdrawable.collateralDeltaUsd).toApproximate(new BigNumber('1.29220252203146045423'))
    }
    const w1 = computeGmxAdapterWithdrawCollateral(
      assets1,
      gmxAggregatorStorage1,
      result1.afterTrade.account,
      assetPrice,
      new BigNumber('0.001') // withdraw collateral
    )
    expect(w1.collateralDeltaUsd).toApproximate(new BigNumber('1.29220252203146045423')) // a little bit larger than 1.2965 * (1 - 0.4%)
    expect(w1.isTradeSafe).toBeTruthy()
  })

  it('open long + open long', () => {
    // open 1
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      longEthPos0,
      new BigNumber('1296.5'), // asset price
      new BigNumber('0.002456140350877193'), // borrow eth
      new BigNumber('453.985'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('12') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result1.isTradeSafe).toBeTruthy()
    expect(result1.afterTrade.computed.leverage).toApproximate(new BigNumber('39.52380289555733869039'))
    // open 2
    const result2 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      result1.afterTrade.account,
      new BigNumber('1296.5'), // asset price
      new BigNumber('0.005333333333333334'), // borrow eth
      new BigNumber('521.8'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('11') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result2.isTradeSafe).toBeTruthy()
  })

  it('short, collateral = USDC. pnl < 0', () => {
    // open
    let assetPrice = new BigNumber('1296.5')
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      shortEthPos0,
      assetPrice,
      new BigNumber('30.251667'), // borrow usdc
      new BigNumber('1296.5'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('14.412759') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result1.swapFeeRate).toApproximate(new BigNumber('0'))
    expect(result1.swapFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.swapOutCollateral).toApproximate(new BigNumber('14.412759'))
    expect(result1.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('30.251667'))
    expect(result1.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('50.460957'))
    expect(result1.afterTrade.account.isLiquidating).toBe(false)
    expect(result1.gmxAmountIn).toApproximate(new BigNumber('44.513168')) // swapOut + cumulativeDebt - boostFee
    expect(result1.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('43.216668')) // gmxAmountIn - sizeUsd * 0.001
    expect(result1.afterTrade.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(result1.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.212231'))
    expect(result1.sizeDeltaUsd).toApproximate(new BigNumber('1296.5'))
    expect(result1.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.gmxPosFeeUsd).toApproximate(new BigNumber('1.2965'))
    expect(result1.boostFeeUsd).toApproximate(new BigNumber('0.151258')) // * 0.005
    expect(result1.feeUsd).toApproximate(new BigNumber('1.447758'))
    expect(result1.isTradeSafe).toBeTruthy()
    expect(result1.afterTrade.computed.size).toApproximate(new BigNumber('1'))
    expect(result1.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('12.965001')) // collateralUsd - (cumulativeDebt + cumulativeFee) * 1296.5
    expect(result1.afterTrade.computed.collateral).toApproximate(new BigNumber('43.216668')) // collateralUsd / 1
    expect(result1.afterTrade.computed.minPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.computed.maxPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.computed.markPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.computed.isIMSafe).toBeTruthy()
    expect(result1.afterTrade.computed.isMMSafe).toBeTruthy()
    expect(result1.afterTrade.computed.fundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.gmxFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.pendingPnlUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.pendingPnlAfterFundingUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.pendingRoe).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('12.965001'))
    expect(result1.afterTrade.computed.leverage).toApproximate(new BigNumber('99.99999228692693506156'))
    expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1302.982501'))

    {
      // can not withdraw when it is already 100x
      const withdrawable = computeGmxAdapterMaxWithdrawCollateral(
        assets1,
        gmxAggregatorStorage1,
        result1.afterTrade.account,
        assetPrice
      )
      expect(withdrawable.collateralOut).toApproximate(new BigNumber('0'))
      expect(withdrawable.collateralDeltaUsd).toApproximate(new BigNumber('0.000000999999'))
    }

    // close after 24 hours. loss
    assetPrice = new BigNumber('1298.5')
    const adapterStorage2ModifiedPrice = {
      ...gmxAggregatorStorage2,
      gmx: {
        ...gmxAggregatorStorage2.gmx,
        tokens: {
          ...gmxAggregatorStorage2.gmx.tokens,
          [weth]: {
            ...gmxAggregatorStorage2.gmx.tokens[weth],
            cumulativeFundingRate: new BigNumber('0.330050'),
            contractMinPrice: assetPrice, // in this test we set contract price first to verify shortFunding. the contract test does NOT need this
            contractMaxPrice: assetPrice
          }
        }
      }
    }
    const beforeClose = computeGmxAdapterAccount(
      assets2,
      adapterStorage2ModifiedPrice,
      result1.afterTrade.account,
      assetPrice
    )
    expect(beforeClose.account.cumulativeDebt).toApproximate(new BigNumber('30.251667'))
    expect(beforeClose.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(beforeClose.account.debtEntryFunding).toApproximate(new BigNumber('50.460957'))
    expect(beforeClose.account.isLiquidating).toBe(false)
    expect(beforeClose.account.gmx.sizeUsd).toApproximate(new BigNumber('1296.5'))
    expect(beforeClose.account.gmx.collateralUsd).toApproximate(new BigNumber('43.216668'))
    expect(beforeClose.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(beforeClose.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5'))
    expect(beforeClose.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.212231'))
    expect(beforeClose.computed.size).toApproximate(new BigNumber('1'))
    expect(beforeClose.computed.traderInitialCostUsd).toApproximate(new BigNumber('12.965001')) // not changed
    expect(beforeClose.computed.collateral).toApproximate(new BigNumber('43.216668')) // not changed
    expect(beforeClose.computed.minPrice).toApproximate(new BigNumber('1298.5'))
    expect(beforeClose.computed.maxPrice).toApproximate(new BigNumber('1298.5'))
    expect(beforeClose.computed.markPrice).toApproximate(new BigNumber('1298.5'))
    expect(beforeClose.computed.isIMSafe).toBeTruthy()
    expect(beforeClose.computed.isMMSafe).toBeTruthy()
    expect(beforeClose.computed.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0.013712')) // (cumulativeDebt + cumulativeFee) * (51.0495615 - 50.460957) / 1298.5 * 30.251667
    expect(beforeClose.computed.gmxFundingFeeUsd).toApproximate(new BigNumber('0.7740105'))
    expect(beforeClose.computed.fundingFeeUsd).toApproximate(new BigNumber('0.7877225'))
    expect(beforeClose.computed.pendingPnlUsd).toApproximate(new BigNumber('-2'))
    expect(beforeClose.computed.pendingPnlAfterFundingUsd).toApproximate(new BigNumber('-2.7877225'))
    expect(beforeClose.computed.pendingRoe).toApproximate(new BigNumber('-0.21501907327272863303'))
    expect(beforeClose.computed.pnlUsd).toApproximate(new BigNumber('-2'))
    expect(beforeClose.computed.marginBalanceUsd).toApproximate(new BigNumber('10.1772785')) // traderInitialCostUsd + upnl - aggregatorFundingFeeUsd - gmxFundingFeeUsd
    expect(beforeClose.computed.leverage.lte('100')).toBeTruthy()
    expect(beforeClose.computed.leverage.gt('99.9')).toBeTruthy()
    expect(beforeClose.computed.liquidationPrice).toApproximate(new BigNumber('1302.1947785'))

    {
      // can not withdraw upnl
      const withdrawable = computeGmxAdapterMaxWithdrawCollateral(
        assets2,
        adapterStorage2ModifiedPrice,
        beforeClose.account,
        assetPrice
      )
      expect(withdrawable.collateralOut).toApproximate(new BigNumber('0'))
      expect(withdrawable.collateralDeltaUsd).toApproximate(new BigNumber('0'))
    }

    // real close all
    assetPrice = new BigNumber('1298.5')
    const result2 = computeGmxAdapterClosePosition(
      assets2,
      adapterStorage2ModifiedPrice,
      result1.afterTrade.account,
      assetPrice,
      new BigNumber('1296.5'), // sizeUsd
      new BigNumber('0') // withdrawCollateralUsd
    )
    expect(result2.realizedPnlUsd).toApproximate(new BigNumber('-2'))
    expect(result2.gmxUsdOutAfterFee).toApproximate(new BigNumber('39.1461575'))
    expect(result2.gmxCollateralOutAfterFee).toApproximate(new BigNumber('39.146157')) // / 1
    expect(result2.repayCollateral).toApproximate(new BigNumber('30.251667'))
    expect(result2.boostFeeUsd).toApproximate(new BigNumber('0.151258335')) // repayCollateral * 0.005
    expect(result2.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0.013712'))
    expect(result2.feeUsd).toApproximate(new BigNumber('2.235480835'))
    expect(result2.collateralOut).toApproximate(new BigNumber('8.729519665')) // (39.146157 - 0.151258335 - 0.01371295135055949172121678860) - 30.251667
    expect(result2.isTradeSafe).toBeTruthy()
    expect(result2.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('51.0495615'))
    expect(result2.afterTrade.account.isLiquidating).toBe(false)
    expect(result2.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.gmx.lastIncreasedTime).toBe(0)
    expect(result2.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.size).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.collateral).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.minPrice).toApproximate(new BigNumber('1298.5'))
    expect(result2.afterTrade.computed.maxPrice).toApproximate(new BigNumber('1298.5'))
    expect(result2.afterTrade.computed.markPrice).toApproximate(new BigNumber('1298.5'))
    expect(result2.afterTrade.computed.isIMSafe).toBeTruthy()
    expect(result2.afterTrade.computed.isMMSafe).toBeTruthy()
    expect(result2.afterTrade.computed.fundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.gmxFundingFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.pendingPnlUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.pendingPnlAfterFundingUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.pendingRoe).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.leverage).toApproximate(new BigNumber('0'))
    expect(result2.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('0'))
  })

  describe('liquidate long, collateral = USDC', () => {
    let afterOpen = longEthPos0
    beforeEach(() => {
      // open
      const assetPrice = new BigNumber('1296.5')
      const result1 = computeGmxAdapterOpenPosition(
        assets1,
        gmxAggregatorStorage1,
        longEthPos0,
        assetPrice,
        new BigNumber('0.023333333333333334'), // borrow eth
        new BigNumber('1296.5'), // sizeUsd
        usdc, // swapIn token
        new BigNumber('14.464836') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
      )
      expect(result1.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('0.023333333333333334'))
      expect(result1.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
      expect(result1.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('1296.5'))
      expect(result1.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('43.217555201333334193345')) // 14.464836 / 1308.01 (.dp6) * (1 - 0.0039) * 1296.5 + 0.023333333333333334 * 1296.5 - 1.30932
      expect(result1.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5'))
      expect(result1.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.329642'))
      expect(result1.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('12.965888534666667531'))
      expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1290.016611465333332469'))
      afterOpen = result1.afterTrade.account
    })

    it('safe', () => {
      const assetPrice = new BigNumber('1290.1')
      const result2 = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, afterOpen, assetPrice)
      expect(result2.computed.marginBalanceUsd).toApproximate(new BigNumber('6.565888534666667531'))
      expect(result2.computed.isMMSafe).toBeTruthy()

      const result3 = computeGmxAdapterClosePosition(
        assets1,
        gmxAggregatorStorage1,
        afterOpen,
        assetPrice,
        new BigNumber('1296.5'), // size
        new BigNumber('0') // collateral
      )
      expect(result3.isTradeSafe).toBeTruthy()
    })

    it('unsafe', () => {
      const assetPrice = new BigNumber('1290.0')
      const result2 = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, afterOpen, assetPrice)
      expect(result2.computed.marginBalanceUsd).toApproximate(new BigNumber('6.465888534666667531'))
      expect(result2.computed.isMMSafe).toBeFalsy()

      const result3 = computeGmxAdapterClosePosition(
        assets1,
        gmxAggregatorStorage1,
        afterOpen,
        assetPrice,
        new BigNumber('1296.5'), // size
        new BigNumber('0') // collateral
      )
      expect(result3.isTradeSafe).toBeFalsy()
    })

    it('bankrupt', () => {
      const assetPrice = new BigNumber('1284')
      const result2 = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, afterOpen, assetPrice)
      expect(result2.computed.isMMSafe).toBeFalsy()

      const result3 = computeGmxAdapterClosePosition(
        assets1,
        gmxAggregatorStorage1,
        afterOpen,
        assetPrice,
        new BigNumber('1296.5'), // size
        new BigNumber('0') // collateral
      )
      expect(result3.isTradeSafe).toBeFalsy()
    })
  })

  describe('liquidate short, collateral = USDC', () => {
    let afterOpen = shortEthPos0
    beforeEach(() => {
      // open
      const assetPrice = new BigNumber('1296.5')
      const result1 = computeGmxAdapterOpenPosition(
        assets1,
        gmxAggregatorStorage1,
        shortEthPos0,
        assetPrice,
        new BigNumber('30.251667'), // borrow usdc
        new BigNumber('1296.5'), // sizeUsd
        usdc, // swapIn token
        new BigNumber('14.412759') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
      )
      expect(result1.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('30.251667'))
      expect(result1.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
      expect(result1.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('1296.5'))
      expect(result1.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('43.216668')) // gmxAmountIn - sizeUsd * 0.001
      expect(result1.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5'))
      expect(result1.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.212231'))
      expect(result1.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('12.965001'))
      expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1302.982501'))
      afterOpen = result1.afterTrade.account
    })

    it('safe', () => {
      const assetPrice = new BigNumber('1302.9')
      const result2 = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, afterOpen, assetPrice)
      expect(result2.computed.marginBalanceUsd).toApproximate(new BigNumber('6.565001'))
      expect(result2.computed.isMMSafe).toBeTruthy()

      const result3 = computeGmxAdapterClosePosition(
        assets1,
        gmxAggregatorStorage1,
        afterOpen,
        assetPrice,
        new BigNumber('1296.5'), // size
        new BigNumber('0') // collateral
      )
      expect(result3.isTradeSafe).toBeTruthy()
    })

    it('unsafe', () => {
      const assetPrice = new BigNumber('1303.0')
      const result2 = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, afterOpen, assetPrice)
      expect(result2.computed.marginBalanceUsd).toApproximate(new BigNumber('6.465001'))
      expect(result2.computed.isMMSafe).toBeFalsy()

      const result3 = computeGmxAdapterClosePosition(
        assets1,
        gmxAggregatorStorage1,
        afterOpen,
        assetPrice,
        new BigNumber('1296.5'), // size
        new BigNumber('0') // collateral
      )
      expect(result3.isTradeSafe).toBeFalsy()
    })

    it('bankrupt', () => {
      const assetPrice = new BigNumber('2296.5')
      const result2 = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, afterOpen, assetPrice)
      expect(result2.computed.isMMSafe).toBeFalsy()

      const result3 = computeGmxAdapterClosePosition(
        assets1,
        gmxAggregatorStorage1,
        afterOpen,
        assetPrice,
        new BigNumber('1296.5'), // size
        new BigNumber('0') // collateral
      )
      expect(result3.isTradeSafe).toBeFalsy()
    })
  })

  it('long, collateral = eth, partial close. pnl > 0', () => {
    // open
    let assetPrice = new BigNumber('1296.5')
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      longEthPos0,
      assetPrice,
      new BigNumber('0.023333333333333334'), // borrow eth
      new BigNumber('1296.5'), // sizeUsd
      weth, // swapIn token
      new BigNumber('0.011117352') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result1.isTradeSafe).toBeTruthy()
    expect(result1.afterTrade.computed.size).toApproximate(new BigNumber('1'))
    expect(result1.afterTrade.computed.leverage).toApproximate(new BigNumber('99.99314713631625782579'))
    expect(result1.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('0.03081'))
    expect(result1.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('43.217555201333334193345')) // (swapOutCollateral + borrow * (1 - 0.005)) * 1296.5 * 1296.5 - gmxPosFeeUsd
    expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1290.016611465333332469'))

    // close 1/2 after 24 hours. take profit
    assetPrice = new BigNumber('1298.5')

    // plan
    const plan = calculateGmxAdapterClosePositionCollateralUsd(
      assets2,
      gmxAggregatorStorage2,
      result1.afterTrade.account,
      assetPrice,
      new BigNumber('0.5') // position size. in asset token
    )
    expect(plan).toApproximate(new BigNumber('6.47386816599953821275'))

    // close 1 / 2
    const result2 = computeGmxAdapterClosePosition(
      assets2,
      gmxAggregatorStorage2,
      result1.afterTrade.account,
      assetPrice, // asset price
      new BigNumber('648.25'), // sizeUsd = 1296.5 / 2
      plan // withdrawCollateralUsd
    )
    expect(result2.realizedPnlUsd).toApproximate(new BigNumber('1')) // 2 * 50%
    expect(result2.gmxUsdOutAfterFee).toApproximate(new BigNumber('6.29664616599953821275')) // positionFee = 648.25 * 0.001, funding = 0.528972. rpnl + plan - posFee - funding
    expect(result2.gmxCollateralOutAfterFee).toApproximate(new BigNumber('0.004849169169040845')) // / assetPrice
    expect(result2.repayCollateral).toApproximate(new BigNumber('0')) // repay = 0 when partial close
    expect(result2.boostFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0.0090895'))
    expect(result2.feeUsd).toApproximate(new BigNumber('1.1863115')) // 648.25 * 0.001 + 0.528972 + 0.0090895
    expect(result2.collateralOut).toApproximate(new BigNumber('0.004849169169040845')) // gmxCollateralOutAfterFee
    expect(result2.isTradeSafe).toBeTruthy()
    expect(result2.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('0.023333333333333334'))
    expect(result2.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0.000007')) // += 0.0090895 / assetPrice
    expect(result2.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('0.03111'))
    expect(result2.afterTrade.account.isLiquidating).toBe(false)
    expect(result2.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('648.25'))
    expect(result2.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('36.743687035333795980595')) // -= plan
    expect(result2.afterTrade.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(result2.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5')) // not changed
    expect(result2.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.330050'))
    expect(result2.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('6.482944868667129188')) // collateralUsd - (cumulativeDebt + cumulativeFee) * assetPrice
    expect(result2.afterTrade.computed.isIMSafe).toBeTruthy()
    expect(result2.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('7.482944868667129188'))
    expect(result2.afterTrade.computed.leverage).toApproximate(new BigNumber('99.99313786132474217555'))
    expect(result2.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1290.016610262665741624'))
  })

  it('short, collateral = usdc, partial close. pnl < 0', () => {
    // open
    let assetPrice = new BigNumber('1296.5')
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      shortEthPos0,
      assetPrice,
      new BigNumber('30.251667'), // borrow usdc
      new BigNumber('1296.5'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('14.412759') // swapIn amount
    )
    expect(result1.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('30.251667'))
    expect(result1.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('50.460957'))
    expect(result1.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('43.216668')) // gmxAmountIn - sizeUsd * 0.001
    expect(result1.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5'))
    expect(result1.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.212231'))
    expect(result1.afterTrade.computed.leverage).toApproximate(new BigNumber('99.99999228692693506156'))
    expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1302.982501'))

    // close 1/2 after 24 hours. loss
    assetPrice = new BigNumber('1298.5')
    const adapterStorage2ModifiedPrice = {
      ...gmxAggregatorStorage2,
      gmx: {
        ...gmxAggregatorStorage2.gmx,
        tokens: {
          ...gmxAggregatorStorage2.gmx.tokens,
          [weth]: {
            ...gmxAggregatorStorage2.gmx.tokens[weth],
            cumulativeFundingRate: new BigNumber('0.330050'),
            contractMinPrice: assetPrice, // in this test we set contract price first to verify shortFunding. the contract test does NOT need this
            contractMaxPrice: assetPrice
          }
        }
      }
    }

    // plan
    let plan = calculateGmxAdapterClosePositionCollateralUsd(
      assets2,
      adapterStorage2ModifiedPrice,
      result1.afterTrade.account,
      assetPrice,
      new BigNumber('0.5') // position size. in asset token
    )
    expect(plan).toApproximate(new BigNumber('5.468788406718581914'))

    // close
    const result2 = computeGmxAdapterClosePosition(
      assets2,
      adapterStorage2ModifiedPrice,
      result1.afterTrade.account,
      assetPrice, // asset price
      new BigNumber('648.25'), // sizeUsd = 1296.5 / 2
      plan // withdrawCollateralUsd
    )
    expect(result2.realizedPnlUsd).toApproximate(new BigNumber('-1'))
    expect(result2.gmxUsdOutAfterFee).toApproximate(new BigNumber('4.04652790671858191491')) // positionFee = 648.25 * 0.001, funding = 0.7740105. plan - posFee - funding
    expect(result2.gmxCollateralOutAfterFee).toApproximate(new BigNumber('4.046527')) // / 1
    expect(result2.repayCollateral).toApproximate(new BigNumber('0')) // repay = 0 when partial close
    expect(result2.boostFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0.013712'))
    expect(result2.feeUsd).toApproximate(new BigNumber('1.4359725')) // 648.25 * 0.001 + 0.7740105 + 0.013712
    expect(result2.collateralOut).toApproximate(new BigNumber('4.046527')) // gmxCollateralOutAfterFee
    expect(result2.isTradeSafe).toBeTruthy()
    expect(result2.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('30.251667'))
    expect(result2.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0.013712')) // += 0.013712
    expect(result2.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('51.0495615'))
    expect(result2.afterTrade.account.isLiquidating).toBe(false)
    expect(result2.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('648.25'))
    expect(result2.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('36.747879593281418086')) // - plan + pnl
    expect(result2.afterTrade.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(result2.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5')) // not changed
    expect(result2.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.212828'))
    expect(result2.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('6.482500593281418085')) // collateralUsd - (cumulativeDebt + cumulativeFee) * assetPrice
    expect(result2.afterTrade.computed.isIMSafe).toBeTruthy()
    expect(result2.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('5.482500593281418085'))
    expect(result2.afterTrade.computed.leverage).toApproximate(new BigNumber('99.99999084795428017565'))
    expect(result2.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1302.98250118656283617'))

    // close all
    const result3 = computeGmxAdapterClosePosition(
      assets2,
      adapterStorage2ModifiedPrice,
      result2.afterTrade.account,
      assetPrice, // asset price
      new BigNumber('648.25'), // sizeUsd = 1296.5 / 2
      _0 // withdrawCollateralUsd
    )
    expect(result3.realizedPnlUsd).toApproximate(new BigNumber('-1')) // 2 * 50%
    expect(result3.gmxUsdOutAfterFee).toApproximate(new BigNumber('35.099629593281418085'))
    expect(result3.gmxCollateralOutAfterFee).toApproximate(new BigNumber('35.099629')) // / assetPrice
    expect(result3.repayCollateral).toApproximate(new BigNumber('30.251667')) // repay all
    expect(result3.boostFeeUsd).toApproximate(new BigNumber('0.151258335'))
    expect(result3.collateralOut).toApproximate(new BigNumber('4.682991665')) // gmxCollateralOutAfterFee
    expect(result3.isTradeSafe).toBeTruthy()
  })

  // in this case, valid collateralDelta is in a range. if collateralDelta < this range, afterTrade will be unsafe
  // it('short, collateral = usdc, partial close. sizeUsd is very small', () => {
  //   // open
  //   let assetPrice = new BigNumber('1296.5')
  //   const result1 = computeGmxAdapterOpenPosition(
  //     assets1,
  //     gmxAggregatorStorage1,
  //     shortEthPos0,
  //     assetPrice,
  //     new BigNumber('0.34'), // borrow usdc
  //     new BigNumber('34'), // sizeUsd
  //     usdc, // swapIn token
  //     new BigNumber('22') // swapIn amount
  //   )
  //   expect(result1.afterTrade.computed.leverage).toApproximate(new BigNumber('1.54796647286733472043'))

  //   // plan
  //   let plan = calculateGmxAdapterClosePositionCollateralUsd(
  //     assets1,
  //     gmxAggregatorStorage1,
  //     result1.afterTrade.account,
  //     assetPrice,
  //     new BigNumber('0.0131122') // position size. in asset token
  //   )
  //   expect(plan).toApproximate(new BigNumber('0'))
  //   plan = new BigNumber('10')

  //   // close
  //   const result2 = computeGmxAdapterClosePosition(
  //     assets1,
  //     gmxAggregatorStorage1,
  //     result1.afterTrade.account,
  //     assetPrice, // asset price
  //     new BigNumber('17'), // sizeUsd
  //     plan // withdrawCollateralUsd
  //   )
  //   expect(result2.isTradeSafe).toBeTruthy()
  //   expect(result2.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('17'))
  //   expect(result2.afterTrade.computed.isIMSafe).toBeTruthy()
  //   expect(result2.afterTrade.computed.leverage).toApproximate(new BigNumber('1.54796647286733472043'))
  // })

  it('long eth failed: insufficient liquidity, can not borrow', () => {
    // open
    let assetPrice = new BigNumber('1296.5')
    const result = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      longEthPos0,
      assetPrice,
      new BigNumber('101'), // borrow eth
      new BigNumber('1296.5'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('14.464836') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result.liquidityWarning?.message).toMatch(new RegExp(`can not borrow`))
  })

  it('long eth failed: insufficient liquidity, gmx max long', () => {
    // open
    let assetPrice = new BigNumber('1296.5')
    const result = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      longEthPos0,
      assetPrice,
      new BigNumber('0'), // borrow eth
      new BigNumber('100000000'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('14.464836') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result.liquidityWarning?.message).toMatch(new RegExp(`guaranteed > maxGlobalLong`))
  })

  it('long uni, specify positionSize(uni), swapIn = uni, borrow = 0', () => {
    // plan for open
    let assetPrice = new BigNumber('6.402') // min/max price = 6.389196 ~ 6.414804
    const plan1 = calculateGmxAdapterOpenPositionWithSize(
      assets1,
      gmxAggregatorStorage1,
      uni, // collateral
      uni, // asset
      true, // long
      assetPrice,
      new BigNumber('30'), // leverage
      new BigNumber('10000'), // size = x UNI
      uni, // swapIn token
      false // enableBorrow
    )
    expect(plan1.sizeDeltaUsd).toApproximate(new BigNumber('64148.04')) // x * maxPrice
    expect(plan1.borrowUsd).toApproximate(new BigNumber('0'))
    expect(plan1.borrowCollateral).toApproximate(new BigNumber('0'))
    expect(plan1.swapOutUsd).toApproximate(new BigNumber('2202.416156270555088766357752')) // >= x * maxPrice / 30 + x * maxPrice * 0.001
    expect(plan1.swapOutCollateral).toApproximate(new BigNumber('344.709437035670073162')) // >= x / 30
    expect(plan1.swapInAmount).toApproximate(new BigNumber('344.709437035670073162'))

    // real open
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      longUniPos0,
      assetPrice,
      plan1.borrowCollateral,
      plan1.sizeDeltaUsd,
      uni, // swapIn token
      plan1.swapInAmount
    )
    expect(result1.isTradeSafe).toBeTruthy()
    expect(result1.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.isLiquidating).toBe(false)
    expect(result1.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('64148.04'))
    expect(result1.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('2138.268116270555088766')) // 50 * minPrice / 30 + 50 * maxPrice * 0.001
    expect(result1.afterTrade.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(result1.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('6.414804'))
    expect(result1.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.094548'))
    expect(result1.sizeDeltaUsd).toApproximate(new BigNumber('64148.04'))
    expect(result1.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('1882.188116270555088766'))
    expect(result1.afterTrade.computed.leverage).toApproximate(new BigNumber('29.99999836871876578145'))
    expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('6.26512522837294449112'))

    // successful close
    assetPrice = new BigNumber('6.278') // close price will be assetPrice * (1 - 0.002). liquidationPrice / (1 - 0.002)
    let beforeClose = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, result1.afterTrade.account, assetPrice)
    expect(beforeClose.computed.isMMSafe).toBeTruthy()

    // this one will fail
    assetPrice = new BigNumber('6.277') // close price will be assetPrice * (1 - 0.002). liquidationPrice / (1 - 0.002)
    beforeClose = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, result1.afterTrade.account, assetPrice)
    expect(beforeClose.computed.isMMSafe).toBeFalsy()
  })

  it('short uni, specify positionSize(uni), swapIn = usdc, borrow = 0', () => {
    // plan for open
    let assetPrice = new BigNumber('6.402') // min/max price = 6.389196 ~ 6.414804
    const plan1 = calculateGmxAdapterOpenPositionWithSize(
      assets1,
      gmxAggregatorStorage1,
      usdc, // collateral
      uni, // asset
      false, // long
      assetPrice,
      new BigNumber('30'), // leverage
      new BigNumber('10000'), // size = x UNI
      usdc, // swapIn token
      false // enableBorrow
    )
    expect(plan1.sizeDeltaUsd).toApproximate(new BigNumber('63891.96')) // x * minPrice
    expect(plan1.borrowUsd).toApproximate(new BigNumber('0'))
    expect(plan1.borrowCollateral).toApproximate(new BigNumber('0'))
    expect(plan1.swapOutUsd).toApproximate(new BigNumber('2193.624026')) // >= x * minPrice / 30 + x * minPrice * 0.001
    expect(plan1.swapOutCollateral).toApproximate(new BigNumber('2193.624026')) // >= x * minPrice / 30
    expect(plan1.swapInAmount).toApproximate(new BigNumber('2193.624026'))

    // real open
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      shortUniPos0,
      assetPrice,
      plan1.borrowCollateral,
      plan1.sizeDeltaUsd,
      usdc, // swapIn token
      plan1.swapInAmount
    )
    expect(result1.isTradeSafe).toBeTruthy()
    expect(result1.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0'))
    expect(result1.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('50.460957'))
    expect(result1.afterTrade.account.isLiquidating).toBe(false)
    expect(result1.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('63891.96'))
    expect(result1.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('2129.732066')) // x * minPrice / 30 + x * minPrice * 0.001
    expect(result1.afterTrade.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(result1.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('6.389196'))
    expect(result1.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.212231'))
    expect(result1.sizeDeltaUsd).toApproximate(new BigNumber('63891.96'))
    expect(result1.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('1873.652066'))
    expect(result1.afterTrade.computed.leverage).toApproximate(new BigNumber('29.99999907030558838381'))
    expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('6.5382772466'))

    // successful close
    assetPrice = new BigNumber('6.525') // close price will be assetPrice * (1 + 0.002). liquidationPrice / (1 + 0.002)
    let beforeClose = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, result1.afterTrade.account, assetPrice)
    expect(beforeClose.computed.isMMSafe).toBeTruthy()

    // this one will fail
    assetPrice = new BigNumber('6.526') // close price will be assetPrice * (1 + 0.002). liquidationPrice / (1 + 0.002)
    beforeClose = computeGmxAdapterAccount(assets1, gmxAggregatorStorage1, result1.afterTrade.account, assetPrice)
    expect(beforeClose.computed.isMMSafe).toBeFalsy()
  })

  it('long, 2 pending orders, partial close', () => {
    // open
    let assetPrice = new BigNumber('1296.5')
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      longEthPos0,
      assetPrice,
      new BigNumber('0.023333333333333334'), // borrow eth
      new BigNumber('1296.5'), // sizeUsd
      weth, // swapIn token
      new BigNumber('0.011117352') // swapIn amount. in swapIn token. NOTE: swap price = 1308.01
    )
    expect(result1.isTradeSafe).toBeTruthy()
    expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1290.016611465333332469'))

    // add 2 orders
    const oneMoreOrder = {
      orderHistoryKey: 'xx',
      category: AggregatorOrderCategory.Open,
      receiver: GmxAdapterOrderReceiver.MarketIncreasing,
      gmxOrderIndex: 1,
      borrow: new BigNumber('0.023333333333333334'),
      placeOrderTime: 0,
      isFillOrCancel: false,
      account: '0x1234',
      collateralToken: weth,
      indexToken: weth,
      isLong: true,
      amountIn: new BigNumber('0.011117352'), // increase only. borrowCollateral + swapOutCollateral
      collateralDeltaUsd: _0, // decrease only
      sizeDeltaUsd: new BigNumber('1296.5'),
      triggerPrice: _0, // 0 if market order
      triggerAboveThreshold: false,
      tpOrderHistoryKey: '',
      slOrderHistoryKey: '',
    }
    const result1WithOrders = computeGmxAdapterAccount(
      assets1,
      gmxAggregatorStorage1,
      {
        ...result1.afterTrade.account,
        cumulativeDebt: result1.afterTrade.account.cumulativeDebt
          .plus('0.023333333333333334')
          .plus('0.023333333333333334'),
        gmxOrders: [...result1.afterTrade.account.gmxOrders, oneMoreOrder, oneMoreOrder]
      },
      assetPrice
    )
    expect(result1WithOrders.computed.isIMSafe).toBeTruthy()
    expect(result1WithOrders.computed.liquidationPrice).toApproximate(new BigNumber('1290.016611465333332469'))

    // close 1/2 after 24 hours. take profit
    assetPrice = new BigNumber('1298.5')

    // plan
    const plan = calculateGmxAdapterClosePositionCollateralUsd(
      assets2,
      gmxAggregatorStorage2,
      result1WithOrders.account,
      assetPrice,
      new BigNumber('0.5') // position size. in asset token
    )
    expect(plan).toApproximate(new BigNumber('6.455717258343739251'))

    // real close 1 / 2
    const result2 = computeGmxAdapterClosePosition(
      assets2,
      gmxAggregatorStorage2,
      result1WithOrders.account,
      assetPrice, // asset price
      new BigNumber('648.25'), // sizeUsd = 1296.5 / 2
      plan // withdrawCollateralUsd
    )
    expect(result2.realizedPnlUsd).toApproximate(new BigNumber('1')) // 2 * 50%
    expect(result2.gmxUsdOutAfterFee).toApproximate(new BigNumber('6.278495258343739251')) // positionFee = 648.25 * 0.001, funding = 0.528972. rpnl + plan - posFee - funding
    expect(result2.gmxCollateralOutAfterFee).toApproximate(new BigNumber('0.004835190803499221')) // / assetPrice
    expect(result2.repayCollateral).toApproximate(new BigNumber('0')) // repay = 0 when partial close
    expect(result2.boostFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0.0272685'))
    expect(result2.feeUsd).toApproximate(new BigNumber('1.2044905')) // 648.25 * 0.001 + 0.528972 + 0.0272685
    expect(result2.collateralOut).toApproximate(new BigNumber('0.004835190803499221')) // gmxCollateralOutAfterFee
    expect(result2.isTradeSafe).toBeTruthy()
    expect(result2.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('0.070000000000000002'))
    expect(result2.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0.000021')) // += 0.0272685 / assetPrice
    expect(result2.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('0.03111'))
    expect(result2.afterTrade.account.isLiquidating).toBe(false)
    expect(result2.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('648.25'))
    expect(result2.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('36.761837942989595811')) // -= plan
    expect(result2.afterTrade.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(result2.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5')) // not changed
    expect(result2.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.330050'))
    expect(result2.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('6.48294477632292828')) // collateralUsd - (cumulativeDebt + cumulativeFee) * assetPrice
    expect(result2.afterTrade.computed.isIMSafe).toBeTruthy()
    expect(result2.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('7.48294477632292828'))
    expect(result2.afterTrade.computed.leverage).toApproximate(new BigNumber('99.9931392856445006865'))
    expect(result2.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1290.01661044735414344'))
  })

  it('short, 2 pending orders, partial close', () => {
    // open
    let assetPrice = new BigNumber('1296.5')
    const result1 = computeGmxAdapterOpenPosition(
      assets1,
      gmxAggregatorStorage1,
      shortEthPos0,
      assetPrice,
      new BigNumber('30.251667'), // borrow usdc
      new BigNumber('1296.5'), // sizeUsd
      usdc, // swapIn token
      new BigNumber('14.412759') // swapIn amount
    )
    expect(result1.isTradeSafe).toBeTruthy()
    expect(result1.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1302.982501'))

    // add 2 orders
    const oneMoreOrder = {
      orderHistoryKey: 'xx',
      category: AggregatorOrderCategory.Open,
      receiver: GmxAdapterOrderReceiver.MarketIncreasing,
      gmxOrderIndex: 1,
      borrow: new BigNumber('30.251667'),
      placeOrderTime: 0,
      isFillOrCancel: false,
      account: '0x1234',
      collateralToken: usdc,
      indexToken: weth,
      isLong: false,
      amountIn: new BigNumber('14.412759'), // increase only. borrowCollateral + swapOutCollateral
      collateralDeltaUsd: _0, // decrease only
      sizeDeltaUsd: new BigNumber('1296.5'),
      triggerPrice: _0, // 0 if market order
      triggerAboveThreshold: false,
      tpOrderHistoryKey: '',
      slOrderHistoryKey: '',
    }
    const result1WithOrders = computeGmxAdapterAccount(
      assets1,
      gmxAggregatorStorage1,
      {
        ...result1.afterTrade.account,
        cumulativeDebt: result1.afterTrade.account.cumulativeDebt.plus('30.251667').plus('30.251667'),
        gmxOrders: [...result1.afterTrade.account.gmxOrders, oneMoreOrder, oneMoreOrder]
      },
      assetPrice
    )
    expect(result1WithOrders.computed.isIMSafe).toBeTruthy()
    expect(result1WithOrders.computed.liquidationPrice).toApproximate(new BigNumber('1302.982501'))

    // close 1/2 after 24 hours. loss
    assetPrice = new BigNumber('1298.5')
    const adapterStorage2ModifiedPrice = {
      ...gmxAggregatorStorage2,
      gmx: {
        ...gmxAggregatorStorage2.gmx,
        tokens: {
          ...gmxAggregatorStorage2.gmx.tokens,
          [weth]: {
            ...gmxAggregatorStorage2.gmx.tokens[weth],
            cumulativeFundingRate: new BigNumber('0.330050'),
            contractMinPrice: assetPrice, // in this test we set contract price first to verify shortFunding. the contract test does NOT need this
            contractMaxPrice: assetPrice
          }
        }
      }
    }

    // plan
    let plan = calculateGmxAdapterClosePositionCollateralUsd(
      assets2,
      adapterStorage2ModifiedPrice,
      result1WithOrders.account,
      assetPrice,
      new BigNumber('0.5') // position size. in asset token
    )
    expect(plan).toApproximate(new BigNumber('5.441362326832652092'))

    // real close 1 / 2
    const result2 = computeGmxAdapterClosePosition(
      assets2,
      adapterStorage2ModifiedPrice,
      result1WithOrders.account,
      assetPrice, // asset price
      new BigNumber('648.25'), // sizeUsd = 1296.5 / 2
      plan // withdrawCollateralUsd
    )
    expect(result2.realizedPnlUsd).toApproximate(new BigNumber('-1'))
    expect(result2.gmxUsdOutAfterFee).toApproximate(new BigNumber('4.019101826832652092')) // positionFee = 648.25 * 0.001, funding = 0.7740105. plan - posFee - funding
    expect(result2.gmxCollateralOutAfterFee).toApproximate(new BigNumber('4.019101')) // / 1
    expect(result2.repayCollateral).toApproximate(new BigNumber('0')) // repay = 0 when partial close
    expect(result2.boostFeeUsd).toApproximate(new BigNumber('0'))
    expect(result2.aggregatorFundingFeeUsd).toApproximate(new BigNumber('0.041138'))
    expect(result2.feeUsd).toApproximate(new BigNumber('1.4633985')) // 648.25 * 0.001 + 0.7740105 + 0.041138
    expect(result2.collateralOut).toApproximate(new BigNumber('4.019101')) // gmxCollateralOutAfterFee
    expect(result2.isTradeSafe).toBeTruthy()
    expect(result2.afterTrade.account.cumulativeDebt).toApproximate(new BigNumber('90.755001'))
    expect(result2.afterTrade.account.cumulativeFee).toApproximate(new BigNumber('0.041138')) // += 0.041138
    expect(result2.afterTrade.account.debtEntryFunding).toApproximate(new BigNumber('51.0495615'))
    expect(result2.afterTrade.account.isLiquidating).toBe(false)
    expect(result2.afterTrade.account.gmx.sizeUsd).toApproximate(new BigNumber('648.25'))
    expect(result2.afterTrade.account.gmx.collateralUsd).toApproximate(new BigNumber('36.775305673167347908')) // - plan + pnl
    expect(result2.afterTrade.account.gmx.lastIncreasedTime).not.toBe(0)
    expect(result2.afterTrade.account.gmx.entryPrice).toApproximate(new BigNumber('1296.5')) // not changed
    expect(result2.afterTrade.account.gmx.entryFundingRate).toApproximate(new BigNumber('0.212828'))
    expect(result2.afterTrade.computed.traderInitialCostUsd).toApproximate(new BigNumber('6.482500673167347908')) // collateralUsd - (cumulativeDebt + cumulativeFee) * assetPrice
    expect(result2.afterTrade.computed.isIMSafe).toBeTruthy()
    expect(result2.afterTrade.computed.marginBalanceUsd).toApproximate(new BigNumber('5.482500673167347908'))
    expect(result2.afterTrade.computed.leverage).toApproximate(new BigNumber('99.9999896156223987079'))
    expect(result2.afterTrade.computed.liquidationPrice).toApproximate(new BigNumber('1302.982501346334695816'))

    // emulated close all before withdraw
    const result3GmxBeforeRepay = computeGmxCoreDecrease(
      adapterStorage2ModifiedPrice.gmx,
      result2.afterTrade.account.gmx,
      assetPrice, // asset price
      new BigNumber('648.25'), // sizeUsd = 1296.5 / 2
      _0 // collateralDeltaUsd
    )
    const result3BeforeRepay = computeGmxAdapterAccount(
      assets2,
      adapterStorage2ModifiedPrice,
      {
        ...result2.afterTrade.account,
        gmx: result3GmxBeforeRepay.afterTrade.gmxAccount
      },
      assetPrice // asset price
    )
    expect(result3BeforeRepay.computed.isIMSafe).toBeFalsy()
    expect(result3BeforeRepay.computed.isMMSafe).toBeFalsy()
    const result3SimulatedRepay = computeGmxAdapterAccountSimulateKeeper(
      assets2,
      adapterStorage2ModifiedPrice,
      result3BeforeRepay.account,
      assetPrice // asset price
    )
    expect(result3SimulatedRepay.computed.isIMSafe).toBeTruthy()
    expect(result3SimulatedRepay.computed.isMMSafe).toBeTruthy()
    expect(result3SimulatedRepay.computed.traderInitialCostUsd).toApproximate(_0)
    expect(result3SimulatedRepay.computed.marginBalanceUsd).toApproximate(_0)
  })
})
