import { BigNumber } from 'bignumber.js'
import { Asset, BugError, InsufficientLiquidityError, InsufficientLiquidityType, InvalidArgumentError } from '../types'
import {
  AggregatorOrderCategory,
  GmxAdapterAccountDetails,
  GmxAdapterClosePositionResult,
  AggregatorCollateral,
  GmxAdapterOpenPositionResult,
  GmxAdapterStorage,
  AggregatorSubAccount,
  GmxAdapterWithdrawCollateralResult,
  GmxTokenInfo
} from './types'
import {
  calculateGmxCoreSwapBySwapOut,
  computeGmxCoreAccount,
  computeGmxCoreDecrease,
  computeGmxCoreIncrease,
  computeGmxCoreSwap,
  computeGmxCoreTokenToUsdMin,
  getGmxCorePrice
} from './gmxCore'
import { GMX_MAX_LEVERAGE } from './constants'
import { DECIMALS, _0, _1 } from '../constants'
import { binarySearchLeft } from '../calculator'

export function computeGmxAdapterAccount(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount,
  assetApiPrice: BigNumber
): GmxAdapterAccountDetails {
  if (pos.assetTokenAddress.toLowerCase() !== pos.gmx.assetTokenAddress.toLowerCase()) {
    throw new InvalidArgumentError(`pos.asset != pos.gmx.asset`)
  }
  if (pos.collateralTokenAddress.toLowerCase() !== pos.gmx.collateralTokenAddress.toLowerCase()) {
    throw new InvalidArgumentError(`pos.collateral != pos.gmx.collateral`)
  }
  if (pos.isLong !== pos.gmx.isLong) {
    throw new InvalidArgumentError(`pos.isLong != pos.gmx.isLong`)
  }
  const { gmxCollateral, aggregatorCollateral } = _loadCollateral(
    assets,
    storage,
    pos.collateralTokenAddress,
    pos.assetTokenAddress,
    pos.isLong
  )
  const gmxDetails = computeGmxCoreAccount(storage.gmx, pos.gmx, assetApiPrice)
  const collateralApiPrice = pos.isLong ? assetApiPrice : null
  const collateralPrice = getGmxCorePrice(gmxCollateral, collateralApiPrice).minPrice
  const traderInitialCollateralPrice = pos.isLong ? pos.gmx.entryPrice : gmxCollateral.contractMinPrice
  // fees
  const aggregatorFundingFeeCollateral = _computeAggregatorFundingFee(assets, storage, pos)
  if (aggregatorFundingFeeCollateral.lt(0)) {
    throw new Error(
      `aggregatorFundingFee < 0. entryFunding: ${pos.debtEntryFunding.toFixed()} token: ${gmxCollateral.config.symbol}`
    )
  }
  // margin balance
  const inflightBorrow = _getInflightBorrow(pos)
  const marginBalanceUsd = pos.gmx.collateralUsd
    .minus(
      pos.cumulativeDebt
        .plus(pos.cumulativeFee)
        .minus(inflightBorrow)
        .plus(aggregatorFundingFeeCollateral)
        .times(traderInitialCollateralPrice)
    )
    .plus(gmxDetails.computed.pendingPnlAfterFundingUsd)
  const traderInitialCostUsd = pos.gmx.collateralUsd.minus(
    pos.cumulativeDebt
      .plus(pos.cumulativeFee)
      .minus(inflightBorrow)
      .times(traderInitialCollateralPrice)
    // note: unlike marginBalanceUsd, we skip aggregatorFundingFee here. we append
    //       aggregatorFundingFee into pendingPnlAfterFundingUsd
  )
  const aggregatorFundingFeeUsd = aggregatorFundingFeeCollateral.times(traderInitialCollateralPrice)
  const pendingPnlAfterFundingUsd = gmxDetails.computed.pendingPnlAfterFundingUsd.minus(aggregatorFundingFeeUsd)
  const leverage = traderInitialCostUsd.eq(0) ? new BigNumber(0) : pos.gmx.sizeUsd.div(traderInitialCostUsd)
  const pendingRoe = traderInitialCostUsd.eq(0) ? new BigNumber(0) : pendingPnlAfterFundingUsd.div(traderInitialCostUsd)

  let liquidationPrice = _estimateGmxAdapterLiquidationPrice(
    aggregatorCollateral,
    pos,
    inflightBorrow,
    aggregatorFundingFeeCollateral,
    gmxDetails.computed.fundingFeeUsd
  )
  if (pos.isLong) {
    liquidationPrice = BigNumber.maximum(liquidationPrice, gmxDetails.computed.liquidationPrice)
  } else {
    liquidationPrice = BigNumber.minimum(liquidationPrice, gmxDetails.computed.liquidationPrice)
  }
  liquidationPrice = BigNumber.maximum(_0, liquidationPrice)

  let isIMSafe = true
  let isMMSafe = true
  if (pos.gmx.sizeUsd.lt(pos.gmx.collateralUsd)) {
    // gmx does not allow this
    isIMSafe = false
    isMMSafe = false
  } else if (pos.gmx.sizeUsd.gt(_0) && marginBalanceUsd.lt(storage.gmx.liquidationFeeUsd)) {
    // the trader pays liquidationFeeUsd
    isIMSafe = false
    isMMSafe = false
  } else if (!gmxDetails.computed.isMMSafe) {
    // if borrow = 0, gmx will liquidate at gmx MMRate instead of aggregator MMRate
    isIMSafe = false
    isMMSafe = false
  } else {
    // aggregator keeper condition
    isIMSafe = marginBalanceUsd.gte(pos.gmx.sizeUsd.times(aggregatorCollateral.initialMarginRate))
    isMMSafe = marginBalanceUsd.gte(pos.gmx.sizeUsd.times(aggregatorCollateral.maintenanceMarginRate))
  }

  return {
    account: pos,
    computed: {
      size: gmxDetails.computed.size,
      collateral: gmxDetails.computed.collateral,
      collateralPrice,
      minPrice: gmxDetails.computed.minPrice,
      maxPrice: gmxDetails.computed.maxPrice,
      markPrice: gmxDetails.computed.markPrice,
      traderInitialCostUsd,
      marginBalanceUsd,
      isIMSafe,
      isMMSafe,
      leverage,
      fundingFeeUsd: aggregatorFundingFeeCollateral.times(collateralPrice).plus(gmxDetails.computed.fundingFeeUsd),
      aggregatorFundingFeeUsd: aggregatorFundingFeeCollateral.times(collateralPrice),
      gmxFundingFeeUsd: gmxDetails.computed.fundingFeeUsd,
      pnlUsd: gmxDetails.computed.pnlUsd,
      pendingPnlUsd: gmxDetails.computed.pendingPnlUsd,
      pendingPnlAfterFundingUsd,
      pendingRoe,
      liquidationPrice,
      inflightBorrow
    }
  }
}

