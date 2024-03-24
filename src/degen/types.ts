import BigNumber from 'bignumber.js'
import { OrderType } from './constants'

export interface DegenMarkPriceDict {
  [symbol: string]: BigNumber
}

export interface DegenPoolStorage {
  pool: DegenPool
  orderBook: DegenOrderBook
  assets: DegenAsset[]
  liquidityLockPeriod: number
}

export interface DegenPool {
  // config
  fundingInterval: number
  liquidityFeeRate: BigNumber
  liquidityCapUsd: BigNumber
  borrowingRateApy: BigNumber
  // state
  sequence: number // note: will be 0 after 0xffffffff
  //                  a sequence number that changes when LiquidityPoolStorage updated. this helps to keep track the state of LiquidityPool.
  lastFundingTime: number
}

export interface DegenOrderBook {
  liquidityLockPeriod: number
}

export interface DegenAsset {
  id: number
  symbol: string
  tokenAddress: string // erc20.address
  decimals: number
  lotSize: BigNumber
  initialMarginRate: BigNumber
  maintenanceMarginRate: BigNumber
  positionFeeRate: BigNumber
  liquidationFeeRate: BigNumber
  minProfitRate: BigNumber
  minProfitTime: number
  maxLongPositionSize: BigNumber
  maxShortPositionSize: BigNumber
  fundingAlpha: BigNumber
  fundingBetaApy: BigNumber
  referenceOracleType: number
  referenceOracle: string
  referenceDeviation: BigNumber
  adlReserveRate: BigNumber
  adlMaxPnlRate: BigNumber
  adlTriggerRate: BigNumber
  flags: number
  isStable: boolean // is a usdt, usdc, ...
  canAddRemoveLiquidity: boolean // can call addLiquidity and removeLiquidity with this token
  isTradable: boolean // allowed to be assetId
  isOpenable: boolean // can open position
  isShortable: boolean // allow shorting this asset
  isEnabled: boolean // allowed to be assetId and collateralId
  isStrictStable: boolean // assetPrice is always 1 unless volatility exceeds strictStableDeviation
  spotLiquidity: BigNumber
  totalLongPosition: BigNumber
  totalShortPosition: BigNumber
  averageLongPrice: BigNumber
  averageShortPrice: BigNumber
  longCumulativeFunding: BigNumber // Σ_t fundingRate_t + borrowingRate_t. payment = (cumulative - entry) * positionSize * entryPrice
  shortCumulativeFunding: BigNumber // Σ_t fundingRate_t + borrowingRate_t. payment = (cumulative - entry) * positionSize * entryPrice
}

export interface DegenSubAccount {
  collateral: BigNumber
  size: BigNumber
  lastIncreasedTime: number
  entryPrice: BigNumber
  entryFunding: BigNumber // entry longCumulativeFunding for long position. entry shortCumulativeFunding for short position
}

export interface DegenOrder {
  account: string
  id: number
  orderType: OrderType
  version: number
  placeOrderTime: number
  payload: string // decode me according to orderType

  positionOrder?: {
    subAccountId: string
    collateral: BigNumber
    size: BigNumber
    price: BigNumber
    tpPrice: BigNumber
    slPrice: BigNumber
    expiration: number
    tpslExpiration: number
    profitTokenId: number
    tpslProfitTokenId: number
    flags: number
  }
  liquidityOrder?: {
    rawAmount: BigNumber // decimals = 0 because I do not know the decimals
    assetId: number
    isAdding: boolean
  }
  withdrawOrder?: {
    subAccountId: string
    rawAmount: BigNumber // decimals = 0 because I do not know the decimals
    profitTokenId: number
    isProfit: boolean
  }
}

export function cloneDegenSubAccount(a: DegenSubAccount): DegenSubAccount {
  return {
    ...a
  }
}

export interface DecodedDegenSubAccountId {
  account: string
  collateralId: number
  assetId: number
  isLong: boolean
}

export interface DegenSubAccountComputed {
  positionValueUsd: BigNumber
  marginBalanceUsd: BigNumber
  isIMSafe: boolean
  isMMSafe: boolean
  isMarginSafe: boolean
  leverage: BigNumber
  effectiveLeverage: BigNumber
  fundingFeeUsd: BigNumber
  pendingPnlUsd: BigNumber // (exit - entry) * size
  uncappedPnlUsd: BigNumber // considering minProfitRate
  pnlUsd: BigNumber // considering adlMaxProfitRate
  pendingPnlAfterFundingUsd: BigNumber
  pendingRoe: BigNumber
  liquidationPrice: BigNumber
  withdrawableCollateral: BigNumber
  maxProfitUsd: BigNumber
}

export interface DegenSubAccountDetails {
  subAccount: DegenSubAccount
  computed: DegenSubAccountComputed
}

export interface DegenOpenPositionResult {
  afterTrade: DegenSubAccountDetails
  isTradeSafe: boolean
  fundingFeeUsd: BigNumber
  feeUsd: BigNumber // fundingFee + positionFee
}

export interface DegenClosePositionResult {
  afterTrade: DegenSubAccountDetails
  isTradeSafe: boolean
  fundingFeeUsd: BigNumber
  feeUsd: BigNumber
  profitAssetTransferred: BigNumber
}

export interface DegenWithdrawCollateralResult {
  afterTrade: DegenSubAccountDetails
  isTradeSafe: boolean
  feeUsd: BigNumber
}
