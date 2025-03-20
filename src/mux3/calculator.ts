import { Mux3SubAccount, Mux3Storage, Mux3Market, cloneMux3SubAccount } from './types'
import { InvalidArgumentError, PriceDict } from '../types'
import { _0, _1 } from '../constants'
import BigNumber from 'bignumber.js'
import {
  computeMux3ClosePosition,
  computeMux3PositionPart1,
  computeMux3SubAccount,
  ensureMux3Position
} from './computations'
import { MUX3_ADDRESS_PAD } from './constants'

// when opening a position, get position size with given collateral and leverage.
// ignore the existing positions. this is suitable for isolated-margin mode.
export function calculateMux3OpenPositionWithNewCollateral(
  storage: Mux3Storage,
  market: Mux3Market,
  subAccount: Mux3SubAccount,
  prices: PriceDict,
  leverage: BigNumber,
  collateralAddress: string,
  collateralAmount: BigNumber
): BigNumber /* position size */ {
  subAccount = cloneMux3SubAccount(subAccount)
  ensureMux3Position(market, subAccount)
  const position = subAccount.positions[market.marketId]
  // collateral
  const collateralPrice = prices[collateralAddress + MUX3_ADDRESS_PAD]
  if (!collateralPrice) {
    throw new Error(`collateral price not found: ${collateralAddress}`)
  }
  const marketPrice = prices[market.oracleId]
  if (!marketPrice) {
    throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
  }
  // size = ((collateralUsd - borrowingFeeUsd) leverage) / ((1 + feeRate leverage) marketPrice)
  const borrowingFeeUsd = computeMux3PositionPart1(storage, market, position, prices).borrowingFeeUsd
  const collateralUsd = collateralAmount.times(collateralPrice)
  const positionFeeRate = market.positionFeeRate
  let size = collateralUsd.minus(borrowingFeeUsd)
  size = size.times(leverage).div(marketPrice) // treat marketPrice as entryPrice
  size = size.div(leverage.times(positionFeeRate).plus(1))
  // lotSize
  size = size
    .div(market.lotSize)
    .integerValue(BigNumber.ROUND_DOWN)
    .times(market.lotSize)
  return size
}

// when opening a position, get position size with existing positions.
// this is suitable for cross-margin mode.
export function calculateMux3OpenPositionWithExistingCollaterals(
  storage: Mux3Storage,
  market: Mux3Market,
  subAccount: Mux3SubAccount,
  prices: PriceDict,
  leverage: BigNumber
): BigNumber /* position size */ {
  subAccount = cloneMux3SubAccount(subAccount)
  ensureMux3Position(market, subAccount)
  const position = subAccount.positions[market.marketId]
  // collateral
  const marketPrice = prices[market.oracleId]
  if (!marketPrice) {
    throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
  }
  // size = ((collateralUsd - existingPosition.entryImRequiredUsd - borrowingFeeUsd) leverage) / ((1 + feeRate leverage) marketPrice)
  const borrowingFeeUsd = computeMux3PositionPart1(storage, market, position, prices).borrowingFeeUsd
  const computed = computeMux3SubAccount(storage, subAccount, prices)
  const collateralUsd = computed.computed.collateralUsd.minus(computed.computed.totalEntryImRequiredUsd)
  const positionFeeRate = market.positionFeeRate
  let size = collateralUsd.minus(borrowingFeeUsd)
  size = size.times(leverage).div(marketPrice) // treat marketPrice as entryPrice
  size = size.div(leverage.times(positionFeeRate).plus(1))
  // lotSize
  size = size
    .div(market.lotSize)
    .integerValue(BigNumber.ROUND_DOWN)
    .times(market.lotSize)
  return size
}

// when closing a position, get collateral usd to withdraw to keep the leverage (positionValue / collateralValue)
export function calculateMux3ClosePositionCollateralUsd(
  storage: Mux3Storage,
  market: Mux3Market,
  subAccount: Mux3SubAccount,
  prices: PriceDict,
  closePositionSize: BigNumber,
  lastConsumedToken: string,
  withdrawProfit: boolean
): BigNumber {
  const beforeTrade = computeMux3SubAccount(storage, subAccount, prices)
  if (!beforeTrade.computed.isMarginSafe) {
    throw new InvalidArgumentError('already bankrupt')
  }
  const oldPosition = beforeTrade.computed.positions[market.marketId]
  if (!oldPosition) {
    throw new InvalidArgumentError('no position to close')
  }
  const oldLeverage = oldPosition.leverage
  const afterTrade = computeMux3ClosePosition(
    storage,
    market,
    subAccount,
    prices,
    closePositionSize,
    lastConsumedToken,
    withdrawProfit,
    _0, // set withdrawUsd = 0 and then calculate withdrawUsd
    false // you are partially-closing, impose no withdrawAllIfEmpty
  )
  if (!afterTrade.isTradeSafe) {
    throw new InvalidArgumentError('close position should safe')
  }
  const newPosition = afterTrade.afterTrade.computed.positions[market.marketId]
  if (newPosition.size.eq(_0)) {
    // close all (assuming flags = WithdrawAllIfEmpty)
    return _0
  }
  // leverage = entryPrice * newSize / newCollateral / collateralPrice
  // so newCollateral = entryPrice * newSize / leverage / collateralPrice
  let newEntryValue = _0
  for (const marketId in afterTrade.afterTrade.computed.positions) {
    const newPosition = afterTrade.afterTrade.computed.positions[marketId]
    newEntryValue = newEntryValue.plus(newPosition.entryValueUsd)
  }
  const collateralRequiredUsd = newEntryValue.div(oldLeverage)
  let deltaCollateralUsd = afterTrade.afterTrade.computed.collateralUsd.minus(collateralRequiredUsd)
  deltaCollateralUsd = BigNumber.maximum(deltaCollateralUsd, _0)
  return deltaCollateralUsd
}
