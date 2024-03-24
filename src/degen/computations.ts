import {
  DegenSubAccountDetails,
  DegenSubAccountComputed,
  DegenSubAccount,
  DegenAsset,
  DegenMarkPriceDict,
  cloneDegenSubAccount,
  DegenOpenPositionResult,
  DegenClosePositionResult,
  DegenPool,
  DegenWithdrawCollateralResult
} from './types'
import { _0, _1 } from '../constants'
import { decodeDegenSubAccountId } from './data'
import BigNumber from 'bignumber.js'
import { InsufficientLiquidityError, InsufficientLiquidityType, InvalidArgumentError } from '../types'

export function computeDegenSubAccount(
  assets: DegenAsset[],
  subAccountId: string,
  subAccount: DegenSubAccount,
  collateralPrice: BigNumber,
  assetPrice: BigNumber
): DegenSubAccountDetails {
  const { collateralId, assetId, isLong } = decodeDegenSubAccountId(subAccountId)
  const positionValueUsd = assetPrice.times(subAccount.size)
  const fundingFeeUsd = computeDegenFundingFeeUsd(subAccount, assets[assetId], isLong)
  const { pendingPnlUsd, uncappedPnlUsd, pnlUsd, maxProfitUsd } = computeDegenCappedPnlUsd(
    assets[assetId],
    subAccount,
    isLong,
    subAccount.size,
    assetPrice
  )
  const pendingPnlAfterFundingUsd = pendingPnlUsd.minus(fundingFeeUsd)
  const pnlAfterFundingUsd = pnlUsd.minus(fundingFeeUsd)
  const collateralValue = subAccount.collateral.times(collateralPrice)
  const marginBalanceUsd = collateralValue.plus(pendingPnlAfterFundingUsd)
  const isIMSafe = marginBalanceUsd.gte(positionValueUsd.times(assets[assetId].initialMarginRate))
  const isMMSafe = marginBalanceUsd.gte(positionValueUsd.times(assets[assetId].maintenanceMarginRate))
  const isMarginSafe = marginBalanceUsd.gte(_0)
  const leverage = collateralValue.gt(0) ? subAccount.entryPrice.times(subAccount.size).div(collateralValue) : _0
  const effectiveLeverage = marginBalanceUsd.gt(0) ? positionValueUsd.div(marginBalanceUsd) : _0
  let pendingRoe = collateralValue.gt(0) ? pendingPnlAfterFundingUsd.div(collateralValue) : _0
  const liquidationPrice = _estimateLiquidationPrice(
    assets,
    collateralId,
    assetId,
    isLong,
    subAccount,
    collateralPrice,
    fundingFeeUsd
  )
  // withdraw collateral
  const safeImr = BigNumber.maximum(assets[assetId].initialMarginRate, '0.01') // limit to 100x in the next calculation
  let withdrawableCollateral = BigNumber.min(
    collateralValue.plus(pnlAfterFundingUsd).minus(positionValueUsd.times(safeImr)), // IM
    collateralValue.minus(fundingFeeUsd).minus(subAccount.entryPrice.times(subAccount.size).times(safeImr)) // leverage
  )
  withdrawableCollateral = BigNumber.max(_0, withdrawableCollateral)
  withdrawableCollateral = withdrawableCollateral.div(collateralPrice)
  const computed: DegenSubAccountComputed = {
    positionValueUsd,
    fundingFeeUsd,
    pendingPnlUsd,
    pendingPnlAfterFundingUsd,
    uncappedPnlUsd,
    pnlUsd,
    marginBalanceUsd,
    isIMSafe,
    isMMSafe,
    isMarginSafe,
    leverage,
    effectiveLeverage,
    pendingRoe,
    liquidationPrice,
    withdrawableCollateral,
    maxProfitUsd
  }
  return { subAccount, computed }
}