// compute the account that simulate the keeper
export function computeGmxAdapterAccountSimulateKeeper(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount,
  assetApiPrice: BigNumber
): GmxAdapterAccountDetails {
  if (pos.gmx.sizeUsd.eq(_0) && pos.cumulativeDebt.gt(_0)) {
    pos = {
      ...pos,
      gmx: {
        ...pos.gmx
      }
    }
    const { gmxCollateral, aggregatorCollateral } = _loadCollateral(
      assets,
      storage,
      pos.collateralTokenAddress,
      pos.assetTokenAddress,
      pos.isLong
    )
    let balance = pos.proxyCollateralBalance
    if (gmxCollateral.config.isNative) {
      balance = balance.plus(pos.proxyEthBalance)
    }
    const inflightBorrow = _getInflightBorrow(pos)
    const repayResult = _repayAsset(aggregatorCollateral, pos, balance, inflightBorrow)
    pos.cumulativeDebt = pos.cumulativeDebt.minus(repayResult.paidDebt)
    pos.cumulativeFee = _0
  }
  return computeGmxAdapterAccount(assets, storage, pos, assetApiPrice)
}

export function computeGmxAdapterOpenPosition(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount,
  assetApiPrice: BigNumber, // asset price
  borrowCollateral: BigNumber, // in collateral token
  sizeDeltaUsd: BigNumber, // position size
  swapInTokenAddress: string, // swapIn token
  swapInAmount: BigNumber // swapIn amount. in swapIn token. will use contract price because swapping executes immediately
): GmxAdapterOpenPositionResult {
  pos = {
    ...pos,
    gmx: {
      ...pos.gmx
    }
  }
  let liquidityWarning: InsufficientLiquidityError | undefined = undefined
  const { gmxCollateral, aggregatorCollateral, muxCollateral } = _loadCollateral(
    assets,
    storage,
    pos.collateralTokenAddress,
    pos.assetTokenAddress,
    pos.isLong
  )
  const gmxSwapIn = storage.gmx.tokens[swapInTokenAddress.toLowerCase()]
  if (!gmxSwapIn) {
    throw new Error(`unknown gmx token ${swapInTokenAddress}`)
  }
  borrowCollateral = borrowCollateral.dp(gmxCollateral.config.decimals, BigNumber.ROUND_DOWN)
  // prices
  const collateralApiPrice = pos.isLong ? assetApiPrice : null
  const collateralPrice = getGmxCorePrice(gmxCollateral, collateralApiPrice).minPrice
  // aggregator fee - funding
  const aggregatorFundingFeeCollateral = _computeAggregatorFundingFee(assets, storage, pos)
  const aggregatorFundingFeeUsd = aggregatorFundingFeeCollateral.times(collateralPrice)
  pos.cumulativeFee = pos.cumulativeFee.plus(aggregatorFundingFeeCollateral)
  // aggregator fee - open position boost fee will be deduct from borrowed
  const boostFeeCollateral = borrowCollateral
    .times(aggregatorCollateral.boostFeeRate)
    .dp(gmxCollateral.config.decimals, BigNumber.ROUND_DOWN)
  const boostFeeUsd = boostFeeCollateral.times(collateralPrice)
  pos.cumulativeDebt = pos.cumulativeDebt.plus(borrowCollateral)
  _updateEntryFunding(assets, storage, pos)
  // swap
  const {
    toAmount: swapOutCollateral,
    feeRate: swapFeeRate,
    feeUsd: swapFeeUsd,
    liquidityWarning: gmxSwapWarning
  } = computeGmxCoreSwap(
    storage.gmx,
    gmxSwapIn,
    gmxCollateral,
    swapInAmount,
    null, // will use contract price because swapping executes immediately
    null // will use contract price because swapping executes immediately
  )
  if (gmxSwapWarning && !liquidityWarning) {
    liquidityWarning = gmxSwapWarning
  }
  // trade
  const gmxAmountIn = swapOutCollateral.plus(borrowCollateral).minus(boostFeeCollateral)
  const collateralDeltaUsd = computeGmxCoreTokenToUsdMin(gmxAmountIn, gmxCollateral, collateralApiPrice)
  const {
    afterTrade: gmxAfterTrade,
    isTradeSafe: isGmxTradeSafe,
    feeUsd: gmxPosFeeUsd,
    liquidityWarning: gmxOpenPositionWarning
  } = computeGmxCoreIncrease(storage.gmx, pos.gmx, assetApiPrice, sizeDeltaUsd, collateralDeltaUsd)
  if (gmxOpenPositionWarning && !liquidityWarning) {
    liquidityWarning = gmxOpenPositionWarning
  }
  if (borrowCollateral.gt(_0)) {
    if (!muxCollateral) {
      throw new InvalidArgumentError(`mux: can not borrow (${gmxCollateral.config.symbol}): no such token`)
    }
    if (muxCollateral.spotLiquidity.lt(borrowCollateral)) {
      if (!liquidityWarning) {
        liquidityWarning = new InsufficientLiquidityError(
          InsufficientLiquidityType.AggregatorLimitedCredit,
          `can not borrow (${
            muxCollateral.symbol
          }): ${muxCollateral.spotLiquidity.toFixed()} < ${borrowCollateral.toFixed()}`
        )
      }
    }
    if (aggregatorCollateral.totalBorrow.plus(borrowCollateral).gt(aggregatorCollateral.borrowLimit)) {
      if (!liquidityWarning) {
        liquidityWarning = new InsufficientLiquidityError(
          InsufficientLiquidityType.AggregatorLimitedCredit,
          `can not borrow (${
            muxCollateral.symbol
          }): ${aggregatorCollateral.totalBorrow.toFixed()} + ${borrowCollateral.toFixed()} > ${aggregatorCollateral.borrowLimit.toFixed()}`
        )
      }
    }
  }

  // after trade
  pos.isLiquidating = false
  const afterTrade = computeGmxAdapterAccount(
    assets,
    storage,
    {
      ...pos,
      gmx: gmxAfterTrade.gmxAccount
    },
    assetApiPrice
  )
  return {
    sizeDeltaUsd,

    swapFeeRate,
    swapFeeUsd,
    swapOutCollateral,
    gmxAmountIn,

    gmxPosFeeUsd,
    boostFeeUsd,
    aggregatorFundingFeeUsd,
    feeUsd: swapFeeUsd
      .plus(gmxPosFeeUsd)
      .plus(boostFeeUsd)
      .plus(aggregatorFundingFeeUsd),

    afterTrade,
    isTradeSafe: isGmxTradeSafe && afterTrade.computed.isIMSafe,
    liquidityWarning
  }
}

