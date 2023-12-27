import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from 'ethers'
import { InsufficientLiquidityError } from '../types'
import { IReader as AggregatorGmxV2Reader, Reader as AggregatorReader } from '../abi/aggregator/Reader'

export enum AggregatorProjectId {
  Invalid,
  Gmx,
  GmxV2
}

export enum AggregatorOrderCategory {
  None,
  Open,
  Close,
  Liquidate
}
export interface GmxAdapterStorage {
  borrowSource: BorrowSources
  collaterals: { [lowerCaseTokenAddress: string]: AggregatorCollateral }
  gmx: GmxCoreStorage
  shortFundingAssetId: number // the aggregator uses cumulativeShortFunding of this mux collateral
}

// note: it is better to split AggregatorCollateral into AggregatorMarketConfig and AggregatorTokenConfig. but
//       for back-compatibility, we keep it as-is.
export interface AggregatorCollateral {
  boostFeeRate: BigNumber
  initialMarginRate: BigNumber
  maintenanceMarginRate: BigNumber
  liquidationFeeRate: BigNumber
  totalBorrow: BigNumber // will offline after LendingPool is online
  borrowLimit: BigNumber // will offline after LendingPool is online
}

export interface AggregatorSubAccount {
  // key
  proxyAddress: string
  projectId: AggregatorProjectId
  account: string
  collateralTokenAddress: string
  assetTokenAddress: string
  isLong: boolean

  // store
  isLiquidating: boolean
  cumulativeDebt: BigNumber
  cumulativeFee: BigNumber
  debtEntryFunding: BigNumber
  proxyCollateralBalance: BigNumber
  proxyEthBalance: BigNumber

  // if gmx
  gmx: GmxCoreAccount
  gmxOrders: GmxAdapterOrder[]
}

export interface RawAggregatorGmxV2SubAccount {
  // key
  proxyAddress: string
  projectId: AggregatorProjectId
  account: string
  collateralTokenAddress: string
  assetTokenAddress: string
  isLong: boolean

  // store
  isLiquidating: boolean
  cumulativeDebt: EthersBigNumber
  cumulativeFee: EthersBigNumber
  debtEntryFunding: EthersBigNumber
  proxyCollateralBalance: EthersBigNumber
  proxyEthBalance: EthersBigNumber

  // if gmx v2
  gmx2?: AggregatorGmxV2Reader.PositionInfoStructOutput // do not use this directly, use gmx2.PositionInfo instead
  gmx2Orders?: AggregatorReader.GmxV2AdapterOrderStructOutput[] // do not use this directly, use gmx2.Order[] instead

  // funding
  claimableFundingAmountLong: EthersBigNumber
  claimableFundingAmountShort: EthersBigNumber
}

export interface GmxAdapterAccountDetails {
  account: AggregatorSubAccount
  computed: {
    size: BigNumber
    collateral: BigNumber
    collateralPrice: BigNumber
    minPrice: BigNumber
    maxPrice: BigNumber
    markPrice: BigNumber
    inflightBorrow: BigNumber
    traderInitialCostUsd: BigNumber // collateralUsd - borrow(without inflightBorrow) * entryPrice
    marginBalanceUsd: BigNumber
    isIMSafe: boolean
    isMMSafe: boolean
    leverage: BigNumber
    fundingFeeUsd: BigNumber
    aggregatorFundingFeeUsd: BigNumber
    gmxFundingFeeUsd: BigNumber
    pnlUsd: BigNumber
    pendingPnlUsd: BigNumber
    pendingPnlAfterFundingUsd: BigNumber
    pendingRoe: BigNumber
    liquidationPrice: BigNumber
  }
}

export interface GmxAdapterOrder {
  orderHistoryKey: string
  category: AggregatorOrderCategory
  receiver: GmxAdapterOrderReceiver
  gmxOrderIndex: number
  borrow: BigNumber
  placeOrderTime: number
  account: string
  collateralToken: string
  indexToken: string
  isLong: boolean
  isFillOrCancel: boolean
  amountIn: BigNumber // increase only
  collateralDeltaUsd: BigNumber // decrease only
  sizeDeltaUsd: BigNumber
  triggerPrice: BigNumber // 0 if market order
  triggerAboveThreshold: boolean
  tpOrderHistoryKey: string
  slOrderHistoryKey: string
}

export interface GmxAdapterOpenPositionResult {
  sizeDeltaUsd: BigNumber
  afterTrade: GmxAdapterAccountDetails
  isTradeSafe: boolean
  liquidityWarning?: InsufficientLiquidityError

  aggregatorFundingFeeUsd: BigNumber
  gmxPosFeeUsd: BigNumber
  boostFeeUsd: BigNumber
  feeUsd: BigNumber

