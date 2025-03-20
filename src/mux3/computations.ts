import {
  Mux3SubAccount,
  Mux3SubAccountDetails,
  Mux3OpenPositionResult,
  Mux3ClosePositionResult,
  Mux3WithdrawCollateralResult,
  Mux3PriceDict,
  Mux3Storage,
  Mux3Market,
  Mux3SubPosition,
  Mux3PositionComputed,
  Mux3Pool,
  cloneMux3SubAccount,
  Mux3PositionPool,
  Mux3Collateral,
  Mux3PoolMarketConfig
} from './types'
import { _0, _1, ZERO_ADDRESS } from '../constants'
import BigNumber from 'bignumber.js'
import { MUX3_ADDRESS_PAD } from './constants'
import { InsufficientLiquidityError, InsufficientLiquidityType, InvalidArgumentError } from '../types'
import { isMux3CrossMargin } from './data'

export const MUX3_MAX_INITIAL_LEVERAGE = new BigNumber('100')

export function computeMux3SubAccount(
  storage: Mux3Storage,
  subAccount: Mux3SubAccount,
  prices: Mux3PriceDict
): Mux3SubAccountDetails {
  // collateral
  let collateralUsd = _0
  for (const collateralAddress in subAccount.collaterals) {
    const collateralAmount = subAccount.collaterals[collateralAddress]
    const collateralPrice = prices[collateralAddress + MUX3_ADDRESS_PAD]
    if (!collateralPrice) {
      throw new Error(`collateral price not found: ${collateralAddress}`)
    }
    collateralUsd = collateralUsd.plus(collateralAmount.times(collateralPrice))
  }
  // positions
  let marginBalanceUsd = collateralUsd
  let totalBorrowingFeeUsd = _0
  let totalEntryImRequiredUsd = _0 // entry value / traderLeverage
  let totalImRequiredUsd = _0 // current value * IM
  let totalMmRequiredUsd = _0 // current value * MM
  const positions: { [marketId: string]: Mux3PositionComputed } = {}
  for (const marketId in subAccount.positions) {
    const market = storage.markets[marketId]
    if (!market) {
      throw new Error(`market not found: ${marketId}`)
    }
    const position = subAccount.positions[marketId]
    const pos = computeMux3PositionPart1(storage, market, position, prices)
    positions[marketId] = pos
    marginBalanceUsd = marginBalanceUsd.plus(pos.pnlAfterBorrowingUsd)
    totalBorrowingFeeUsd = totalBorrowingFeeUsd.plus(pos.borrowingFeeUsd)
    totalEntryImRequiredUsd = totalEntryImRequiredUsd.plus(pos.entryImRequiredUsd)
    totalImRequiredUsd = totalImRequiredUsd.plus(pos.imRequiredUsd)
    totalMmRequiredUsd = totalMmRequiredUsd.plus(pos.mmRequiredUsd)
  } // foreach market
  // post process after collaterals and positions
  let isIMSafe = marginBalanceUsd.gte(totalImRequiredUsd)
  if (collateralUsd.lt(totalEntryImRequiredUsd)) {
    isIMSafe = false
  }
  const isMMSafe = marginBalanceUsd.gte(totalMmRequiredUsd)
  const isMarginSafe = marginBalanceUsd.gte(_0)
  let withdrawableCollateralUsd = BigNumber.min(
    marginBalanceUsd.minus(totalImRequiredUsd), // IM
    collateralUsd.minus(totalBorrowingFeeUsd).minus(totalEntryImRequiredUsd) // leverage
  )
  withdrawableCollateralUsd = BigNumber.max(_0, withdrawableCollateralUsd)
  const ret: Mux3SubAccountDetails = {
    subAccount,
    computed: {
      collateralUsd,
      positions,
      marginBalanceUsd,
      isIMSafe,
      isMMSafe,
      isMarginSafe,
      withdrawableCollateralUsd,
      totalEntryImRequiredUsd,
      totalImRequiredUsd,
      totalMmRequiredUsd
    }
  }
  computeMux3PositionPart2(storage, ret, prices)
  return ret
}