export function computeGmxAdapterClosePosition(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount,
  assetApiPrice: BigNumber,
  sizeDeltaUsd: BigNumber, // position size
  collateralDeltaUsd: BigNumber // in USD
): GmxAdapterClosePositionResult {
  pos = {
    ...pos,
    gmx: {
      ...pos.gmx
    }
  }
  const { gmxCollateral, aggregatorCollateral } = _loadCollateral(
    assets,
    storage,
    pos.collateralTokenAddress,
    pos.assetTokenAddress,
    pos.isLong
  )
  if (pos.gmx.entryPrice.eq(0)) {
    throw new Error('empty account')
  }
  // prices
  const collateralApiPrice = pos.isLong ? assetApiPrice : null
  const collateralPrice = getGmxCorePrice(gmxCollateral, collateralApiPrice).minPrice
  const beforeTrade = computeGmxAdapterAccount(assets, storage, pos, assetApiPrice)
  // core close
  const {
    afterTrade: gmxAfterTrade,
    isTradeSafe: gmxIsTradeSafe,
    feeUsd: posFeeUsd,
    realizedPnlUsd,
    usdOutAfterFee: gmxUsdOutAfterFee,
    collateralOutAfterFee: gmxCollateralOutAfterFee
  } = computeGmxCoreDecrease(storage.gmx, pos.gmx, assetApiPrice, sizeDeltaUsd, collateralDeltaUsd)
  // aggregator fee - funding
  const aggregatorFundingFeeCollateral = _computeAggregatorFundingFee(assets, storage, pos)
  const aggregatorFundingFeeUsd = aggregatorFundingFeeCollateral.times(collateralPrice)
  pos.cumulativeFee = pos.cumulativeFee.plus(aggregatorFundingFeeCollateral)
  _updateEntryFunding(assets, storage, pos)
  // repay. see Debt.sol
  let collateralOut = gmxCollateralOutAfterFee
  let repayCollateral = _0
  let boostFeeCollateral = _0
  let boostFeeUsd = _0
  if (gmxAfterTrade.gmxAccount.sizeUsd.eq(0)) {
    const inflightBorrow = _getInflightBorrow(pos)
    const repayResult = _repayAsset(
      aggregatorCollateral,
      pos,
      gmxCollateralOutAfterFee /* note: balance in the proxy are ignored */,
      inflightBorrow
    )
    collateralOut = repayResult.remain
    repayCollateral = repayResult.paidDebt
    boostFeeCollateral = repayResult.boostFee
    boostFeeUsd = boostFeeCollateral.times(collateralPrice)
  }
  const afterTrade = computeGmxAdapterAccount(
    assets,
    storage,
    {
      ...pos,
      gmx: gmxAfterTrade.gmxAccount
    },
    assetApiPrice
  )
  return {
    sizeDeltaUsd,
    collateralDeltaUsd,

    realizedPnlUsd,
    gmxUsdOutAfterFee,
    gmxCollateralOutAfterFee,
    repayCollateral,

    boostFeeUsd,
    aggregatorFundingFeeUsd,
    feeUsd: posFeeUsd.plus(boostFeeUsd).plus(aggregatorFundingFeeUsd),

    afterTrade,
    collateralOut,
    isTradeSafe: beforeTrade.computed.isMMSafe && gmxIsTradeSafe && afterTrade.computed.isMMSafe
  }
}

