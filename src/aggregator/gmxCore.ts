import { GmxTokenInfo, GmxCoreAccount, GmxCoreAccountDetails, GmxCoreStorage } from './types'
import { BigNumber } from 'bignumber.js'
import { GMX_BASIS_POINTS_DECIMALS, GMX_MAX_LEVERAGE, GMX_PRICE_DECIMALS } from './constants'
import { binarySearchRight } from '../calculator'
import { _1 } from '../constants'
import { InsufficientLiquidityError, InsufficientLiquidityType } from '../types'

export function computeGmxCoreAccount(
  storage: GmxCoreStorage,
  pos: GmxCoreAccount,
  assetApiPrice: BigNumber
): GmxCoreAccountDetails {
  const asset = storage.tokens[pos.assetTokenAddress.toLowerCase()]
  if (!asset) {
    throw new Error(`unknown gmx token ${pos.assetTokenAddress}`)
  }
  const collateral = storage.tokens[pos.collateralTokenAddress.toLowerCase()]
  if (!asset) {
    throw new Error(`unknown gmx token ${pos.collateralTokenAddress}`)
  }
  // size of account
  let size = new BigNumber(0)
  let collateralAmount = pos.collateralUsd
  if (!pos.entryPrice.eq(0)) {
    size = pos.sizeUsd.div(pos.entryPrice)
    if (pos.isLong) {
      collateralAmount = pos.collateralUsd.div(pos.entryPrice)
    }
  }
  // prices
  const { minPrice, maxPrice } = getGmxCorePrice(asset, assetApiPrice)
  const markPrice = pos.isLong ? minPrice : maxPrice
  // fees
  const fundingFeeUsd = _getFundingFee(pos.entryFundingRate, collateral.cumulativeFundingRate, pos.sizeUsd)
  if (fundingFeeUsd.lt(0)) {
    throw new Error(
      `computeGmxCoreAccount:fundingFeeUsd < 0. entryFunding: ${pos.entryFundingRate.toFixed()} token: ${
        collateral.config.symbol
      } acc.funding: ${collateral.cumulativeFundingRate.toFixed()}`
    )
  }
  let pendingPnlUsd = new BigNumber(0)
  let pnlUsd = new BigNumber(0)
  if (!pos.sizeUsd.eq(0) && !pos.entryPrice.eq(0)) {
    let priceDelta = markPrice.minus(pos.entryPrice)
    if (!pos.isLong) {
      priceDelta = priceDelta.negated()
    }
    pendingPnlUsd = pos.sizeUsd.div(pos.entryPrice).times(priceDelta)
    pnlUsd = pendingPnlUsd
    // if the minProfitTime has passed then there will be no min profit threshold
    // the min profit threshold helps to prevent front-running issues
    const minBps =
      Date.now() / 1000 > pos.lastIncreasedTime + storage.minProfitTime ? new BigNumber(0) : asset.minProfit
    if (pnlUsd.gt(0) && pnlUsd.div(pos.sizeUsd).lte(minBps)) {
      pnlUsd = new BigNumber(0)
    }
  }
  const pendingPnlAfterFundingUsd = pendingPnlUsd.minus(fundingFeeUsd)
  const marginBalanceUsd = pos.collateralUsd.plus(pendingPnlAfterFundingUsd)
  let liquidationPrice = _getLiquidationPrice(
    storage,
    pos.isLong,
    pos.sizeUsd,
    pos.collateralUsd,
    pos.entryPrice,
    pos.entryFundingRate,
    collateral.cumulativeFundingRate
  )
  if (!liquidationPrice) {
    liquidationPrice = new BigNumber(0)
  }

  const leverage = pos.collateralUsd.eq(0) ? new BigNumber(0) : pos.sizeUsd.div(pos.collateralUsd)
  const pendingRoe = pos.collateralUsd.eq(0) ? new BigNumber(0) : pendingPnlAfterFundingUsd.div(pos.collateralUsd)
  const withdrawableCollateralUsd = BigNumber.maximum(
    0,
    pos.collateralUsd
      .minus(_getPositionFee(storage, pos.sizeUsd))
      .minus(storage.liquidationFeeUsd)
      .minus(pos.sizeUsd.div(GMX_MAX_LEVERAGE))
      .plus(BigNumber.minimum(0, pendingPnlUsd))
  )

  let isSafe = true
  if (pos.sizeUsd.lt(pos.collateralUsd)) {
    isSafe = false
  } else if (pos.collateralUsd.lt(0)) {
    isSafe = false
  } else if (pendingPnlUsd.lt(0)) {
    const remainingCollateralUsd = pos.collateralUsd.plus(pendingPnlUsd)
    const positionFeeUsd = _getPositionFee(storage, pos.sizeUsd)
    if (remainingCollateralUsd.lt(positionFeeUsd.plus(storage.liquidationFeeUsd))) {
      isSafe = false
    } else if (remainingCollateralUsd.times(GMX_MAX_LEVERAGE).lt(pos.sizeUsd)) {
      isSafe = false
    }
  }

  return {
    gmxAccount: pos,
    computed: {
      size,
      collateral: collateralAmount,
      minPrice,
      maxPrice,
      markPrice,
      marginBalanceUsd,
      isIMSafe: isSafe,
      isMMSafe: isSafe,
      leverage,
      fundingFeeUsd,
      pendingPnlUsd,
      pendingPnlAfterFundingUsd,
      pendingRoe,
      pnlUsd,
      liquidationPrice,
      withdrawableCollateralUsd
    }
  }
}

