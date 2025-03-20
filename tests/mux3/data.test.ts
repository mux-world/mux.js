import { extendExpect } from '../helper'
import {
  decodeMux3PositionId,
  decodeMux3RawPositionId,
  encodeMux3PositionId,
  encodeMux3RawPositionId,
  parseMux3OrderPayload
} from '../../src/mux3/data'
import { BigNumber } from 'bignumber.js'
import { Mux3Storage } from '../../src/mux3/types'
import { Mux3OrderType, Mux3PositionOrderFlags } from '../../src/mux3/constants'
extendExpect()

const storage: Mux3Storage = {
  collaterals: {
    '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512': {
      symbol: 'USDC',
      tokenAddress: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
      decimals: 18,
      isExist: true,
      isStable: true,
      isShowInTraderCollateralList: true
    }
  },
  pools: {
    '0x9162d0ebd913f439f9e43ead9b76c2395888b558': {
      poolAddress: '0x9162d0ebd913f439f9e43ead9b76c2395888b558',
      lpSymbol: 'pool1',
      collateralToken: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
      totalSupply: new BigNumber(0),
      liquidityFeeRate: new BigNumber(0),
      liquidityCapUsd: new BigNumber(0),
      liquidityBalances: {},
      borrowConfig: {
        k: new BigNumber(0),
        b: new BigNumber(0)
      },
      mux3PoolMarkets: {},
      mux3PoolMarketsConfig: {}
    }
  },
  markets: {},
  orderBook: {
    sequence: 0,
    gasFee: new BigNumber(0),
    liquidityLockPeriod: 0,
    minLiquidityOrderUsd: new BigNumber(0)
  },
  strictStableDeviation: new BigNumber('0.001'),
  borrowingBaseApy: new BigNumber('0.10'),
  borrowingInterval: 3600
}

describe('mux3:data', () => {
  it('encodeMux3RawPositionId', () => {
    const address = '0x0000000000000000000000000000000000000001'
    const index = 1
    const subAccountId = encodeMux3RawPositionId(address, index)
    const decoded = decodeMux3RawPositionId(subAccountId)
    expect(decoded.account).toBe(address)
    expect(decoded.rawIndex.toString()).toBe('1')
  })

  it('encodeAndDecodeMux3SubAccountId', () => {
    const address = '0x0000000000000000000000000000000000000001'
    const collateralToken = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512'
    const marketId = '0x1110000000000000000000000000000000000000000000000000000000000000'
    const subAccountId = encodeMux3PositionId(address, collateralToken, marketId)
    const decoded = decodeMux3PositionId(subAccountId)
    expect(decoded.account).toBe(address)
    expect(decoded.collateralPrefix).toBe(collateralToken.slice(0, 14))
    expect(decoded.marketPrefix).toBe(marketId.slice(0, 14))
  })

  it('parse position order', () => {
    const raw =
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000011100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000a2a15d09519be000000000000000000000000000000000000000000000000000000000000067277ac00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f05120000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000df27a2cdf4480000000000000000000000000000000000000000000000000000dcef33a6f8380000000000000000000000000000000000000000000000000000000000067277ea80000000000000000000000000000000000000000000000000000000000000320000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f05120000000000000000000000000000000000000000000000000000000000000000'
    const order = parseMux3OrderPayload(raw, Mux3OrderType.Position, storage)
    expect(order.positionOrder!.positionId).toBe('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000')
    expect(order.positionOrder!.marketId).toBe('0x1110000000000000000000000000000000000000000000000000000000000000')
    expect(order.positionOrder!.size).toBeBigNumber(new BigNumber('1'))
    expect(order.positionOrder!.flags).toBe(Mux3PositionOrderFlags.OpenPosition + Mux3PositionOrderFlags.MarketOrder)
    expect(order.positionOrder!.limitPrice).toBeBigNumber(new BigNumber('3000'))
    expect(order.positionOrder!.expiration).toBe(1730640576)
    expect(order.positionOrder!.lastConsumedToken).toBe('0x0000000000000000000000000000000000000000')
    expect(order.positionOrder!.collateralToken).toBe('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')
    expect(order.positionOrder!.collateralAmount).toBeBigNumber(new BigNumber('1'))
    expect(order.positionOrder!.withdrawUsd).toBeBigNumber(new BigNumber('0'))
    expect(order.positionOrder!.withdrawSwapToken).toBe('0x0000000000000000000000000000000000000000')
    expect(order.positionOrder!.withdrawSwapSlippage).toBeBigNumber(new BigNumber('0'))
    expect(order.positionOrder!.tpPriceDiff).toBeBigNumber(new BigNumber('1.005'))
    expect(order.positionOrder!.slPriceDiff).toBeBigNumber(new BigNumber('0.995'))
    expect(order.positionOrder!.tpslExpiration).toBe(1730641576)
    expect(order.positionOrder!.tpslFlags).toBe(
      Mux3PositionOrderFlags.WithdrawAllIfEmpty +
        Mux3PositionOrderFlags.WithdrawProfit +
        Mux3PositionOrderFlags.UnwrapEth
    )
    expect(order.positionOrder!.tpslWithdrawSwapToken).toBe('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')
    expect(order.positionOrder!.tpslWithdrawSwapSlippage).toBeBigNumber(new BigNumber('0'))
  })

  it('parse liquidity order', () => {
    const raw =
      '0x0000000000000000000000009162d0ebd913f439f9e43ead9b76c2395888b558000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f05120000000000000000000000000000000000000000000000022b1c8c1227a0000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000'
    const order = parseMux3OrderPayload(raw, Mux3OrderType.Liquidity, storage)
    expect(order.liquidityOrder!.poolAddress).toBe('0x9162d0ebd913f439f9e43ead9b76c2395888b558')
    expect(order.liquidityOrder!.token).toBe('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')
    expect(order.liquidityOrder!.rawAmount).toBeBigNumber(new BigNumber('40'))
    expect(order.liquidityOrder!.isAdding).toBe(true)
    expect(order.liquidityOrder!.isUnwrapWeth).toBe(false)
  })

  it('parse withdraw order', () => {
    const raw =
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f051200000000000000000000000000000000000000000000001b1ae4d6e2ef5000000000000000000000000000000000000000000000000000000000000000000000'
    const order = parseMux3OrderPayload(raw, Mux3OrderType.Withdrawal, storage)
    expect(order.withdrawOrder!.positionId).toBe('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000')
    expect(order.withdrawOrder!.rawAmount).toBeBigNumber(new BigNumber('500'))
    expect(order.withdrawOrder!.tokenAddress).toBe('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')
    expect(order.withdrawOrder!.isUnwrapWeth).toBe(false)
  })
})
