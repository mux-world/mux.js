import { BytesLike, ethers } from 'ethers'
import { Hexable } from 'ethers/lib/utils'
import { _0 } from '../constants'
import { DecodedDegenSubAccountId, DegenAsset, DegenOrder, DegenOrderBook, DegenPool, DegenSubAccount } from './types'
import { InvalidArgumentError, MultiCallStruct } from '../types'
import { fromRate, fromUnit, fromWei, test64 } from '../data'
import { Reader__factory } from '../abi/factories/degen/Reader__factory'
import { IDegenPool__factory } from '../abi/factories/degen/IDegenPool__factory'
import { OrderBook__factory } from '../abi/factories/degen/OrderBook__factory'
import { Reader, ReaderInterface } from '../abi/degen/Reader'
import { IDegenPoolInterface } from '../abi/degen/IDegenPool'
import { OrderBookInterface, OrderDataStructOutput } from '../abi/degen/OrderBook'
import {
  ASSET_CAN_ADD_REMOVE_LIQUIDITY,
  ASSET_IS_ENABLED,
  ASSET_IS_OPENABLE,
  ASSET_IS_SHORTABLE,
  ASSET_IS_STABLE,
  ASSET_IS_STRICT_STABLE,
  ASSET_IS_TRADABLE,
  BORROWING_RATE_APY_KEY,
  FUNDING_INTERVAL_KEY,
  LIQUIDITY_CAP_USD_KEY,
  LIQUIDITY_FEE_RATE_KEY,
  OB_LIQUIDITY_LOCK_PERIOD_KEY,
  OrderType,
} from './constants'

/**
 * SubAccountId =
 *         96             88        80       72        0
 * +---------+--------------+---------+--------+--------+
 * | Account | collateralId | assetId | isLong | unused |
 * +---------+--------------+---------+--------+--------+
 */
export function encodeDegenSubAccountId(
  account: BytesLike | Hexable,
  collateralId: number,
  assetId: number,
  isLong: boolean
): string {
  if (ethers.utils.arrayify(account).length !== 20) {
    throw new InvalidArgumentError(`malformed account: ${account}`)
  }
  return (
    ethers.utils.solidityPack(['address', 'uint8', 'uint8', 'bool'], [account, collateralId, assetId, isLong]) +
    '000000000000000000'
  )
}

export function decodeDegenSubAccountId(subAccountId: BytesLike | Hexable): DecodedDegenSubAccountId {
  const raw = ethers.utils.arrayify(subAccountId)
  if (raw.length !== 32) {
    throw new InvalidArgumentError(`unrecognized subAccountId: ${subAccountId}`)
  }
  return {
    account: ethers.utils.hexlify(raw.subarray(0, 20)),
    collateralId: raw[20],
    assetId: raw[21],
    isLong: !!raw[22]
  }
}

const interfaceCache: { [contractName: string]: ethers.utils.Interface } = {}

function getReaderInterface(): ReaderInterface {
  if (!interfaceCache['Reader']) {
    interfaceCache['Reader'] = Reader__factory.createInterface()
  }
  return interfaceCache['Reader'] as ReaderInterface
}

function getDegenPoolInterface(): IDegenPoolInterface {
  if (!interfaceCache['DegenPool']) {
    interfaceCache['DegenPool'] = IDegenPool__factory.createInterface()
  }
  return interfaceCache['DegenPool'] as IDegenPoolInterface
}

function getOrderBookInterface(): OrderBookInterface {
  if (!interfaceCache['OrderBook']) {
    interfaceCache['OrderBook'] = OrderBook__factory.createInterface()
  }
  return interfaceCache['OrderBook'] as OrderBookInterface
}

export function makeDegenAssetsCall(readerAddress: string): [MultiCallStruct<DegenAsset[]>] {
  const iface = getReaderInterface()
  return [
    {
      target: readerAddress,
      callData: iface.encodeFunctionData('getAssets'),
      responseDecoder: (result: BytesLike) => {
        const parsed = iface.decodeFunctionResult('getAssets', result).ret as Reader.AssetStorageStructOutput[]
        return parsed.map(parseAsset)
      }
    }
  ]
}