export function computeGmxAdapterWithdrawCollateralWithUsd(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount,
  assetApiPrice: BigNumber,
  collateralDeltaUsd: BigNumber // unit in USD
): GmxAdapterWithdrawCollateralResult {
  const { aggregatorCollateral } = _loadCollateral(
    assets,
    storage,
    pos.collateralTokenAddress,
    pos.assetTokenAddress,
    pos.isLong
  )
  const r: GmxAdapterClosePositionResult = computeGmxAdapterClosePosition(
    assets,
    storage,
    pos,
    assetApiPrice,
    new BigNumber(0), // sizeDeltaUsd
    collateralDeltaUsd
  )
  const maxLeverageAfterWithdraw = BigNumber.min('100', _1.div(aggregatorCollateral.initialMarginRate))
  return {
    ...r,
    isTradeSafe: r.afterTrade.computed.isIMSafe && r.afterTrade.computed.leverage.lte(maxLeverageAfterWithdraw)
  }
}

// if the trader wants withdrawCollateral, get collateralUsd of the contract
export function computeGmxAdapterWithdrawCollateral(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount,
  assetApiPrice: BigNumber,
  withdrawCollateral: BigNumber // unit in collateral
): GmxAdapterWithdrawCollateralResult {
  _loadCollateral(assets, storage, pos.collateralTokenAddress, pos.assetTokenAddress, pos.isLong)
  let collateralDeltaUsd = binarySearchLeft(
    (x: BigNumber) => {
      if (x.lte(0)) {
        return true
      }
      const res = computeGmxAdapterWithdrawCollateralWithUsd(assets, storage, pos, assetApiPrice, x)
      if (!res.isTradeSafe) {
        return false
      }
      if (res.collateralOut.gt(withdrawCollateral)) {
        return false
      }
      return true
    },
    null, //   guess
    pos.gmx.collateralUsd // upperLimit
  )
  return computeGmxAdapterWithdrawCollateralWithUsd(assets, storage, pos, assetApiPrice, collateralDeltaUsd)
}

export function computeGmxAdapterMaxWithdrawCollateral(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount,
  assetApiPrice: BigNumber
): GmxAdapterWithdrawCollateralResult {
  _loadCollateral(assets, storage, pos.collateralTokenAddress, pos.assetTokenAddress, pos.isLong)
  // get max possible collateralDeltaUsd
  let collateralDeltaUsd = binarySearchLeft(
    (x: BigNumber) => {
      if (x.lte(0)) {
        return true
      }
      const res = computeGmxAdapterWithdrawCollateralWithUsd(assets, storage, pos, assetApiPrice, x)
      if (!res.isTradeSafe) {
        return false
      }
      return true
    },
    null, // guess
    pos.gmx.collateralUsd // upperLimit
  )
  // get max possible collateralDelta
  return computeGmxAdapterWithdrawCollateralWithUsd(assets, storage, pos, assetApiPrice, collateralDeltaUsd)
}

