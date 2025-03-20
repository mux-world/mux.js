import { ethers } from 'ethers'

export enum Mux3OrderType {
  Invalid, // 0
  Position, // 1
  Liquidity, // 2
  Withdrawal, // 3
  Rebalance, // 4
  Adl, // 5
  Liquidate // 6
}

export enum Mux3PositionOrderFlags {
  OpenPosition = 0x80, // this flag means open-position; otherwise close-position
  MarketOrder = 0x40, // this flag only affects order expire time and shows a better effect on UI
  WithdrawAllIfEmpty = 0x20, // this flag means auto withdraw all collateral if position.size == 0
  TriggerOrder = 0x10, // this flag means this is a trigger order (ex: stop-loss order). otherwise this is a limit order (ex: take-profit order)
  AutoDeleverage = 0x02, // denotes that this order is an auto-deleverage order
  UnwrapEth = 0x100, // unwrap WETH into ETH. only valid when fill close-position, or cancel open-position, or fill liquidity, or cancel liquidity
  WithdrawProfit = 0x200 // withdraw profit - fee. only valid when fill close-position
}

export const CHAIN_ID_TO_MUX3_CORE_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x85c8F4a67F4f9AD7b38e875c8FeDE7F4c878bFAc'
}

export const CHAIN_ID_TO_MUX3_ORDERBOOK_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x8ec387586a709ECE1a9Ea83c6163c3616D8E16b4'
}

export const CHAIN_ID_TO_MUX3_DELEGATOR_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xEf501d58e8d09eE8D8f28Cf812D5F57384e5d7B0'
}

export const CHAIN_ID_TO_MUX3_SWAPPER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x0D37BC91a3F1807cf4305E4A5eDEb4Ee47FA7112'
}

export const CHAIN_ID_TO_MUX3_POOL_ADDRESSES: { [chainID: number]: string[] } = {
  // arb1
  42161: [
    '0x13BB10542Aa9C0792d6FFe56bf123cE20A159A20', // MUX3LP-BTC-1, wbtc
    '0x5BDc5c2d8b5b50072906632f678AfA054E8f257d', // MUX3LP-BTC-2, wbtc
    '0x78673E3f54A009389F22fD3FcAA42B9Fc8Da9f53', // MUX3LP-ETH-1, weth,
    '0xd63F8decb14E83a1a2a950F66dc9437507b5f81F', // MUX3LP-ETH-2, weth,
    '0xA1082BDFC6f21cD71073FFeE2823139D67878aaE', // MUX3LP-sUSDe-1, susde,
    '0xd85D0bCE8Ff396EA1198996a21f96Db2feB8e943', // MUX3LP-sUSDe-2, susde,
    '0xAb0910755D99b420c51f48B6847733bB3fe19Af4', // MUX3LP-sUSDe-3, susde,
    '0x3d0572808510C293Bc5C9C42033Dd471266D4b3A', // MUX3LP-sUSDe-4, susde,
    '0x4aC33D0E24c9b4e51FcDDDd680534755a1d6A514', // MUX3LP-sUSDe-5, susde,
    '0xC432B2A5100C99ef12161Be5237B3a5Cfc3E8377', // MUX3LP-sUSDe-6, susde,
    '0xacD3471D77c25E5d98aB4A3f4402999f02cEf2A0', // MUX3LP-sUSDe-7, susde,
    '0x87f980bb419365DF5E665C8Af0a3996BE154873a', // MUX3LP-sUSDe-8, susde,
    '0x94762Ab36F872Aa058c8737d2cc90217382E85d2', // MUX3LP-USDC-1, USDC
    '0x89Eecc4fBCFe604EAEc70c0ea65e70C945A96db9', // MUX3LP-USDC-2, USDC
    '0xd2C1be5AF06D766Daeb13ddF96c55b39895D8057', // MUX3LP-USDC-3, USDC
    '0xBbdAd464f801102AFe1CE7B81AF43412Aa30ba7e' // MUX3LP-USDC-4, USDC
  ]
}

export const CHAIN_ID_TO_MUX3_MARKET_IDS: { [chainID: number]: string[] } = {
  // arb1
  42161: [
    ethers.utils.formatBytes32String('LongBTC'),
    ethers.utils.formatBytes32String('ShortBTC'),
    ethers.utils.formatBytes32String('LongETH'),
    ethers.utils.formatBytes32String('ShortETH')
  ]
}

