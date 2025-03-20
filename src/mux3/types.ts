import BigNumber from 'bignumber.js'
import { Mux3OrderType, Mux3PositionOrderFlags } from './constants'

export interface Mux3PriceDict {
  // a oracleId is either
  // * market.oracleId
  // * pool.collateralToken + MUX3_ADDRESS_PAD
  [oracleId: string]: BigNumber
}

export interface Mux3Storage {
  collaterals: { [tokenAddress: string]: Mux3Collateral } // constant.MUX3_COLLATERAL_ADDRESSES
  markets: { [marketId: string]: Mux3Market } // constant.MUX3_MARKET_IDS
  pools: { [poolAddress: string]: Mux3Pool } // constant.MUX3_POOL_ADDRESSES
  orderBook: Mux3OrderBook
  strictStableDeviation: BigNumber // constant.MC_STRICT_STABLE_DEVIATION
  borrowingBaseApy: BigNumber // constant.MC_BORROWING_BASE_APY_KEY
  borrowingInterval: number // constant.MC_BORROWING_INTERVAL
}

// read from OrderBookGetter
export interface Mux3OrderBook {
  sequence: number // sequence(). will be 0 after 0xffffffff
  gasFee: BigNumber // MCO_ORDER_GAS_FEE_GWEI_KEY, value * 1e9 / 1e18
  minLiquidityOrderUsd: BigNumber // MCO_MIN_LIQUIDITY_ORDER_USD_KEY

  // from orderBook.configValue
  liquidityLockPeriod: number // MCO_LIQUIDITY_LOCK_PERIOD
}

export interface Mux3Collateral {
  symbol: string
  tokenAddress: string // erc20.address
  decimals: number // .getCollateralToken().decimals
  isExist: boolean // .getCollateralToken().isExist
  isStable: boolean // .getCollateralToken().isStable
  isShowInTraderCollateralList: boolean // constant.CHAIN_ID_TO_MUX3_TRADE_COLLATERAL_ADDRESSES
}

// read from CollateralPool(poolAddress)
export interface Mux3Pool {
  poolAddress: string // from constant
  lpSymbol: string // from constant or erc20.symbol
  collateralToken: string // from constant or .collateralToken
  totalSupply: BigNumber
  liquidityFeeRate: BigNumber // pool.configValue(MCP_LIQUIDITY_FEE_RATE)
  liquidityCapUsd: BigNumber // pool.configValue(MCP_LIQUIDITY_CAP_USD)
  liquidityBalances: { [tokenAddress: string]: BigNumber } // .liquidityBalances
  borrowConfig: Mux3ExponentialBorrowConfig
  mux3PoolMarketsConfig: { [marketId: string]: Mux3PoolMarketConfig } // .marketConfigs([...keys])
  mux3PoolMarkets: { [marketId: string]: Mux3PoolMarket } // .marketStates()
}

export interface Mux3Market {
  // FacetReader(coreAddress).marketState
  marketId: string
  symbol: string
  isLong: boolean

  // marketConfigValue
  positionFeeRate: BigNumber // MM_POSITION_FEE_RATE
  initialMarginRate: BigNumber // MM_INITIAL_MARGIN_RATE
  maintenanceMarginRate: BigNumber // MM_MAINTENANCE_MARGIN_RATE
  lotSize: BigNumber // MM_LOT_SIZE
  oracleId: string // MM_ORACLE_ID
  openInterestCapUsd: BigNumber // MM_OPEN_INTEREST_CAP_USD

  backedPools: Mux3MarketPool[] // .listMarketPools
}

// 1 pool can be the backed pool for multiple markets.
// this is the state of each market within the pool
export interface Mux3PoolMarket {
  marketId: string
  isLong: boolean
  totalSize: BigNumber
  averageEntryPrice: BigNumber
  cumulatedBorrowingPerUsd: BigNumber // $borrowingFee / $positionValue, always increasing
  lastBorrowingUpdateTime: number
}

export interface Mux3PoolMarketConfig {
  marketId: string
  adlReserveRate: BigNumber // MCP_ADL_RESERVE_RATE
  adlMaxPnlRate: BigNumber // MCP_ADL_MAX_PNL_RATE
  adlTriggerRate: BigNumber // MCP_ADL_TRIGGER_RATE
}

// 1 market has multiple backed pools
export interface Mux3MarketPool {
  backedPool: string
}

export interface Mux3SubPosition {
  initialLeverage: BigNumber
  lastIncreasedTime: number
  realizedBorrowingUsd: BigNumber
  pools: { [poolAddress: string]: Mux3PositionPool }
}

export interface Mux3PositionPool {
  size: BigNumber
  entryPrice: BigNumber
  entryBorrowing: BigNumber
}

