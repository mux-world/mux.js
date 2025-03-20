import { extendExpect } from '../helper'
import { BigNumber } from 'bignumber.js'
import { Mux3PriceDict, Mux3Storage, Mux3SubAccount } from '../../src/mux3/types'
import { MUX3_ADDRESS_PAD } from '../../src/mux3/constants'
import {
  computeMux3SubAccount,
  computeMux3PoolAumUsdWithPnl,
  computeMux3MarketBorrowRateApy,
  computeMux3OpenPosition,
  computeMux3ClosePosition,
  computeMux3WithdrawCollateral,
  computeMux3DeallocateLiquidity,
  computeMux3PoolCollateralUsd,
  computeMux3UpdatePoolBorrowing
} from '../../src/mux3/computations'
import {
  calculateMux3OpenPositionWithNewCollateral,
  calculateMux3ClosePositionCollateralUsd
} from '../../src/mux3/calculator'
import { ZERO_ADDRESS } from '../../src/constants'

extendExpect()

const usdc = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
const weth = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const wbtc = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
const arb = '0x912ce59144191c1204e64559fe8253a0e49e6548'
const pool1 = '0x0000000000000000000000000000000000000001'
const pool2 = '0x0000000000000000000000000000000000000002'
const pool3 = '0x0000000000000000000000000000000000000003'
const market1 = '0x11000000000000000000000000000000000000000000000000000000000000' // long btc
const market2 = '0x12000000000000000000000000000000000000000000000000000000000000' // short btc
const market3 = '0x13000000000000000000000000000000000000000000000000000000000000' // long eth