function _computeAggregatorFundingFee(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount
): BigNumber {
  if (pos.cumulativeDebt.eq(_0)) {
    return _0
  }
  if (pos.gmx.sizeUsd.eq(_0)) {
    // if the order is not filled, even if the trader borrows, the funding is always 0.
    // the order can be canceled by broker.
    return _0
  }
  const { gmxCollateral, muxCollateral } = _loadCollateral(
    assets,
    storage,
    pos.collateralTokenAddress,
    pos.assetTokenAddress,
    pos.isLong
  )
  if (!gmxCollateral) {
    throw new InvalidArgumentError(`missing gmxAsset[${pos.collateralTokenAddress}]`)
  }
  let cumulativeFunding = _0
  if (
    pos.isLong &&
    pos.cumulativeDebt.gt(_0) /* note: some of gmxCollateral can not borrow. thus there is no muxCollateral */
  ) {
    if (!muxCollateral) {
      throw new InvalidArgumentError(`can not borrow ${gmxCollateral.config.symbol}. no such token`)
    }
    cumulativeFunding = muxCollateral.longCumulativeFundingRate.minus(pos.debtEntryFunding)
    cumulativeFunding = cumulativeFunding
  }
  if (!pos.isLong) {
    // this is a design compromise, mux does not have a short funding unit in usd. so the contract uses
    // specified shortFundingAssetId instead
    const muxCollateral = assets[storage.shortFundingAssetId]
    if (!muxCollateral) {
      throw new InvalidArgumentError(`missing muxAsset[${storage.shortFundingAssetId}]`)
    }
    if (muxCollateral.isStable) {
      throw new InvalidArgumentError(`bad config. muxAsset[${storage.shortFundingAssetId}] can not be stable coin`)
    }
    const gmxShortFundingAsset = storage.gmx.tokens[muxCollateral.tokenAddress.toLowerCase()]
    if (!gmxShortFundingAsset) {
      throw new InvalidArgumentError(`missing gmxAsset[${muxCollateral.tokenAddress}]`)
    }
    // note: mux eth.shortCumulativeFunding = Σ_i ethPrice_i * fundingRate_i
    cumulativeFunding = muxCollateral.shortCumulativeFunding
      .minus(pos.debtEntryFunding)
      .div(gmxShortFundingAsset.contractMinPrice)
  }
  return cumulativeFunding.times(pos.cumulativeDebt).dp(gmxCollateral.config.decimals, BigNumber.ROUND_DOWN)
}

// CAUTION: only work when borrow > 0
function _estimateGmxAdapterLiquidationPrice(
  aggregatorCollateral: AggregatorCollateral,
  pos: AggregatorSubAccount,
  inflightBorrow: BigNumber,
  aggregatorFundingFee: BigNumber,
  gmxFundingFeeUsd: BigNumber
): BigNumber {
  if (pos.gmx.sizeUsd.eq(_0) || pos.gmx.entryPrice.eq(_0)) {
    return _0
  }
  const { maintenanceMarginRate: mmr } = aggregatorCollateral
  const t1 = pos.gmx.collateralUsd.minus(gmxFundingFeeUsd).minus(pos.gmx.sizeUsd.times(mmr))
  const t2 = pos.cumulativeDebt
    .minus(inflightBorrow)
    .plus(pos.cumulativeFee)
    .plus(aggregatorFundingFee)
  const t3 = pos.gmx.sizeUsd.div(pos.gmx.entryPrice)
  if (pos.isLong) {
    return t1
      .minus(pos.gmx.sizeUsd)
      .minus(t2.times(pos.gmx.entryPrice))
      .div(t3.negated())
  } else {
    return t1
      .plus(pos.gmx.sizeUsd)
      .minus(t2)
      .div(t3)
  }
}

// when opening a position, get position size with given positionSize and leverage.
// (ignore the existing positions)
export function calculateGmxAdapterOpenPositionWithSize(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  collateralTokenAddress: string, // key
  assetTokenAddress: string, // key
  isLong: boolean, // key
  assetApiPrice: BigNumber, // asset price
  leverage: BigNumber,
  positionAmount: BigNumber, // in asset
  swapInTokenAddress: string, // swapIn token. will use contract price because swapping executes immediately
  enableBorrow: boolean // borrowCollateral = 0 if !enableBorrow
): {
  borrowCollateral: BigNumber
  sizeDeltaUsd: BigNumber

  borrowUsd: BigNumber
  swapOutUsd: BigNumber
  swapOutCollateral: BigNumber
  swapInAmount: BigNumber
} {
  const gmxAsset = storage.gmx.tokens[assetTokenAddress.toLowerCase()]
  if (!gmxAsset) {
    throw new Error(`unknown gmx token ${assetTokenAddress}`)
  }
  // price
  const { minPrice, maxPrice } = getGmxCorePrice(gmxAsset, assetApiPrice)
  const tradingPrice = isLong ? maxPrice : minPrice
  const sizeUsd = tradingPrice.times(positionAmount)
  return calculateGmxAdapterOpenPositionWithSizeUsd(
    assets,
    storage,
    collateralTokenAddress,
    assetTokenAddress,
    isLong,
    assetApiPrice,
    leverage,
    sizeUsd,
    swapInTokenAddress,
    enableBorrow
  )
}