export function computeMux3PositionPart1(
  storage: Mux3Storage,
  market: Mux3Market,
  position: Mux3SubPosition,
  prices: Mux3PriceDict
): Mux3PositionComputed {
  const assetPrice = prices[market.oracleId]
  if (!assetPrice) {
    throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
  }
  let totalSize = _0
  let totalPositionValueUsd = _0
  let totalEntryValueUsd = _0
  let totalPnlUsd = _0
  let totalMaxProfitUsd = _0
  let totalBorrowingFeeUsd = _0
  for (const poolAddress in position.pools) {
    const positionForPool = position.pools[poolAddress]
    const pool = storage.pools[poolAddress]
    if (!pool) {
      throw new Error(`pool not found: ${poolAddress}`)
    }
    const poolCollateralToken = storage.collaterals[pool.collateralToken]
    if (!poolCollateralToken) {
      throw new Error(`pool collateral token not found: ${poolAddress}/${pool.collateralToken}`)
    }
    const poolMarketConfig = pool.mux3PoolMarketsConfig[market.marketId]
    if (!poolMarketConfig) {
      throw new Error(`pool market config not found: ${poolAddress}/${market.marketId}`)
    }
    const poolMarket = pool.mux3PoolMarkets[market.marketId]
    if (!poolMarket) {
      throw new Error(`pool market not found: ${poolAddress}/${market.marketId}`)
    }
    // size
    totalSize = totalSize.plus(positionForPool.size)
    // position value
    totalPositionValueUsd = totalPositionValueUsd.plus(positionForPool.size.times(assetPrice))
    totalEntryValueUsd = totalEntryValueUsd.plus(positionForPool.size.times(positionForPool.entryPrice))
    // capped pnl
    const priceDelta = market.isLong
      ? assetPrice.minus(positionForPool.entryPrice)
      : positionForPool.entryPrice.minus(assetPrice)
    let pnlUsd = priceDelta.times(positionForPool.size)
    const poolMaxProfitUsd = computeMux3MaxProfitUsdForPool(positionForPool, poolMarketConfig, poolCollateralToken)
    totalMaxProfitUsd = totalMaxProfitUsd.plus(poolMaxProfitUsd)
    if (pnlUsd.gt(_0)) {
      pnlUsd = BigNumber.min(pnlUsd, poolMaxProfitUsd)
    }
    totalPnlUsd = totalPnlUsd.plus(pnlUsd)
    // borrowing fee
    if (poolMarket.cumulatedBorrowingPerUsd.lt(positionForPool.entryBorrowing)) {
      console.log(
        `bug: cumulatedBorrowingPerUsd < entryBorrowing: ${poolMarket.cumulatedBorrowingPerUsd} < ${positionForPool.entryBorrowing}`
      )
    }
    const borrowingFeePerUsd = BigNumber.max(
      _0,
      poolMarket.cumulatedBorrowingPerUsd.minus(positionForPool.entryBorrowing)
    )
    const borrowingFeeUsd = positionForPool.size.times(assetPrice).times(borrowingFeePerUsd)
    totalBorrowingFeeUsd = totalBorrowingFeeUsd.plus(borrowingFeeUsd)
  } // foreach position pools
  const pnlAfterBorrowingUsd = totalPnlUsd.minus(totalBorrowingFeeUsd)

  const imr = BigNumber.max(market.initialMarginRate, _1.div(position.initialLeverage))
  const mmr = market.maintenanceMarginRate
  const imRequiredUsd = totalPositionValueUsd.times(imr)
  const mmRequiredUsd = totalPositionValueUsd.times(mmr)
  const entryImRequiredUsd = totalEntryValueUsd.div(position.initialLeverage)

  return {
    // part 1
    size: totalSize,
    positionValueUsd: totalPositionValueUsd,
    entryValueUsd: totalEntryValueUsd,
    pnlUsd: totalPnlUsd,
    maxProfitUsd: totalMaxProfitUsd,
    borrowingFeeUsd: totalBorrowingFeeUsd,
    pnlAfterBorrowingUsd,
    imRequiredUsd,
    mmRequiredUsd,
    entryImRequiredUsd,
    // part 2
    leverage: _0,
    roe: _0,
    liquidationPrice: _0
  }
}

// some of values require collaterals and pnl in the subAccount,
// thus we need to compute them after all part1 are computed
export function computeMux3PositionPart2(
  storage: Mux3Storage,
  subAccount: Mux3SubAccountDetails /* mutable */,
  prices: Mux3PriceDict
) {
  const collateralUsd = subAccount.computed.collateralUsd
  for (const marketId in subAccount.computed.positions) {
    const position = subAccount.computed.positions[marketId]
    const market = storage.markets[marketId]
    const imRequiredUsd = position.entryImRequiredUsd
    if (!market) {
      throw new Error(`market not found: ${marketId}`)
    }
    if (collateralUsd.gt(_0)) {
      position.leverage = position.entryValueUsd.div(collateralUsd)
      position.roe = isMux3CrossMargin(subAccount.subAccount.subAccountId)
        ? position.pnlUsd.div(imRequiredUsd)
        : position.pnlUsd.div(collateralUsd)
    }
    position.liquidationPrice = _computeMux3LiquidationPrice(storage, market, subAccount, prices)
  }
}