// .listAccountCollateralsAndPositionsOf
export interface Mux3SubAccount {
  subAccountId: string
  collaterals: { [collateralAddress: string]: BigNumber }
  positions: { [marketId: string]: Mux3SubPosition }
}

export function cloneMux3SubAccount(lhs: Mux3SubAccount): Mux3SubAccount {
  const collaterals: { [collateralAddress: string]: BigNumber } = {}
  for (const collateralAddress in lhs.collaterals) {
    collaterals[collateralAddress] = lhs.collaterals[collateralAddress]
  }
  const positions: { [marketId: string]: Mux3SubPosition } = {}
  for (const marketId in lhs.positions) {
    const lhsPosition = lhs.positions[marketId]
    const p: Mux3SubPosition = {
      ...lhsPosition,
      pools: {}
    }
    for (const poolAddress in lhsPosition.pools) {
      p.pools[poolAddress] = {
        ...lhsPosition.pools[poolAddress]
      }
    }
    positions[marketId] = p
  }
  return {
    subAccountId: lhs.subAccountId,
    collaterals,
    positions
  }
}

export interface Mux3OrderPayload {
  positionOrder?: {
    positionId: string
    marketId: string
    size: BigNumber
    flags: Mux3PositionOrderFlags
    limitPrice: BigNumber
    expiration: number
    lastConsumedToken: string
    // when openPosition
    collateralToken: string
    collateralAmount: BigNumber // erc20.decimals
    // when closePosition
    withdrawUsd: BigNumber
    withdrawSwapToken: string
    withdrawSwapSlippage: BigNumber
    // tpsl strategy
    tpPriceDiff: BigNumber
    slPriceDiff: BigNumber
    tpslExpiration: number
    tpslFlags: Mux3PositionOrderFlags
    tpslWithdrawSwapToken: string
    tpslWithdrawSwapSlippage: BigNumber
  }
  liquidityOrder?: {
    poolAddress: string
    token: string
    rawAmount: BigNumber // erc20.decimals
    isAdding: boolean
    isUnwrapWeth: boolean
  }
  withdrawOrder?: {
    positionId: string
    rawAmount: BigNumber // erc20.decimals
    tokenAddress: string
    isUnwrapWeth: boolean
  }
  adlOrder?: {
    positionId: string
    size: BigNumber
    price: BigNumber
    profitToken: string
    isUnwrapWeth: boolean
  }
}

export type Mux3Order = Mux3OrderPayload & {
  account: string
  orderId: number
  orderType: Mux3OrderType
  version: number
  placeOrderTime: number
  payload: string // decode me according to orderType
}

export interface Mux3SubAccountDetails {
  subAccount: Mux3SubAccount
  computed: Mux3SubAccountComputed
}

export interface Mux3SubAccountComputed {
  collateralUsd: BigNumber
  positions: { [marketId: string]: Mux3PositionComputed }
  marginBalanceUsd: BigNumber
  isIMSafe: boolean
  isMMSafe: boolean
  isMarginSafe: boolean
  withdrawableCollateralUsd: BigNumber
  totalEntryImRequiredUsd: BigNumber
  totalImRequiredUsd: BigNumber
  totalMmRequiredUsd: BigNumber
}

export interface Mux3PositionComputed {
  // according to subAccount.positions[marketId]
  size: BigNumber
  positionValueUsd: BigNumber
  entryValueUsd: BigNumber
  borrowingFeeUsd: BigNumber
  maxProfitUsd: BigNumber
  pnlUsd: BigNumber // considering adlMaxProfitRate
  pnlAfterBorrowingUsd: BigNumber
  // according to subAccount.collaterals
  leverage: BigNumber
  roe: BigNumber
  liquidationPrice: BigNumber
  entryImRequiredUsd: BigNumber
  imRequiredUsd: BigNumber
  mmRequiredUsd: BigNumber
}

export interface Mux3OpenPositionResult {
  afterTrade: Mux3SubAccountDetails
  isTradeSafe: boolean
  borrowingFeeUsd: BigNumber
  positionFeeUsd: BigNumber
}

export interface Mux3ClosePositionResult {
  afterTrade: Mux3SubAccountDetails
  isTradeSafe: boolean
  borrowingFeeUsd: BigNumber
  positionFeeUsd: BigNumber
  pnlUsd: BigNumber
  withdrawUsd: BigNumber // including withdrawProfit + withdrawUsd + withdrawAllIfEmpty
}

export interface Mux3WithdrawCollateralResult {
  afterTrade: Mux3SubAccountDetails
  isTradeSafe: boolean
  borrowingFeeUsd: BigNumber
}

export interface Mux3ExponentialBorrowConfig {
  k: BigNumber // MCP_BORROWING_K
  b: BigNumber // MCP_BORROWING_B
}