export function computeGmxCoreIncrease(
  storage: GmxCoreStorage,
  pos: GmxCoreAccount,
  assetApiPrice: BigNumber,
  sizeDeltaUsd: BigNumber,
  collateralDeltaUsd: BigNumber
): {
  afterTrade: GmxCoreAccountDetails
  isTradeSafe: boolean
  feeUsd: BigNumber
  liquidityWarning?: InsufficientLiquidityError
} {
  pos = { ...pos }
  let liquidityWarning: InsufficientLiquidityError | undefined = undefined
  const asset = storage.tokens[pos.assetTokenAddress.toLowerCase()]
  if (!asset) {
    throw new Error(`unknown gmx token ${pos.assetTokenAddress}`)
  }
  const collateral = storage.tokens[pos.collateralTokenAddress.toLowerCase()]
  if (!collateral) {
    throw new Error(`unknown gmx token ${pos.collateralTokenAddress}`)
  }
  if (asset.config.isStable) {
    throw new Error(`asset is a stable coin ${pos.assetTokenAddress}`)
  }
  if (pos.isLong && pos.assetTokenAddress !== pos.collateralTokenAddress) {
    throw new Error(`asset != collateral for long position`)
  }
  if (!pos.isLong && !collateral.config.isStable) {
    throw new Error(`collateral should be stable coin for short position`)
  }
  const detail = computeGmxCoreAccount(storage, pos, assetApiPrice)
  collateralDeltaUsd = collateralDeltaUsd.dp(collateral.config.decimals, BigNumber.ROUND_DOWN)
  // prices
  const { minPrice, maxPrice } = getGmxCorePrice(asset, assetApiPrice)
  const tradingPrice = pos.isLong ? maxPrice : minPrice
  // update entryPrice
  if (pos.sizeUsd.eq(0)) {
    pos.entryPrice = tradingPrice
  } else {
    // for longs: nextAveragePrice = (nextPrice * nextSize)/ (nextSize + delta)
    // for shorts: nextAveragePrice = (nextPrice * nextSize) / (nextSize - delta)
    const nextSize = pos.sizeUsd.plus(sizeDeltaUsd)
    if (nextSize.lte(0)) {
      throw new Error(`invalid sizeDeltaUsd ${sizeDeltaUsd.toFixed()}. new position = 0`)
    }
    const divisor = pos.isLong ? nextSize.plus(detail.computed.pnlUsd) : nextSize.minus(detail.computed.pnlUsd)
    pos.entryPrice = tradingPrice.times(nextSize).div(divisor)
  }
  // fee
  const feeUsd = _getPositionFee(storage, sizeDeltaUsd).plus(
    _getFundingFee(pos.entryFundingRate, collateral.cumulativeFundingRate, pos.sizeUsd)
  )
  pos.collateralUsd = pos.collateralUsd.plus(collateralDeltaUsd)
  pos.collateralUsd = pos.collateralUsd.minus(feeUsd)
  pos.entryFundingRate = collateral.cumulativeFundingRate
  pos.sizeUsd = pos.sizeUsd.plus(sizeDeltaUsd)
  pos.lastIncreasedTime = Date.now() / 1000
  // _validateMaxGlobalSize
  if (!sizeDeltaUsd.eq(0)) {
    if (
      !liquidityWarning &&
      pos.isLong &&
      asset.maxGlobalLongSizeUsd.gt(0) &&
      asset.guaranteedUsd.plus(sizeDeltaUsd).gt(asset.maxGlobalLongSizeUsd)
    ) {
      liquidityWarning = new InsufficientLiquidityError(
        InsufficientLiquidityType.AggregatorLimitedMaxPosition,
        `gmx: asset(${
          asset.config.symbol
        }) guaranteed > maxGlobalLong: ${asset.guaranteedUsd.toFixed()} + ${sizeDeltaUsd.toFixed()} > ${asset.maxGlobalLongSizeUsd.toFixed()}`
      )
    }
    if (
      !liquidityWarning &&
      !pos.isLong &&
      asset.maxGlobalShortSizeUsd.gt(0) &&
      asset.globalShortSizeUsd.plus(sizeDeltaUsd).gt(asset.maxGlobalShortSizeUsd)
    ) {
      liquidityWarning = new InsufficientLiquidityError(
        InsufficientLiquidityType.AggregatorLimitedMaxPosition,
        `gmx: asset(${
          asset.config.symbol
        }) globalShort > maxGlobalShortSize: ${asset.globalShortSizeUsd.toFixed()} + ${sizeDeltaUsd.toFixed()} > ${asset.maxGlobalShortSizeUsd.toFixed()}`
      )
    }
  }
  // _increaseReservedAmount
  const collateralApiPrice = pos.isLong ? assetApiPrice : null
  const reserveDelta = computeGmxCoreUsdToTokenMin(sizeDeltaUsd, collateral, collateralApiPrice)
  if (collateral.reservedAmount.plus(reserveDelta).gt(collateral.poolAmount)) {
    if (!liquidityWarning) {
      liquidityWarning = new InsufficientLiquidityError(
        InsufficientLiquidityType.AggregatorLimitedMaxPosition,
        `gmx: collateral(${
          collateral.config.symbol
        }) reserve > pool: ${collateral.reservedAmount.toFixed()} + ${reserveDelta.toFixed()} > ${collateral.poolAmount.toFixed()}`
      )
    }
  }
  const afterTrade = computeGmxCoreAccount(storage, pos, assetApiPrice)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isIMSafe,
    liquidityWarning,
    feeUsd
  }
}

