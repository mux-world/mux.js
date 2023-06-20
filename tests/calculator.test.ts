import BigNumber from 'bignumber.js'
import { _0, _1 } from '../src/constants'
import { encodeSubAccountId } from '../src/data'
import { Asset, PriceDict, SubAccount } from '../src/types'
import { extendExpect } from './helper'
import {
  calculateClosePositionCollateralAmount,
  calculateOpenPositionWithCollateral,
  binarySearchRight,
  binarySearchLeft
} from '../src/calculator'
import {
  computeClosePosition,
  computeOpenPosition,
  computeSubAccount,
  computeTradingPrice
} from '../src/computations'

extendExpect()

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
    longCumulativeFundingRate: new BigNumber('0.00142857142857142857142857142857'),
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

describe('calculateOpenPositionWithCollateral', function () {
  const prices: PriceDict = {
    ETH: new BigNumber('7000'),
    USDC: _1
  }
  const subAccountId = encodeSubAccountId('0x1111111111111111111111111111111111111111', 1, 0, true)

  it(`from 0`, function () {
    const subAccount = {
      collateral: _0,
      size: _0,
      lastIncreasedTime: 0,
      entryPrice: _0,
      entryFunding: _0
    }
    // position fee = 1 * 7000 * 0.00115 = 8.05
    const cost = new BigNumber('3508.05')
    let size = calculateOpenPositionWithCollateral(assets, subAccountId, subAccount, prices, new BigNumber(2), cost, _0)
    expect(size).toBeBigNumber(new BigNumber('1'))
    const computed = computeOpenPosition(
      assets,
      subAccountId,
      {
        ...subAccount,
        collateral: subAccount.collateral.plus(cost)
      },
      prices,
      size,
      _0
    )
    expect(computed.afterTrade.computed.leverage).toBeBigNumber(new BigNumber(2))
  })

  it(`from 1`, function () {
    const subAccount = {
      collateral: new BigNumber('3500'),
      size: _1,
      lastIncreasedTime: 0,
      entryPrice: new BigNumber('7000'),
      entryFunding: _0
    }
    // funding fee = 1 * (10 - 0) = 10
    // position fee = 1 * 7000 * 0.00115 = 8.05
    const cost = new BigNumber('3518.05')
    let size = calculateOpenPositionWithCollateral(assets, subAccountId, subAccount, prices, new BigNumber(2), cost, _0)
    expect(size).toBeBigNumber(new BigNumber('1'))
    const computed = computeOpenPosition(
      assets,
      subAccountId,
      {
        ...subAccount,
        collateral: subAccount.collateral.plus(cost)
      },
      prices,
      size,
      _0
    )
    expect(computed.afterTrade.computed.leverage).toBeBigNumber(new BigNumber(2))
  })
})

