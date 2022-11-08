import BigNumber from 'bignumber.js'
import { BytesLike, ethers, CallOverrides } from 'ethers'
import { arrayify, getAddress, Hexable, hexlify } from 'ethers/lib/utils'
import {
  Asset,
  BugError,
  ChainStorage,
  DecodedSubAccountId,
  Dex,
  FlashTakeEIP712,
  InvalidArgumentError,
  LiquidityPool,
  SignerOrProvider,
  SubAccount
} from './types'
import {
  ASSET_CAN_ADD_REMOVE_LIQUIDITY,
  ASSET_IS_ENABLED,
  ASSET_IS_OPENABLE,
  ASSET_IS_SHORTABLE,
  ASSET_IS_STABLE,
  ASSET_IS_STRICT_STABLE,
  ASSET_IS_TRADABLE,
  ASSET_USE_STABLE_TOKEN_FOR_PROFIT,
  CHAIN_ID_TO_READER_ADDRESS,
  DECIMALS,
  RATIO_DECIMALS,
  _0
} from './constants'
import { Reader__factory } from './abi/factories/Reader__factory'
import { Reader } from './abi/Reader'

/**
 * SubAccountId =
 *         96             88        80       72        0
 * +---------+--------------+---------+--------+--------+
 * | Account | collateralId | assetId | isLong | unused |
 * +---------+--------------+---------+--------+--------+
 */
export function encodeSubAccountId(
  account: BytesLike | Hexable,
  collateralId: number,
  assetId: number,
  isLong: boolean
): string {
  if (ethers.utils.arrayify(account).length !== 20) {
    throw new Error(`malformed account: ${account}`)
  }
  return (
    ethers.utils.solidityPack(['address', 'uint8', 'uint8', 'bool'], [account, collateralId, assetId, isLong]) +
    '000000000000000000'
  )
}

export function decodeSubAccountId(subAccountId: BytesLike | Hexable): DecodedSubAccountId {
  const raw = ethers.utils.arrayify(subAccountId)
  if (raw.length !== 32) {
    throw new Error(`unrecognized subAccountId: ${subAccountId}`)
  }
  return {
    account: ethers.utils.hexlify(raw.subarray(0, 20)),
    collateralId: raw[20],
    assetId: raw[21],
    isLong: !!raw[22]
  }
}

export async function getReaderContract(signerOrProvider: SignerOrProvider, contractAddress?: string): Promise<Reader> {
  if (!contractAddress) {
    let chainId = 0
    if (signerOrProvider instanceof ethers.Signer) {
      if (!signerOrProvider.provider) {
        throw new InvalidArgumentError('the given Signer does not have a Provider')
      }
      chainId = (await signerOrProvider.provider.getNetwork()).chainId
    } else {
      chainId = (await signerOrProvider.getNetwork()).chainId
    }
    contractAddress = CHAIN_ID_TO_READER_ADDRESS[chainId]
    if (!contractAddress) {
      throw new InvalidArgumentError(`unknown chainId ${chainId}`)
    }
  }
  getAddress(contractAddress)
  return Reader__factory.connect(contractAddress, signerOrProvider)
}

export async function getSubAccounts(
  reader: Reader,
  subAccountIds: BytesLike[],
  overrides: CallOverrides = {}
): Promise<{ [subAccountId: string]: SubAccount }> {
  const ret: { [subAccountId: string]: SubAccount } = {}
  const subAccounts = await reader.getSubAccounts(subAccountIds, overrides)
  if (subAccounts.length !== subAccountIds.length) {
    throw new BugError(`subAccounts array mismatched: ${subAccounts.length} vs ${subAccountIds.length}`)
  }
  subAccounts.forEach((subAccount, i) => {
    ret[subAccountIds[i].toString()] = _convertSubAccount(subAccount)
  })
  return ret
}

export async function getSubAccountsAndOrders(
  reader: Reader,
  subAccountIds: BytesLike[],
  orderIds: number[],
  overrides: CallOverrides = {}
): Promise<{
  subAccounts: { [subAccountId: string]: SubAccount }
  orders: { [orderId: number]: [string, string, string] }
}> {
  const ret: {
    subAccounts: { [subAccountId: string]: SubAccount }
    orders: { [orderId: number]: [string, string, string] }
  } = { subAccounts: {}, orders: {} }
  const result = await reader.getSubAccountsAndOrders(subAccountIds, orderIds, overrides)
  if (result.subAccounts.length !== subAccountIds.length) {
    throw new BugError(`subAccounts array mismatched: ${result.subAccounts.length} vs ${subAccountIds.length}`)
  }
  result.subAccounts.forEach((subAccount, i) => {
    ret.subAccounts[subAccountIds[i].toString()] = _convertSubAccount(subAccount)
  })
  if (result.orders.length !== orderIds.length) {
    throw new BugError(`orders array mismatched: ${result.orders.length} vs ${orderIds.length}`)
  }
  if (result.isOrderExist.length !== orderIds.length) {
    throw new BugError(`orders array mismatched: ${result.isOrderExist.length} vs ${orderIds.length}`)
  }
  orderIds.forEach((orderId: number, index: number) => {
    if (result.isOrderExist[index]) {
      ret.orders[orderId] = result.orders[index]
    }
  })
  return ret
}

