import { DegenSubAccount, DegenAsset, DegenMarkPriceDict } from './types'
import { _0, _1 } from '../constants'
import BigNumber from 'bignumber.js'
import { decodeDegenSubAccountId } from './data'
import { InvalidArgumentError } from '../types'
import { computeDegenClosePosition, computeDegenFundingFeeUsd, computeDegenSubAccount, getMarkPriceBySubAccountId } from './computations'

/*
how to use

### open position, market order, the trader enters collateral

1. calculateDegenOpenPositionVolume, got volume
2. volume * (1 - slippage) => volumeMinusSlippage
3. call broker, got size and price
4. computeDegenOpenPosition

### open position, limit order, the trader enters collateral

1. calculateDegenOpenPositionWithCollateral, got size
2. computeDegenOpenPosition

### open position, market order, the trader enters size

1. call broker, got price
2. size * (1 - slippage) => sizeMinusSlippage
3. computeDegenOpenPosition

### open position, limit order, the trader enters size

1. computeDegenOpenPosition
*/

// when opening a position with limit order, get position size with given collateral and leverage.
// (ignore the existing positions)
export function calculateDegenOpenPositionWithCollateral(
  assets: DegenAsset[],
  subAccountId: string,
  subAccount: DegenSubAccount,
  collateralAmount: BigNumber,
  collateralPrice: BigNumber,
  limitPrice: BigNumber,
  leverage: BigNumber
): BigNumber /* position size */ {
  const { assetId, isLong } = decodeDegenSubAccountId(subAccountId)
  if (assetId >= assets.length) {
    throw new InvalidArgumentError(`missing asset[${assetId}]`)
  }
  if (collateralPrice.lte(_0)) {
    throw new InvalidArgumentError(`invalid collateral price`)
  }
  if (collateralAmount.lte(_0)) {
    throw new InvalidArgumentError(`invalid collateral ${collateralAmount.toFixed()}`)
  }
  if (limitPrice.lte(_0)) {
    throw new InvalidArgumentError(`invalid limit price`)
  }
  const collateralUsd = collateralAmount.times(collateralPrice)
  const positionFeeRate = assets[assetId].positionFeeRate
  const fundingFeeUsd = computeDegenFundingFeeUsd(subAccount, assets[assetId], isLong)
  let size = collateralUsd.minus(fundingFeeUsd)
  size = size.times(leverage).div(limitPrice)
  size = size.div(leverage.times(positionFeeRate).plus(1))
  return size
}

// when opening a position with market order, get position size with given collateral and leverage.
// (ignore the existing positions)
// step 1: (collateral, leverage, positionFee) => mux.js => volumeWithoutFee
// step 2: volumeWithoutFee => broker => size
export function calculateDegenOpenPositionVolume(
  assets: DegenAsset[],
  subAccountId: string,
  subAccount: DegenSubAccount,
  collateralAmount: BigNumber,
  collateralPrice: BigNumber,
  leverage: BigNumber,
): BigNumber /* CAUTION: this is NOT size, but volumeWithoutFee in step 1 */ {
  const { assetId, isLong } = decodeDegenSubAccountId(subAccountId)
  if (assetId >= assets.length) {
    throw new InvalidArgumentError(`missing asset[${assetId}]`)
  }
  if (collateralPrice.lte(_0)) {
    throw new InvalidArgumentError(`invalid collateral price`)
  }
  if (collateralAmount.lte(_0)) {
    throw new InvalidArgumentError(`invalid collateral ${collateralAmount.toFixed()}`)
  }
  // filledValue -> (collateralValue leverage) / (1 + feeRate leverage)
  const collateralUsd = collateralAmount.times(collateralPrice)
  const positionFeeRate = assets[assetId].positionFeeRate
  const fundingFeeUsd = computeDegenFundingFeeUsd(subAccount, assets[assetId], isLong)
  let size = collateralUsd
    .minus(fundingFeeUsd)
    .times(leverage)
    .div(leverage.times(positionFeeRate).plus(1))
  return size
}

// when closing a position, get collateral amount to withdraw to keep the leverage (positionValue / collateralValue)
export function calculateDegenClosePositionCollateralAmount(
  assets: DegenAsset[],
  subAccountId: string,
  subAccount: DegenSubAccount,
  profitAssetId: number,
  deltaPosition: BigNumber,
  tradingPrice: BigNumber,
  markPrices: DegenMarkPriceDict, // given by off-chain broker
  brokerGasFee: BigNumber // in collateral. you can pass _0 when calling placePositionOrder
): BigNumber {
  const { collateralId } = decodeDegenSubAccountId(subAccountId)
  if (collateralId >= assets.length) {
    throw new InvalidArgumentError(`missing asset[${collateralId}]`)
  }
  const { collateralPrice, assetPrice } = getMarkPriceBySubAccountId(assets, subAccountId, markPrices)
  const beforeTrade = computeDegenSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  if (!beforeTrade.computed.isMarginSafe) {
    throw new InvalidArgumentError('already bankrupt')
  }
  const oldLeverage = beforeTrade.computed.leverage
  const afterTrade = computeDegenClosePosition(
    assets,
    subAccountId,
    subAccount,
    profitAssetId,
    tradingPrice,
    markPrices,
    deltaPosition,
    brokerGasFee
  )
  if (!afterTrade.isTradeSafe) {
    throw new InvalidArgumentError('bad deltaPosition')
  }
  if (afterTrade.afterTrade.subAccount.size.eq(_0)) {
    // close all (assuming flags = WithdrawAllIfEmpty)
    return _0
  }
  // leverage = entryPrice * newSize / newCollateral / collateralPrice
  // so newCollateral = entryPrice * newSize / leverage / collateralPrice
  const collateralRequired = afterTrade.afterTrade.subAccount.size
    .times(afterTrade.afterTrade.subAccount.entryPrice)
    .div(oldLeverage)
    .div(collateralPrice)
  let deltaCollateral = afterTrade.afterTrade.subAccount.collateral.minus(collateralRequired)
  deltaCollateral = BigNumber.maximum(deltaCollateral, _0)
  return deltaCollateral
}