export function getMarkPriceBySubAccountId(
  assets: DegenAsset[],
  subAccountId: string,
  markPrices: DegenMarkPriceDict // given by off-chain broker
): { assetPrice: BigNumber; collateralPrice: BigNumber } {
  const { collateralId, assetId } = decodeDegenSubAccountId(subAccountId)
  if (collateralId >= assets.length) {
    throw new InvalidArgumentError(`missing asset[${collateralId}]`)
  }
  if (assetId >= assets.length) {
    throw new InvalidArgumentError(`missing asset[${assetId}]`)
  }
  let collateralPrice = markPrices[assets[collateralId].symbol]
  let assetPrice = markPrices[assets[assetId].symbol]
  if (!collateralPrice || collateralPrice.lte(_0)) {
    throw new InvalidArgumentError(`invalid price[${assets[collateralId].symbol}]`)
  }
  if (!assetPrice || assetPrice.lte(_0)) {
    throw new InvalidArgumentError(`invalid price[${assets[assetId].symbol}]`)
  }
  return { assetPrice, collateralPrice }
}

// get price with spread when add/remove liquidity
export function computeDegenLiquidityPrice(
  assets: DegenAsset[],
  prices: DegenMarkPriceDict, // given by off-chain broker
  tokenId: number
): BigNumber {
  if (tokenId >= assets.length) {
    throw new InvalidArgumentError(`missing asset[${tokenId}]`)
  }
  let collateralPrice = prices[assets[tokenId].symbol]
  if (!collateralPrice || collateralPrice.lte(_0)) {
    throw new InvalidArgumentError(`invalid price[${assets[tokenId].symbol}]`)
  }
  return collateralPrice
}

export function computeDegenPositionPnlUsd(
  asset: DegenAsset,
  subAccount: DegenSubAccount,
  isLong: boolean,
  amount: BigNumber,
  assetPrice: BigNumber
): { pendingPnlUsd: BigNumber; pnlUsd: BigNumber } {
  if (amount.eq(_0)) {
    return { pendingPnlUsd: _0, pnlUsd: _0 }
  }
  let priceDelta = isLong ? assetPrice.minus(subAccount.entryPrice) : subAccount.entryPrice.minus(assetPrice)
  let pendingPnlUsd = priceDelta.times(amount)
  if (
    priceDelta.gt(_0) &&
    Math.ceil(Date.now() / 1000) < subAccount.lastIncreasedTime + asset.minProfitTime &&
    priceDelta.abs().lt(asset.minProfitRate.times(subAccount.entryPrice))
  ) {
    return { pendingPnlUsd, pnlUsd: _0 }
  }
  return { pendingPnlUsd, pnlUsd: pendingPnlUsd }
}

// see Trade.sol _traderCappedPnlUsd
export function computeDegenCappedPnlUsd(
  asset: DegenAsset,
  subAccount: DegenSubAccount,
  isLong: boolean,
  amount: BigNumber,
  assetPrice: BigNumber
): { pendingPnlUsd: BigNumber; uncappedPnlUsd: BigNumber; pnlUsd: BigNumber; maxProfitUsd: BigNumber } {
  const { pendingPnlUsd, pnlUsd } = computeDegenPositionPnlUsd(asset, subAccount, isLong, amount, assetPrice)
  const maxProfitUsd = amount.times(subAccount.entryPrice).times(asset.adlMaxPnlRate)
  const cappedPnlUsd = BigNumber.min(pnlUsd, maxProfitUsd)
  return { pendingPnlUsd, uncappedPnlUsd: pnlUsd, pnlUsd: cappedPnlUsd, maxProfitUsd }
}

function _computeFeeUsd(
  subAccount: DegenSubAccount,
  asset: DegenAsset,
  isLong: boolean,
  amount: BigNumber,
  assetPrice: BigNumber
): BigNumber {
  let fee = computeDegenFundingFeeUsd(subAccount, asset, isLong)
  fee = fee.plus(_computePositionFeeUsd(asset, amount, assetPrice))
  return fee
}