export async function getChainStorage(reader: Reader, overrides: CallOverrides = {}): Promise<ChainStorage> {
  const storage = await reader.callStatic.getChainStorage(overrides)
  return {
    pool: _convertLiquidityPoolStorage(storage.pool),
    assets: storage.assets.map(x => _convertAssetStorage(x)),
    dexes: storage.dexes.map(x => _convertDexStorage(storage.assets, x)),
    liquidityLockPeriod: storage.liquidityLockPeriod,
    lpDeduct: fromWei(storage.lpDeduct),
    stableDeduct: fromWei(storage.stableDeduct)
  }
}

export function fromWei(n: ethers.BigNumber): BigNumber {
  return new BigNumber(n.toString()).shiftedBy(-DECIMALS)
}

function fromRate(n: number): BigNumber {
  return new BigNumber(n.toString()).shiftedBy(-RATIO_DECIMALS)
}

function _convertSubAccount(a: Reader.SubAccountStateStructOutput): SubAccount {
  return {
    collateral: fromWei(a.collateral),
    size: fromWei(a.size),
    lastIncreasedTime: a.lastIncreasedTime,
    entryPrice: fromWei(a.entryPrice),
    entryFunding: fromWei(a.entryFunding)
  }
}

function _convertLiquidityPoolStorage(p: Reader.PoolStorageStructOutput): LiquidityPool {
  return {
    shortFundingBaseRate8H: fromRate(p.shortFundingBaseRate8H),
    shortFundingLimitRate8H: fromRate(p.shortFundingLimitRate8H),
    lastFundingTime: p.lastFundingTime,
    fundingInterval: p.fundingInterval,
    liquidityBaseFeeRate: fromRate(p.liquidityBaseFeeRate),
    liquidityDynamicFeeRate: fromRate(p.liquidityDynamicFeeRate),
    sequence: p.sequence,
    strictStableDeviation: fromRate(p.strictStableDeviation),
    mlpPriceLowerBound: fromWei(p.mlpPriceLowerBound),
    mlpPriceUpperBound: fromWei(p.mlpPriceUpperBound)
  }
}

function _convertAssetStorage(a: Reader.AssetStorageStructOutput): Asset {
  return {
    symbol: ethers.utils.parseBytes32String(a.symbol),
    id: a.id,
    decimals: a.decimals,
    isStable: test64(a.flags.toNumber(), ASSET_IS_STABLE),
    canAddRemoveLiquidity: test64(a.flags.toNumber(), ASSET_CAN_ADD_REMOVE_LIQUIDITY),
    isTradable: test64(a.flags.toNumber(), ASSET_IS_TRADABLE),
    isOpenable: test64(a.flags.toNumber(), ASSET_IS_OPENABLE),
    isShortable: test64(a.flags.toNumber(), ASSET_IS_SHORTABLE),
    useStableTokenForProfit: test64(a.flags.toNumber(), ASSET_USE_STABLE_TOKEN_FOR_PROFIT),
    isEnabled: test64(a.flags.toNumber(), ASSET_IS_ENABLED),
    isStrictStable: test64(a.flags.toNumber(), ASSET_IS_STRICT_STABLE),
    referenceOracleType: a.referenceOracleType,
    referenceOracle: a.referenceOracle,
    referenceDeviation: fromRate(a.referenceDeviation),
    halfSpread: fromRate(a.halfSpread),
    tokenAddress: a.tokenAddress,
    muxTokenAddress: a.muxTokenAddress,
    initialMarginRate: fromRate(a.initialMarginRate),
    maintenanceMarginRate: fromRate(a.maintenanceMarginRate),
    positionFeeRate: fromRate(a.positionFeeRate),
    minProfitRate: fromRate(a.minProfitRate),
    minProfitTime: a.minProfitTime,
    maxLongPositionSize: fromWei(a.maxLongPositionSize),
    maxShortPositionSize: fromWei(a.maxShortPositionSize),
    spotWeight: a.spotWeight,
    longFundingBaseRate8H: fromRate(a.longFundingBaseRate8H),
    longFundingLimitRate8H: fromRate(a.longFundingLimitRate8H),
    longCumulativeFundingRate: fromWei(a.longCumulativeFundingRate),
    shortCumulativeFunding: fromWei(a.shortCumulativeFunding),
    spotLiquidity: fromWei(a.spotLiquidity),
    totalLongPosition: fromWei(a.totalLongPosition),
    averageLongPrice: fromWei(a.averageLongPrice),
    totalShortPosition: fromWei(a.totalShortPosition),
    averageShortPrice: fromWei(a.averageShortPrice),
    collectedFee: fromWei(a.collectedFee),
    deduct: fromWei(a.deduct)
  }
}

