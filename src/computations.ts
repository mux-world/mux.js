import {
  SubAccountDetails,
  SubAccountComputed,
  SubAccount,
  Asset,
  PriceDict,
  cloneSubAccount,
  OpenPositionResult,
  ClosePositionResult,
  WithdrawProfitResult,
  LiquidityPool,
  InsufficientLiquidityError,
  InvalidArgumentError,
  BugError,
  WithdrawCollateralResult
} from './types'
import { SpreadType, _0, _1 } from './constants'
import { decodeSubAccountId } from './data'
import BigNumber from 'bignumber.js'

// note: this function does not add spread. use computeTradingPrice, computeLiquidationPrice or computeLiquidityPrice before this function
export function computeSubAccount(
  assets: Asset[],
  subAccountId: string,
  subAccount: SubAccount,
  collateralPrice: BigNumber,
  assetPrice: BigNumber
): SubAccountDetails {
  const { collateralId, assetId, isLong } = decodeSubAccountId(subAccountId)
  const positionValueUsd = assetPrice.times(subAccount.size)
  const imr = BigNumber.maximum(assets[assetId].initialMarginRate, '0.01') // limit to 100x in the next calculation
  const positionMarginUsd = positionValueUsd.times(imr)
  const maintenanceMarginUsd = positionValueUsd.times(assets[assetId].maintenanceMarginRate)
  const fundingFeeUsd = computeFundingFeeUsd(subAccount, assets[assetId], isLong, assetPrice)
  const { pendingPnlUsd, pnlUsd } = computePositionPnlUsd(
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
  const isIMSafe = marginBalanceUsd.gte(positionMarginUsd)
  const isMMSafe = marginBalanceUsd.gte(maintenanceMarginUsd)
  const isMarginSafe = marginBalanceUsd.gte(_0)
  const leverage = collateralValue.gt(0) ? subAccount.entryPrice.times(subAccount.size).div(collateralValue) : _0
  const effectiveLeverage = marginBalanceUsd.gt(0) ? positionValueUsd.div(marginBalanceUsd) : _0
  let pendingRoe = collateralValue.gt(0) ? pendingPnlAfterFundingUsd.div(collateralValue) : _0
  const liquidationPrice = estimateLiquidationPrice(
    assets,
    collateralId,
    assetId,
    isLong,
    subAccount,
    collateralPrice,
    fundingFeeUsd
  )
  // withdraw collateral
  let withdrawableCollateral = BigNumber.min(
    collateralValue.plus(pnlAfterFundingUsd).minus(positionMarginUsd), // IM
    collateralValue.minus(fundingFeeUsd).minus(subAccount.entryPrice.times(subAccount.size).times(imr)) // leverage
  )
  withdrawableCollateral = BigNumber.max(_0, withdrawableCollateral)
  withdrawableCollateral = withdrawableCollateral.div(collateralPrice)
  // withdraw profit
  let withdrawableProfit = BigNumber.min(
    collateralValue.plus(pnlAfterFundingUsd).minus(positionMarginUsd), // IM
    pnlAfterFundingUsd // profit
  )
  withdrawableProfit = BigNumber.max(_0, withdrawableProfit)
  if (isLong) {
    withdrawableProfit = withdrawableProfit.div(assetPrice)
  }
  const computed: SubAccountComputed = {
    positionValueUsd,
    positionMarginUsd,
    maintenanceMarginUsd,
    fundingFeeUsd,
    pendingPnlUsd,
    pendingPnlAfterFundingUsd,
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
    withdrawableProfit
  }
  return { subAccount, computed }
}

// get price with spread when liquidate
export function computeLiquidationPrice(
  assets: Asset[],
  subAccountId: string,
  prices: PriceDict // given by off-chain broker
): { assetPrice: BigNumber; collateralPrice: BigNumber } {
  return computeTradingPrice(assets, subAccountId, prices, false)
}

// get price with spread when open/close positions
export function computeTradingPrice(
  assets: Asset[],
  subAccountId: string,
  prices: PriceDict, // given by off-chain broker
  isOpenPosition: boolean // true if openPosition
): { assetPrice: BigNumber; collateralPrice: BigNumber } {
  const { collateralId, assetId, isLong } = decodeSubAccountId(subAccountId)
  if (collateralId >= assets.length) {
    throw new Error(`missing asset[${collateralId}]`)
  }
  if (assetId >= assets.length) {
    throw new Error(`missing asset[${assetId}]`)
  }
  let collateralPrice = prices[assets[collateralId].symbol]
  let assetPrice = prices[assets[assetId].symbol]
  if (!collateralPrice || collateralPrice.lte(_0)) {
    throw new Error(`invalid price[${assets[collateralId].symbol}]`)
  }
  if (!assetPrice || assetPrice.lte(_0)) {
    throw new Error(`invalid price[${assets[assetId].symbol}]`)
  }
  let spreadType: SpreadType
  if (isOpenPosition) {
    spreadType = isLong ? SpreadType.Ask : SpreadType.Bid
  } else {
    spreadType = isLong ? SpreadType.Bid : SpreadType.Ask
  }
  assetPrice = computePriceWithSpread(assets[assetId], assetPrice, spreadType)
  return { assetPrice, collateralPrice }
}

// get price with spread when add/remove liquidity
export function computeLiquidityPrice(
  assets: Asset[],
  prices: PriceDict, // given by off-chain broker
  tokenId: number,
  isAddLiquidity: boolean // true if addLiquidity
): BigNumber {
  if (tokenId >= assets.length) {
    throw new Error(`missing asset[${tokenId}]`)
  }
  let collateralPrice = prices[assets[tokenId].symbol]
  if (!collateralPrice || collateralPrice.lte(_0)) {
    throw new Error(`invalid price[${assets[tokenId].symbol}]`)
  }
  let spreadType = isAddLiquidity ? SpreadType.Bid : SpreadType.Ask
  collateralPrice = computePriceWithSpread(assets[tokenId], collateralPrice, spreadType)
  return collateralPrice
}

export function computePositionPnlUsd(
  asset: Asset,
  subAccount: SubAccount,
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

export function computeFeeUsd(
  subAccount: SubAccount,
  asset: Asset,
  isLong: boolean,
  amount: BigNumber,
  assetPrice: BigNumber
): BigNumber {
  let fee = computeFundingFeeUsd(subAccount, asset, isLong, assetPrice)
  fee = fee.plus(computePositionFeeUsd(asset, amount, assetPrice))
  return fee
}

export function computeFundingFeeUsd(
  subAccount: SubAccount,
  asset: Asset,
  isLong: boolean,
  assetPrice: BigNumber
): BigNumber {
  if (subAccount.size.eq(_0)) {
    return _0
  }
  let cumulativeFunding = _0
  if (isLong) {
    cumulativeFunding = asset.longCumulativeFundingRate.minus(subAccount.entryFunding)
    cumulativeFunding = cumulativeFunding.times(assetPrice)
  } else {
    cumulativeFunding = asset.shortCumulativeFunding.minus(subAccount.entryFunding)
  }
  return cumulativeFunding.times(subAccount.size)
}

export function computePositionFeeUsd(asset: Asset, amount: BigNumber, assetPrice: BigNumber): BigNumber {
  if (amount.eq(_0)) {
    return _0
  }
  let feeUsd = assetPrice.times(asset.positionFeeRate).times(amount)
  return feeUsd
}

// note: mutable modify
function updateEntryFunding(subAccount: SubAccount, asset: Asset, isLong: boolean) {
  if (isLong) {
    subAccount.entryFunding = asset.longCumulativeFundingRate
  } else {
    subAccount.entryFunding = asset.shortCumulativeFunding
  }
}

export function estimateLiquidationPrice(
  assets: Asset[],
  collateralId: number,
  assetId: number,
  isLong: boolean,
  subAccount: SubAccount,
  collateralPrice: BigNumber,
  fundingFeeUsd: BigNumber
): BigNumber {
  if (subAccount.size.eq(0)) {
    return _0
  }
  const { maintenanceMarginRate, positionFeeRate } = assets[assetId]
  const longFactor = isLong ? _1 : _1.negated()
  const t = longFactor
    .minus(maintenanceMarginRate)
    .minus(positionFeeRate)
    .times(subAccount.size)
  if (collateralId === assetId) {
    let p = longFactor.times(subAccount.entryPrice).times(subAccount.size)
    p = p.plus(fundingFeeUsd).div(t.plus(subAccount.collateral))
    p = BigNumber.max(_0, p)
    return p
  } else {
    let p = longFactor.times(subAccount.entryPrice).times(subAccount.size)
    p = p.plus(fundingFeeUsd).minus(collateralPrice.times(subAccount.collateral))
    p = p.div(t)
    p = BigNumber.max(_0, p)
    return p
  }
}

export function computeOpenPosition(
  assets: Asset[],
  subAccountId: string,
  subAccount: SubAccount,
  prices: PriceDict,
  amount: BigNumber,
  brokerGasFee: BigNumber // in collateral. you can pass _0 when calling placePositionOrder. pass gasFee when calling flashTake
): OpenPositionResult {
  // context
  subAccount = cloneSubAccount(subAccount)
  const { collateralId, assetId, isLong } = decodeSubAccountId(subAccountId)
  const { collateralPrice, assetPrice } = computeTradingPrice(assets, subAccountId, prices, true)
  if (amount.lte(_0)) {
    throw new Error(`invalid amount ${amount.toFixed()}`)
  }
  if (brokerGasFee.lt(_0)) {
    throw new Error(`invalid gasFee ${brokerGasFee.toFixed()}`)
  }
  // protection
  if (
    assets[assetId].isStable ||
    !assets[assetId].isTradable ||
    !assets[assetId].isOpenable ||
    !assets[assetId].isEnabled ||
    !assets[collateralId].isEnabled ||
    (!isLong && !assets[assetId].isShortable)
  ) {
    throw new Error('not tradable')
  }

  // fee & funding
  const feeUsd = computeFeeUsd(subAccount, assets[assetId], isLong, amount, assetPrice)
  updateEntryFunding(subAccount, assets[assetId], isLong)
  let feeCollateral = feeUsd.div(collateralPrice)
  feeCollateral = feeCollateral.plus(brokerGasFee)
  if (subAccount.collateral.lt(feeCollateral)) {
    // InsufficientCollateralForFee. we continue in mux.js
  }
  subAccount.collateral = subAccount.collateral.minus(feeCollateral)
  // position
  const pnlUsd = computePositionPnlUsd(assets[assetId], subAccount, isLong, amount, assetPrice)
  const newSize = subAccount.size.plus(amount)
  if (pnlUsd.pnlUsd.eq(_0)) {
    subAccount.entryPrice = assetPrice
  } else {
    subAccount.entryPrice = subAccount.entryPrice
      .times(subAccount.size)
      .plus(assetPrice.times(amount))
      .div(newSize)
  }
  subAccount.size = newSize
  subAccount.lastIncreasedTime = Math.ceil(Date.now() / 1000)
  // post check
  const afterTrade = computeSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isIMSafe,
    feeUsd
  }
}

export function computeClosePosition(
  assets: Asset[],
  subAccountId: string,
  subAccount: SubAccount,
  profitAssetId: number,
  prices: PriceDict,
  amount: BigNumber,
  brokerGasFee: BigNumber // in collateral. you can pass _0 when calling placePositionOrder. pass gasFee when calling flashTake
): ClosePositionResult {
  // context
  subAccount = cloneSubAccount(subAccount)
  const { collateralId, assetId, isLong } = decodeSubAccountId(subAccountId)
  const { collateralPrice, assetPrice } = computeTradingPrice(assets, subAccountId, prices, false)
  let profitAssetPrice = _0
  if (isLong && !assets[assetId].useStableTokenForProfit) {
    profitAssetId = assetId
    profitAssetPrice = assetPrice
  } else {
    if (profitAssetId >= assets.length) {
      throw new Error(`missing asset[${profitAssetId}]`)
    }
    if (!assets[profitAssetId].isStable) {
      throw new Error(`profit asset[${profitAssetId}] should be a stable coin`)
    }
    profitAssetPrice = prices[assets[profitAssetId].symbol]
    if (!profitAssetPrice || profitAssetPrice.lte(_0)) {
      throw new Error(`invalid price[${assets[profitAssetId].symbol}]`)
    }
  }
  if (amount.lte(_0) || amount.gt(subAccount.size)) {
    throw new Error(`invalid amount ${amount.toFixed()}`)
  }
  if (brokerGasFee.lt(_0)) {
    throw new Error(`invalid gasFee ${brokerGasFee.toFixed()}`)
  }
  // protection
  if (
    assets[assetId].isStable ||
    !assets[assetId].isTradable ||
    !assets[assetId].isEnabled ||
    !assets[collateralId].isEnabled ||
    (!isLong && !assets[assetId].isShortable)
  ) {
    throw new Error('not tradable')
  }
  // fee & funding
  const totalFeeUsd = computeFeeUsd(subAccount, assets[assetId], isLong, amount, assetPrice)
  updateEntryFunding(subAccount, assets[assetId], isLong)
  // realize pnl
  let realizedPnlUsd = _0
  let paidFeeUsd = _0
  let profitAssetTransferred = _0
  let muxTokenTransferred = _0
  const { pnlUsd } = computePositionPnlUsd(assets[assetId], subAccount, isLong, amount, assetPrice)
  if (pnlUsd.gt(_0)) {
    const result = computeRealizeProfit(pnlUsd, totalFeeUsd, assets[profitAssetId], profitAssetPrice)
    paidFeeUsd = result.deductUsd
    profitAssetTransferred = result.profitAssetTransferred
    muxTokenTransferred = result.muxTokenTransferred
  } else if (pnlUsd.lt(_0)) {
    computeRealizeLoss(subAccount, collateralPrice, pnlUsd.negated(), true)
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
  const afterTrade = computeSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isMarginSafe,
    feeUsd: paidFeeUsd,
    realizedPnlUsd,
    profitAssetTransferred,
    muxTokenTransferred
  }
}

export function computeWithdrawCollateral(
  assets: Asset[],
  subAccountId: string,
  subAccount: SubAccount,
  prices: PriceDict,
  amount: BigNumber
): WithdrawCollateralResult {
  // context
  subAccount = cloneSubAccount(subAccount)
  const { collateralId, assetId, isLong } = decodeSubAccountId(subAccountId)
  const { collateralPrice, assetPrice } = computeLiquidationPrice(assets, subAccountId, prices)
  if (amount.lte(_0)) {
    throw new Error(`invalid amount ${amount.toFixed()}`)
  }
  // protection
  if (!assets[assetId].isEnabled || !assets[collateralId].isEnabled) {
    throw new Error('not tradable')
  }
  // fee & funding
  const totalFeeUsd = computeFundingFeeUsd(subAccount, assets[assetId], isLong, assetPrice)
  if (subAccount.size.gt(_0)) {
    updateEntryFunding(subAccount, assets[assetId], isLong)
  }
  const feeCollateral = totalFeeUsd.div(collateralPrice)
  subAccount.collateral = subAccount.collateral.minus(feeCollateral)
  // withdraw
  subAccount.collateral = subAccount.collateral.minus(amount)
  // post check
  const afterTrade = computeSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isIMSafe,
    feeUsd: totalFeeUsd
  }
}