function parseAsset(a: Reader.AssetStorageStructOutput): DegenAsset {
  return {
    id: a.id,
    symbol: ethers.utils.parseBytes32String(a.symbol),
    tokenAddress: a.tokenAddress,
    decimals: a.decimals.toNumber(),
    lotSize: fromWei(a.lotSize),
    initialMarginRate: fromRate(a.initialMarginRate),
    maintenanceMarginRate: fromRate(a.maintenanceMarginRate),
    positionFeeRate: fromRate(a.positionFeeRate),
    liquidationFeeRate: fromRate(a.liquidationFeeRate),
    minProfitRate: fromRate(a.minProfitRate),
    minProfitTime: a.minProfitTime,
    maxLongPositionSize: fromWei(a.maxLongPositionSize),
    maxShortPositionSize: fromWei(a.maxShortPositionSize),
    fundingAlpha: fromWei(a.fundingAlpha),
    fundingBetaApy: fromRate(a.fundingBetaApy),
    referenceOracleType: a.referenceOracleType,
    referenceOracle: a.referenceOracle,
    referenceDeviation: fromRate(a.referenceDeviation),
    adlReserveRate: fromRate(a.adlReserveRate),
    adlMaxPnlRate: fromRate(a.adlMaxPnlRate),
    adlTriggerRate: fromRate(a.adlTriggerRate),
    flags: a.flags.toNumber(),
    isStable: test64(a.flags.toNumber(), ASSET_IS_STABLE),
    canAddRemoveLiquidity: test64(a.flags.toNumber(), ASSET_CAN_ADD_REMOVE_LIQUIDITY),
    isTradable: test64(a.flags.toNumber(), ASSET_IS_TRADABLE),
    isOpenable: test64(a.flags.toNumber(), ASSET_IS_OPENABLE),
    isShortable: test64(a.flags.toNumber(), ASSET_IS_SHORTABLE),
    isEnabled: test64(a.flags.toNumber(), ASSET_IS_ENABLED),
    isStrictStable: test64(a.flags.toNumber(), ASSET_IS_STRICT_STABLE),
    spotLiquidity: fromWei(a.spotLiquidity),
    totalLongPosition: fromWei(a.totalLongPosition),
    averageLongPrice: fromWei(a.averageLongPrice),
    totalShortPosition: fromWei(a.totalShortPosition),
    averageShortPrice: fromWei(a.averageShortPrice),
    longCumulativeFunding: fromWei(a.longCumulativeFunding),
    shortCumulativeFunding: fromWei(a.shortCumulativeFunding)
  }
}

export function makeDegenPoolStorageCall(
  degenPoolAddress: string
): [
    // config
    MultiCallStruct<string>, // fundingInterval
    MultiCallStruct<string>, // liquidityFeeRate
    MultiCallStruct<string>, // liquidityCapUsd
    MultiCallStruct<string>, // borrowingRateApy
    // state
    MultiCallStruct<[string, string]> // sequence, lastFundingTime
  ] {
  const iface = getDegenPoolInterface()
  return [
    // config
    {
      target: degenPoolAddress,
      callData: iface.encodeFunctionData('getPoolParameter', [FUNDING_INTERVAL_KEY]),
      responseDecoder: (result: BytesLike) => {
        return iface.decodeFunctionResult('getPoolParameter', result)[0]
      }
    },
    {
      target: degenPoolAddress,
      callData: iface.encodeFunctionData('getPoolParameter', [LIQUIDITY_FEE_RATE_KEY]),
      responseDecoder: (result: BytesLike) => {
        return iface.decodeFunctionResult('getPoolParameter', result)[0]
      }
    },
    {
      target: degenPoolAddress,
      callData: iface.encodeFunctionData('getPoolParameter', [LIQUIDITY_CAP_USD_KEY]),
      responseDecoder: (result: BytesLike) => {
        return iface.decodeFunctionResult('getPoolParameter', result)[0]
      }
    },
    {
      target: degenPoolAddress,
      callData: iface.encodeFunctionData('getPoolParameter', [BORROWING_RATE_APY_KEY]),
      responseDecoder: (result: BytesLike) => {
        return iface.decodeFunctionResult('getPoolParameter', result)[0]
      }
    },
    // state
    {
      target: degenPoolAddress,
      callData: iface.encodeFunctionData('getPoolStorage'),
      responseDecoder: (result: BytesLike) => {
        const parsed = iface.decodeFunctionResult('getPoolStorage', result)
        return [parsed.sequence, parsed.lastFundingTime]
      }
    }
  ]
}

export function convertDegenPoolStorage(ret: any[]): DegenPool {
  if (ret.length !== 5) {
    throw new Error(`unrecognized degen pool storage: ${ret.length}`)
  }
  return {
    // config
    fundingInterval: fromUnit(ret[0], 0).toNumber(),
    liquidityFeeRate: fromRate(ret[1]),
    liquidityCapUsd: fromWei(ret[2]),
    borrowingRateApy: fromRate(ret[3]),
    // state
    sequence: fromUnit(ret[4][0], 0).toNumber(),
    lastFundingTime: fromUnit(ret[4][1], 0).toNumber()
  }
}

export function makeDegenOrderBookStorageCall(
  degenOrderBookAddress: string
): [
    // config
    MultiCallStruct<string> // liquidityLockPeriod
  ] {
  const iface = getOrderBookInterface()
  return [
    // config
    {
      target: degenOrderBookAddress,
      callData: iface.encodeFunctionData('getParameter', [OB_LIQUIDITY_LOCK_PERIOD_KEY]),
      responseDecoder: (result: BytesLike) => {
        return iface.decodeFunctionResult('getParameter', result)[0]
      }
    }
  ]
}

