import BigNumber from 'bignumber.js'

export const DECIMALS = 18
export const RATIO_DECIMALS = 5
export const ASSET_IS_STABLE = 0x00000000000001 // is a usdt, usdc, ...
export const ASSET_CAN_ADD_REMOVE_LIQUIDITY = 0x00000000000002 // can call addLiquidity and removeLiquidity with this token
export const ASSET_IS_TRADABLE = 0x00000000000100 // allowed to be assetId
export const ASSET_IS_OPENABLE = 0x00000000010000 // can open position
export const ASSET_IS_SHORTABLE = 0x00000001000000 // allow shorting this asset
export const ASSET_USE_STABLE_TOKEN_FOR_PROFIT = 0x00000100000000 // take profit will get stable coin
export const ASSET_IS_ENABLED = 0x00010000000000 // allowed to be assetId and collateralId
export const ASSET_IS_STRICT_STABLE = 0x01000000000000 // assetPrice is always 1 unless volatility exceeds strictStableDeviation

export const _0: BigNumber = new BigNumber('0')
export const _1: BigNumber = new BigNumber('1')
export const _2: BigNumber = new BigNumber('2')
export const _3: BigNumber = new BigNumber('3')

export const MAIN_CHAIN_IDS = [
  421611, // arb rinkeby
  42161 // arb1
]

export const CHAIN_ID_TO_PROTOCOL_OWNED_LIQUIDITY_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x18891480b9dd2aC5eF03220C45713d780b5CFdeF'
}

export const CHAIN_ID_TO_MCB_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x4e352cf164e64adcbad318c3a1e222e9eba4ce42'
}

export const CHAIN_ID_TO_MUX_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x8BB2Ac0DCF1E86550534cEE5E9C8DED4269b679B'
}

export const CHAIN_ID_TO_MLP_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x7CbaF5a14D953fF896E5B3312031515c858737C8',
  // avalanche
  43114: '0xAf2D365e668bAaFEdcFd256c0FBbe519e594E390',
  // bsc
  56: '0x07145Ad7C7351c6FE86b6B841fC9Bed74eb475A7',
  // fantom
  250: '0xDDAde9a8dA4851960DFcff1AE4A18EE75C39eDD2',
  // optimism
  10: '0x0509474f102b5cd3f1f09e1E91feb25938eF0f17'
}

export const CHAIN_ID_TO_LIQUIDITY_POOL_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633',
  // avalanche
  43114: '0x0bA2e492e8427fAd51692EE8958eBf936bEE1d84',
  // bsc
  56: '0x855E99F768FaD76DD0d3EB7c446C0b759C96D520',
  // fantom
  250: '0x2e81F443A11a943196c88afcB5A0D807721A88E6',
  // optimism
  10: '0xc6BD76FA1E9e789345e003B361e4A0037DFb7260'
}

export const CHAIN_ID_TO_ORDER_BOOK_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xa19fD5aB6C8DCffa2A295F78a5Bb4aC543AAF5e3',
  // avalanche
  43114: '0x5898c3E218a8501533d771C86e2fA37743ea2aDd',
  // bsc
  56: '0xa67aA293642C4e02D1b9F360b007C0dBDc451A08',
  // fantom
  250: '0x0c30b10462CdED51C3CA31e7C51019b7d25a965B',
  // optimism
  10: '0x6Fde9892Fd5302ac3c68688085BD5b031A63BC9D'
}

export const CHAIN_ID_TO_LIQUIDITY_MANAGER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x02FAe054ACD7FB1615471319c4E3029DFbC2B23C',
  // avalanche
  43114: '0x7c7fe685FD4c6185db22529556202c797D010113',
  // bsc
  56: '0x0c30b10462CdED51C3CA31e7C51019b7d25a965B',
  // fantom
  250: '0xee85CDdCe0CF068091081eA0fcd53f279aa3B09F',
  // optimism
  10: '0xFEc3704f4A02cB0EE6C7d52Cbf72b11E0441E9d5'
}