// estimated liquidation price
// 1. settle all positions upnlUsd at marketPrice
// 2. let entryPrice = marketPrice
// 3. merge positions with same oracle. ex: long a ETH + short b ETH = long (a-b) ETH
// 4. now we have:
//    - collateral: ethCol, otherColUsd, upnlUsd, borrowFeeUsd
//    - position: ethSize, ethIsLong, ethEntry (which equals marketPrice), ethMMRate, otherMMUsd
// 5. estimated liquidation price
// ethLiqPrice == (borrowFeeUsd + ethEntry ethSize ethIsLong - otherColUsd + otherMMUsd - upnlUsd) / (ethCol + (ethIsLong - ethMMRate) ethSize)
//                 partA          partB                        partC         partD        partE       partF    partG
function _computeMux3LiquidationPrice(
  storage: Mux3Storage,
  currentMarket: Mux3Market,
  subAccount: Mux3SubAccountDetails,
  prices: Mux3PriceDict
): BigNumber {
  let partA = _0
  let partB = _0
  let partC = _0
  let partD = _0
  let partE = _0
  let partF = _0
  let partG = _0
  let currentOracleId = currentMarket.oracleId
  // positions
  for (const marketId in subAccount.computed.positions) {
    const position = subAccount.computed.positions[marketId]
    partA = partA.plus(position.borrowingFeeUsd)
    partE = partE.plus(position.pnlUsd)
    const market = storage.markets[marketId]
    if (!market) {
      throw new Error(`market not found: ${marketId}`)
    }
    const marketPrice = prices[market.oracleId]
    if (!marketPrice) {
      throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
    }
    const isLong = market.isLong ? new BigNumber('1') : new BigNumber('-1')
    // update parts
    if (currentMarket.oracleId === market.oracleId) {
      // eth
      partB = partB.plus(marketPrice.times(position.size).times(isLong))
      partG = partG.plus(position.size.times(isLong.minus(market.maintenanceMarginRate)))
    } else {
      // other
      partD = partD.plus(marketPrice.times(position.size).times(market.maintenanceMarginRate))
    }
  }
  // collaterals
  for (const collateralAddress in subAccount.subAccount.collaterals) {
    const collateral = subAccount.subAccount.collaterals[collateralAddress]
    if (collateralAddress + MUX3_ADDRESS_PAD === currentOracleId) {
      // eth
      partF = partF.plus(collateral)
    } else {
      // other
      const collateralPrice = prices[collateralAddress + MUX3_ADDRESS_PAD]
      if (!collateralPrice) {
        throw new Error(`collateral price not found: ${collateralAddress}`)
      }
      partC = partC.plus(collateral.times(collateralPrice))
    }
  }
  // final
  const denominator = partF.plus(partG)
  if (denominator.eq(_0)) {
    return _0
  }
  const numerator = partA
    .plus(partB)
    .minus(partC)
    .plus(partD)
    .minus(partE)
  let liqPrice = numerator.div(denominator)
  if (liqPrice.lte(_0)) {
    // impossible to be liquidated
    if (currentMarket.isLong) {
      liqPrice = _0
    } else {
      liqPrice = new BigNumber(Infinity)
    }
  }
  return liqPrice
}

export function computeMux3OpenPosition(
  storage: Mux3Storage,
  market: Mux3Market,
  subAccount: Mux3SubAccount,
  prices: Mux3PriceDict,
  amount: BigNumber,
  initialLeverage: BigNumber,
  lastConsumedToken: string
): Mux3OpenPositionResult {
  subAccount = cloneMux3SubAccount(subAccount)
  ensureMux3Position(market, subAccount)
  // args
  if (amount.lte(_0)) {
    throw new InvalidArgumentError(`invalid amount ${amount.toFixed()}`)
  }
  if (!amount.mod(market.lotSize).eq(_0)) {
    throw new InvalidArgumentError(
      `amount ${amount.toFixed()} is not a multiple of lot size ${market.lotSize.toFixed()}`
    )
  }
  if (initialLeverage.lte(_0)) {
    throw new InvalidArgumentError(`invalid initial leverage ${initialLeverage.toFixed()}`)
  }
  // setInitialLeverage
  initialLeverage = BigNumber.min(initialLeverage, MUX3_MAX_INITIAL_LEVERAGE)
  const position = subAccount.positions[market.marketId]
  position.initialLeverage = initialLeverage
  position.lastIncreasedTime = Math.floor(Date.now() / 1000)
  const marketPrice = prices[market.oracleId]
  if (!marketPrice) {
    throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
  }
  // allocation
  const allocations = computeMux3AllocateLiquidity(market, position, amount)
  // fees
  const { deliveredUsd: borrowingFeeUsd, remainUsd: remainBorrowingFeeUsd } = _updateAndDispatchBorrowingFee(
    storage,
    market,
    subAccount,
    prices,
    lastConsumedToken
  )
  const { deliveredUsd: positionFeeUsd, remainUsd: remainPositionFeeUsd } = _updatePositionFee(
    market,
    subAccount,
    amount,
    prices,
    lastConsumedToken
  )
  // _openMarketPosition
  {
    let newOI = _0
    for (const i of market.backedPools) {
      const poolAddress = i.backedPool
      const pool = storage.pools[poolAddress]
      if (!pool) {
        throw new Error(`pool not found: ${poolAddress}`)
      }
      const poolMarket = pool.mux3PoolMarkets[market.marketId]
      if (!poolMarket) {
        throw new Error(`pool market not found: ${poolAddress}/${market.marketId}`)
      }
      newOI = newOI.plus(poolMarket.totalSize)
    }
    newOI = newOI.plus(amount)
    const newOpenInterestUsd = newOI.times(marketPrice)
    if (newOpenInterestUsd.gt(market.openInterestCapUsd)) {
      throw new InsufficientLiquidityError(
        InsufficientLiquidityType.MuxLimitedMaxPosition,
        `newPos ${newOpenInterestUsd} > max ${market.openInterestCapUsd}`
      )
    }
  }
  // _openAccountPosition
  for (const poolAddress in allocations) {
    const allocation = allocations[poolAddress]
    if (allocation.eq(_0)) {
      continue
    }
    const positionPool = position.pools[poolAddress]
    const pool = storage.pools[poolAddress]
    if (!pool) {
      throw new Error(`position pool not found: ${poolAddress}`)
    }
    const poolMarket = pool.mux3PoolMarkets[market.marketId]
    if (!poolMarket) {
      throw new Error(`pool market not found: ${poolAddress}/${market.marketId}`)
    }
    const nextSize = positionPool.size.plus(allocation)
    if (positionPool.size.eq(_0)) {
      positionPool.entryPrice = marketPrice
    } else {
      positionPool.entryPrice = positionPool.entryPrice
        .times(positionPool.size)
        .plus(marketPrice.times(allocation))
        .div(nextSize)
    }
    positionPool.size = nextSize
    positionPool.entryBorrowing = poolMarket.cumulatedBorrowingPerUsd
  }
  position.lastIncreasedTime = Math.floor(Date.now() / 1000)
  // post check
  const afterTrade = computeMux3SubAccount(storage, subAccount, prices)
  const isTradeSafe = afterTrade.computed.isIMSafe && remainBorrowingFeeUsd.eq(_0) && remainPositionFeeUsd.eq(_0)
  return {
    afterTrade,
    isTradeSafe,
    borrowingFeeUsd,
    positionFeeUsd
  }
}