describe('calculateClosePositionCollateralAmount', function () {
  it('short ETH/USDC without profit', function () {
    const prices: PriceDict = {
      ETH: new BigNumber('7000'),
      USDC: _1
    }
    const subAccountId = encodeSubAccountId('0x1111111111111111111111111111111111111111', 1, 0, false)
    const subAccount = {
      collateral: new BigNumber('3500'),
      size: _1,
      lastIncreasedTime: 0,
      entryPrice: new BigNumber('7000'),
      entryFunding: new BigNumber('20')
    }
    const size = new BigNumber('0.5')
    const profitAssetId = 1
    const { collateralPrice, assetPrice } = computeTradingPrice(assets, subAccountId, prices, false /* isOpen */)
    const oldLeverage = computeSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice).computed
      .leverage
    expect(oldLeverage).toBeBigNumber(new BigNumber(2))
    const collateralDelta = calculateClosePositionCollateralAmount(
      assets,
      subAccountId,
      subAccount,
      prices,
      profitAssetId,
      size,
      _0
    )
    expect(collateralDelta).toBeBigNumber(new BigNumber('1745.975'))
    const computed = computeClosePosition(
      assets,
      subAccountId,
      {
        ...subAccount,
        collateral: subAccount.collateral.minus(collateralDelta)
      },
      profitAssetId,
      prices,
      size,
      _0
    )
    expect(computed.afterTrade.computed.leverage).toBeBigNumber(new BigNumber(2))
  })

  it('short BTC/BTC with profit', function () {
    const assets: Asset[] = [
      {
        symbol: 'USDC',
        id: 0,
        decimals: 18,
        isStable: true,
        canAddRemoveLiquidity: true,
        isTradable: false,
        isOpenable: false,
        isShortable: false,
        useStableTokenForProfit: false,
        isEnabled: true,
        isStrictStable: true,
        referenceOracleType: 1,
        referenceOracle: '0x51597f405303C4377E36123cBc172b13269EA163',
        referenceDeviation: new BigNumber('0'),
        halfSpread: new BigNumber('0'),
        tokenAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        muxTokenAddress: '0x523d3e0DacD7c470Ebe8880AbE808161696CeBeC',
        initialMarginRate: new BigNumber('0'),
        maintenanceMarginRate: new BigNumber('0'),
        positionFeeRate: new BigNumber('0'),
        minProfitRate: new BigNumber('0'),
        minProfitTime: 0,
        maxLongPositionSize: new BigNumber('0'),
        maxShortPositionSize: new BigNumber('0'),
        spotWeight: 0,
        longFundingBaseRate8H: new BigNumber('0'),
        longFundingLimitRate8H: new BigNumber('0'),
        longCumulativeFundingRate: new BigNumber('0'),
        shortCumulativeFunding: new BigNumber('0'),
        spotLiquidity: new BigNumber('19905.784771394040578368'),
        credit: new BigNumber(0),
        totalLongPosition: new BigNumber('0'),
        averageLongPrice: new BigNumber('0'),
        totalShortPosition: new BigNumber('0'),
        averageShortPrice: new BigNumber('0'),
        collectedFee: new BigNumber('31.26712687530408'),
        deduct: new BigNumber('0')
      },
      {
        symbol: 'BTC',
        id: 4,
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
        referenceOracle: '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf',
        referenceDeviation: new BigNumber('0.03'),
        halfSpread: new BigNumber('0'),
        tokenAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
        muxTokenAddress: '0x904d0221641232fb40f99dc92C1d59c35698Ff0B',
        initialMarginRate: new BigNumber('0.006'),
        maintenanceMarginRate: new BigNumber('0.005'),
        positionFeeRate: new BigNumber('0.001'),
        minProfitRate: new BigNumber('0'),
        minProfitTime: 0,
        maxLongPositionSize: new BigNumber('9999999999'),
        maxShortPositionSize: new BigNumber('9999999999'),
        spotWeight: 5,
        longFundingBaseRate8H: new BigNumber('0.00008'),
        longFundingLimitRate8H: new BigNumber('0.0002'),
        longCumulativeFundingRate: new BigNumber('0.0301'),
        shortCumulativeFunding: new BigNumber('773.54034'),
        spotLiquidity: new BigNumber('2.326231295875720941'),
        credit: new BigNumber(0),
        totalLongPosition: new BigNumber('0.02558'),
        averageLongPrice: new BigNumber('20392.999999999999999924'),
        totalShortPosition: new BigNumber('0.056625628806906317'),
        averageShortPrice: new BigNumber('19932.823755336445664971'),
        collectedFee: new BigNumber('0.00030396483613622'),
        deduct: new BigNumber('999999999999.00039810088913831')
      }
    ]
    const subAccount: SubAccount = {
      collateral: new BigNumber('0.000612753953225098'),
      size: new BigNumber('0.00529'),
      lastIncreasedTime: 1663916920,
      entryPrice: new BigNumber('21245.593572'),
      entryFunding: new BigNumber('771.61544')
    }
    const prices: PriceDict = {
      BTC: new BigNumber('19174'),
      USDC: _1
    }
    const subAccountId = encodeSubAccountId('0x1111111111111111111111111111111111111111', 1, 1, false)
    const size = new BigNumber('0.00264')
    const profitAssetId = 0
    const { collateralPrice, assetPrice } = computeTradingPrice(assets, subAccountId, prices, false /* isOpen */)
    const oldLeverage = computeSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice).computed
      .leverage
    expect(oldLeverage).toBeBigNumber(new BigNumber('9.56589691246774616423'))
    const collateralDelta = calculateClosePositionCollateralAmount(
      assets,
      subAccountId,
      subAccount,
      prices,
      profitAssetId,
      size,
      _0
    )
    expect(collateralDelta).toApproximate(new BigNumber('0.00030579781408587121'))
    const computed = computeClosePosition(
      assets,
      subAccountId,
      {
        ...subAccount,
        collateral: subAccount.collateral.minus(collateralDelta)
      },
      profitAssetId,
      prices,
      size,
      _0
    )
    expect(computed.afterTrade.computed.leverage).toApproximate(new BigNumber('9.56589691246774616423'))
  })
})