export function computeDegenFundingFeeUsd(subAccount: DegenSubAccount, asset: DegenAsset, isLong: boolean): BigNumber {
  if (subAccount.size.eq(_0)) {
    return _0
  }
  let cumulativeFunding = _0
  if (isLong) {
    cumulativeFunding = asset.longCumulativeFunding.minus(subAccount.entryFunding)
  } else {
    cumulativeFunding = asset.shortCumulativeFunding.minus(subAccount.entryFunding)
  }
  const sizeUsd = subAccount.size.times(subAccount.entryPrice)
  return cumulativeFunding.times(sizeUsd)
}

function _computePositionFeeUsd(asset: DegenAsset, amount: BigNumber, assetPrice: BigNumber): BigNumber {
  if (amount.eq(_0)) {
    return _0
  }
  let feeUsd = assetPrice.times(asset.positionFeeRate).times(amount)
  return feeUsd
}

// note: mutable modify
function _updateEntryFunding(subAccount: DegenSubAccount, asset: DegenAsset, isLong: boolean) {
  if (isLong) {
    subAccount.entryFunding = asset.longCumulativeFunding
  } else {
    subAccount.entryFunding = asset.shortCumulativeFunding
  }
}

function _estimateLiquidationPrice(
  assets: DegenAsset[],
  collateralId: number,
  assetId: number,
  isLong: boolean,
  subAccount: DegenSubAccount,
  collateralPrice: BigNumber,
  fundingFeeUsd: BigNumber
): BigNumber {
  if (subAccount.size.eq(_0)) {
    return _0
  }
  const { maintenanceMarginRate } = assets[assetId]
  const longFactor = isLong ? _1 : _1.negated()
  const t = longFactor.minus(maintenanceMarginRate).times(subAccount.size)
  let p = _0
  if (collateralId === assetId) {
    p = longFactor.times(subAccount.entryPrice).times(subAccount.size)
    p = p.plus(fundingFeeUsd).div(t.plus(subAccount.collateral))
    p = BigNumber.max(_0, p)
  } else {
    p = longFactor.times(subAccount.entryPrice).times(subAccount.size)
    p = p.plus(fundingFeeUsd).minus(collateralPrice.times(subAccount.collateral))
    p = p.div(t)
    p = BigNumber.max(_0, p)
  }
  return p
}

export function computeDegenOpenPosition(
  assets: DegenAsset[],
  subAccountId: string,
  subAccount: DegenSubAccount,
  tradingPrice: BigNumber,
  markPrices: DegenMarkPriceDict,
  amount: BigNumber,
  brokerGasFee: BigNumber // in collateral. you can pass _0 when calling placePositionOrder
): DegenOpenPositionResult {
  // context
  subAccount = cloneDegenSubAccount(subAccount)
  const { collateralId, assetId, isLong } = decodeDegenSubAccountId(subAccountId)
  const { collateralPrice, assetPrice } = getMarkPriceBySubAccountId(assets, subAccountId, markPrices)
  if (amount.lte(_0)) {
    throw new InvalidArgumentError(`invalid amount ${amount.toFixed()}`)
  }
  if (brokerGasFee.lt(_0)) {
    throw new InvalidArgumentError(`invalid gasFee ${brokerGasFee.toFixed()}`)
  }
  // protection
  if (
    assets[assetId].isStable ||
    !assets[assetId].isTradable ||
    !assets[assetId].isOpenable ||
    !assets[assetId].isEnabled ||
    !assets[collateralId].isEnabled ||
    !assets[collateralId].isStable ||
    (!isLong && !assets[assetId].isShortable)
  ) {
    throw new InvalidArgumentError('not tradable')
  }

  // fee & funding
  const fundingFeeUsd = computeDegenFundingFeeUsd(subAccount, assets[assetId], isLong)
  const feeUsd = _computeFeeUsd(subAccount, assets[assetId], isLong, amount, tradingPrice)
  _updateEntryFunding(subAccount, assets[assetId], isLong)
  let feeCollateral = feeUsd.div(collateralPrice)
  feeCollateral = feeCollateral.plus(brokerGasFee)
  if (subAccount.collateral.lt(feeCollateral)) {
    // InsufficientCollateralForFee. we continue in mux.js
  }
  subAccount.collateral = subAccount.collateral.minus(feeCollateral)
  // position
  const { pnlUsd } = computeDegenCappedPnlUsd(assets[assetId], subAccount, isLong, amount, tradingPrice)
  const newSize = subAccount.size.plus(amount)
  if (pnlUsd.eq(_0)) {
    subAccount.entryPrice = tradingPrice
  } else {
    subAccount.entryPrice = subAccount.entryPrice
      .times(subAccount.size)
      .plus(tradingPrice.times(amount))
      .div(newSize)
  }
  subAccount.size = newSize
  subAccount.lastIncreasedTime = Math.ceil(Date.now() / 1000)
  // post check
  const afterTrade = computeDegenSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  _increaseTotalSize(assets, assetId, isLong, amount, tradingPrice, markPrices)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isIMSafe,
    fundingFeeUsd,
    feeUsd
  }
}