export function computeMux3ClosePosition(
  storage: Mux3Storage,
  market: Mux3Market,
  subAccount: Mux3SubAccount,
  prices: Mux3PriceDict,
  amount: BigNumber,
  lastConsumedToken: string,
  withdrawProfit: boolean,
  withdrawUsd: BigNumber,
  withdrawAllIfEmpty: boolean
): Mux3ClosePositionResult {
  // ensure position
  subAccount = cloneMux3SubAccount(subAccount)
  if (!subAccount.positions[market.marketId]) {
    throw new Error(`position not found: ${market.marketId}`)
  }
  const position = subAccount.positions[market.marketId]
  // args
  let oldAmount = _0
  for (const poolAddress in position.pools) {
    oldAmount = oldAmount.plus(position.pools[poolAddress].size)
  }
  if (amount.gt(oldAmount)) {
    throw new InvalidArgumentError(`amount ${amount.toFixed()} > existing position ${oldAmount.toFixed()}`)
  }
  if (!amount.mod(market.lotSize).eq(_0)) {
    throw new InvalidArgumentError(
      `amount ${amount.toFixed()} is not a multiple of lot size ${market.lotSize.toFixed()}`
    )
  }
  const marketPrice = prices[market.oracleId]
  if (!marketPrice) {
    throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
  }
  // deallocate
  const allocations = computeMux3DeallocateLiquidity(position, amount)
  const pnlUsds = _positionPnlUsd(storage, market, position, allocations, marketPrice)
  const { remainLossUsd } = _realizeProfitAndLoss(storage, subAccount, pnlUsds, prices, lastConsumedToken)
  // fees
  const { deliveredUsd: borrowingFeeUsd, remainUsd: remainBorrowingFeeUsd } = _updateAndDispatchBorrowingFee(
    storage,
    market,
    subAccount,
    prices,
    lastConsumedToken
  )
  const { deliveredUsd: positionFeeUsd, remainUsd: remainPositionFeeUsd } = _updatePositionFee(
    market,
    subAccount,
    amount,
    prices,
    lastConsumedToken
  )
  // close position
  for (const poolAddress in allocations) {
    const allocation = allocations[poolAddress]
    if (allocation.eq(_0)) {
      continue
    }
    const positionPool = position.pools[poolAddress]
    positionPool.size = positionPool.size.minus(allocation)
    if (positionPool.size.eq(_0)) {
      positionPool.entryPrice = _0
      positionPool.entryBorrowing = _0
    }
  }
  // withdraw
  let actualWithdrawUsd = _0
  // withdraw profit
  let totalPnlUsd = _0
  for (const poolAddress in pnlUsds) {
    totalPnlUsd = totalPnlUsd.plus(pnlUsds[poolAddress])
  }
  if (withdrawProfit) {
    withdrawUsd = withdrawUsd
      .plus(totalPnlUsd)
      .minus(borrowingFeeUsd)
      .minus(positionFeeUsd)
  }
  // withdraw usd
  let remainWithdrawUsd = _0
  if (withdrawUsd.gt(_0)) {
    const withdrawResult = _deduceFromCollateral(subAccount, withdrawUsd, prices, lastConsumedToken)
    actualWithdrawUsd = actualWithdrawUsd.plus(withdrawResult.deliveredUsd)
    remainWithdrawUsd = withdrawResult.remainUsd
  }
  // withdraw all if empty
  if (withdrawAllIfEmpty && computeMux3IsFullyClosed(subAccount)) {
    const withdrawResult = _computeMux3WithdrawAll(subAccount, prices)
    actualWithdrawUsd = actualWithdrawUsd.plus(withdrawResult.deliveredUsd)
  }
  // post check
  const afterTrade = computeMux3SubAccount(storage, subAccount, prices)
  const isTradeSafe =
    afterTrade.computed.isMarginSafe &&
    remainLossUsd.eq(_0) &&
    remainBorrowingFeeUsd.eq(_0) &&
    remainPositionFeeUsd.eq(_0) &&
    remainWithdrawUsd.eq(_0)
  return {
    afterTrade,
    isTradeSafe,
    borrowingFeeUsd,
    positionFeeUsd,
    pnlUsd: totalPnlUsd,
    withdrawUsd: actualWithdrawUsd
  }
}

