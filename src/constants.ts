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
  // arb rinkeby
  421611: '0xba893CfA648f46F92a29911589f1A353b6AA4938',
  // arb1
  42161: '0x18891480b9dd2aC5eF03220C45713d780b5CFdeF'
}

export const CHAIN_ID_TO_MCB_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0x33086E2B2EE2f10F7013F8c16bd208347de5ba59',
  // arb1
  42161: '0x4e352cf164e64adcbad318c3a1e222e9eba4ce42'
}

export const CHAIN_ID_TO_MUX_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0x327b6209764B6DFcdF6F57540552a8112B272DF1',
  // arb1
  42161: '0x8BB2Ac0DCF1E86550534cEE5E9C8DED4269b679B'
}

export const CHAIN_ID_TO_MLP_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0x508E18100ED8C908c924EE5DEd5ac0A60876B0FF',
  // bsc testnet
  97: '0x0F97336F83DB38E0D8B7324F37703e6216C533De',
  // fantom testnet
  4002: '0xF65976b7a02bd986DbBc5fcA1881633F5665ff99',
  // avalanche testnet
  43113: '0x9229bb4403113c26EE8AcAcAD2fEcB6a2a83D514',
  // arb1
  42161: '0x7CbaF5a14D953fF896E5B3312031515c858737C8',
  // bsc
  56: '0x07145Ad7C7351c6FE86b6B841fC9Bed74eb475A7',
  // fantom
  250: '0xDDAde9a8dA4851960DFcff1AE4A18EE75C39eDD2',
  // avalanche
  43114: '0xAf2D365e668bAaFEdcFd256c0FBbe519e594E390',
  // l1
  1: '0x55c6b11d9FA571e1eea371D0cbB160B8FEfB571a'
}

export const CHAIN_ID_TO_LIQUIDITY_POOL_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xa182610BE93374c31548D516631152bDAc2F79aA',
  // bsc testnet
  97: '0xd037289cd24c328d53D6115cff63Ed6414F57a6A',
  // ftm testnet
  4002: '0x19b306373e29A9d41c761B2373E8968E9b72EddF',
  // avalanche testnet
  43113: '0x3cEAD888989FD07F51EBD05755056a72e02BA01b',
  // arb1
  42161: '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633',
  // bsc
  56: '0x855E99F768FaD76DD0d3EB7c446C0b759C96D520',
  // fantom
  250: '0x2e81F443A11a943196c88afcB5A0D807721A88E6',
  // avalanche
  43114: '0x0bA2e492e8427fAd51692EE8958eBf936bEE1d84',
  // l1
  1: '0xaB6f7bCC18ce206a355F2993a013ba4a67656f0D'
}

export const CHAIN_ID_TO_ORDER_BOOK_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xdD57B1342E1fF9BC3B40C1Bb5e3353a47F17CE46',
  // bsc testnet
  97: '0x4FD4819afD44977f2659e42e204E18a6A5E48e90',
  // ftm testnet
  4002: '0x998f79857e57Fe9f8eBC54694c0A498D8315E95f',
  // avalanche testnet
  43113: '0xdE8A3970297E0a6bE7fAcaD423cf701D7B15039A',
  // arb1
  42161: '0xa19fD5aB6C8DCffa2A295F78a5Bb4aC543AAF5e3',
  // bsc
  56: '0xa67aA293642C4e02D1b9F360b007C0dBDc451A08',
  // fantom
  250: '0x0c30b10462CdED51C3CA31e7C51019b7d25a965B',
  // avalanche
  43114: '0x5898c3E218a8501533d771C86e2fA37743ea2aDd',
  // l1
  1: '0xA2972bB7f89F8E67807C02d8AC4C8C7a4C41D309'
}

export const CHAIN_ID_TO_LIQUIDITY_MANAGER_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0x1f8cfdF64Fbee92e4BB0b8331477E4693E24e9d2',
  // bsc testnet
  97: '0xF7b05c2170aA6cFccC96ceC7DF6A08C27643eef6',
  // ftm testnet
  4002: '0x6bfDC5e0659f4D312442546d456A5552dEE636C5',
  // avalanche testnet
  43113: '0x6AF724C8D2a6A61A7Ca7d9727CBE842D57F427Fe',
  // arb1
  42161: '0x02FAe054ACD7FB1615471319c4E3029DFbC2B23C',
  // bsc
  56: '0x0c30b10462CdED51C3CA31e7C51019b7d25a965B',
  // fantom
  250: '0xee85CDdCe0CF068091081eA0fcd53f279aa3B09F',
  // avalanche
  43114: '0x7c7fe685FD4c6185db22529556202c797D010113',
  // l1
  1: '0xd5db0EF907066d07D912b2Dd14C38F6E94156DEb'
}

export const CHAIN_ID_TO_READER_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xDA3819eDdF3E99c85De6A3ccF233CB8f83E0CE96',
  // bsc testnet
  97: '0xD096f5E77dc0DFe8CAF0943A5E6B2d2B52164872',
  // ftm testnet
  4002: '0x4eb5a6c7da3C8cBB496e6a1dd16E24b8ee766273',
  // avalanche testnet
  43113: '0x57ef3E73944a89C3cB589EB9A90Dd0d87D20AA48',
  // arb1
  42161: '0x6e29c4e8095B2885B8d30b17790924F33EcD7b33',
  // bsc
  56: '0xeAb5b06a1ea173674601dD54C612542b563beca1',
  // fantom
  250: '0x29F4dC996a0219838AfeCF868362E4df28A70a7b',
  // avalanche
  43114: '0x5996D4545EE59D96cb1FE8661a028Bef0f4744B0',
  // l1
  1: '0x4153024Bcaa030b70819b9ADf1c7Ad8780EC17D7'
}