export function convertDegenOrderBookStorage(ret: any[]): DegenOrderBook {
  if (ret.length !== 1) {
    throw new Error(`unrecognized degen orderBook storage: ${ret.length}`)
  }
  return {
    // config
    liquidityLockPeriod: fromUnit(ret[0], 0).toNumber()
  }
}

export function makeDegenSubAccountsOfTraderCall(
  readerAddress: string,
  traderAddress: string,
  begin: number,
  end: number
): [MultiCallStruct<{ [subAccountId: string]: DegenSubAccount }>] {
  const iface = getReaderInterface()
  return [
    {
      target: readerAddress,
      callData: iface.encodeFunctionData('getSubAccountsOf', [traderAddress, begin, end]),
      responseDecoder: (result: BytesLike) => {
        const parsed = iface.decodeFunctionResult('getSubAccountsOf', result)
        const ret: { [subAccountId: string]: DegenSubAccount } = {}
        for (let i in parsed.subAccountIds) {
          ret[parsed.subAccountIds[i]] = parseDegenSubAccounts(parsed.subAccounts[i])
        }
        return ret
      }
    }
  ]
}

function parseDegenSubAccounts(a: Reader.SubAccountStateStructOutput): DegenSubAccount {
  return {
    collateral: fromWei(a.collateral),
    size: fromWei(a.size),
    lastIncreasedTime: a.lastIncreasedTime,
    entryPrice: fromWei(a.entryPrice),
    entryFunding: fromWei(a.entryFunding)
  }
}

export function makeDegenOrdersOfTraderCall(
  degenPoolOrderBookAddress: string,
  traderAddress: string,
  assets: DegenAsset[],
  begin: number,
  end: number
): [MultiCallStruct<{ [orderId: number]: DegenOrder }>] {
  const iface = getOrderBookInterface()
  return [
    {
      target: degenPoolOrderBookAddress,
      callData: iface.encodeFunctionData('getOrdersOf', [traderAddress, begin, end]),
      responseDecoder: (result: BytesLike) => {
        const parsed = iface.decodeFunctionResult('getOrdersOf', result)
        return (parsed.orderDataArray as OrderDataStructOutput[]).reduce(
          (acc: { [orderId: number]: DegenOrder }, orderData: OrderDataStructOutput) => {
            acc[orderData.id.toNumber()] = parseDegenOrder(orderData, assets)
            return acc
          },
          {}
        )
      }
    }
  ]
}

export function parseDegenOrder(a: OrderDataStructOutput, assets: DegenAsset[]): DegenOrder {
  const ret: DegenOrder = {
    account: a.account,
    id: a.id.toNumber(),
    orderType: a.orderType as OrderType,
    version: a.version,
    placeOrderTime: a.placeOrderTime,
    payload: a.payload
  }
  if (ret.orderType === OrderType.Position) {
    const [
      subAccountId,
      collateral,
      size,
      price,
      tpPrice,
      slPrice,
      expiration,
      tpslExpiration,
      profitTokenId,
      tpslProfitTokenId,
      flags
    ] = ethers.utils.defaultAbiCoder.decode(
      ['bytes32', 'uint96', 'uint96', 'uint96', 'uint96', 'uint96', 'uint32', 'uint32', 'uint8', 'uint8', 'uint8'],
      ret.payload
    )

    const { collateralId } = decodeDegenSubAccountId(subAccountId)
    if (collateralId >= assets.length) {
      throw new InvalidArgumentError(`missing asset[${collateralId}]`)
    }

    ret.positionOrder = {
      subAccountId,
      collateral: fromUnit(collateral, assets[collateralId].decimals),
      size: fromWei(size),
      price: fromWei(price),
      tpPrice: fromWei(tpPrice),
      slPrice: fromWei(slPrice),
      expiration,
      tpslExpiration,
      profitTokenId,
      tpslProfitTokenId,
      flags
    }
  } else if (ret.orderType === OrderType.Liquidity) {
    const [rawAmount, assetId, isAdding] = ethers.utils.defaultAbiCoder.decode(['uint96', 'uint8', 'bool'], ret.payload)

    if (assetId >= assets.length) {
      throw new InvalidArgumentError(`missing asset[${assetId}]`)
    }

    ret.liquidityOrder = {
      rawAmount: fromUnit(rawAmount, assets[assetId].decimals),
      assetId,
      isAdding
    }
  } else if (ret.orderType === OrderType.Withdrawal) {
    const [subAccountId, rawAmount, profitTokenId, isProfit] = ethers.utils.defaultAbiCoder.decode(
      ['bytes32', 'uint96', 'uint8', 'bool'],
      ret.payload
    )

    const { collateralId } = decodeDegenSubAccountId(subAccountId)
    if (collateralId >= assets.length) {
      throw new InvalidArgumentError(`missing asset[${collateralId}]`)
    }

    ret.withdrawOrder = {
      subAccountId,
      rawAmount: fromUnit(rawAmount, assets[collateralId].decimals),
      profitTokenId,
      isProfit
    }
  }
  return ret
}