const storage: Mux3Storage = {
  collaterals: {
    [usdc]: {
      symbol: 'USDC',
      tokenAddress: usdc,
      decimals: 6,
      isExist: true,
      isStable: true,
      isShowInTraderCollateralList: true
    },
    [wbtc]: {
      symbol: 'WBTC',
      tokenAddress: wbtc,
      decimals: 8,
      isExist: true,
      isStable: false,
      isShowInTraderCollateralList: true
    },
    [arb]: {
      symbol: 'ARB',
      tokenAddress: arb,
      decimals: 18,
      isExist: true,
      isStable: false,
      isShowInTraderCollateralList: true
    }
  },
  markets: {
    [market1]: {
      marketId: market1,
      symbol: 'long',
      isLong: true,
      positionFeeRate: new BigNumber('0.001'),
      initialMarginRate: new BigNumber('0.006'),
      maintenanceMarginRate: new BigNumber('0.005'),
      lotSize: new BigNumber('0.0001'),
      oracleId: wbtc + MUX3_ADDRESS_PAD,
      backedPools: [
        {
          backedPool: pool1
        },
        {
          backedPool: pool2
        },
        {
          backedPool: pool3
        }
      ],
      openInterestCapUsd: new BigNumber('100000000')
    },
    [market2]: {
      marketId: market2,
      symbol: 'short',
      isLong: false,
      positionFeeRate: new BigNumber('0.001'),
      initialMarginRate: new BigNumber('0.006'),
      maintenanceMarginRate: new BigNumber('0.005'),
      lotSize: new BigNumber('0.0001'),
      oracleId: wbtc + MUX3_ADDRESS_PAD,
      backedPools: [
        {
          backedPool: pool1
        },
        {
          backedPool: pool2
        },
        {
          backedPool: pool3
        }
      ],
      openInterestCapUsd: new BigNumber('100000000')
    },
    [market3]: {
      marketId: market3,
      symbol: 'long',
      isLong: true,
      positionFeeRate: new BigNumber('0.001'),
      initialMarginRate: new BigNumber('0.006'),
      maintenanceMarginRate: new BigNumber('0.005'),
      lotSize: new BigNumber('0.0001'),
      oracleId: weth + MUX3_ADDRESS_PAD,
      backedPools: [
        {
          backedPool: pool1
        }
      ],
      openInterestCapUsd: new BigNumber('100000000')
    }
  },
  pools: {
    [pool1]: {
      poolAddress: pool1,
      lpSymbol: 'pool1',
      collateralToken: usdc,
      totalSupply: new BigNumber('999980'),
      liquidityFeeRate: new BigNumber('0.001'),
      liquidityCapUsd: new BigNumber('100000000'),
      liquidityBalances: {
        [usdc]: new BigNumber('999900')
      },
      borrowConfig: {
        k: new BigNumber('10'),
        b: new BigNumber('-7')
      },
      mux3PoolMarkets: {
        [market1]: {
          marketId: market1,
          isLong: true,
          totalSize: new BigNumber('15.1989'),
          averageEntryPrice: new BigNumber('50000'),
          cumulatedBorrowingPerUsd: new BigNumber('0.004'),
          lastBorrowingUpdateTime: 0
        },
        [market2]: {
          marketId: market2,
          isLong: false,
          totalSize: new BigNumber('0'),
          averageEntryPrice: new BigNumber('50000'),
          cumulatedBorrowingPerUsd: new BigNumber('0'),
          lastBorrowingUpdateTime: 0
        },
        [market3]: {
          marketId: market3,
          isLong: true,
          totalSize: new BigNumber('0'),
          averageEntryPrice: new BigNumber('0'),
          cumulatedBorrowingPerUsd: new BigNumber('0'),
          lastBorrowingUpdateTime: 0
        }
      },
      mux3PoolMarketsConfig: {
        [market1]: {
          marketId: market1,
          adlReserveRate: new BigNumber('0.80'),
          adlMaxPnlRate: new BigNumber('0.75'),
          adlTriggerRate: new BigNumber('0.70')
        },
        [market2]: {
          marketId: market2,
          adlReserveRate: new BigNumber('0.80'),
          adlMaxPnlRate: new BigNumber('0.75'),
          adlTriggerRate: new BigNumber('0.70')
        },
        [market3]: {
          marketId: market3,
          adlReserveRate: new BigNumber('0.80'),
          adlMaxPnlRate: new BigNumber('0.75'),
          adlTriggerRate: new BigNumber('0.70')
        }
      }
    },
    [pool2]: {
      poolAddress: pool2,
      lpSymbol: 'pool2',
      collateralToken: usdc,
      totalSupply: new BigNumber('999900'),
      liquidityFeeRate: new BigNumber('0.001'),
      liquidityCapUsd: new BigNumber('100000000'),
      liquidityBalances: {
        [usdc]: new BigNumber('999900')
      },
      borrowConfig: {
        k: new BigNumber('6'),
        b: new BigNumber('-6')
      },
      mux3PoolMarkets: {
        [market1]: {
          marketId: market1,
          isLong: true,
          totalSize: new BigNumber('21.1652'),
          averageEntryPrice: new BigNumber('50000'),
          cumulatedBorrowingPerUsd: new BigNumber('0.004'),
          lastBorrowingUpdateTime: 0
        },
        [market2]: {
          marketId: market2,
          isLong: false,
          totalSize: new BigNumber('0'),
          averageEntryPrice: new BigNumber('50000'),
          cumulatedBorrowingPerUsd: new BigNumber('0'),
          lastBorrowingUpdateTime: 0
        }
      },
      mux3PoolMarketsConfig: {
        [market1]: {
          marketId: market1,
          adlReserveRate: new BigNumber('0.80'),
          adlMaxPnlRate: new BigNumber('0.75'),
          adlTriggerRate: new BigNumber('0.70')
        },
        [market2]: {
          marketId: market2,
          adlReserveRate: new BigNumber('0.80'),
          adlMaxPnlRate: new BigNumber('0.75'),
          adlTriggerRate: new BigNumber('0.70')
        }
      }
    },
    [pool3]: {
      poolAddress: pool3,
      lpSymbol: 'pool3',
      collateralToken: wbtc,
      totalSupply: new BigNumber('999900'),
      liquidityFeeRate: new BigNumber('0.001'),
      liquidityCapUsd: new BigNumber('10000000'),
      liquidityBalances: {
        [wbtc]: new BigNumber('19.998')
      },
      borrowConfig: {
        k: new BigNumber('2.2'),
        b: new BigNumber('-3')
      },
      mux3PoolMarkets: {
        [market1]: {
          marketId: market1,
          isLong: true,
          totalSize: new BigNumber('23.6359'),
          averageEntryPrice: new BigNumber('50000'),
          cumulatedBorrowingPerUsd: new BigNumber('0.004'),
          lastBorrowingUpdateTime: 0
        },
        [market2]: {
          marketId: market2,
          isLong: false,
          totalSize: new BigNumber('0'),
          averageEntryPrice: new BigNumber('50000'),
          cumulatedBorrowingPerUsd: new BigNumber('0'),
          lastBorrowingUpdateTime: 0
        }
      },
      mux3PoolMarketsConfig: {
        [market1]: {
          marketId: market1,
          adlReserveRate: new BigNumber('0.80'),
          adlMaxPnlRate: new BigNumber('0.75'),
          adlTriggerRate: new BigNumber('0.70')
        },
        [market2]: {
          marketId: market2,
          adlReserveRate: new BigNumber('0.80'),
          adlMaxPnlRate: new BigNumber('0.75'),
          adlTriggerRate: new BigNumber('0.70')
        }
      }
    }
  },
  orderBook: {
    sequence: 0,
    gasFee: new BigNumber(0),
    liquidityLockPeriod: 900,
    minLiquidityOrderUsd: new BigNumber('0.1')
  },
  strictStableDeviation: new BigNumber('0.003'),
  borrowingBaseApy: new BigNumber('0.10'),
  borrowingInterval: 3600
}

const emptySubAccount: Mux3SubAccount = {
  subAccountId: '0x0000000000000000000000000000000000000000000000000000000000000000',
  collaterals: {},
  positions: {}
}

const longNormalSubAccount: Mux3SubAccount = {
  subAccountId: '0x0000000000000000000000000000000000000000000000000000000000000000',
  collaterals: {
    [usdc]: new BigNumber('30000'),
    [arb]: new BigNumber('30000')
  },
  positions: {
    [market1]: {
      initialLeverage: new BigNumber('100'),
      lastIncreasedTime: 0,
      realizedBorrowingUsd: new BigNumber('0'),
      pools: {
        [pool1]: {
          size: new BigNumber('15.1989'),
          entryPrice: new BigNumber('50000'),
          entryBorrowing: new BigNumber('0.001')
        },
        [pool2]: {
          size: new BigNumber('21.1652'),
          entryPrice: new BigNumber('50000'),
          entryBorrowing: new BigNumber('0.001')
        },
        [pool3]: {
          size: new BigNumber('23.6359'),
          entryPrice: new BigNumber('50000'),
          entryBorrowing: new BigNumber('0.001')
        }
      }
    }
  }
}