export function computeDegenClosePosition(
  assets: DegenAsset[],
  subAccountId: string,
  subAccount: DegenSubAccount,
  profitAssetId: number,
  tradingPrice: BigNumber,
  markPrices: DegenMarkPriceDict,
  amount: BigNumber,
  brokerGasFee: BigNumber // in collateral. you can pass _0 when calling placePositionOrder
): DegenClosePositionResult {
  // context
  subAccount = cloneDegenSubAccount(subAccount)
  const { collateralId, assetId, isLong } = decodeDegenSubAccountId(subAccountId)
  const { collateralPrice, assetPrice } = getMarkPriceBySubAccountId(assets, subAccountId, markPrices)
  if (profitAssetId >= assets.length) {
    throw new InvalidArgumentError(`missing asset[${profitAssetId}]`)
  }
  if (!assets[profitAssetId].isStable) {
    throw new InvalidArgumentError(`profit asset[${profitAssetId}] should be a stable coin`)
  }
  const profitAssetPrice = markPrices[assets[profitAssetId].symbol]
  if (!profitAssetPrice || profitAssetPrice.lte(_0)) {
    throw new InvalidArgumentError(`invalid price[${assets[profitAssetId].symbol}]`)
  }
  if (amount.lte(_0) || amount.gt(subAccount.size)) {
    throw new InvalidArgumentError(`invalid amount ${amount.toFixed()}`)
  }
  if (brokerGasFee.lt(_0)) {
    throw new InvalidArgumentError(`invalid gasFee ${brokerGasFee.toFixed()}`)
  }
  // protection
  if (
    assets[assetId].isStable ||
    !assets[assetId].isTradable ||
    !assets[assetId].isEnabled ||
    !assets[collateralId].isEnabled ||
    !assets[collateralId].isStable ||
    (!isLong && !assets[assetId].isShortable)
  ) {
    throw new InvalidArgumentError('not tradable')
  }
  // fee & funding
  const fundingFeeUsd = computeDegenFundingFeeUsd(subAccount, assets[assetId], isLong)
  const totalFeeUsd = _computeFeeUsd(subAccount, assets[assetId], isLong, amount, tradingPrice)
  _updateEntryFunding(subAccount, assets[assetId], isLong)
  // realize pnl
  let paidFeeUsd = _0
  let profitAssetTransferred = _0
  const { pnlUsd } = computeDegenCappedPnlUsd(assets[assetId], subAccount, isLong, amount, tradingPrice)
  if (pnlUsd.gt(_0)) {
    const result = computeDegenRealizeProfit(pnlUsd, totalFeeUsd, assets[profitAssetId], profitAssetPrice)
    paidFeeUsd = result.deductUsd
    profitAssetTransferred = result.profitAssetTransferred
  } else if (pnlUsd.lt(_0)) {
    computeDegenRealizeLoss(subAccount, collateralPrice, pnlUsd.negated(), true)
  }
  subAccount.size = subAccount.size.minus(amount)
  if (subAccount.size.eq(_0)) {
    subAccount.entryPrice = _0
    subAccount.entryFunding = _0
    subAccount.lastIncreasedTime = 0
  }
  // ignore fees if can not afford
  if (brokerGasFee.gt(_0) || totalFeeUsd.gt(paidFeeUsd)) {
    let feeCollateral = totalFeeUsd.minus(paidFeeUsd).div(collateralPrice)
    let feeAndGasCollateral = feeCollateral.plus(brokerGasFee)
    if (subAccount.collateral.lt(feeAndGasCollateral)) {
      feeAndGasCollateral = subAccount.collateral
      if (subAccount.collateral.lt(brokerGasFee)) {
        feeCollateral = _0
      } else {
        feeCollateral = subAccount.collateral.minus(brokerGasFee)
      }
    }
    subAccount.collateral = subAccount.collateral.minus(feeAndGasCollateral)
    paidFeeUsd = paidFeeUsd.plus(feeCollateral.times(collateralPrice))
  }
  // post check
  const afterTrade = computeDegenSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isMarginSafe,
    fundingFeeUsd,
    feeUsd: paidFeeUsd,
    profitAssetTransferred
  }
}