export function computeWithdrawProfit(
  assets: Asset[],
  subAccountId: string,
  subAccount: SubAccount,
  profitAssetId: number,
  prices: PriceDict,
  amount: BigNumber
): WithdrawProfitResult {
  // context
  subAccount = cloneSubAccount(subAccount)
  const { collateralId, assetId, isLong } = decodeSubAccountId(subAccountId)
  const { collateralPrice, assetPrice } = computeLiquidationPrice(assets, subAccountId, prices)
  let profitAssetPrice = _0
  if (isLong && !assets[assetId].useStableTokenForProfit) {
    profitAssetId = assetId
    profitAssetPrice = assetPrice
  } else {
    if (profitAssetId >= assets.length) {
      throw new Error(`missing asset[${profitAssetId}]`)
    }
    if (!assets[profitAssetId].isStable) {
      throw new Error(`profit asset[${profitAssetId}] should be a stable coin`)
    }
    profitAssetPrice = prices[assets[profitAssetId].symbol]
    if (!profitAssetPrice || profitAssetPrice.lte(_0)) {
      throw new Error(`invalid price[${assets[profitAssetId].symbol}]`)
    }
  }
  if (amount.lte(_0)) {
    throw new Error(`invalid amount ${amount.toFixed()}`)
  }
  // protection
  if (
    assets[assetId].isStable ||
    !assets[assetId].isTradable ||
    !assets[assetId].isEnabled ||
    !assets[collateralId].isEnabled ||
    (!isLong && !assets[assetId].isShortable)
  ) {
    throw new Error('not tradable')
  }
  if (subAccount.size.eq(_0)) {
    throw new Error('empty position')
  }
  // fee & funding
  const totalFeeUsd = computeFundingFeeUsd(subAccount, assets[assetId], isLong, assetPrice)
  updateEntryFunding(subAccount, assets[assetId], isLong)
  // withdraw
  const deltaUsd = amount.times(profitAssetPrice).plus(totalFeeUsd)
  // profit
  const { pnlUsd } = computePositionPnlUsd(assets[assetId], subAccount, isLong, subAccount.size, assetPrice)
  if (pnlUsd.lt(deltaUsd)) {
    throw new Error('insufficient pnl')
  }
  const { profitAssetTransferred, muxTokenTransferred } = computeRealizeProfit(
    pnlUsd,
    totalFeeUsd,
    assets[profitAssetId],
    profitAssetPrice
  )
  // new entry price
  if (isLong) {
    subAccount.entryPrice = subAccount.entryPrice.plus(deltaUsd.div(subAccount.size))
  } else {
    subAccount.entryPrice = subAccount.entryPrice.minus(deltaUsd.div(subAccount.size))
  }
  // post check
  const afterTrade = computeSubAccount(assets, subAccountId, subAccount, collateralPrice, assetPrice)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isIMSafe,
    feeUsd: totalFeeUsd,
    profitAssetTransferred,
    muxTokenTransferred
  }
}