export function computeMux3WithdrawCollateral(
  storage: Mux3Storage,
  subAccount: Mux3SubAccount,
  prices: Mux3PriceDict,
  tokenAddress: string,
  tokenAmount: BigNumber,
  lastConsumedToken: string
): Mux3WithdrawCollateralResult {
  subAccount = cloneMux3SubAccount(subAccount)
  // borrowing fee
  let totalBorrowingFeeUsd = _0
  let totalRemainBorrowingFeeUsd = _0
  for (const marketId in subAccount.positions) {
    const market = storage.markets[marketId]
    if (!market) {
      throw new Error(`market not found: ${marketId}`)
    }
    const { deliveredUsd, remainUsd } = _updateAndDispatchBorrowingFee(
      storage,
      market,
      subAccount,
      prices,
      lastConsumedToken
    )
    totalBorrowingFeeUsd = totalBorrowingFeeUsd.plus(deliveredUsd)
    totalRemainBorrowingFeeUsd = totalRemainBorrowingFeeUsd.plus(remainUsd)
  }
  // withdraw
  if (!subAccount.collaterals[tokenAddress]) {
    throw new InvalidArgumentError(`insufficient collateral: ${tokenAddress} 0`)
  } else if (subAccount.collaterals[tokenAddress].lt(tokenAmount)) {
    throw new InvalidArgumentError(
      `insufficient collateral: ${tokenAddress} ${subAccount.collaterals[
        tokenAddress
      ].toFixed()} < ${tokenAmount.toFixed()}`
    )
  }
  subAccount.collaterals[tokenAddress] = subAccount.collaterals[tokenAddress].minus(tokenAmount)
  // post check
  const afterTrade = computeMux3SubAccount(storage, subAccount, prices)
  return {
    afterTrade,
    isTradeSafe: afterTrade.computed.isIMSafe && totalRemainBorrowingFeeUsd.eq(_0),
    borrowingFeeUsd: totalBorrowingFeeUsd
  }
}

export function ensureMux3Position(market: Mux3Market, subAccount: Mux3SubAccount /* mutable */) {
  if (!subAccount.positions[market.marketId]) {
    const position: Mux3SubPosition = {
      initialLeverage: _0,
      lastIncreasedTime: 0,
      realizedBorrowingUsd: _0,
      pools: {}
    }
    for (const p of market.backedPools) {
      position.pools[p.backedPool] = {
        size: _0,
        entryPrice: _0,
        entryBorrowing: _0
      }
    }
    subAccount.positions[market.marketId] = position
  }
}

function _deduceFromCollateral(
  subAccount: Mux3SubAccount /* mutable */,
  deduceUsd: BigNumber,
  prices: Mux3PriceDict,
  lastConsumedToken: string
): { deliveredUsd: BigNumber; remainUsd: BigNumber } {
  let remainUsd = deduceUsd
  const collateralAddresses = computeMux3ActiveCollateralsWithLastWithdraw(subAccount, lastConsumedToken)
  for (const feeAddress of collateralAddresses) {
    if (subAccount.collaterals[feeAddress].lte(_0)) {
      continue
    }
    const tokenPrice = prices[feeAddress + MUX3_ADDRESS_PAD]
    if (!tokenPrice) {
      throw new Error(`token price not found: ${feeAddress}`)
    }
    const balanceUsd = subAccount.collaterals[feeAddress].times(tokenPrice)
    const pnlUsd = BigNumber.min(balanceUsd, remainUsd)
    const pnlCollateral = pnlUsd.div(tokenPrice)
    subAccount.collaterals[feeAddress] = subAccount.collaterals[feeAddress].minus(pnlCollateral)
    remainUsd = remainUsd.minus(pnlUsd)
    if (remainUsd.lte(_0)) {
      break
    }
  }
  return { deliveredUsd: deduceUsd.minus(remainUsd), remainUsd }
}

function _updateAndDispatchBorrowingFee(
  storage: Mux3Storage,
  market: Mux3Market,
  subAccount: Mux3SubAccount /* mutable */,
  prices: Mux3PriceDict,
  lastConsumedToken: string
): { deliveredUsd: BigNumber; remainUsd: BigNumber } {
  // _updateAccountBorrowingFee
  const position = subAccount.positions[market.marketId]
  const computed = computeMux3PositionPart1(storage, market, position, prices)
  const { deliveredUsd, remainUsd } = _deduceFromCollateral(
    subAccount,
    computed.borrowingFeeUsd,
    prices,
    lastConsumedToken
  )
  // update entryBorrowing
  for (const poolAddress in position.pools) {
    const positionForPool = position.pools[poolAddress]
    if (positionForPool.size.eq(_0)) {
      continue
    }
    const pool = storage.pools[poolAddress]
    if (!pool) {
      throw new Error(`pool not found: ${poolAddress}`)
    }
    const poolMarket = pool.mux3PoolMarkets[market.marketId]
    if (!poolMarket) {
      throw new Error(`pool market not found: ${poolAddress}/${market.marketId}`)
    }
    positionForPool.entryBorrowing = poolMarket.cumulatedBorrowingPerUsd
  }
  // update realizedBorrowingUsd
  position.realizedBorrowingUsd = position.realizedBorrowingUsd.plus(deliveredUsd)
  return { deliveredUsd, remainUsd }
}

function _updatePositionFee(
  market: Mux3Market,
  subAccount: Mux3SubAccount /* mutable */,
  size: BigNumber,
  prices: Mux3PriceDict,
  lastConsumedToken: string
): { deliveredUsd: BigNumber; remainUsd: BigNumber } {
  const marketPrice = prices[market.oracleId]
  if (!marketPrice) {
    throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
  }
  const positionFeeUsd = size.times(marketPrice).times(market.positionFeeRate)
  return _deduceFromCollateral(subAccount, positionFeeUsd, prices, lastConsumedToken)
}