function _convertDexStorage(assets: Reader.AssetStorageStructOutput[], d: Reader.DexStorageStructOutput): Dex {
  const fromAssetUnit = (balance: ethers.BigNumber, assetId: number): BigNumber => {
    const asset = assets[assetId]
    if (typeof asset === 'undefined') {
      throw new Error(`bad dex config. reading assetId: ${assetId}`)
    }
    return new BigNumber(balance.toString()).shiftedBy(-asset.decimals)
  }
  return {
    dexId: d.dexId,
    dexType: d.dexType,
    assetIds: d.assetIds,
    assetWeightInDEX: d.assetWeightInDEX,
    dexWeight: d.dexWeight,
    totalSpotInDEX: d.totalSpotInDEX.map((balance: ethers.BigNumber, i: number) =>
      fromAssetUnit(balance, d.assetIds[i])
    ),
    dexLPBalance: fromWei(d.dexLPBalance),
    liquidityBalance: d.liquidityBalance.map((balance: ethers.BigNumber, i: number) =>
      fromAssetUnit(balance, d.assetIds[i])
    )
  }
}

export function and64(v1: number, v2: number): number {
  let hi = 0x80000000
  let low = 0x7fffffff
  let hi1 = ~~(v1 / hi)
  let hi2 = ~~(v2 / hi)
  let low1 = v1 & low
  let low2 = v2 & low
  let h = hi1 & hi2
  let l = low1 & low2
  return h * hi + l
}

export function test64(v1: number, mask: number): boolean {
  return and64(v1, mask) !== 0
}

function _hashString(x: string): Buffer {
  return _hash(ethers.utils.toUtf8Bytes(x))
}

function _hash(x: BytesLike): Buffer {
  return Buffer.from(ethers.utils.keccak256(x).slice(2), 'hex')
}

export function getFlashTakeMessageHash(chainId: number, orderBookAddress: string, order: FlashTakeEIP712): string {
  if (arrayify(order.subAccountId).length !== 32) {
    throw new Error('invalid subAccountId. should be bytes32')
  }
  if (arrayify(order.referralCode).length !== 32) {
    throw new Error('invalid referralCode. should be bytes32')
  }
  const domain = _hash(
    ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        _hashString('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
        _hashString('MUX Protocol'),
        _hashString('v1'),
        chainId,
        orderBookAddress
      ]
    )
  )
  const typedMessage = _hash(
    ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'uint96', 'uint96', 'uint96', 'bytes32', 'uint8', 'uint8', 'uint8', 'uint32', 'uint32'],
      [
        _hashString(
          'FlashTake(bytes32 subAccountId,uint96 collateral,uint96 size,uint96 gasFee,bytes32 referralCode,uint8 orderType,uint8 flags,uint8 profitTokenId,uint32 placeOrderTime,uint32 salt)'
        ),
        order.subAccountId,
        order.collateral,
        order.size,
        order.gasFee,
        order.referralCode,
        order.orderType,
        order.flags,
        order.profitTokenId,
        order.placeOrderTime,
        order.salt
      ]
    )
  )
  const eip712MessageHash = _hash(Buffer.concat([Buffer.from('1901', 'hex'), domain, typedMessage]))
  return hexlify(eip712MessageHash)
}

// return {r}{s}{v + 4} to indicate that we are using eth_sign
export function encodeFlashTakeEthSignSignature(signature: string): string {
  const s = arrayify(signature)
  if (s.length !== 65) {
    throw new Error('only {r}{s}{v} is supported')
  }
  if (s[64] === 0 || s[64] === 1) {
    s[64] += 27 + 4
  } else if (s[64] === 27 || s[64] === 28) {
    s[64] += 4
  } else {
    throw new Error(`invalid {r}{s}{v = ${s[64]}}`)
  }
  return hexlify(s)
}