// shown in trader collateral list
export const CHAIN_ID_TO_MUX3_TRADE_COLLATERAL_ADDRESSES: { [chainID: number]: string[] } = {
  // arb1
  42161: [
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // usdc
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // usdc.e
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // usdt
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // wbtc
    '0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2' // sUSDe
  ]
}

// shown in pool collateral list
export const CHAIN_ID_TO_MUX3_POOL_COLLATERAL_ADDRESSES: { [chainID: number]: string[] } = {
  // arb1
  42161: [
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // wbtc
    '0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2', // sUSDe
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' // usdc
  ]
}

function _hashString(x: string): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(x))
}

export const MUX3_ADDRESS_PAD = '000000000000000000000000'

// mux3 config
export const MC_BORROWING_BASE_APY_KEY = _hashString('MC_BORROWING_BASE_APY')
export const MC_BORROWING_INTERVAL_KEY = _hashString('MC_BORROWING_INTERVAL')
export const MC_STRICT_STABLE_DEVIATION_KEY = _hashString('MC_STRICT_STABLE_DEVIATION')

// market config
export const MM_POSITION_FEE_RATE_KEY = _hashString('MM_POSITION_FEE_RATE')
export const MM_LIQUIDATION_FEE_RATE_KEY = _hashString('MM_LIQUIDATION_FEE_RATE')
export const MM_INITIAL_MARGIN_RATE_KEY = _hashString('MM_INITIAL_MARGIN_RATE')
export const MM_MAINTENANCE_MARGIN_RATE_KEY = _hashString('MM_MAINTENANCE_MARGIN_RATE')
export const MM_LOT_SIZE_KEY = _hashString('MM_LOT_SIZE')
export const MM_ORACLE_ID_KEY = _hashString('MM_ORACLE_ID')
export const MM_DISABLE_TRADE_KEY = _hashString('MM_DISABLE_TRADE')
export const MM_DISABLE_OPEN_KEY = _hashString('MM_DISABLE_OPEN')
export const MM_OPEN_INTEREST_CAP_USD_KEY = _hashString('MM_OPEN_INTEREST_CAP_USD')

// collateral pool config
export const MCP_TOKEN_NAME_KEY = _hashString('MCP_TOKEN_NAME')
export const MCP_TOKEN_SYMBOL_KEY = _hashString('MCP_TOKEN_SYMBOL')
export const MCP_LIQUIDITY_FEE_RATE_KEY = _hashString('MCP_LIQUIDITY_FEE_RATE')
export const MCP_LIQUIDITY_CAP_USD_KEY = _hashString('MCP_LIQUIDITY_CAP_USD')
export const MCP_BORROWING_K_KEY = _hashString('MCP_BORROWING_K')
export const MCP_BORROWING_B_KEY = _hashString('MCP_BORROWING_B')

// pool + market
export const MCP_ADL_RESERVE_RATE_KEY = _hashString('MCP_ADL_RESERVE_RATE')
export const MCP_ADL_MAX_PNL_RATE_KEY = _hashString('MCP_ADL_MAX_PNL_RATE')
export const MCP_ADL_TRIGGER_RATE_KEY = _hashString('MCP_ADL_TRIGGER_RATE')
export const MCO_MIN_LIQUIDITY_ORDER_USD_KEY = _hashString('MCO_MIN_LIQUIDITY_ORDER_USD')

// order book config
export const MCO_LIQUIDITY_LOCK_PERIOD_KEY = _hashString('MCO_LIQUIDITY_LOCK_PERIOD')
export const MCO_POSITION_ORDER_PAUSED_KEY = _hashString('MCO_POSITION_ORDER_PAUSED')
export const MCO_LIQUIDITY_ORDER_PAUSED_KEY = _hashString('MCO_LIQUIDITY_ORDER_PAUSED')
export const MCO_WITHDRAWAL_ORDER_PAUSED_KEY = _hashString('MCO_WITHDRAWAL_ORDER_PAUSED')
export const MCO_MARKET_ORDER_TIMEOUT_KEY = _hashString('MCO_MARKET_ORDER_TIMEOUT')
export const MCO_LIMIT_ORDER_TIMEOUT_KEY = _hashString('MCO_LIMIT_ORDER_TIMEOUT')
export const MCO_CANCEL_COOL_DOWN_KEY = _hashString('MCO_CANCEL_COOL_DOWN')
export const MCO_ORDER_GAS_FEE_GWEI_KEY = _hashString('MCO_ORDER_GAS_FEE_GWEI')