// we do not implement this in mux.js exactly the same as the contract
// until this is necessary for the front end
export function computeMux3AllocateLiquidity(
  market: Mux3Market,
  position: Mux3SubPosition,
  size: BigNumber
): { [poolAddress: string]: BigNumber } {
  const allocations: { [poolAddress: string]: BigNumber } = {}
  for (const poolAddress in position.pools) {
    allocations[poolAddress] = _0
  }
  const backedPools = market.backedPools
  allocations[backedPools[0].backedPool] = size
  return allocations
}

export function computeMux3DeallocateLiquidity(
  position: Mux3SubPosition,
  size: BigNumber
): { [poolAddress: string]: BigNumber } {
  const allocations: { [poolAddress: string]: BigNumber } = {}
  let totalSizeInPools = _0
  for (const poolAddress in position.pools) {
    totalSizeInPools = totalSizeInPools.plus(position.pools[poolAddress].size)
  }
  if (size.gt(totalSizeInPools)) {
    throw new Error('size > position size')
  }
  for (const poolAddress in position.pools) {
    let xi = _0
    if (totalSizeInPools.gt(_0)) {
      xi = size.times(position.pools[poolAddress].size).div(totalSizeInPools)
    }
    allocations[poolAddress] = xi
  }
  return allocations
}

function _positionPnlUsd(
  storage: Mux3Storage,
  market: Mux3Market,
  position: Mux3SubPosition,
  allocation: { [poolAddress: string]: BigNumber },
  marketPrice: BigNumber
): { [poolAddress: string]: BigNumber } {
  const cappedPnlUsd: { [poolAddress: string]: BigNumber } = {}
  for (const poolAddress in position.pools) {
    const pool = storage.pools[poolAddress]
    if (!pool) {
      throw new Error(`pool not found: ${poolAddress}`)
    }
    const poolCollateralToken = storage.collaterals[pool.collateralToken]
    if (!poolCollateralToken) {
      throw new Error(`pool collateral token not found: ${poolAddress}/${pool.collateralToken}`)
    }
    const poolMarketConfig = pool.mux3PoolMarketsConfig[market.marketId]
    if (!poolMarketConfig) {
      throw new Error(`pool market config not found: ${poolAddress}/${market.marketId}`)
    }
    const positionForPool = position.pools[poolAddress]
    let pnlUsd = marketPrice.minus(positionForPool.entryPrice).times(allocation[poolAddress])
    if (!market.isLong) {
      pnlUsd = pnlUsd.negated()
    }
    const maxPnlUsd = computeMux3MaxProfitUsdForPool(positionForPool, poolMarketConfig, poolCollateralToken)
    cappedPnlUsd[poolAddress] = BigNumber.min(pnlUsd, maxPnlUsd)
  }
  return cappedPnlUsd
}

// NOTE: Calculating theoretical maximum profit differs from the contract implementation.
//       This is because we need to estimate potential maximum future profits in the future.
function computeMux3MaxProfitUsdForPool(
  positionForPool: Mux3PositionPool,
  poolMarketConfig: Mux3PoolMarketConfig,
  poolCollateral: Mux3Collateral
): BigNumber {
  const rate = BigNumber.minimum(poolMarketConfig.adlMaxPnlRate, poolMarketConfig.adlTriggerRate)
  if (poolCollateral.isStable) {
    // the pool is using USD to support long/short. reservedUsd = entryPrice * size * rate which is unchanged
    return positionForPool.size.times(positionForPool.entryPrice).times(rate)
  } else {
    // the pool is using ETH (as an example) to support long ETH. reservedUsd = ethFuturePrice * size * rate,
    // thus maxProfit = min{
    //   (ethFuturePrice - entryPrice) * size,  // actual profit
    //   (ethFuturePrice * size * rate),        // max profit
    // }
    // we can prove that maxProfit <= entryPrice * size * rate / (1 - rate)
    if (rate.gte(_1)) {
      return new BigNumber('Infinity')
    }
    return positionForPool.size
      .times(positionForPool.entryPrice)
      .times(rate)
      .div(_1.minus(rate))
  }
}

function _realizeProfitAndLoss(
  storage: Mux3Storage,
  subAccount: Mux3SubAccount /* mutable */,
  pnlUsds: { [poolAddress: string]: BigNumber },
  prices: Mux3PriceDict,
  lastConsumedToken: string
): { remainLossUsd: BigNumber } {
  let remainLossUsd = _0
  for (const poolAddress in pnlUsds) {
    const pnlUsd = pnlUsds[poolAddress]
    if (pnlUsd.eq(_0)) {
      continue
    }
    const pool = storage.pools[poolAddress]
    if (!pool) {
      throw new Error(`pool not found: ${poolAddress}`)
    }
    if (pnlUsd.gt(_0)) {
      // take profit
      const collateralToken = pool.collateralToken
      const collateralPrice = prices[collateralToken + MUX3_ADDRESS_PAD]
      if (!collateralPrice) {
        throw new Error(`collateral price not found: ${collateralToken}`)
      }
      if (!subAccount.collaterals[collateralToken]) {
        subAccount.collaterals[collateralToken] = _0
      }
      subAccount.collaterals[collateralToken] = subAccount.collaterals[collateralToken].plus(
        pnlUsd.div(collateralPrice)
      )
    } else {
      // realize loss
      const { remainUsd } = _deduceFromCollateral(subAccount, pnlUsd.negated(), prices, lastConsumedToken)
      remainLossUsd = remainLossUsd.plus(remainUsd)
    }
  }
  return { remainLossUsd }
}