export function computeGmxCoreDecrease(
  storage: GmxCoreStorage,
  pos: GmxCoreAccount,
  assetApiPrice: BigNumber,
  sizeDeltaUsd: BigNumber, // in USD
  collateralDeltaUsd: BigNumber // in USD
): {
  afterTrade: GmxCoreAccountDetails
  isTradeSafe: boolean
  feeUsd: BigNumber
  realizedPnlUsd: BigNumber
  usdOutAfterFee: BigNumber
  collateralOutAfterFee: BigNumber
} {
  pos = { ...pos }
  const asset = storage.tokens[pos.assetTokenAddress.toLowerCase()]
  if (!asset) {
    throw new Error(`unknown gmx token ${pos.assetTokenAddress}`)
  }
  const collateral = storage.tokens[pos.collateralTokenAddress.toLowerCase()]
  if (!collateral) {
    throw new Error(`unknown gmx token ${pos.collateralTokenAddress}`)
  }
  if (asset.config.isStable) {
    throw new Error(`asset is a stable coin ${pos.assetTokenAddress}`)
  }
  if (pos.isLong && pos.assetTokenAddress !== pos.collateralTokenAddress) {
    throw new Error(`asset != collateral for long position`)
  }
  if (!pos.isLong && !collateral.config.isStable) {
    throw new Error(`collateral should be stable coin for short position`)
  }
  if (pos.sizeUsd.lt(sizeDeltaUsd)) {
    throw new Error(`invalid amount ${sizeDeltaUsd.toFixed()}, pos ${pos.sizeUsd.toFixed()}`)
  }
  const detail = computeGmxCoreAccount(storage, pos, assetApiPrice)
  const { realizedPnlUsd, newPosition, usdOutAfterFee, feeUsd } = _reduceCollateral(
    storage,
    detail,
    collateralDeltaUsd,
    sizeDeltaUsd
  )
  const collateralApiPrice = pos.isLong ? assetApiPrice : null
  const collateralOutAfterFee = computeGmxCoreUsdToTokenMin(usdOutAfterFee, collateral, collateralApiPrice)
  pos = newPosition
  if (!pos.sizeUsd.eq(sizeDeltaUsd)) {
    // partial
    pos.entryFundingRate = collateral.cumulativeFundingRate
    pos.sizeUsd = pos.sizeUsd.minus(sizeDeltaUsd)
  } else {
    // completely close
    pos.collateralUsd = new BigNumber(0)
    pos.sizeUsd = new BigNumber(0)
    pos.entryFundingRate = new BigNumber(0)
    pos.entryPrice = new BigNumber(0)
    pos.lastIncreasedTime = 0
  }
  const afterTrade = computeGmxCoreAccount(storage, pos, assetApiPrice)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isIMSafe,
    feeUsd,
    realizedPnlUsd,
    usdOutAfterFee,
    collateralOutAfterFee
  }
}