export const CHAIN_ID_TO_REWARD_ROUTER_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xFf8746F336A1da4471634AA622CAC778cd2548D2',
  // arb1
  42161: '0xaf9C4F6A0ceB02d4217Ff73f3C95BbC8c7320ceE'
}

export const CHAIN_ID_TO_MLP_FEE_REWARD_TRACKER_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0x0C7e35d76da990Ee4EF4F50c8466be4EB9A27F87',
  // arb1
  42161: '0x290450cDea757c68E4Fe6032ff3886D204292914'
}

export const CHAIN_ID_TO_VOTING_ESCROW_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xFDCa72734AeF298eF32e50B40e5D515AD04190E6',
  // arb1
  42161: '0xA65bA125a25b51539a3d10910557b28215097810'
}

export const CHAIN_ID_TO_MLP_VESTER_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xdAae4D50ff6D90B0bC3E74218416c9BeAaFB267c',
  // arb1
  42161: '0xBCF8c124975DE6277D8397A3Cad26E2333620226'
}

export const CHAIN_ID_TO_MUX_VESTER_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xA848ed0a344f32de648CC7dc5E1ea4CFB0E253c5',
  // arb1
  42161: '0xD7e864658DdE98B1A1d70ce6d84D78e0A8e8aD18'
}

export const CHAIN_ID_TO_REWARD_MANAGER_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xa32093d762A468C4Ac3f20944f32257785062E79',
  // arb1
  42161: '0xaf9C4F6A0ceB02d4217Ff73f3C95BbC8c7320ceE'
}

export const CHAIN_ID_TO_VAULT_ADDRESS: { [chainID: number]: string } = {
  // arb rinkeby
  421611: '0xB770cD34192AaF600bb5A275c378aBC84A69606F',
  // bsc testnet
  97: '0xc418532cb53d104cdCdcCC514ef48e1113eB9916',
  // fantom testnet
  4002: '0x297F3C9106B2e5288e87Deb4bb7B6d40C32166C9',
  // avalanche testnet
  43113: '0xe6BB6c7e2A6d97ED93694219d31528F0Dc7b95BA',
  // arb1
  42161: '0x917952280770Daa800E1B4912Ea08450Bf71d57e',
  // bsc
  56: '0x8D751570BA1Fd8a8ae89E4B27d18bf6C321Aab0a',
  // fantom
  250: '0xdAF2064F52F123EE1D410e97C2df549c23a99683',
  // avalanche
  43114: '0x29a28cC3FdC128693ef6a596eF45c43ff63B7062',
  // l1
  1: '0x0625f0f7ed57b16b5EA8ad59Cff32D0e9A7126B2'
}

export const CHAIN_ID_TO_REFERRAL_MANAGER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0xa68d96F26112377abdF3d6b9fcde9D54f2604C2a',
  // avalanche
  43114: '0x1444edF22cd6C891391f3644b435eF6b8270C4B0',
  // bsc
  56: '0x3EfE4639eb082e22209fee29aAbaf14Ade5bF82B',
  // fantom
  250: '0x3EfE4639eb082e22209fee29aAbaf14Ade5bF82B'
}

export enum OrderType {
  Invalid,
  Position,
  Liquidity,
  Withdrawal,
  Rebalance,
  FlashTakePosition
}

export enum PositionOrderFlags {
  OpenPosition = 0x80, // 0x80 means openPosition; otherwise closePosition
  MarketOrder = 0x40, // 0x40 means ignore limitPrice
  WithdrawAllIfEmpty = 0x20, // 0x20 means auto withdraw all collateral if position.size == 0
  TriggerOrder = 0x10 // 0x10 means this is a trigger order (ex: stop-loss order). 0 means this is a limit order (ex: take-profit order)
}

// do not forget toWei(PreMinedTokenTotalSupply)
export const PreMinedTokenTotalSupply = '1000000000000000000'

export enum SpreadType {
  Ask,
  Bid
}

export const FlashTakeEIP712DomainType = [
  { name: 'name', type: 'string' }, // "MUX Protocol"
  { name: 'version', type: 'string' }, // "v1"
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
]

export const FlashTakeEIP712Type = {
  FlashTake: [
    { name: 'subAccountId', type: 'bytes32' },
    { name: 'collateral', type: 'uint96' }, // erc20.decimals
    { name: 'size', type: 'uint96' }, // 1e18
    { name: 'gasFee', type: 'uint96' }, // 1e18
    { name: 'referralCode', type: 'bytes32' },
    { name: 'orderType', type: 'uint8' }, // should be FlashTakePosition
    { name: 'flags', type: 'uint8' }, // see LibOrder.POSITION_*
    { name: 'profitTokenId', type: 'uint8' },
    { name: 'placeOrderTime', type: 'uint32' },
    { name: 'salt', type: 'uint32' }
  ]
}