const shortNormalSubAccount: Mux3SubAccount = {
  subAccountId: '0x0000000000000000000000000000000000000000000000000000000000000000',
  collaterals: {
    [usdc]: new BigNumber('30000'),
    [arb]: new BigNumber('30000')
  },
  positions: {
    [market2]: {
      initialLeverage: new BigNumber('100'),
      lastIncreasedTime: 0,
      realizedBorrowingUsd: new BigNumber('0'),
      pools: {
        [pool1]: {
          size: new BigNumber('15.1989'),
          entryPrice: new BigNumber('50000'),
          entryBorrowing: new BigNumber('0')
        },
        [pool2]: {
          size: new BigNumber('21.1652'),
          entryPrice: new BigNumber('50000'),
          entryBorrowing: new BigNumber('0')
        },
        [pool3]: {
          size: new BigNumber('23.6359'),
          entryPrice: new BigNumber('50000'),
          entryBorrowing: new BigNumber('0')
        }
      }
    }
  }
}

describe('mux3:computations', () => {
  it('computeMux3SubAccount: empty', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const subAccountDetails = computeMux3SubAccount(storage, emptySubAccount, prices)
    expect(subAccountDetails.computed.collateralUsd).toBeBigNumber(new BigNumber('0'))
    expect(subAccountDetails.computed.marginBalanceUsd).toBeBigNumber(new BigNumber('0'))
    expect(subAccountDetails.computed.isIMSafe).toBe(true)
    expect(subAccountDetails.computed.isMMSafe).toBe(true)
    expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    expect(subAccountDetails.computed.withdrawableCollateralUsd).toBeBigNumber(new BigNumber('0'))
  })

  it('computeMux3SubAccount: long, profit', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('3'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const subAccountDetails = computeMux3SubAccount(storage, longNormalSubAccount, prices)
    expect(subAccountDetails.computed.collateralUsd).toBeBigNumber(new BigNumber('120000')) // 30000 + 30000 * 3
    expect(subAccountDetails.computed.positions[market1].size).toBeBigNumber(new BigNumber('60'))
    expect(subAccountDetails.computed.positions[market1].positionValueUsd).toBeBigNumber(new BigNumber('3600000')) // 60000 * 60
    expect(subAccountDetails.computed.positions[market1].entryValueUsd).toBeBigNumber(new BigNumber('3000000')) // 50000 * 60
    expect(subAccountDetails.computed.positions[market1].borrowingFeeUsd).toBeBigNumber(new BigNumber('10800')) // 60000 * 60 * 0.003
    // 50000 * 15.1989 * 0.70 + 50000 * 21.1652 * 0.70 + 50000 * 23.6359 * 0.70 / (1 - 0.70)
    expect(subAccountDetails.computed.positions[market1].maxProfitUsd).toBeBigNumber(
      new BigNumber('4030265.16666666666666666667')
    )
    expect(subAccountDetails.computed.positions[market1].pnlUsd).toBeBigNumber(new BigNumber('600000')) // (60000 - 50000) * 60
    expect(subAccountDetails.computed.positions[market1].pnlAfterBorrowingUsd).toBeBigNumber(new BigNumber('589200')) // 600000 - 10800
    expect(subAccountDetails.computed.positions[market1].leverage).toBeBigNumber(new BigNumber('25')) // 3000000 / 120000
    expect(subAccountDetails.computed.positions[market1].roe).toBeBigNumber(new BigNumber('20')) // cross margin uses traderLeverage, 600000 / (3000000 / 100)
    expect(subAccountDetails.computed.marginBalanceUsd).toBeBigNumber(new BigNumber('709200')) // 120000 + 600000 - 10800
    expect(subAccountDetails.computed.isIMSafe).toBe(true)
    expect(subAccountDetails.computed.isMMSafe).toBe(true)
    expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    expect(subAccountDetails.computed.withdrawableCollateralUsd).toBeBigNumber(new BigNumber('79200')) // 120000 - 10800 - 50000 * 60 * 0.01
  })

  it('computeMux3PoolCollateralUsd', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('3'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const pool = storage.pools[pool1]
    const poolCollateralUsd = computeMux3PoolCollateralUsd(pool, prices)
    expect(poolCollateralUsd).toBeBigNumber(new BigNumber('999900')) // 999900 * 1
  })

  it('aumWithPnl', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const pool = storage.pools[pool1]
    const aumUsdWithPnl = computeMux3PoolAumUsdWithPnl(storage, pool, prices)
    expect(aumUsdWithPnl).toBeBigNumber(new BigNumber('847911')) // 999900 - (60000 - 50000) * 15.1989
  })

  it('market borrowing apy', () => {
    const market = storage.markets[market1]
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    // fr1 0.10 + exp( 10 * 15.1989 * 50000 * 0.80 / 999900 - 7)           = 0.498586004604546543
    // fr2 0.10 + exp(  6 * 21.1652 * 50000 * 0.80 / 999900 - 6)           = 0.498581221122844065
    // fr2 0.10 + exp(2.2 * 23.6359 * 60000 * 0.80 / (19.998 * 60000) - 3) = 0.498585685703980363
    // (apy1 * sizeUsd1 + apy2 * sizeUsd2 + apy3 * sizeUsd3) / (sizeUsd1 + sizeUsd2 + sizeUsd3)
    // = (0.4985860046045465 * 759945 + 0.49858122112284405 * 1058260 + 0.49858568570398034 * 1181795) / (759945 + 1058260 + 1181795)
    const borrowingApy = computeMux3MarketBorrowRateApy(storage, market, prices)
    expect(borrowingApy).toBeBigNumber(new BigNumber('0.4985841915903994934'))
  })

  it('liquidation price: long btc, collateral does not include btc', () => {
    // get liq price
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    {
      const subAccountDetails = computeMux3SubAccount(storage, longNormalSubAccount, prices)
      expect(subAccountDetails.computed.positions[market1].liquidationPrice).toApproximate(
        new BigNumber('48894.47236180904522613065')
      )
    }
    // safe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('48895')
      const subAccountDetails = computeMux3SubAccount(storage, longNormalSubAccount, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(true)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
    // unsafe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('48891') // the difference is due to that borrowing fee decreasing
      const subAccountDetails = computeMux3SubAccount(storage, longNormalSubAccount, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(false)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
  })

  it('liquidation price: long btc, collateral includes btc', () => {
    // get liq price
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    const subAccount2 = {
      ...longNormalSubAccount,
      collaterals: {
        [usdc]: new BigNumber('30000'),
        [wbtc]: new BigNumber('1')
      }
    }
    {
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.positions[market1].liquidationPrice).toApproximate(
        new BigNumber('49077.42998352553542009885')
      )
    }
    // safe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('49078')
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(true)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
    // unsafe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('49074') // the difference is due to that borrowing fee decreasing
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(false)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
  })

  it('liquidation price: short btc, collateral does not include btc', () => {
    // get liq price
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    {
      const subAccountDetails = computeMux3SubAccount(storage, shortNormalSubAccount, prices)
      expect(subAccountDetails.computed.positions[market2].liquidationPrice).toApproximate(
        new BigNumber('51243.7810945273631840796')
      )
    }
    // safe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('51243')
      const subAccountDetails = computeMux3SubAccount(storage, shortNormalSubAccount, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(true)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
    // unsafe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('51244')
      const subAccountDetails = computeMux3SubAccount(storage, shortNormalSubAccount, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(false)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
  })

  it('liquidation price: short btc, collateral includes btc', () => {
    // get liq price
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    const subAccount2 = {
      ...shortNormalSubAccount,
      collaterals: {
        [usdc]: new BigNumber('30000'),
        [wbtc]: new BigNumber('1')
      }
    }
    {
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.positions[market2].liquidationPrice).toApproximate(
        new BigNumber('51096.12141652613827993255')
      )
    }
    // safe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('51096')
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(true)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
    // unsafe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('51097')
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(false)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
  })

  it('liquidation price: long btc + long eth, upnl < 0', () => {
    // get liq price
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000'),
      [weth + MUX3_ADDRESS_PAD]: new BigNumber('3000')
    }
    const subAccount2 = {
      subAccountId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      collaterals: {
        [usdc]: new BigNumber('30000')
      },
      positions: {
        [market1]: {
          initialLeverage: new BigNumber('100'),
          lastIncreasedTime: 0,
          realizedBorrowingUsd: new BigNumber('0'),
          pools: {
            [pool1]: {
              size: new BigNumber('1'),
              entryPrice: new BigNumber('51000'),
              entryBorrowing: new BigNumber('0')
            }
          }
        },
        [market3]: {
          initialLeverage: new BigNumber('100'),
          lastIncreasedTime: 0,
          realizedBorrowingUsd: new BigNumber('0'),
          pools: {
            [pool1]: {
              size: new BigNumber('1'),
              entryPrice: new BigNumber('3100'),
              entryBorrowing: new BigNumber('0')
            }
          }
        }
      }
    }
    {
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.positions[market1].liquidationPrice).toApproximate(
        new BigNumber('21422.11055276381909547739')
      )
    }
    // safe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('21423')
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(true)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
    // unsafe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('21300') // the difference is due to that borrowing fee decreasing
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(false)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
  })

  it('liquidation price: long btc + short btc, upnl < 0', () => {
    // get liq price
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    const subAccount2 = {
      subAccountId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      collaterals: {
        [usdc]: new BigNumber('30000')
      },
      positions: {
        [market1]: {
          initialLeverage: new BigNumber('100'),
          lastIncreasedTime: 0,
          realizedBorrowingUsd: new BigNumber('0'),
          pools: {
            [pool1]: {
              size: new BigNumber('5'),
              entryPrice: new BigNumber('51000'),
              entryBorrowing: new BigNumber('0')
            }
          }
        },
        [market2]: {
          initialLeverage: new BigNumber('100'),
          lastIncreasedTime: 0,
          realizedBorrowingUsd: new BigNumber('0'),
          pools: {
            [pool1]: {
              size: new BigNumber('4'),
              entryPrice: new BigNumber('51000'),
              entryBorrowing: new BigNumber('0')
            }
          }
        }
      }
    }
    {
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.positions[market1].liquidationPrice).toApproximate(
        new BigNumber('23036.64921465968586387435')
      )
    }
    // safe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('23037')
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(true)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
    // unsafe
    {
      prices[wbtc + MUX3_ADDRESS_PAD] = new BigNumber('22450') // the difference is due to that borrowing fee decreasing
      const subAccountDetails = computeMux3SubAccount(storage, subAccount2, prices)
      expect(subAccountDetails.computed.isIMSafe).toBe(false)
      expect(subAccountDetails.computed.isMMSafe).toBe(false)
      expect(subAccountDetails.computed.isMarginSafe).toBe(true)
    }
  })

  it('open long from empty, exceeds max leverage', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    const subAccount1 = {
      ...emptySubAccount,
      collaterals: {
        [usdc]: new BigNumber('1000')
      }
    }
    const result = computeMux3OpenPosition(
      storage,
      storage.markets[market1],
      subAccount1,
      prices,
      new BigNumber('1'), // amount
      new BigNumber('10'), // initial leverage
      ZERO_ADDRESS
    )
    expect(result.isTradeSafe).toBe(false)
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].size).toBeBigNumber(new BigNumber('1'))
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryPrice).toBeBigNumber(
      new BigNumber('50000')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
  })

  it('open long from empty', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    const subAccount1 = {
      ...emptySubAccount,
      collaterals: {
        [usdc]: new BigNumber('10000')
      }
    }
    const result = computeMux3OpenPosition(
      storage,
      storage.markets[market1],
      subAccount1,
      prices,
      new BigNumber('1'), // amount
      new BigNumber('10'), // initial leverage
      ZERO_ADDRESS
    )
    expect(result.isTradeSafe).toBe(true)
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].size).toBeBigNumber(new BigNumber('1'))
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryPrice).toBeBigNumber(
      new BigNumber('50000')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
  })

  it('open again, pay borrowing fee', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const result = computeMux3OpenPosition(
      storage,
      storage.markets[market1],
      longNormalSubAccount,
      prices,
      new BigNumber('1'), // amount
      new BigNumber('100'), // initial leverage
      ZERO_ADDRESS
    )
    expect(result.isTradeSafe).toBe(true)
    // borrowing fee = 0.003 * 60000 * 60 = 10800
    // position fee = 60000 * 1 * 0.001 = 60
    expect(result.borrowingFeeUsd).toBeBigNumber(new BigNumber('10800'))
    expect(result.positionFeeUsd).toBeBigNumber(new BigNumber('60'))
    expect(result.afterTrade.subAccount.collaterals[usdc]).toBeBigNumber(new BigNumber('19140')) // 30000 - 10800 - 60
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].size).toBeBigNumber(new BigNumber('16.1989')) // 15.1989 + 1
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryPrice).toBeBigNumber(
      new BigNumber('50617.32586780583866805771') // (50000 * 15.1989 + 60000 * 1) / 16.1989
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
    expect(longNormalSubAccount.positions[market1].pools[pool1].entryBorrowing).toBeBigNumber(new BigNumber('0.001')) // computeMux3OpenPosition should be immutable
  })

  it('close half, take profit', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const result = computeMux3ClosePosition(
      storage,
      storage.markets[market1],
      longNormalSubAccount,
      prices,
      new BigNumber('10'), // amount
      ZERO_ADDRESS,
      false, // withdrawProfit
      new BigNumber('0'), // withdrawUsd
      false // withdrawAllIfEmpty
    )
    expect(result.isTradeSafe).toBe(true)
    // borrowing fee = 0.003 * 60000 * 60 = 10800
    // position fee = 60000 * 10 * 0.001 = 600
    // Δsize1 = 15.1989 / 60 * 10 = 2.53315
    // Δsize2 = 21.1652 / 60 * 10 = 3.52753333333333333333
    // Δsize3 = 23.6359 / 60 * 10 = 3.93931666666666666667
    // pnl1 = (60000 - 50000) * 2.53315 = 25331.5
    // pnl2 = (60000 - 50000) * 3.52753333333333333333 = 35275.3333333333333333
    // pnl3 = (60000 - 50000) * 3.93931666666666666667 = 39393.1666666666666667 = 0.65655277777777777778 btc
    // pnlUsd = (60000 - 50000) * 10 = 100000
    expect(result.borrowingFeeUsd).toBeBigNumber(new BigNumber('10800'))
    expect(result.positionFeeUsd).toBeBigNumber(new BigNumber('600'))
    expect(result.pnlUsd).toBeBigNumber(new BigNumber('100000'))
    expect(result.afterTrade.subAccount.collaterals[usdc]).toBeBigNumber(new BigNumber('79206.8333333333333333')) // 30000 + 25331.5 + 35275.3333333333333333 - 10800 - 600
    expect(result.afterTrade.subAccount.collaterals[arb]).toBeBigNumber(new BigNumber('30000')) // unchanged
    expect(result.afterTrade.subAccount.collaterals[wbtc]).toBeBigNumber(new BigNumber('0.65655277777777777778')) // 0 + 0.65655277777777777778
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].size).toApproximate(new BigNumber('12.66575')) // 15.1989 - 2.53315
    expect(result.afterTrade.subAccount.positions[market1].pools[pool2].size).toApproximate(
      new BigNumber('17.63766666666666666667')
    ) // 21.1652 - 3.52753333333333333333
    expect(result.afterTrade.subAccount.positions[market1].pools[pool3].size).toApproximate(
      new BigNumber('19.69658333333333333333')
    ) // 23.6359 - 3.93931666666666666667
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryPrice).toApproximate(
      new BigNumber('50000')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool2].entryPrice).toApproximate(
      new BigNumber('50000')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool3].entryPrice).toApproximate(
      new BigNumber('50000')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool2].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool3].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
    expect(longNormalSubAccount.positions[market1].pools[pool1].entryBorrowing).toBeBigNumber(new BigNumber('0.001')) // computeMux3ClosePosition should be immutable
  })

  it('close half, realize loss', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('1.5'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('49500')
    }
    const result = computeMux3ClosePosition(
      storage,
      storage.markets[market1],
      longNormalSubAccount,
      prices,
      new BigNumber('10'), // amount
      ZERO_ADDRESS,
      false, // withdrawProfit
      new BigNumber('0'), // withdrawUsd
      false // withdrawAllIfEmpty
    )
    expect(result.isTradeSafe).toBe(true)
    // borrowing fee = 0.003 * 49500 * 60 = 8910
    // position fee = 49500 * 10 * 0.001 = 495
    // Δsize1 = 15.1989 / 60 * 10 = 2.53315
    // Δsize2 = 21.1652 / 60 * 10 = 3.52753333333333333333
    // Δsize3 = 23.6359 / 60 * 10 = 3.93931666666666666667
    // pnlUsd = (49500 - 50000) * 10 = -5000
    expect(result.borrowingFeeUsd).toBeBigNumber(new BigNumber('8910'))
    expect(result.positionFeeUsd).toBeBigNumber(new BigNumber('495'))
    expect(result.pnlUsd).toBeBigNumber(new BigNumber('-5000'))
    expect(result.afterTrade.subAccount.collaterals[usdc]).toBeBigNumber(new BigNumber('15595')) // 30000 - 5000 - 8910 - 495
    expect(result.afterTrade.subAccount.collaterals[arb]).toBeBigNumber(new BigNumber('30000')) // 30000
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].size).toApproximate(new BigNumber('12.66575')) // 15.1989 - 2.53315
    expect(result.afterTrade.subAccount.positions[market1].pools[pool2].size).toApproximate(
      new BigNumber('17.63766666666666666667')
    ) // 21.1652 - 3.52753333333333333333
    expect(result.afterTrade.subAccount.positions[market1].pools[pool3].size).toApproximate(
      new BigNumber('19.69658333333333333333')
    ) // 23.6359 - 3.93931666666666666667
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryPrice).toApproximate(
      new BigNumber('50000')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool2].entryPrice).toApproximate(
      new BigNumber('50000')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool3].entryPrice).toApproximate(
      new BigNumber('50000')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool1].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool2].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
    expect(result.afterTrade.subAccount.positions[market1].pools[pool3].entryBorrowing).toBeBigNumber(
      new BigNumber('0.004')
    )
    expect(longNormalSubAccount.positions[market1].pools[pool1].entryBorrowing).toBeBigNumber(new BigNumber('0.001')) // computeMux3ClosePosition should be immutable
  })

  it('close half, profit, withdraw profit + withdraw usd', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const result = computeMux3ClosePosition(
      storage,
      storage.markets[market1],
      longNormalSubAccount,
      prices,
      new BigNumber('10'), // amount
      usdc,
      true, // withdrawProfit
      new BigNumber('500'), // withdrawUsd
      false // withdrawAllIfEmpty
    )
    expect(result.isTradeSafe).toBe(true)
    // borrowing fee = 0.003 * 60000 * 60 = 10800
    // position fee = 60000 * 10 * 0.001 = 600
    // Δsize1 = 15.1989 / 60 * 10 = 2.53315
    // Δsize2 = 21.1652 / 60 * 10 = 3.52753333333333333333
    // Δsize3 = 23.6359 / 60 * 10 = 3.93931666666666666667
    // pnl1 = (60000 - 50000) * 2.53315 = 25331.5
    // pnl2 = (60000 - 50000) * 3.52753333333333333333 = 35275.3333333333333333
    // pnl3 = (60000 - 50000) * 3.93931666666666666667 = 39393.1666666666666667 = 0.65655277777777777778 btc
    // pnlUsd = (60000 - 50000) * 10 = 100000
    // realize fees = (10800 + 600) / 60000 = 0.19
    // withdrawing 100000 - (10800 + 600) + 500 = 89100
    //           = 0.46655277777777777778 wbtc * 60000 + 30000 arb * 2 + 1106.8333333333333332
    expect(result.borrowingFeeUsd).toBeBigNumber(new BigNumber('10800'))
    expect(result.positionFeeUsd).toBeBigNumber(new BigNumber('600'))
    expect(result.pnlUsd).toBeBigNumber(new BigNumber('100000'))
    expect(result.afterTrade.subAccount.collaterals[wbtc]).toBeBigNumber(new BigNumber('0')) // 0 + 0.65655277777777777778 - 0.19 - 0.46655277777777777778
    expect(result.afterTrade.subAccount.collaterals[arb]).toBeBigNumber(new BigNumber('0')) // 30000 - 30000
    expect(result.afterTrade.subAccount.collaterals[usdc]).toBeBigNumber(new BigNumber('89500.0000000000000001')) // 30000 + 25331.5 + 35275.3333333333333333 - 1106.8333333333333332
  })

  it('withdraw collateral, deduct borrowing fee', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50000')
    }
    // preview
    {
      const subAccountDetails = computeMux3SubAccount(storage, longNormalSubAccount, prices)
      // borrowing = 50000 * 60 * 0.003 = 9000
      // pnl = 0
      // collateral = 30000 + 30000 * 2 = 90000
      // collateral - borrowing = 90000 - 9000 = 81000
      // margin balance = 81000
      // im = 50000 * 60 * 0.006 = 18000
      // entryLev = 50000 * 60 / 100 = 30000
      // max withdraw (according to marginBalance >= im) = 81000 - 18000 = 63000
      // max withdraw (according to collateral >= entryLev) = 81000 - 30000 = 51000
      expect(subAccountDetails.computed.positions[market1].borrowingFeeUsd).toBeBigNumber(new BigNumber('9000'))
      expect(subAccountDetails.computed.positions[market1].pnlUsd).toBeBigNumber(new BigNumber('0'))
      expect(subAccountDetails.computed.withdrawableCollateralUsd).toBeBigNumber(new BigNumber('51000'))
    }
    // withdraw more 51001 / 2 = 25500.5
    {
      const result = computeMux3WithdrawCollateral(
        storage,
        longNormalSubAccount,
        prices,
        arb,
        new BigNumber('25500.5'),
        ZERO_ADDRESS
      )
      expect(result.isTradeSafe).toBe(false)
    }
    // withdraw less 51000 / 2 = 25500
    {
      const result = computeMux3WithdrawCollateral(
        storage,
        longNormalSubAccount,
        prices,
        arb,
        new BigNumber('25500'),
        ZERO_ADDRESS
      )
      expect(result.isTradeSafe).toBe(true)
    }
  })

  it('calculateMux3OpenPositionWithCollateral', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('3'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const adding = new BigNumber('20000')
    const result = calculateMux3OpenPositionWithNewCollateral(
      storage,
      storage.markets[market1],
      longNormalSubAccount,
      prices,
      new BigNumber('25'), // so that leverage not changed
      usdc,
      adding
    )
    expect(result).toBeBigNumber(new BigNumber('3.7398'))
    const subAccount2 = {
      ...longNormalSubAccount,
      collaterals: {
        ...longNormalSubAccount.collaterals,
        [usdc]: longNormalSubAccount.collaterals[usdc].plus(adding)
      }
    }
    const trade = computeMux3OpenPosition(
      storage,
      storage.markets[market1],
      subAccount2,
      prices,
      result,
      new BigNumber('25'),
      ZERO_ADDRESS
    )
    expect(trade.isTradeSafe).toBe(true)
    expect(trade.borrowingFeeUsd).toBeBigNumber(new BigNumber('10800')) // 60000 * 60 * 0.003
    expect(trade.positionFeeUsd).toBeBigNumber(new BigNumber('224.388')) // 3.7398 * 60000 * 0.001
    expect(trade.afterTrade.computed.collateralUsd).toBeBigNumber(new BigNumber('128975.612')) // (30000 + 30000 * 3) + 20000 - 10800 - 224.388
    expect(trade.afterTrade.computed.positions[market1].leverage).toApproximate(
      new BigNumber('24.99998216717126335481')
    )
  })

  it('calculateMux3ClosePositionCollateralUsd to keep leverage', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('3'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('60000')
    }
    const closeSize = new BigNumber('30')
    const result = calculateMux3ClosePositionCollateralUsd(
      storage,
      storage.markets[market1],
      longNormalSubAccount,
      prices,
      closeSize,
      ZERO_ADDRESS,
      false // withdrawProfit
    )
    expect(result).toBeBigNumber(new BigNumber('347399.9999999999999998'))
    const trade = computeMux3ClosePosition(
      storage,
      storage.markets[market1],
      {
        ...longNormalSubAccount,
        collaterals: {
          ...longNormalSubAccount.collaterals,
          [arb]: longNormalSubAccount.collaterals[arb].minus(result.div(3))
        }
      },
      prices,
      closeSize,
      ZERO_ADDRESS,
      false, // withdrawProfit
      new BigNumber('0'), // withdrawUsd
      false // withdrawAllIfEmpty
    )
    expect(trade.isTradeSafe).toBe(true)
    expect(trade.borrowingFeeUsd).toBeBigNumber(new BigNumber('10800')) // 60000 * 60 * 0.003
    expect(trade.positionFeeUsd).toBeBigNumber(new BigNumber('1800')) // 30 * 60000 * 0.001
    expect(trade.pnlUsd).toBeBigNumber(new BigNumber('300000')) // (60000 - 50000) * 30
    expect(trade.afterTrade.computed.collateralUsd).toApproximate(new BigNumber('60000')) // (30000 + 30000 * 3) - 10800 - 1800 + 300000 - withdraw
    expect(trade.afterTrade.computed.positions[market1].leverage).toApproximate(new BigNumber('25'))
  })

  it('deallocate', () => {
    const result = computeMux3DeallocateLiquidity(longNormalSubAccount.positions[market1], new BigNumber('10'))
    expect(result).toEqual({
      [pool1]: new BigNumber('2.53315'), // 15.1989 * 10 / 60
      [pool2]: new BigNumber('3.52753333333333333333'), // 21.1652 * 10 / 60
      [pool3]: new BigNumber('3.93931666666666666667') // 23.6359 * 10 / 60
    })
  })

  it('deallocate', () => {
    const result = computeMux3DeallocateLiquidity(longNormalSubAccount.positions[market1], new BigNumber('60'))
    expect(result).toEqual({
      [pool1]: new BigNumber('15.1989'),
      [pool2]: new BigNumber('21.1652'),
      [pool3]: new BigNumber('23.6359')
    })
  })

  it('update pool borrowing: success', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50500')
    }
    const blockTime = Math.floor(Date.now() / 1000)
    const nextFundingTime = Math.floor(blockTime / 3600) * 3600
    const storage1 = {
      ...storage,
      pools: {
        ...storage.pools,
        [pool1]: {
          ...storage.pools[pool1],
          mux3PoolMarkets: {
            ...storage.pools[pool1].mux3PoolMarkets
          }
        },
        [pool2]: {
          ...storage.pools[pool2],
          mux3PoolMarkets: {
            ...storage.pools[pool2].mux3PoolMarkets
          }
        },
        [pool3]: {
          ...storage.pools[pool3],
          mux3PoolMarkets: {
            ...storage.pools[pool3].mux3PoolMarkets
          }
        }
      }
    }
    storage1.pools[pool1].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd = new BigNumber('1')
    storage1.pools[pool2].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd = new BigNumber('2')
    storage1.pools[pool3].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd = new BigNumber('3')
    storage1.pools[pool1].mux3PoolMarkets[market1].lastBorrowingUpdateTime = nextFundingTime - 7 * 86400
    storage1.pools[pool2].mux3PoolMarkets[market1].lastBorrowingUpdateTime = nextFundingTime - 7 * 86400
    storage1.pools[pool3].mux3PoolMarkets[market1].lastBorrowingUpdateTime = nextFundingTime - 7 * 86400
    // fr1 0.10 + exp( 10 * 15.1989 * 50000 * 0.80 / 999900 - 7)           = 0.498586004604546543
    // fr2 0.10 + exp(  6 * 21.1652 * 50000 * 0.80 / 999900 - 6)           = 0.498581221122844065
    // fr2 0.10 + exp(2.2 * 23.6359 * 60000 * 0.80 / (19.998 * 60000) - 3) = 0.498585685703980363
    // acc1 0.498586004604546543 * 7 / 365 = 0.009561923375977604
    // acc2 0.498581221122844065 * 7 / 365 = 0.009561831637972351
    // acc2 0.498585685703980363 * 7 / 365 = 0.009561917260076335
    const result = computeMux3UpdatePoolBorrowing(storage1, prices)
    expect(result.pools[pool1].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd).toBeBigNumber(
      new BigNumber('1.00956192337597760411')
    )
    expect(result.pools[pool1].mux3PoolMarkets[market2].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('0'))
    expect(result.pools[pool1].mux3PoolMarkets[market3].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('0'))
    expect(result.pools[pool2].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd).toBeBigNumber(
      new BigNumber('2.00956183163797235164')
    )
    expect(result.pools[pool2].mux3PoolMarkets[market2].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('0'))
    expect(result.pools[pool3].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd).toBeBigNumber(
      new BigNumber('3.00956191726007633529')
    )
    expect(result.pools[pool1].mux3PoolMarkets[market1].lastBorrowingUpdateTime).toBe(nextFundingTime)
    expect(result.pools[pool1].mux3PoolMarkets[market2].lastBorrowingUpdateTime).toBe(nextFundingTime)
    expect(result.pools[pool1].mux3PoolMarkets[market3].lastBorrowingUpdateTime).toBe(nextFundingTime)
    expect(result.pools[pool2].mux3PoolMarkets[market1].lastBorrowingUpdateTime).toBe(nextFundingTime)
    expect(result.pools[pool2].mux3PoolMarkets[market2].lastBorrowingUpdateTime).toBe(nextFundingTime)
    expect(result.pools[pool3].mux3PoolMarkets[market1].lastBorrowingUpdateTime).toBe(nextFundingTime)
  })

  it('update pool borrowing: skip', () => {
    const prices: Mux3PriceDict = {
      [usdc + MUX3_ADDRESS_PAD]: new BigNumber('1'),
      [arb + MUX3_ADDRESS_PAD]: new BigNumber('2'),
      [wbtc + MUX3_ADDRESS_PAD]: new BigNumber('50500')
    }
    const blockTime = Math.floor(Date.now() / 1000)
    const nextFundingTime = Math.floor(blockTime / 3600) * 3600
    const storage1 = {
      ...storage,
      pools: {
        ...storage.pools,
        [pool1]: {
          ...storage.pools[pool1],
          mux3PoolMarkets: {
            ...storage.pools[pool1].mux3PoolMarkets
          }
        },
        [pool2]: {
          ...storage.pools[pool2],
          mux3PoolMarkets: {
            ...storage.pools[pool2].mux3PoolMarkets
          }
        },
        [pool3]: {
          ...storage.pools[pool3],
          mux3PoolMarkets: {
            ...storage.pools[pool3].mux3PoolMarkets
          }
        }
      }
    }
    storage1.pools[pool1].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd = new BigNumber('1')
    storage1.pools[pool2].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd = new BigNumber('2')
    storage1.pools[pool3].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd = new BigNumber('3')
    storage1.pools[pool1].mux3PoolMarkets[market1].lastBorrowingUpdateTime = nextFundingTime - 1800
    storage1.pools[pool2].mux3PoolMarkets[market1].lastBorrowingUpdateTime = nextFundingTime - 1800
    storage1.pools[pool3].mux3PoolMarkets[market1].lastBorrowingUpdateTime = nextFundingTime - 1800
    const result = computeMux3UpdatePoolBorrowing(storage1, prices)
    expect(result.pools[pool1].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('1'))
    expect(result.pools[pool1].mux3PoolMarkets[market2].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('0'))
    expect(result.pools[pool1].mux3PoolMarkets[market3].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('0'))
    expect(result.pools[pool2].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('2'))
    expect(result.pools[pool2].mux3PoolMarkets[market2].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('0'))
    expect(result.pools[pool3].mux3PoolMarkets[market1].cumulatedBorrowingPerUsd).toBeBigNumber(new BigNumber('3'))
    expect(result.pools[pool1].mux3PoolMarkets[market1].lastBorrowingUpdateTime).toBe(nextFundingTime - 1800)
    expect(result.pools[pool1].mux3PoolMarkets[market2].lastBorrowingUpdateTime).toBe(nextFundingTime)
    expect(result.pools[pool1].mux3PoolMarkets[market3].lastBorrowingUpdateTime).toBe(nextFundingTime)
    expect(result.pools[pool2].mux3PoolMarkets[market1].lastBorrowingUpdateTime).toBe(nextFundingTime - 1800)
    expect(result.pools[pool2].mux3PoolMarkets[market2].lastBorrowingUpdateTime).toBe(nextFundingTime)
    expect(result.pools[pool3].mux3PoolMarkets[market1].lastBorrowingUpdateTime).toBe(nextFundingTime - 1800)
  })
})