function _reduceCollateral(
  storage: GmxCoreStorage,
  details: GmxCoreAccountDetails,
  collateralDeltaUsd: BigNumber,
  sizeDeltaUsd: BigNumber
): {
  realizedPnlUsd: BigNumber
  newPosition: GmxCoreAccount
  usdOut: BigNumber
  usdOutAfterFee: BigNumber
  feeUsd: BigNumber
} {
  const pos = { ...details.gmxAccount } // clone
  const collateral = storage.tokens[pos.collateralTokenAddress.toLowerCase()]
  const feeUsd = _getPositionFee(storage, sizeDeltaUsd).plus(
    _getFundingFee(pos.entryFundingRate, collateral.cumulativeFundingRate, pos.sizeUsd)
  )
  // get the proportional change in pnl
  // ΔN / N * pnl
  const adjustedDeltaUsd = sizeDeltaUsd.times(details.computed.pnlUsd).div(pos.sizeUsd)
  let usdOut = new BigNumber(0)
  // transfer profits out
  if (adjustedDeltaUsd.gt(0)) {
    usdOut = adjustedDeltaUsd
  } else if (adjustedDeltaUsd.lt(0)) {
    pos.collateralUsd = pos.collateralUsd.plus(adjustedDeltaUsd)
  }
  // reduce the position's collateral by _collateralDelta
  // transfer _collateralDelta out
  if (collateralDeltaUsd.gt(0)) {
    usdOut = usdOut.plus(collateralDeltaUsd)
    pos.collateralUsd = pos.collateralUsd.minus(collateralDeltaUsd)
  }
  // if the position will be closed, then transfer the remaining collateral out
  if (pos.sizeUsd.eq(sizeDeltaUsd)) {
    usdOut = usdOut.plus(pos.collateralUsd)
    pos.collateralUsd = new BigNumber(0)
  }
  // if the usdOut is more than the fee then deduct the fee from the usdOut directly
  // else deduct the fee from the position's collateral
  let usdOutAfterFee = usdOut
  if (usdOut.gt(feeUsd)) {
    usdOutAfterFee = usdOut.minus(feeUsd)
  } else {
    pos.collateralUsd = pos.collateralUsd.minus(feeUsd)
  }
  return { realizedPnlUsd: adjustedDeltaUsd, newPosition: pos, usdOut, usdOutAfterFee, feeUsd }
}

export function getGmxCorePrice(
  token: GmxTokenInfo,
  apiPrice: BigNumber | null
): { minPrice: BigNumber; maxPrice: BigNumber } {
  if (apiPrice === null) {
    return { minPrice: token.contractMinPrice, maxPrice: token.contractMaxPrice }
  }
  const contractMidPrice = token.contractMaxPrice.plus(token.contractMinPrice).div(2)
  const halfSpread = token.contractMaxPrice
    .minus(token.contractMinPrice)
    .div(2)
    .div(contractMidPrice)
    .times(apiPrice)
  const minPrice = BigNumber.maximum(0, apiPrice.minus(halfSpread))
  const maxPrice = apiPrice.plus(halfSpread)
  return { minPrice, maxPrice }
}