// used for borrowing rate apy
export function computeMux3PoolCollateralUsd(pool: Mux3Pool, prices: Mux3PriceDict): BigNumber {
  const collateralToken = pool.collateralToken
  const collateralPrice = prices[collateralToken + MUX3_ADDRESS_PAD]
  if (!collateralPrice) {
    throw new Error(`collateral price not found: ${collateralToken}`)
  }
  return pool.liquidityBalances[collateralToken].times(collateralPrice)
}

function _computeMux3PoolAumUsdWithoutPnl(pool: Mux3Pool, prices: Mux3PriceDict): BigNumber {
  let aumUsdWithoutPnl = _0
  for (const tokenAddress in pool.liquidityBalances) {
    const balance = pool.liquidityBalances[tokenAddress]
    if (balance.lte(_0)) {
      continue
    }
    const tokenPrice = prices[tokenAddress + MUX3_ADDRESS_PAD]
    if (!tokenPrice) {
      throw new Error(`token price not found: ${tokenAddress}`)
    }
    aumUsdWithoutPnl = aumUsdWithoutPnl.plus(balance.times(tokenPrice))
  }
  return aumUsdWithoutPnl
}

// used for nav
export function computeMux3PoolAumUsdWithPnl(storage: Mux3Storage, pool: Mux3Pool, prices: Mux3PriceDict): BigNumber {
  let aumUsd = _computeMux3PoolAumUsdWithoutPnl(pool, prices)
  for (const marketId in pool.mux3PoolMarkets) {
    const marketConfig = storage.markets[marketId]
    if (!marketConfig) {
      throw new Error(`market config not found: ${marketId}`)
    }
    const marketState = pool.mux3PoolMarkets[marketId]
    if (marketState.totalSize.lte(_0)) {
      continue
    }
    const marketPrice = prices[marketConfig.oracleId]
    if (!marketPrice) {
      throw new Error(`market price not found: ${marketId}/${marketConfig.oracleId}`)
    }
    let upnl = marketPrice.minus(marketState.averageEntryPrice).times(marketState.totalSize)
    if (marketState.isLong) {
      aumUsd = aumUsd.minus(upnl)
    } else {
      aumUsd = aumUsd.plus(upnl)
    }
  }
  return aumUsd
}

// collateralPool._reservedUsd
export function computeMux3PoolReservedUsd(storage: Mux3Storage, pool: Mux3Pool, prices: Mux3PriceDict): BigNumber {
  let reservedUsd = _0
  const poolCollateral = storage.collaterals[pool.collateralToken]
  if (!poolCollateral) {
    throw new Error(`pool collateral not found: ${pool.collateralToken}`)
  }
  for (const marketId in pool.mux3PoolMarketsConfig) {
    const poolMarketConfig = pool.mux3PoolMarketsConfig[marketId]
    const poolMarket = pool.mux3PoolMarkets[marketId]
    if (!poolMarket) {
      throw new Error(`pool market not found: ${pool.poolAddress}/${marketId}`)
    }
    const market = storage.markets[marketId]
    if (!market) {
      throw new Error(`market not found: ${marketId}`)
    }
    // * When collateralPool uses stablecoin (e.g., long/short ETH with USDC as collateral),
    //   reserved = entryPrice * size * reserveRatio
    // * When collateralPool uses non-stablecoin (e.g., long ETH with ETH as collateral),
    //   reserved = marketPrice * size * reserveRatio,
    //   note that both numerator and denominator of util contain marketPrice.
    let sizeUsd = _0
    if (poolCollateral.isStable) {
      sizeUsd = poolMarket.totalSize.times(poolMarket.averageEntryPrice)
    } else {
      const marketPrice = prices[market.oracleId]
      if (!marketPrice) {
        throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
      }
      sizeUsd = poolMarket.totalSize.times(marketPrice)
    }
    reservedUsd = reservedUsd.plus(sizeUsd.times(poolMarketConfig.adlReserveRate))
  }
  return reservedUsd
}

export function computeMux3MarketBorrowRateApy(
  storage: Mux3Storage,
  market: Mux3Market,
  prices: Mux3PriceDict
): BigNumber {
  let totalSizeUsd = _0
  let totalBorrowingFeeOneYearUsd = _0
  const marketPrice = prices[market.oracleId]
  if (!marketPrice) {
    throw new Error(`market price not found: ${market.marketId}/${market.oracleId}`)
  }
  for (const i of market.backedPools) {
    const poolAddress = i.backedPool
    const pool = storage.pools[poolAddress]
    if (!pool) {
      throw new Error(`pool not found: ${poolAddress}`)
    }
    const poolMarketConfig = pool.mux3PoolMarketsConfig[market.marketId]
    if (!poolMarketConfig) {
      throw new Error(`pool market config not found: ${poolAddress}/${market.marketId}`)
    }
    const poolMarket = pool.mux3PoolMarkets[market.marketId]
    if (!poolMarket) {
      throw new Error(`pool market not found: ${poolAddress}/${market.marketId}`)
    }
    const poolSizeUsd = computeMux3PoolCollateralUsd(pool, prices)
    const reservedUsd = computeMux3PoolReservedUsd(storage, pool, prices)
    const sizeUsd = poolMarket.totalSize.times(marketPrice)
    const poolApy = computeMux3PoolBorrowRateApy(
      storage.borrowingBaseApy,
      pool.borrowConfig.k,
      pool.borrowConfig.b,
      poolSizeUsd,
      reservedUsd
    )
    totalSizeUsd = totalSizeUsd.plus(sizeUsd)
    totalBorrowingFeeOneYearUsd = totalBorrowingFeeOneYearUsd.plus(sizeUsd.times(poolApy))
  }
  const apy = totalBorrowingFeeOneYearUsd.div(totalSizeUsd)
  return apy
}

