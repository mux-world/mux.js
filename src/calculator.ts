import { SubAccount, Asset, PriceDict, InvalidArgumentError } from './types'
import { _0, _1 } from './constants'
import { decodeSubAccountId } from './data'
import BigNumber from 'bignumber.js'
import { computeTradingPrice, computeClosePosition, computeFundingFeeUsd, computeSubAccount } from './computations'

// when opening a position, get position size with given collateral and leverage.
// (ignore the existing positions)
export function calculateOpenPositionWithCollateral(
  assets: Asset[],
  subAccountId: string,
  subAccount: SubAccount,
  prices: PriceDict,
  leverage: BigNumber,
  collateralAmount: BigNumber,
  brokerGasFee: BigNumber // in collateral. you can pass _0 when calling placePositionOrder
): BigNumber {
  const { collateralId, assetId, isLong } = decodeSubAccountId(subAccountId)
  if (collateralId >= assets.length) {
    throw new Error(`missing asset[${collateralId}]`)
  }
  if (assetId >= assets.length) {
    throw new Error(`missing asset[${assetId}]`)
  }
  const collateralPrice = prices[assets[collateralId].symbol]
  const assetPrice = prices[assets[assetId].symbol]
  if (!collateralPrice || collateralPrice.lte(_0)) {
    throw new Error(`invalid price[${assets[collateralId].symbol}]`)
  }
  if (!assetPrice || assetPrice.lte(_0)) {
    throw new Error(`invalid price[${assets[assetId].symbol}]`)
  }
  if (collateralAmount.lte(_0)) {
    throw new Error(`invalid collateral ${collateralAmount.toFixed()}`)
  }
  if (brokerGasFee.lt(_0)) {
    throw new Error(`invalid gasFee ${brokerGasFee.toFixed()}`)
  }
  if (collateralAmount.lt(brokerGasFee)) {
    throw new Error(`collateral ${collateralAmount.toFixed()} < brokerGasFee ${brokerGasFee.toFixed()}`)
  }
  const collateralUsd = collateralAmount.minus(brokerGasFee).times(collateralPrice)
  const positionFeeRate = assets[assetId].positionFeeRate
  const fundingFeeUsd = computeFundingFeeUsd(subAccount, assets[assetId], isLong, assetPrice)
  let size = collateralUsd.minus(fundingFeeUsd)
  size = size.times(leverage).div(assetPrice) // treat assetPrice as entryPrice
  size = size.div(leverage.times(positionFeeRate).plus(1))
  return size
}

// when closing a position, get collateral amount to withdraw to keep the leverage (positionValue / collateralValue)
export function calculateClosePositionCollateralAmount(
  assets: Asset[],
  subAccountId: string,
  subAccount: SubAccount,
  prices: PriceDict,
  profitAssetId: number,
  deltaPosition: BigNumber,
  brokerGasFee: BigNumber // in collateral. you can pass _0 when calling placePositionOrder
): BigNumber {
  const { collateralId } = decodeSubAccountId(subAccountId)
  if (collateralId >= assets.length) {
    throw new Error(`missing asset[${collateralId}]`)
  }
  const { collateralPrice, assetPrice } = computeTradingPrice(assets, subAccountId, prices, false)
  const beforeTrade = computeSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  if (!beforeTrade.computed.isMarginSafe) {
    throw new InvalidArgumentError('already bankrupt')
  }
  const oldLeverage = beforeTrade.computed.leverage
  const afterTrade = computeClosePosition(
    assets,
    subAccountId,
    subAccount,
    profitAssetId,
    prices,
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