function _getPositionFee(storage: GmxCoreStorage, sizeUsd: BigNumber): BigNumber {
  return sizeUsd.times(storage.marginFeeRate)
}

function _getFundingFee(entryFundingRate: BigNumber, cumulativeFundingRate: BigNumber, sizeUsd: BigNumber): BigNumber {
  return sizeUsd.times(cumulativeFundingRate.minus(entryFundingRate))
}

function _getLiquidationPriceFromDelta(
  liquidationAmountUsd: BigNumber,
  sizeUsd: BigNumber,
  collateralUsd: BigNumber,
  averagePrice: BigNumber,
  isLong: boolean
): BigNumber | undefined {
  if (!sizeUsd || sizeUsd.eq(0)) {
    return
  }
  if (liquidationAmountUsd.gt(collateralUsd)) {
    const liquidationDelta = liquidationAmountUsd.minus(collateralUsd)
    const priceDelta = liquidationDelta.times(averagePrice).div(sizeUsd)
    return !isLong ? averagePrice.minus(priceDelta) : averagePrice.plus(priceDelta)
  }
  const liquidationDelta = collateralUsd.minus(liquidationAmountUsd)
  const priceDelta = liquidationDelta.times(averagePrice).div(sizeUsd)
  return isLong ? averagePrice.minus(priceDelta) : averagePrice.plus(priceDelta)
}

function _getLiquidationPrice(
  storage: GmxCoreStorage,
  isLong: boolean,
  sizeUsd: BigNumber,
  collateral: BigNumber,
  averagePrice: BigNumber,
  entryFundingRate: BigNumber,
  cumulativeFundingRate: BigNumber
): BigNumber | undefined {
  const nextSize = sizeUsd
  const remainingCollateral = collateral
  let positionFee = _getPositionFee(storage, sizeUsd).plus(storage.liquidationFeeUsd)
  const fundingFee = _getFundingFee(entryFundingRate, cumulativeFundingRate, sizeUsd)
  positionFee = positionFee.plus(fundingFee)
  const liquidationPriceForFees = _getLiquidationPriceFromDelta(
    positionFee,
    nextSize,
    remainingCollateral,
    averagePrice,
    isLong
  )
  const liquidationPriceForMaxLeverage = _getLiquidationPriceFromDelta(
    nextSize.div(GMX_MAX_LEVERAGE),
    nextSize,
    remainingCollateral,
    averagePrice,
    isLong
  )
  if (!liquidationPriceForFees) {
    return liquidationPriceForMaxLeverage
  }
  if (!liquidationPriceForMaxLeverage) {
    return liquidationPriceForFees
  }
  if (isLong) {
    return BigNumber.maximum(liquidationPriceForFees, liquidationPriceForMaxLeverage)
  }
  return BigNumber.minimum(liquidationPriceForFees, liquidationPriceForMaxLeverage)
}