// when opening a position, get position size with given positionSize and leverage.
// (ignore the existing positions)
export function calculateGmxAdapterOpenPositionWithSizeUsd(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  collateralTokenAddress: string, // key
  assetTokenAddress: string, // key
  isLong: boolean, // key
  assetApiPrice: BigNumber, // asset price
  leverage: BigNumber,
  sizeUsd: BigNumber, // in usd
  swapInTokenAddress: string, // swapIn token. will use contract price because swapping executes immediately
  enableBorrow: boolean // borrowCollateral = 0 if !enableBorrow
): {
  borrowCollateral: BigNumber
  sizeDeltaUsd: BigNumber

  borrowUsd: BigNumber
  swapOutUsd: BigNumber
  swapOutCollateral: BigNumber
  swapInAmount: BigNumber
} {
  const { gmxCollateral, aggregatorCollateral } = _loadCollateral(
    assets,
    storage,
    collateralTokenAddress,
    assetTokenAddress,
    isLong
  )
  const gmxSwapIn = storage.gmx.tokens[swapInTokenAddress.toLowerCase()]
  if (!gmxSwapIn) {
    throw new Error(`unknown gmx token ${swapInTokenAddress}`)
  }
  if (typeof gmxCollateral.config.muxAssetId === 'undefined') {
    // mux can not borrow this
    if (enableBorrow) {
      throw new Error(`mux can not borrow ${gmxCollateral.config.symbol}`)
    }
  }
  // price
  const collateralApiPrice = isLong ? assetApiPrice : null
  const collateralPrice = getGmxCorePrice(gmxCollateral, collateralApiPrice).minPrice
  // get swapOut, borrow = position * 0.5%
  let borrowRate = _0
  if (enableBorrow) {
    borrowRate = BigNumber.maximum(_0, _1.div(GMX_MAX_LEVERAGE).minus(aggregatorCollateral.maintenanceMarginRate))
  }
  let collateralFactor = _1
    .div(leverage)
    .plus(aggregatorCollateral.boostFeeRate.times(borrowRate))
    .plus(storage.gmx.marginFeeRate)
  const swapOutCollateral = sizeUsd.div(collateralPrice).times(collateralFactor)
  const borrowCollateral = sizeUsd.div(collateralPrice).times(borrowRate)
  const swap = calculateGmxCoreSwapBySwapOut(
    storage.gmx,
    gmxSwapIn, // from
    gmxCollateral, // to
    swapOutCollateral, // toAmount
    null, // will use contract price because swapping executes immediately
    null // will use contract price because swapping executes immediately
  )
  return {
    sizeDeltaUsd: sizeUsd,
    borrowCollateral: borrowCollateral.dp(gmxCollateral.config.decimals, BigNumber.ROUND_UP),
    borrowUsd: borrowCollateral.times(collateralPrice),
    swapInAmount: swap.fromAmount,
    swapOutCollateral: swap.toAmount,
    swapOutUsd: swap.toAmount.times(collateralPrice)
  }
}

