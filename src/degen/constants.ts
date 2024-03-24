import { ethers } from 'ethers'

export const DECIMALS = 18
export const RATIO_DECIMALS = 5

export const CHAIN_ID_TO_DEGEN_POOL_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x2f977A859eD91c729c781ba0e50927d5Da3Cb988'
}

export const CHAIN_ID_TO_DEGEN_ORDER_BOOK_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xab7bD145CC9B68b1904D4B6Ca93056f503C5aA19'
}

export const CHAIN_ID_TO_DEGEN_READER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x25aB6cA91979714a2DC06512618F6eCC66e3B7fD'
}

export enum OrderType {
  Invalid,
  Position,
  Liquidity,
  Withdrawal
}

export enum PositionOrderFlags {
  OpenPosition = 0x80, // this flag means openPosition; otherwise closePosition
  MarketOrder = 0x40, // this flag only affects order expire time and show a better effect on UI
  WithdrawAllIfEmpty = 0x20, // this flag means auto withdraw all collateral if position.size == 0
  TriggerOrder = 0x10, // this flag means this is a trigger order (ex: stop-loss order). otherwise this is a limit order (ex: take-profit order)
  TpSlStrategy = 0x08, // for open-position-order, this flag auto place take-profit and stop-loss orders when open-position-order fills.
  //                      for close-position-order, this flag means ignore limitPrice and profitTokenId, and use extra.tpPrice, extra.slPrice, extra.tpslProfitTokenId instead.
  ShouldReachMinProfit = 0x04, // this flag is used to ensure that either the minProfitTime is met or the minProfitRate ratio is reached when close a position. only available when minProfitTime > 0.
  AutoDeleverage = 0x02 // denotes that this order is an auto-deleverage order
}

export enum ReferenceOracleType {
  None,
  Chainlink
}

export const ASSET_IS_STABLE = 0x00000000000001 // is a usdt, usdc, ...
export const ASSET_CAN_ADD_REMOVE_LIQUIDITY = 0x00000000000002 // can call addLiquidity and removeLiquidity with this token
export const ASSET_IS_TRADABLE = 0x00000000000100 // allowed to be assetId
export const ASSET_IS_OPENABLE = 0x00000000010000 // can open position
export const ASSET_IS_SHORTABLE = 0x00000001000000 // allow shorting this asset
export const ASSET_IS_ENABLED = 0x00010000000000 // allowed to be assetId and collateralId
export const ASSET_IS_STRICT_STABLE = 0x01000000000000 // assetPrice is always 1 unless volatility exceeds strictStableDeviation

function _hashString(x: string): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(x))
}

// POOL
export const MLP_TOKEN_KEY = _hashString('MLP_TOKEN')
export const ORDER_BOOK_KEY = _hashString('ORDER_BOOK')
export const FEE_DISTRIBUTOR_KEY = _hashString('FEE_DISTRIBUTOR')

export const FUNDING_INTERVAL_KEY = _hashString('FUNDING_INTERVAL')
export const BORROWING_RATE_APY_KEY = _hashString('BORROWING_RATE_APY')

export const LIQUIDITY_FEE_RATE_KEY = _hashString('LIQUIDITY_FEE_RATE')

export const STRICT_STABLE_DEVIATION_KEY = _hashString('STRICT_STABLE_DEVIATION')
export const BROKER_GAS_REBATE_USD_KEY = _hashString('BROKER_GAS_REBATE_USD')

// POOL - ASSET
export const SYMBOL_KEY = _hashString('SYMBOL')
export const DECIMALS_KEY = _hashString('DECIMALS')
export const TOKEN_ADDRESS_KEY = _hashString('TOKEN_ADDRESS')
export const LOT_SIZE_KEY = _hashString('LOT_SIZE')

export const INITIAL_MARGIN_RATE_KEY = _hashString('INITIAL_MARGIN_RATE')
export const MAINTENANCE_MARGIN_RATE_KEY = _hashString('MAINTENANCE_MARGIN_RATE')
export const MIN_PROFIT_RATE_KEY = _hashString('MIN_PROFIT_RATE')
export const MIN_PROFIT_TIME_KEY = _hashString('MIN_PROFIT_TIME')
export const POSITION_FEE_RATE_KEY = _hashString('POSITION_FEE_RATE')
export const LIQUIDATION_FEE_RATE_KEY = _hashString('LIQUIDATION_FEE_RATE')

export const REFERENCE_ORACLE_KEY = _hashString('REFERENCE_ORACLE')
export const REFERENCE_DEVIATION_KEY = _hashString('REFERENCE_DEVIATION')
export const REFERENCE_ORACLE_TYPE_KEY = _hashString('REFERENCE_ORACLE_TYPE')

export const MAX_LONG_POSITION_SIZE_KEY = _hashString('MAX_LONG_POSITION_SIZE')
export const MAX_SHORT_POSITION_SIZE_KEY = _hashString('MAX_SHORT_POSITION_SIZE')
export const FUNDING_ALPHA_KEY = _hashString('FUNDING_ALPHA')
export const FUNDING_BETA_APY_KEY = _hashString('FUNDING_BETA_APY')

export const LIQUIDITY_CAP_USD_KEY = _hashString('LIQUIDITY_CAP_USD')

export const ADL_RESERVE_RATE_KEY = _hashString('ADL_RESERVE_RATE')
export const ADL_MAX_PNL_RATE_KEY = _hashString('ADL_MAX_PNL_RATE')
export const ADL_TRIGGER_RATE_KEY = _hashString('ADL_TRIGGER_RATE')

// ORDERBOOK
export const BROKER_ROLE = _hashString('BROKER_ROLE')
export const CALLBACKER_ROLE = _hashString('CALLBACKER_ROLE')
export const MAINTAINER_ROLE = _hashString('MAINTAINER_ROLE')
export const OB_LIQUIDITY_LOCK_PERIOD_KEY = _hashString('OB_LIQUIDITY_LOCK_PERIOD')
export const OB_REFERRAL_MANAGER_KEY = _hashString('OB_REFERRAL_MANAGER')
export const OB_MARKET_ORDER_TIMEOUT_KEY = _hashString('OB_MARKET_ORDER_TIMEOUT')
export const OB_LIMIT_ORDER_TIMEOUT_KEY = _hashString('OB_LIMIT_ORDER_TIMEOUT')
export const OB_CALLBACK_GAS_LIMIT_KEY = _hashString('OB_CALLBACK_GAS_LIMIT')
export const OB_CANCEL_COOL_DOWN_KEY = _hashString('OB_CANCEL_COOL_DOWN')