// fr = baseApy + exp(k * util + b)
export function computeMux3PoolBorrowRateApy(
  baseApy: BigNumber,
  k: BigNumber,
  b: BigNumber,
  poolSizeUsd: BigNumber,
  reservedUsd: BigNumber
): BigNumber {
  let util = _0
  if (poolSizeUsd.gt(0)) {
    util = reservedUsd.div(poolSizeUsd)
  }
  let fr = k.times(util).plus(b)
  fr = new BigNumber(Math.exp(fr.toNumber()))
  fr = baseApy.plus(fr)
  return fr
}

// get active collaterals of a trader, while
// try to avoid consuming a token if possible.
export function computeMux3ActiveCollateralsWithLastWithdraw(
  subAccount: Mux3SubAccount,
  lastConsumedToken: string
): string[] {
  const collaterals = Object.keys(subAccount.collaterals)
  if (!lastConsumedToken || lastConsumedToken === ZERO_ADDRESS) {
    return collaterals
  }
  if (collaterals.length <= 1) {
    return collaterals
  }
  // swap lastConsumedToken to the end
  for (let i = 0; i < collaterals.length - 1; i++) {
    if (collaterals[i] === lastConsumedToken) {
      collaterals[i] = collaterals[collaterals.length - 1]
      collaterals[collaterals.length - 1] = lastConsumedToken
      break
    }
  }
  return collaterals
}

// _isPositionAccountFullyClosed
export function computeMux3IsFullyClosed(subAccount: Mux3SubAccount) {
  for (const marketId in subAccount.positions) {
    const position = subAccount.positions[marketId]
    for (const poolAddress in position.pools) {
      const pool = position.pools[poolAddress]
      if (pool.size.gt(0)) {
        return false
      }
    }
  }
  return true
}

// withdrawAll
function _computeMux3WithdrawAll(subAccount: Mux3SubAccount, prices: Mux3PriceDict): { deliveredUsd: BigNumber } {
  let deliveredUsd = _0
  for (const collateralAddress in subAccount.collaterals) {
    if (subAccount.collaterals[collateralAddress].lte(_0)) {
      continue
    }
    const tokenPrice = prices[collateralAddress + MUX3_ADDRESS_PAD]
    if (!tokenPrice) {
      throw new Error(`token price not found: ${collateralAddress}`)
    }
    const balanceUsd = subAccount.collaterals[collateralAddress].times(tokenPrice)
    deliveredUsd = deliveredUsd.plus(balanceUsd)
  }
  subAccount.collaterals = {}
  return { deliveredUsd }
}

// since no one update pool cumulatedBorrowingPerUsd in the contract,
// we simulate CollateralPool._updateAllMarketBorrowing() here.
// you can call this function immediately after fetching Mux3Storage.
export function computeMux3UpdatePoolBorrowing(storage: Mux3Storage, prices: Mux3PriceDict): Mux3Storage {
  const ret: Mux3Storage = {
    ...storage,
    pools: {}
  }
  for (const poolAddress in storage.pools) {
    const pool = storage.pools[poolAddress]
    ret.pools[poolAddress] = {
      ...pool,
      mux3PoolMarkets: {}
    }
    for (const marketId in pool.mux3PoolMarkets) {
      const marketState = {
        ...pool.mux3PoolMarkets[marketId]
      }
      ret.pools[poolAddress].mux3PoolMarkets[marketId] = marketState
      // _updateMarketBorrowing
      const interval = storage.borrowingInterval
      const blockTime = Math.floor(Date.now() / 1000)
      const nextFundingTime = Math.floor(blockTime / interval) * interval
      if (marketState.lastBorrowingUpdateTime === 0) {
        // init state. just update lastFundingTime
        marketState.lastBorrowingUpdateTime = nextFundingTime
      } else if (marketState.lastBorrowingUpdateTime + interval >= blockTime) {
        // do nothing
      } else {
        const timeSpan = nextFundingTime - marketState.lastBorrowingUpdateTime
        const market = storage.markets[marketId]
        if (!market) {
          throw new Error(`market not found: ${marketId}`)
        }
        const poolSizeUsd = computeMux3PoolCollateralUsd(pool, prices)
        const reservedUsd = computeMux3PoolReservedUsd(storage, pool, prices)
        const poolApy = computeMux3PoolBorrowRateApy(
          storage.borrowingBaseApy,
          pool.borrowConfig.k,
          pool.borrowConfig.b,
          poolSizeUsd,
          reservedUsd
        )
        marketState.cumulatedBorrowingPerUsd = marketState.cumulatedBorrowingPerUsd.plus(
          poolApy.times(timeSpan).div(365 * 86400)
        )
        marketState.lastBorrowingUpdateTime = nextFundingTime
      }
    }
  }
  return ret
}