export function computeDegenWithdrawCollateral(
  assets: DegenAsset[],
  subAccountId: string,
  subAccount: DegenSubAccount,
  markPrices: DegenMarkPriceDict,
  amount: BigNumber
): DegenWithdrawCollateralResult {
  // context
  subAccount = cloneDegenSubAccount(subAccount)
  const { collateralId, assetId, isLong } = decodeDegenSubAccountId(subAccountId)
  const { collateralPrice, assetPrice } = getMarkPriceBySubAccountId(assets, subAccountId, markPrices)
  if (amount.lte(_0)) {
    throw new InvalidArgumentError(`invalid amount ${amount.toFixed()}`)
  }
  // protection
  if (!assets[assetId].isEnabled || !assets[collateralId].isEnabled) {
    throw new InvalidArgumentError('not tradable')
  }
  // fee & funding
  const totalFeeUsd = computeDegenFundingFeeUsd(subAccount, assets[assetId], isLong)
  if (subAccount.size.gt(_0)) {
    _updateEntryFunding(subAccount, assets[assetId], isLong)
  }
  const feeCollateral = totalFeeUsd.div(collateralPrice)
  subAccount.collateral = subAccount.collateral.minus(feeCollateral)
  // withdraw
  subAccount.collateral = subAccount.collateral.minus(amount)
  // post check
  const afterTrade = computeDegenSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isIMSafe,
    feeUsd: totalFeeUsd
  }
}

export function computeDegenRealizeProfit(
  profitUsd: BigNumber,
  feeUsd: BigNumber,
  profitAsset: DegenAsset,
  profitAssetPrice: BigNumber
): { deductUsd: BigNumber; profitAssetTransferred: BigNumber } {
  let deductUsd = BigNumber.minimum(profitUsd, feeUsd)
  let profitAssetTransferred = _0
  // pnl
  profitUsd = profitUsd.minus(deductUsd)
  if (profitUsd.gt(_0)) {
    let profitCollateral = profitUsd.div(profitAssetPrice)
    // transfer profit token
    if (profitAsset.spotLiquidity.lt(profitCollateral)) {
      throw new InsufficientLiquidityError(
        InsufficientLiquidityType.MuxRemoveLiquidityExceedsCurrentAsset,
        'insufficient profit token'
      )
    }
    let spot = BigNumber.minimum(profitCollateral, profitAsset.spotLiquidity)
    if (spot.gt(_0)) {
      profitAssetTransferred = spot
    }
  }
  return { deductUsd, profitAssetTransferred }
}

export function computeDegenRealizeLoss(
  subAccount: DegenSubAccount,
  collateralPrice: BigNumber,
  lossUsd: BigNumber,
  isThrowBankrupt: boolean
) {
  if (lossUsd.eq(_0)) {
    return
  }
  let lossCollateral = lossUsd.div(collateralPrice)
  if (isThrowBankrupt) {
    if (subAccount.collateral.lt(lossCollateral)) {
      throw new Error('bankrupt')
    }
  } else {
    lossCollateral = BigNumber.minimum(lossCollateral, subAccount.collateral)
  }
  subAccount.collateral = subAccount.collateral.minus(lossCollateral)
}