export const CHAIN_ID_TO_READER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xF64B4bD682E792e0BA78956B86F2Cee946d2E7D6',
  // avalanche
  43114: '0xCE443B8c1C3E3edb3b9F3B2B482FaaC09A95B01d',
  // bsc
  56: '0x9897A73a606606394FA2324D16f3926f5963a9C3',
  // fantom
  250: '0x30acc119F8b60C9cb92b8E3c4c7f8830c82f707E',
  // optimism
  10: '0xdF88Fe94EF674D8c1ab1743AD88717E7AE893a44'
}

export const CHAIN_ID_TO_REWARD_ROUTER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xaf9C4F6A0ceB02d4217Ff73f3C95BbC8c7320ceE'
}

export const CHAIN_ID_TO_MLP_FEE_REWARD_TRACKER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x290450cDea757c68E4Fe6032ff3886D204292914'
}

export const CHAIN_ID_TO_VOTING_ESCROW_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xA65bA125a25b51539a3d10910557b28215097810'
}

export const CHAIN_ID_TO_MLP_VESTER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xBCF8c124975DE6277D8397A3Cad26E2333620226'
}

export const CHAIN_ID_TO_MUX_VESTER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xD7e864658DdE98B1A1d70ce6d84D78e0A8e8aD18'
}

export const CHAIN_ID_TO_REWARD_MANAGER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xaf9C4F6A0ceB02d4217Ff73f3C95BbC8c7320ceE'
}

export const CHAIN_ID_TO_VAULT_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x917952280770Daa800E1B4912Ea08450Bf71d57e',
  // avalanche
  43114: '0x29a28cC3FdC128693ef6a596eF45c43ff63B7062',
  // bsc
  56: '0x8D751570BA1Fd8a8ae89E4B27d18bf6C321Aab0a',
  // fantom
  250: '0xdAF2064F52F123EE1D410e97C2df549c23a99683',
  // optimism
  10: '0x39d653884B611E0A8dbdb9720Ad5D75642fd544b'
}

export const CHAIN_ID_TO_REFERRAL_MANAGER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xa68d96F26112377abdF3d6b9fcde9D54f2604C2a',
  // avalanche
  43114: '0x1444edF22cd6C891391f3644b435eF6b8270C4B0',
  // bsc
  56: '0x3EfE4639eb082e22209fee29aAbaf14Ade5bF82B',
  // fantom
  250: '0x3EfE4639eb082e22209fee29aAbaf14Ade5bF82B',
  // optimism
  10: '0xc9296e12e2Fe55605d9F6dB5412EaA1938F0B404'
}

export enum OrderType {
  Invalid,
  Position,
  Liquidity,
  Withdrawal,
  Rebalance
}

export enum PositionOrderFlags {
  OpenPosition = 0x80, // this flag means openPosition; otherwise closePosition
  MarketOrder = 0x40, // this flag means ignore limitPrice
  WithdrawAllIfEmpty = 0x20, // this flag means auto withdraw all collateral if position.size == 0
  TriggerOrder = 0x10, // this flag means this is a trigger order (ex: stop-loss order). otherwise this is a limit order (ex: take-profit order)
  TpSlStrategy = 0x08, // for open-position-order, this flag auto place take-profit and stop-loss orders when open-position-order fills.
  //                     for close-position-order, this flag means ignore limitPrice and profitTokenId, and use extra.tpPrice, extra.slPrice, extra.tpslProfitTokenId instead.
  ShouldReachMinProfit = 0x04, // this flag is used to ensure that either the minProfitTime is met or the minProfitRate ratio is reached when close a position. only available when minProfitTime > 0.
}

// do not forget toWei(PreMinedTokenTotalSupply)
export const PreMinedTokenTotalSupply = '1000000000000000000'

export enum SpreadType {
  Ask,
  Bid
}