export function computeRealizeProfit(
  profitUsd: BigNumber,
  feeUsd: BigNumber,
  profitAsset: Asset,
  profitAssetPrice: BigNumber
): { deductUsd: BigNumber; profitAssetTransferred: BigNumber; muxTokenTransferred: BigNumber } {
  let deductUsd = BigNumber.minimum(profitUsd, feeUsd)
  let profitAssetTransferred = _0
  let muxTokenTransferred = _0
  // pnl
  profitUsd = profitUsd.minus(deductUsd)
  if (profitUsd.gt(_0)) {
    let profitCollateral = profitUsd.div(profitAssetPrice)
    // transfer profit token
    let spot = BigNumber.minimum(profitCollateral, profitAsset.spotLiquidity)
    if (spot.gt(_0)) {
      profitAssetTransferred = spot
    }
    // debt
    const debtWadAmount = profitCollateral.minus(spot)
    if (debtWadAmount.gt(_0)) {
      muxTokenTransferred = debtWadAmount
    }
  }
  return { deductUsd, profitAssetTransferred, muxTokenTransferred }
}

export function computeRealizeLoss(
  subAccount: SubAccount,
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

export function computeLiquidityFeeRate(
  poolConfig: LiquidityPool,
  currentAssetValue: BigNumber,
  targetAssetValue: BigNumber,
  isAdd: boolean,
  deltaValue: BigNumber
): BigNumber {
  const baseFeeRate = poolConfig.liquidityBaseFeeRate
  const dynamicFeeRate = poolConfig.liquidityDynamicFeeRate
  let newAssetValue = _0
  if (isAdd) {
    newAssetValue = currentAssetValue.plus(deltaValue)
  } else {
    if (currentAssetValue.lt(deltaValue)) {
      throw new InsufficientLiquidityError(`removed value ${deltaValue} > liquidity ${currentAssetValue}`)
    }
    newAssetValue = currentAssetValue.minus(deltaValue)
  }
  // | x - target |
  const oldDiff = currentAssetValue.minus(targetAssetValue).abs()
  const newDiff = newAssetValue.minus(targetAssetValue).abs()
  if (targetAssetValue.eq(_0)) {
    // avoid division by 0
    return baseFeeRate
  } else if (newDiff.lt(oldDiff)) {
    // improves
    const rebate = dynamicFeeRate
      .times(oldDiff)
      .div(targetAssetValue)
      .dp(5, BigNumber.ROUND_DOWN)
    return BigNumber.maximum(_0, baseFeeRate.minus(rebate))
  } else {
    // worsen
    let avgDiff = oldDiff.plus(newDiff).div(2)
    avgDiff = BigNumber.minimum(avgDiff, targetAssetValue)
    const dynamic = dynamicFeeRate
      .times(avgDiff)
      .div(targetAssetValue)
      .dp(5, BigNumber.ROUND_DOWN)
    return baseFeeRate.plus(dynamic)
  }
}

export function computeFundingRate(
  pool: LiquidityPool,
  asset: Asset,
  stableUtilization: BigNumber,
  unstableUtilization: BigNumber
): { longFundingRate: BigNumber; shortFundingRate: BigNumber } {
  const shortFundingRate = computeSingleFundingRate(
    pool.shortFundingBaseRate8H,
    pool.shortFundingLimitRate8H,
    stableUtilization
  )
  const longFundingRate = computeSingleFundingRate(
    asset.longFundingBaseRate8H,
    asset.longFundingLimitRate8H,
    unstableUtilization
  )
  return { longFundingRate, shortFundingRate }
}

/**
 * Funding rate formula
 *
 * ^ fr           / limit
 * |            /
 * |          /
 * |        /
 * |______/ base
 * |    .
 * |  .
 * |.
 * +-------------------> %util
 */
export function computeSingleFundingRate(
  baseRate8H: BigNumber,
  limitRate8H: BigNumber,
  utilization: BigNumber
): BigNumber {
  if (utilization.gt(_1)) {
    throw new InvalidArgumentError('%utilization > 100%')
  }
  let fundingRate = utilization.times(limitRate8H)
  fundingRate = BigNumber.maximum(fundingRate, baseRate8H)
  return fundingRate
}

/**
 * @dev check price and add spread, where spreadType should be:
 *
 *      subAccount.isLong   openPosition   closePosition   addLiquidity   removeLiquidity
 *      long                ask            bid
 *      short               bid            ask
 *      N/A                                                bid            ask
 */
export function computePriceWithSpread(asset: Asset, price: BigNumber, spreadType: SpreadType): BigNumber {
  if (asset.halfSpread.eq(_0)) {
    return price
  }
  const halfSpread = price.times(asset.halfSpread)
  if (spreadType == SpreadType.Bid) {
    if (price.lte(halfSpread)) {
      throw new BugError(`price - halfSpread = 0. impossible. price: ${price.toFixed()}`)
    }
    return price.minus(halfSpread)
  } else {
    return price.plus(halfSpread)
  }
}