// swap A to B, giving A
// original: getNextToAmount
export function computeGmxCoreSwap(
  storage: GmxCoreStorage,
  fromToken: GmxTokenInfo,
  toToken: GmxTokenInfo,
  fromAmount: BigNumber,
  fromTokenApiPrice: BigNumber | null, // CAUTION: if swapping execute immediately, you should pass null
  toTokenApiPrice: BigNumber | null // CAUTION: if swapping execute immediately, you should pass null
): { toAmount: BigNumber; feeRate: BigNumber; feeUsd: BigNumber; liquidityWarning?: InsufficientLiquidityError } {
  let liquidityWarning: InsufficientLiquidityError | undefined = undefined
  if (fromToken.config.address.toLowerCase() === toToken.config.address.toLowerCase()) {
    return { toAmount: fromAmount, feeRate: new BigNumber(0), feeUsd: new BigNumber(0) }
  }
  const fromTokenMinPrice = getGmxCorePrice(fromToken, fromTokenApiPrice).minPrice
  const toTokenMaxPrice = getGmxCorePrice(toToken, toTokenApiPrice).maxPrice
  const toAmount = fromAmount
    .times(fromTokenMinPrice)
    .div(toTokenMaxPrice)
    .dp(fromToken.config.decimals, BigNumber.ROUND_DOWN) // the original code is amountIn.mul(priceIn).div(priceOut). so decimals = tokenIn.decimals
    .dp(toToken.config.decimals, BigNumber.ROUND_DOWN) // the original code is adjustForDecimals. so decimals = tokenOut.decimals
  const usdgAmount = fromAmount.times(fromTokenMinPrice)
  const swapFeeBasisPoints =
    fromToken.config.isStable && toToken.config.isStable ? storage.stableSwapFeeRate : storage.swapFeeRate
  const taxBasisPoints = fromToken.config.isStable && toToken.config.isStable ? storage.stableTaxRate : storage.taxRate
  const feeRate0 = getGmxCoreTokenFeeRate(storage, fromToken, usdgAmount, swapFeeBasisPoints, taxBasisPoints, true)
  const feeRate1 = getGmxCoreTokenFeeRate(storage, toToken, usdgAmount, swapFeeBasisPoints, taxBasisPoints, false)
  const feeRate = BigNumber.maximum(feeRate0, feeRate1)
  const afterFeeAmount = new BigNumber(1).minus(feeRate).times(toAmount)
  const feeAmount = toAmount.minus(afterFeeAmount)
  const feeUsd = computeGmxCoreTokenToUsdMin(feeAmount, toToken, toTokenApiPrice)
  // _increaseUsdgAmount _tokenIn
  if (fromToken.usdgAmount.plus(usdgAmount).gt(fromToken.maxUsdgAmounts)) {
    if (!liquidityWarning) {
      liquidityWarning = new InsufficientLiquidityError(
        InsufficientLiquidityType.SwapExceedsCurrentAsset,
        `gmx: fromToken(${
          fromToken.config.symbol
        }) exceeds max usdg: ${fromToken.usdgAmount.toFixed()} + ${usdgAmount.toFixed()} > ${fromToken.maxUsdgAmounts.toFixed()} `
      )
    }
  }
  // _decreasePoolAmount _tokenOut
  if (toToken.poolAmount.minus(toAmount).lt(toToken.reservedAmount)) {
    if (!liquidityWarning) {
      liquidityWarning = new InsufficientLiquidityError(
        InsufficientLiquidityType.SwapExceedsCurrentAsset,
        `gmx: toToken(${
          toToken.config.symbol
        }) less than reserved: ${toToken.poolAmount.toFixed()} - ${toAmount.toFixed()} < ${toToken.reservedAmount.toFixed()}`
      )
    }
  }
  // _validateBufferAmount _tokenOut
  if (toToken.poolAmount.minus(toAmount).lt(toToken.bufferAmounts)) {
    if (!liquidityWarning) {
      liquidityWarning = new InsufficientLiquidityError(
        InsufficientLiquidityType.SwapExceedsCurrentAsset,
        `gmx: toToken(${
          toToken.config.symbol
        }) less than buffer: ${toToken.poolAmount.toFixed()} - ${toAmount.toFixed()} < ${toToken.bufferAmounts.toFixed()}`
      )
    }
  }
  return {
    toAmount: afterFeeAmount,
    feeRate,
    feeUsd,
    liquidityWarning
  }
}