// when opening a position, get position size with given swapInAmount and leverage.
// (ignore the existing positions)
export function calculateGmxAdapterOpenPositionWithCost(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  collateralTokenAddress: string, // key
  assetTokenAddress: string, // key
  isLong: boolean, // key
  assetApiPrice: BigNumber, // asset price
  leverage: BigNumber,
  swapInTokenAddress: string, // swapIn token
  swapInAmount: BigNumber, // swapIn amount. in swapIn token
  enableBorrow: boolean // borrowCollateral = 0 if !enableBorrow
): {
  borrowCollateral: BigNumber
  sizeDeltaUsd: BigNumber

  borrowUsd: BigNumber
  swapOutUsd: BigNumber
  swapOutCollateral: BigNumber
} {
  const { gmxCollateral, aggregatorCollateral } = _loadCollateral(
    assets,
    storage,
    collateralTokenAddress,
    assetTokenAddress,
    isLong
  )
  const gmxSwapIn = storage.gmx.tokens[swapInTokenAddress.toLowerCase()]
  if (!gmxSwapIn) {
    throw new Error(`unknown gmx token ${swapInTokenAddress}`)
  }
  if (typeof gmxCollateral.config.muxAssetId === 'undefined') {
    // mux can not borrow this
    if (enableBorrow) {
      throw new Error(`mux can not borrow ${gmxCollateral.config.symbol}`)
    }
  }
  // prices
  const collateralApiPrice = isLong ? assetApiPrice : null
  const collateralPrice = getGmxCorePrice(gmxCollateral, collateralApiPrice).minPrice
  // swap
  const { toAmount: swapOutCollateral } = computeGmxCoreSwap(
    storage.gmx,
    gmxSwapIn,
    gmxCollateral,
    swapInAmount,
    null, // will use contract price because swapping executes immediately
    null // will use contract price because swapping executes immediately
  )
  // get sizeUsd, borrow = position * 0.5%
  let borrowRate = _0
  if (enableBorrow) {
    borrowRate = BigNumber.maximum(_0, _1.div(GMX_MAX_LEVERAGE).minus(aggregatorCollateral.maintenanceMarginRate))
  }
  let collateralFactor = _1
    .div(leverage)
    .plus(aggregatorCollateral.boostFeeRate.times(borrowRate))
    .plus(storage.gmx.marginFeeRate)
  const sizeDeltaUsd = swapOutCollateral.times(collateralPrice).div(collateralFactor)
  const borrowCollateral = sizeDeltaUsd.div(collateralPrice).times(borrowRate)
  return {
    sizeDeltaUsd,
    borrowCollateral: borrowCollateral.dp(gmxCollateral.config.decimals, BigNumber.ROUND_UP),
    borrowUsd: borrowCollateral.times(collateralPrice),
    swapOutCollateral: swapOutCollateral,
    swapOutUsd: swapOutCollateral.times(collateralPrice)
  }
}

// when closing a position, get collateralUsd to withdraw to keep the leverage
export function calculateGmxAdapterClosePositionCollateralUsd(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount,
  assetApiPrice: BigNumber,
  amount: BigNumber // position size. in asset token
): BigNumber {
  const { aggregatorCollateral } = _loadCollateral(
    assets,
    storage,
    pos.collateralTokenAddress,
    pos.assetTokenAddress,
    pos.isLong
  )
  if (pos.gmx.entryPrice.eq(_0)) {
    throw new InvalidArgumentError(`empty position`)
  }
  const sizeDeltaUsd = amount.times(pos.gmx.entryPrice)
  if (sizeDeltaUsd.gt(pos.gmx.sizeUsd)) {
    throw new InvalidArgumentError(
      `amount (${amount.toFixed()} = ${sizeDeltaUsd.toFixed()}) > position (${pos.gmx.sizeUsd.toFixed()})`
    )
  }
  if (sizeDeltaUsd.eq(pos.gmx.sizeUsd)) {
    // close all will automatically withdraw
    return _0
  }
  // target leverage
  const maxLeverageAfterWithdraw = BigNumber.min('100', _1.div(aggregatorCollateral.initialMarginRate))
  const oldLeverage = BigNumber.minimum(
    maxLeverageAfterWithdraw,
    computeGmxAdapterAccount(assets, storage, pos, assetApiPrice).computed.leverage
  )
  if (oldLeverage.eq(_0)) {
    throw new BugError(`BUG? oldLeverage = 0. ${JSON.stringify(pos)}`)
  }
  let collateralDeltaUsd = binarySearchLeft(
    (x: BigNumber) => {
      if (x.lte(0)) {
        return true
      }
      x = x.dp(DECIMALS) // GmxAdapter only accepts 18
      const res = computeGmxAdapterClosePosition(assets, storage, pos, assetApiPrice, sizeDeltaUsd, x)
      if (!res.isTradeSafe) {
        return false
      }
      if (res.afterTrade.computed.leverage.gt(oldLeverage)) {
        return false
      }
      return true
    },
    null, //   guess
    pos.gmx.collateralUsd // upperLimit
  )
  return collateralDeltaUsd.dp(DECIMALS)
}

// CAUTION: mutable
function _updateEntryFunding(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  pos: AggregatorSubAccount // CAUTION: mutable
) {
  if (pos.isLong && pos.cumulativeDebt.gt(_0)) {
    const { gmxCollateral, muxCollateral } = _loadCollateral(
      assets,
      storage,
      pos.collateralTokenAddress,
      pos.assetTokenAddress,
      pos.isLong
    )
    if (!muxCollateral) {
      throw new InvalidArgumentError(`can not borrow ${gmxCollateral.config.symbol}. no such token`)
    }
    pos.debtEntryFunding = muxCollateral.longCumulativeFundingRate
  }
  if (!pos.isLong) {
    // this is a design compromise, mux does not have a short funding unit in usd. so the contract uses
    // specified shortFundingAssetId instead
    const muxCollateral = assets[storage.shortFundingAssetId]
    if (!muxCollateral) {
      throw new InvalidArgumentError(`missing muxAsset[${storage.shortFundingAssetId}]`)
    }
    if (muxCollateral.isStable) {
      throw new InvalidArgumentError(`bad config. muxAsset[${storage.shortFundingAssetId}] can not be stable coin`)
    }
    pos.debtEntryFunding = muxCollateral.shortCumulativeFunding
  }
}

