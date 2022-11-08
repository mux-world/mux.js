import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { Provider } from '@ethersproject/providers'

export type SignerOrProvider = ethers.Signer | Provider

/**
 * Invalid argument or the query condition is impossible.
 */
export class InvalidArgumentError extends Error {
  public constructor(message: string) {
    super()
    this.name = message
  }
}

/**
 * Indicates that LiquidityPool has insufficient reserves for a desired amount.
 */
export class InsufficientLiquidityError extends Error {
  public readonly isInsufficientLiquidityError: true = true

  public constructor(message: string) {
    super()
    this.name = message
  }
}

/**
 * Indicates that calling convention error or bugs happened.
 */
export class BugError extends Error {
  public constructor(message: string) {
    super()
    this.name = message
  }
}

export interface PriceDict {
  [symbol: string]: BigNumber
}

export interface ChainStorage {
  pool: LiquidityPool
  assets: Asset[]
  dexes: Dex[]
  liquidityLockPeriod: number
  lpDeduct: BigNumber
  stableDeduct: BigNumber
}

export interface LiquidityPool {
  shortFundingBaseRate8H: BigNumber
  shortFundingLimitRate8H: BigNumber
  lastFundingTime: number
  fundingInterval: number
  liquidityBaseFeeRate: BigNumber
  liquidityDynamicFeeRate: BigNumber
  // a sequence number that changes when LiquidityPoolStorage updated. this helps to keep track the state of LiquidityPool.
  sequence: number // note: will be 0 after 0xffffffff
  strictStableDeviation: BigNumber
  mlpPriceLowerBound: BigNumber // safeguard against mlp price attacks
  mlpPriceUpperBound: BigNumber // safeguard against mlp price attacks
}

export interface AssetConfig {
  symbol: string
  id: number
  decimals: number
  isStable: boolean // is a usdt, usdc, ...
  canAddRemoveLiquidity: boolean // can call addLiquidity and removeLiquidity with this token
  isTradable: boolean // allowed to be assetId
  isOpenable: boolean // can open position
  isShortable: boolean // allow shorting this asset
  useStableTokenForProfit: boolean // take profit will get stable coin
  isEnabled: boolean // allowed to be assetId and collateralId
  isStrictStable: boolean // assetPrice is always 1 unless volatility exceeds strictStableDeviation
  referenceOracleType: number
  referenceOracle: string
  referenceDeviation: BigNumber
  halfSpread: BigNumber
  tokenAddress: string // erc20.address
  muxTokenAddress: string // muxToken.address. all stable coins share the same muxTokenAddress
  initialMarginRate: BigNumber
  maintenanceMarginRate: BigNumber
  positionFeeRate: BigNumber
  minProfitRate: BigNumber
  minProfitTime: number
  maxLongPositionSize: BigNumber
  maxShortPositionSize: BigNumber
  spotWeight: number
  longFundingBaseRate8H: BigNumber
  longFundingLimitRate8H: BigNumber
}

export interface AssetState {
  longCumulativeFundingRate: BigNumber // Σ_t fundingRate_t
  shortCumulativeFunding: BigNumber // Σ_t fundingRate_t * indexPrice_t
  spotLiquidity: BigNumber
  totalLongPosition: BigNumber
  totalShortPosition: BigNumber
  averageLongPrice: BigNumber
  averageShortPrice: BigNumber
  collectedFee: BigNumber
  deduct: BigNumber
}

export type Asset = AssetConfig & AssetState

export interface DexConfig {
  dexId: number
  dexType: number
  assetIds: number[]
  assetWeightInDEX: number[]
  dexWeight: number
  totalSpotInDEX: BigNumber[]
}

export interface DexState {
  dexId: number
  dexLPBalance: BigNumber
  liquidityBalance: BigNumber[]
}

export type Dex = DexConfig & DexState

export interface SubAccount {
  collateral: BigNumber
  size: BigNumber
  lastIncreasedTime: number
  entryPrice: BigNumber
  entryFunding: BigNumber // entry longCumulativeFundingRate for long position. entry shortCumulativeFunding for short position
}

export function cloneSubAccount(a: SubAccount): SubAccount {
  return {
    ...a
  }
}

export interface DecodedSubAccountId {
  account: string
  collateralId: number
  assetId: number
  isLong: boolean
}

export interface SubAccountComputed {
  positionValueUsd: BigNumber
  positionMarginUsd: BigNumber
  maintenanceMarginUsd: BigNumber
  marginBalanceUsd: BigNumber
  isIMSafe: boolean
  isMMSafe: boolean
  isMarginSafe: boolean
  leverage: BigNumber
  effectiveLeverage: BigNumber
  fundingFeeUsd: BigNumber
  pendingPnlUsd: BigNumber
  pendingPnlAfterFundingUsd: BigNumber
  pendingRoe: BigNumber
  pnlUsd: BigNumber
  liquidationPrice: BigNumber
  withdrawableCollateral: BigNumber
  withdrawableProfit: BigNumber
}

export interface SubAccountDetails {
  subAccount: SubAccount
  computed: SubAccountComputed
}

export interface OpenPositionResult {
  afterTrade: SubAccountDetails
  isTradeSafe: boolean
  feeUsd: BigNumber
}

export interface ClosePositionResult {
  afterTrade: SubAccountDetails
  isTradeSafe: boolean
  feeUsd: BigNumber
  realizedPnlUsd: BigNumber
  profitAssetTransferred: BigNumber
  muxTokenTransferred: BigNumber
}

export interface WithdrawCollateralResult {
  afterTrade: SubAccountDetails
  isTradeSafe: boolean
  feeUsd: BigNumber
}

export interface WithdrawProfitResult {
  afterTrade: SubAccountDetails
  isTradeSafe: boolean
  feeUsd: BigNumber
  profitAssetTransferred: BigNumber
  muxTokenTransferred: BigNumber
}

export interface FlashTakeEIP712 {
  subAccountId: string
  collateral: string // collateral.decimals
  size: string // 1e18
  gasFee: string // 1e18
  referralCode: string
  orderType: number // OrderType.FlashTakeOrder
  flags: number // PositionOrderFlags.*
  profitTokenId: number
  placeOrderTime: number
  salt: number
}