// NOTE: this function always returns APY funding rate. if fundingInterval is 1h, the fee will be
//       positionSizeUsd * fundingRateAPY / 365 / 24 every hour.
export function computeDegenFundingRateApy(
  pool: DegenPool,
  asset: DegenAsset
): { longFundingRateApy: BigNumber; shortFundingRateApy: BigNumber; borrowingRateApy: BigNumber } {
  // min(1, abs(longs - shorts）/ alpha) * beta
  const longsUsd = asset.totalLongPosition.times(asset.averageLongPrice)
  const shortsUsd = asset.totalShortPosition.times(asset.averageShortPrice)
  const isPositiveFundingRate = longsUsd.gte(shortsUsd)
  const x = BigNumber.min(asset.fundingAlpha, longsUsd.minus(shortsUsd).abs())
  let fundingApy = x.times(asset.fundingBetaApy).div(asset.fundingAlpha)
  let longFundingRateApy = isPositiveFundingRate ? fundingApy : _0
  let shortFundingRateApy = isPositiveFundingRate ? _0 : fundingApy
  // borrowing
  const borrowingRateApy = pool.borrowingRateApy
  return { longFundingRateApy, shortFundingRateApy, borrowingRateApy }
}

function _increaseTotalSize(
  assets: DegenAsset[],
  assetId: number,
  isLong: boolean,
  amount: BigNumber,
  tradingPrice: BigNumber,
  markPrices: DegenMarkPriceDict
): {
  assets: DegenAsset[]
} {
  // clone assets
  assets = assets.map(asset => ({ ...asset }))
  const asset = assets[assetId]
  if (isLong) {
    const newPosition = asset.totalLongPosition.plus(amount)
    if (newPosition.gt(asset.maxLongPositionSize)) {
      throw new InsufficientLiquidityError(
        InsufficientLiquidityType.MuxLimitedMaxPosition,
        `newPos ${newPosition} > max ${asset.maxLongPositionSize}`
      )
    }
    asset.averageLongPrice = asset.averageLongPrice
      .times(asset.totalLongPosition)
      .plus(tradingPrice.times(amount))
      .div(newPosition)
    asset.totalLongPosition = newPosition
  } else {
    const newPosition = asset.totalShortPosition.plus(amount)
    if (newPosition.gt(asset.maxShortPositionSize)) {
      throw new InsufficientLiquidityError(
        InsufficientLiquidityType.MuxLimitedMaxPosition,
        `newPos ${newPosition} > max ${asset.maxShortPositionSize}`
      )
    }
    asset.averageShortPrice = asset.averageShortPrice
      .times(asset.totalShortPosition)
      .plus(tradingPrice.times(amount))
      .div(newPosition)
    asset.totalShortPosition = newPosition
  }
  // reserve
  const reservationUsd = computeDegenTotalReservationUsd(assets)
  const poolUsd = computeDegenPoolUsdWithoutPnl(assets, markPrices)
  if (reservationUsd.gt(poolUsd)) {
    throw new InsufficientLiquidityError(
      InsufficientLiquidityType.MuxLimitedReservation,
      `reservation ${reservationUsd} > pool ${poolUsd}`
    )
  }
  return { assets }
}

function computeDegenTotalReservationUsd(assets: DegenAsset[]): BigNumber {
  let usd = _0
  for (const asset of assets) {
    usd = usd.plus(asset.totalLongPosition.times(asset.averageLongPrice).times(asset.adlReserveRate))
    usd = usd.plus(asset.totalShortPosition.times(asset.averageShortPrice).times(asset.adlReserveRate))
  }
  return usd
}

function computeDegenPoolUsdWithoutPnl(assets: DegenAsset[], markPrices: DegenMarkPriceDict): BigNumber {
  let usd = _0
  for (const asset of assets) {
    const markPrice = markPrices[asset.symbol]
    if (!markPrice || markPrice.lte(_0)) {
      throw new InvalidArgumentError(`invalid price[${asset.symbol}]`)
    }
    usd = usd.plus(asset.spotLiquidity.times(markPrice))
  }
  return usd
}