function _loadCollateral(
  assets: Asset[], // MUX storage
  storage: GmxAdapterStorage, // aggregator storage
  collateralTokenAddress: string,
  assetTokenAddress: string,
  isLong: boolean
): {
  gmxCollateral: GmxTokenInfo
  gmxAsset: GmxTokenInfo
  aggregatorCollateral: AggregatorCollateral
  muxCollateral?: Asset
} {
  const gmxCollateral = storage.gmx.tokens[collateralTokenAddress.toLowerCase()]
  if (!gmxCollateral) {
    throw new InvalidArgumentError(`missing gmxAsset[${collateralTokenAddress}]`)
  }
  const gmxAsset = storage.gmx.tokens[assetTokenAddress.toLowerCase()]
  if (!gmxAsset) {
    throw new InvalidArgumentError(`missing gmxAsset[${assetTokenAddress}]`)
  }
  if (gmxAsset.config.isStable) {
    throw new Error(`stable coin can not be asset(${assetTokenAddress})`)
  }
  if (isLong && assetTokenAddress.toLowerCase() !== collateralTokenAddress.toLowerCase()) {
    throw new Error(`long position should satisfy asset(${assetTokenAddress}) == collateral(${collateralTokenAddress})`)
  }
  if (!isLong && !gmxCollateral.config.isStable) {
    throw new Error(`short position should use stable coin as collateral(${collateralTokenAddress})`)
  }
  const aggregatorCollateral = storage.collaterals[collateralTokenAddress.toLowerCase()]
  if (!aggregatorCollateral) {
    throw new InvalidArgumentError(`missing aggregatorCollateral[${collateralTokenAddress}]`)
  }
  const muxCollateralId = gmxCollateral.config.muxAssetId
  let muxCollateral: Asset | undefined = undefined
  if (typeof muxCollateralId !== 'undefined') {
    // mux has this collateral
    muxCollateral = assets[muxCollateralId]
    if (!muxCollateral) {
      throw new InvalidArgumentError(`missing muxAsset[${muxCollateralId}]`)
    }
    if (collateralTokenAddress.toLowerCase() !== muxCollateral.tokenAddress.toLowerCase()) {
      throw new InvalidArgumentError(
        `pos.collateral(${collateralTokenAddress}) != pos.collateralId(${muxCollateralId})`
      )
    }
  } else {
    // mux does not have this collateral
    // just keep muxCollateral = undefined
  }
  return {
    gmxCollateral,
    gmxAsset,
    aggregatorCollateral,
    muxCollateral
  }
}

// CAUTION: mutable
function _repayAsset(
  aggregatorCollateral: AggregatorCollateral,
  pos: AggregatorSubAccount, // CAUTION: mutable
  collateralBalance: BigNumber,
  inflightBorrow: BigNumber
): {
  boostFee: BigNumber
  remain: BigNumber
  paidDebt: BigNumber
  paidFee: BigNumber
  badDebt: BigNumber
} {
  const boostFee = pos.cumulativeDebt.times(aggregatorCollateral.boostFeeRate)
  const debt = pos.cumulativeDebt.minus(inflightBorrow)
  const fee = boostFee.plus(pos.cumulativeFee)
  let remain = collateralBalance
  let paidDebt = _0
  let paidFee = _0
  if (remain.gte(debt)) {
    // good
    paidDebt = debt
    remain = remain.minus(debt)
  } else {
    // bad
    paidDebt = remain
    remain = _0
  }
  if (remain.gte(fee)) {
    // good
    paidFee = fee
    remain = remain.minus(fee)
  } else {
    // bad
    paidFee = remain
    remain = _0
  }
  let badDebt = debt.minus(paidDebt)
  pos.cumulativeDebt = inflightBorrow
  pos.cumulativeFee = _0
  return {
    boostFee,
    remain,
    paidDebt,
    paidFee,
    badDebt
  }
}

function _getInflightBorrow(pos: AggregatorSubAccount): BigNumber {
  let inflightBorrow = _0
  for (let order of pos.gmxOrders) {
    if (!order.isFillOrCancel && order.category === AggregatorOrderCategory.Open) {
      if (order.collateralToken.toLowerCase() !== pos.gmx.collateralTokenAddress.toLowerCase()) {
        throw new BugError(
          `[BUG] order collateral (${order.collateralToken}) != subAccount collateral (${pos.gmx.collateralTokenAddress})`
        )
      }
      inflightBorrow = inflightBorrow.plus(order.borrow)
    }
  }
  return inflightBorrow
}