  swapFeeRate: BigNumber
  swapFeeUsd: BigNumber
  swapOutCollateral: BigNumber
  gmxAmountIn: BigNumber
}

export interface GmxAdapterClosePositionResult {
  sizeDeltaUsd: BigNumber
  collateralDeltaUsd: BigNumber

  realizedPnlUsd: BigNumber
  gmxUsdOutAfterFee: BigNumber
  gmxCollateralOutAfterFee: BigNumber
  boostFeeUsd: BigNumber
  aggregatorFundingFeeUsd: BigNumber
  feeUsd: BigNumber

  repayCollateral: BigNumber
  collateralOut: BigNumber
  afterTrade: GmxAdapterAccountDetails
  isTradeSafe: boolean
}

export interface GmxAdapterWithdrawCollateralResult {
  collateralDeltaUsd: BigNumber

  gmxUsdOutAfterFee: BigNumber
  gmxCollateralOutAfterFee: BigNumber
  aggregatorFundingFeeUsd: BigNumber
  feeUsd: BigNumber

  collateralOut: BigNumber
  afterTrade: GmxAdapterAccountDetails
  isTradeSafe: boolean
}

//////////////////////////////////////////////////////////////
// GMX Core

export enum GmxAdapterOrderReceiver {
  MarketIncreasing,
  MarketDecreasing,
  LimitIncreasing,
  LimitDecreasing
}

export interface GmxTokenConfig {
  symbol: string
  decimals: number
  address: string
  isAsset: boolean
  isShortable: boolean
  isStable: boolean
  isNative: boolean
  muxAssetId?: number
}

export interface GmxCoreStorage {
  // config
  tokens: { [lowerCaseTokenAddress: string]: GmxTokenInfo }
  totalTokenWeights: number
  minProfitTime: number
  minExecutionFee: BigNumber // in wei. { value: executionFee + 1 }, max { PositionRouter.minExecutionFee, OrderBook.minExecutionFee }
  liquidationFeeUsd: BigNumber
  marginFeeRate: BigNumber
  swapFeeRate: BigNumber
  stableSwapFeeRate: BigNumber
  taxRate: BigNumber
  stableTaxRate: BigNumber

  // state
  usdgSupply: BigNumber
}

export interface GmxTokenInfo {
  // config
  config: GmxTokenConfig

  // storage
  poolAmount: BigNumber
  reservedAmount: BigNumber
  usdgAmount: BigNumber
  weight: number
  globalShortSizeUsd: BigNumber
  maxGlobalShortSizeUsd: BigNumber
  maxGlobalLongSizeUsd: BigNumber
  contractMinPrice: BigNumber
  contractMaxPrice: BigNumber
  guaranteedUsd: BigNumber
  minProfit: BigNumber
  maxUsdgAmounts: BigNumber
  redemptionAmount: BigNumber
  bufferAmounts: BigNumber
  fundingRate: BigNumber
  cumulativeFundingRate: BigNumber

  // computed
  availableAmount: BigNumber
  availableUsd: BigNumber
  maxAvailableShortUsd: BigNumber
  maxAvailableLongUsd: BigNumber
  maxLongCapacityUsd: BigNumber
}

export interface GmxCoreAccount {
  collateralTokenAddress: string
  assetTokenAddress: string
  isLong: boolean
  sizeUsd: BigNumber
  collateralUsd: BigNumber // initial collateral
  lastIncreasedTime: number
  entryPrice: BigNumber
  entryFundingRate: BigNumber
}

export interface GmxCoreAccountDetails {
  gmxAccount: GmxCoreAccount
  computed: {
    size: BigNumber
    collateral: BigNumber
    minPrice: BigNumber
    maxPrice: BigNumber
    markPrice: BigNumber
    marginBalanceUsd: BigNumber
    isIMSafe: boolean
    isMMSafe: boolean
    leverage: BigNumber
    fundingFeeUsd: BigNumber
    pendingPnlUsd: BigNumber
    pendingPnlAfterFundingUsd: BigNumber
    pendingRoe: BigNumber
    pnlUsd: BigNumber
    liquidationPrice: BigNumber
    withdrawableCollateralUsd: BigNumber
  }
}

export enum BorrowSources {
  LIQUIDITY_POOL = 1,
  LENDING_POOL = 2,
}

export interface LendingPool {
  collaterals: { [lowerCaseTokenAddress: string]: LendingCollateral }
}


export interface LendingCollateral {
  flags: number
  supplyAmount: BigNumber
}

export const LENDING_STATE_IS_ENABLED = 0x1
export const LENDING_STATE_IS_BORROWABLE = 0x2
export const LENDING_STATE_IS_REPAYABLE = 0x4
export const LENDING_STATE_IS_DEPOSITABLE = 0x8
export const LENDING_STATE_IS_WITHDRAWABLE = 0x10