describe('binarySearchRight', (): void => {
  let groundTruth = new BigNumber('314159.265358979323846264')
  const f1 = (x: BigNumber) => {
    return x.gte(groundTruth)
  }
  it('guess 1', () => {
    const res = binarySearchRight(f1, new BigNumber('100000'))
    expect(res.gte(groundTruth)).toBeTruthy()
    expect(res.lt(groundTruth.plus('0.001'))).toBeTruthy()
  })
  it('guess 2', () => {
    const res = binarySearchRight(f1, new BigNumber('500000'))
    expect(res.gte(groundTruth)).toBeTruthy()
    expect(res.lt(groundTruth.plus('0.001'))).toBeTruthy()
  })
  it('upper 1', () => {
    const res = binarySearchRight(f1, null, new BigNumber('10000000'))
    expect(res.gte(groundTruth)).toBeTruthy()
    expect(res.lt(groundTruth.plus('0.001'))).toBeTruthy()
  })

  const f2 = (x: BigNumber) => {
    return !x.isZero()
  }
  it('guess 1', () => {
    const res = binarySearchRight(f2, new BigNumber('0'))
    expect(res.gt(_0)).toBeTruthy()
  })
  it('guess 2', () => {
    const res = binarySearchRight(f2, new BigNumber('100000'))
    expect(res.gt(_0)).toBeTruthy()
  })
  it('upper 1', () => {
    const res = binarySearchRight(f2, null, new BigNumber('10000000'))
    expect(res.gt(_0)).toBeTruthy()
  })

  groundTruth = new BigNumber('0.000000123456')
  const f3 = (x: BigNumber) => {
    return x.gte(groundTruth)
  }
  it('guess 1', () => {
    const res = binarySearchRight(f3, new BigNumber('0'))
    expect(res.gte(groundTruth)).toBeTruthy()
    expect(res.lt(groundTruth.plus('0.001'))).toBeTruthy()
  })
  it('guess 2', () => {
    const res = binarySearchRight(f3, new BigNumber('10000'))
    expect(res.gte(groundTruth)).toBeTruthy()
    expect(res.lt(groundTruth.plus('0.001'))).toBeTruthy()
  })
  it('upper 1', () => {
    const res = binarySearchRight(f3, null, new BigNumber('10000000'))
    expect(res.gte(groundTruth)).toBeTruthy()
    expect(res.lt(groundTruth.plus('0.001'))).toBeTruthy()
  })
})

describe('binarySearchLeft', (): void => {
  let groundTruth = new BigNumber('314159.265358979323846264')
  const f1 = (x: BigNumber) => {
    return x.lt(groundTruth)
  }
  it('guess 1', () => {
    const res = binarySearchLeft(f1, new BigNumber('100000'))
    expect(res.lte(groundTruth)).toBeTruthy()
    expect(res.gt(groundTruth.minus('0.001'))).toBeTruthy()
  })
  it('guess 2', () => {
    const res = binarySearchLeft(f1, new BigNumber('500000'))
    expect(res.lte(groundTruth)).toBeTruthy()
    expect(res.gt(groundTruth.minus('0.001'))).toBeTruthy()
  })
  it('upper 1', () => {
    const res = binarySearchLeft(f1, null, new BigNumber('10000000'))
    expect(res.lte(groundTruth)).toBeTruthy()
    expect(res.gt(groundTruth.minus('0.001'))).toBeTruthy()
  })

  const f2 = (x: BigNumber) => {
    return x.isZero()
  }
  it('guess 1', () => {
    const res = binarySearchLeft(f2, new BigNumber('0'))
    expect(res).toBeBigNumber(_0)
  })
  it('guess 2', () => {
    const res = binarySearchLeft(f2, new BigNumber('100000'))
    expect(res).toBeBigNumber(_0)
  })
  it('upper 1', () => {
    const res = binarySearchLeft(f2, null, new BigNumber('10000000'))
    expect(res).toBeBigNumber(_0)
  })

  groundTruth = new BigNumber('0.000000123456')
  const f3 = (x: BigNumber) => {
    return x.lt(groundTruth)
  }
  it('guess 1', () => {
    const res = binarySearchLeft(f3, new BigNumber('0'))
    expect(res.lte(groundTruth)).toBeTruthy()
    expect(res.gt(groundTruth.minus('0.001'))).toBeTruthy()
  })
  it('guess 2', () => {
    const res = binarySearchLeft(f3, new BigNumber('10000'))
    expect(res.lte(groundTruth)).toBeTruthy()
    expect(res.gt(groundTruth.minus('0.001'))).toBeTruthy()
  })
  it('upper 1', () => {
    const res = binarySearchLeft(f3, null, new BigNumber('10000000'))
    expect(res.lte(groundTruth)).toBeTruthy()
    expect(res.gt(groundTruth.minus('0.001'))).toBeTruthy()
  })
})