export function getGmxCoreTokenFeeRate(
  storage: GmxCoreStorage,
  token: GmxTokenInfo,
  usdgDelta: BigNumber,
  feeRate: BigNumber,
  taxRate: BigNumber,
  increment: boolean
): BigNumber {
  if (feeRate.gte(1)) {
    throw new Error(`invalid feeRate ${feeRate.toFixed()}`)
  }
  if (taxRate.gte(1)) {
    throw new Error(`invalid feeRate ${taxRate.toFixed()}`)
  }
  const initialAmount = token.usdgAmount
  let nextAmount = new BigNumber(0)
  if (increment) {
    nextAmount = initialAmount.plus(usdgDelta)
  } else {
    nextAmount = BigNumber.maximum(0, initialAmount.minus(usdgDelta))
  }
  const targetAmount = getGmxCoreTargetUsdgAmount(storage, token)
  const initialDiff = initialAmount.minus(targetAmount).abs()
  const nextDiff = nextAmount.minus(targetAmount).abs()
  if (targetAmount.eq(0)) {
    return feeRate
  } else if (nextDiff.lt(initialDiff)) {
    const rebateBps = taxRate
      .times(initialDiff)
      .div(targetAmount)
      .dp(GMX_BASIS_POINTS_DECIMALS, BigNumber.ROUND_DOWN)
    return BigNumber.maximum(0, feeRate.minus(rebateBps))
  } else {
    const averageDiff = BigNumber.minimum(targetAmount, initialDiff.plus(nextDiff).div(2))
    const taxBps = taxRate
      .times(averageDiff)
      .div(targetAmount)
      .dp(GMX_BASIS_POINTS_DECIMALS, BigNumber.ROUND_DOWN)
    return feeRate.plus(taxBps)
  }
}

export function getGmxCoreTargetUsdgAmount(storage: GmxCoreStorage, token: GmxTokenInfo): BigNumber {
  if (storage.usdgSupply.eq(0)) {
    return new BigNumber(0)
  }
  return storage.usdgSupply.times(token.weight).div(storage.totalTokenWeights)
}

export function computeGmxCoreUsdToTokenMin(
  usd: BigNumber,
  token: GmxTokenInfo,
  tokenApiPrice: BigNumber | null
): BigNumber {
  return usd.div(getGmxCorePrice(token, tokenApiPrice).maxPrice).dp(token.config.decimals, BigNumber.ROUND_DOWN)
  //                                                   ^^^ yes! that's correct
}

export function computeGmxCoreTokenToUsdMin(
  tokenAmount: BigNumber,
  token: GmxTokenInfo,
  tokenApiPrice: BigNumber | null
): BigNumber {
  return tokenAmount.times(getGmxCorePrice(token, tokenApiPrice).minPrice).dp(GMX_PRICE_DECIMALS, BigNumber.ROUND_DOWN)
}

// swap A to B, giving B
export function calculateGmxCoreSwapBySwapOut(
  storage: GmxCoreStorage,
  fromToken: GmxTokenInfo,
  toToken: GmxTokenInfo,
  toAmount: BigNumber,
  fromTokenApiPrice: BigNumber | null,
  toTokenApiPrice: BigNumber | null
): { fromAmount: BigNumber; toAmount: BigNumber; feeRate: BigNumber; feeUsd: BigNumber } {
  const guess = toAmount
    .times(getGmxCorePrice(toToken, toTokenApiPrice).maxPrice)
    .div(getGmxCorePrice(fromToken, fromTokenApiPrice).minPrice) // max / min so that guess will be a little larger
    .times(storage.swapFeeRate.plus(storage.taxRate).plus(_1)) // add max possible swap fee
  // search in for given out
  let fromAmount = binarySearchRight((x: BigNumber) => {
    x = x.dp(fromToken.config.decimals, BigNumber.ROUND_DOWN)
    const swapResult = computeGmxCoreSwap(storage, fromToken, toToken, x, fromTokenApiPrice, toTokenApiPrice)
    return swapResult.toAmount.gte(toAmount)
  }, guess)
  // swap in => out again
  fromAmount = fromAmount.dp(fromToken.config.decimals, BigNumber.ROUND_DOWN)
  const swapResult = computeGmxCoreSwap(storage, fromToken, toToken, fromAmount, fromTokenApiPrice, toTokenApiPrice)
  // NOTE: insufficient liquidity is ignored
  if (swapResult.toAmount.lt(toAmount)) {
    console.warn(
      `BUG:calculateGmxCoreSwapBySwapOut:get swapIn by swapOut has a bug. ${fromAmount} ${
        fromToken.config.symbol
      } => ${swapResult.toAmount.toFixed()} ${toToken.config.symbol} < ${toAmount.toFixed()}`
    )
  }
  return {
    fromAmount,
    toAmount: swapResult.toAmount,
    feeRate: swapResult.feeRate,
    feeUsd: swapResult.feeUsd
  }
}
