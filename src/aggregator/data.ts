import BigNumber from 'bignumber.js'
import { BytesLike } from 'ethers'
import { Hexable, hexlify } from 'ethers/lib/utils'
import {
  GMX_TOKENS,
  GMX_PRICE_DECIMALS,
  CHAIN_ID_TO_AGGREGATOR_READER_ADDRESS,
  GMX_BASIS_POINTS_DECIMALS,
  GMX_FUNDING_RATE_DECIMALS,
  GMX_POSITION_FEE_RATE,
  CHAIN_ID_TO_AGGREGATOR_SHORT_FUNDING_ASSET_ID
} from './constants'
import { BugError, InvalidArgumentError, SignerOrProvider } from '../types'
import {
  AggregatorSubAccount,
  GmxAdapterStorage,
  AggregatorCollateral,
  GmxTokenInfo,
  GmxCoreAccount,
  AggregatorProjectId,
  GmxAdapterOrder,
  AggregatorOrderCategory,
  GmxAdapterOrderReceiver,
  GmxTokenConfig
} from './types'
import { CallOverrides, ethers } from 'ethers'
import { fromRate, fromUnit, fromWei } from '../data'
import { Reader as AggregatorReader } from '../abi/aggregator/Reader'
import { Reader__factory as AggregatorReader__factory } from '../abi/factories/aggregator/Reader__factory'
import { getAddress } from 'ethers/lib/utils'
import { _0 } from '../constants'

export function fromGmxUsd(n: ethers.BigNumber): BigNumber {
  return fromUnit(n, GMX_PRICE_DECIMALS)
}

export async function getAggregatorReaderContract(
  signerOrProvider: SignerOrProvider,
  contractAddress?: string
): Promise<AggregatorReader> {
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
    contractAddress = CHAIN_ID_TO_AGGREGATOR_READER_ADDRESS[chainId]
    if (!contractAddress) {
      throw new InvalidArgumentError(`unknown chainId ${chainId}`)
    }
  }
  getAddress(contractAddress)
  return AggregatorReader__factory.connect(contractAddress, signerOrProvider)
}

export async function getGmxAdapterStorage(
  reader: AggregatorReader,
  chainId: number,
  gmxPositionManager: string,
  gmxPositionRouter: string,
  gmxOrderBook: string,
  aggregatorTokenAddresses: string[] = [],
  gmxTokenAddresses: string[] = [],
  overrides: CallOverrides = {}
): Promise<GmxAdapterStorage> {
  if (aggregatorTokenAddresses.length === 0) {
    const filtered = GMX_TOKENS[chainId]
    aggregatorTokenAddresses = filtered.map(token => token.address)
  }
  if (gmxTokenAddresses.length === 0) {
    const filtered = GMX_TOKENS[chainId]
    gmxTokenAddresses = filtered.map(token => token.address)
  }
  const store = await reader.getGmxAdapterStorage(
    gmxPositionManager,
    gmxPositionRouter,
    gmxOrderBook,
    aggregatorTokenAddresses,
    gmxTokenAddresses,
    overrides
  )
  return _parseGmxAndAggregatorStorage(chainId, aggregatorTokenAddresses, gmxTokenAddresses, store)
}

function _parseGmxAndAggregatorStorage(
  chainId: number,
  aggregatorTokenAddresses: string[],
  gmxTokenAddresses: string[],
  store: AggregatorReader.GmxAdapterStorageStructOutput
): GmxAdapterStorage {
  return {
    gmx: {
      liquidationFeeUsd: fromGmxUsd(store.gmx.liquidationFeeUsd),
      marginFeeRate: GMX_POSITION_FEE_RATE,
      swapFeeRate: fromUnit(store.gmx.swapFeeBasisPoints, GMX_BASIS_POINTS_DECIMALS),
      stableSwapFeeRate: fromUnit(store.gmx.stableSwapFeeBasisPoints, GMX_BASIS_POINTS_DECIMALS),
      taxRate: fromUnit(store.gmx.taxBasisPoints, GMX_BASIS_POINTS_DECIMALS),
      stableTaxRate: fromUnit(store.gmx.stableTaxBasisPoints, GMX_BASIS_POINTS_DECIMALS),
      minExecutionFee: new BigNumber(store.gmx.minExecutionFee.toString()),
      minProfitTime: store.gmx.minProfitTime.toNumber(),
      totalTokenWeights: store.gmx.totalTokenWeights.toNumber(),
      usdgSupply: fromWei(store.gmx.usdgSupply),
      tokens: _parseGmxTokens(chainId, gmxTokenAddresses, store)
    },
    collaterals: _parseAdapterCollaterals(chainId, aggregatorTokenAddresses, store),
    shortFundingAssetId: CHAIN_ID_TO_AGGREGATOR_SHORT_FUNDING_ASSET_ID[chainId]
  }
}

function _parseGmxTokens(
  chainId: number,
  gmxTokenAddresses: string[],
  store: AggregatorReader.GmxAdapterStorageStructOutput
): { [lowerCaseTokenAddress: string]: GmxTokenInfo } {
  const ret: { [lowerCaseTokenAddress: string]: GmxTokenInfo } = {}
  if (gmxTokenAddresses.length !== store.gmx.tokens.length) {
    throw new BugError(`Bug: invalid gmxTokens length. ${gmxTokenAddresses.length} vs ${store.gmx.tokens.length}`)
  }
  // parse gmx tokens
  for (let i = 0; i < gmxTokenAddresses.length; i++) {
    const tokenAddress = gmxTokenAddresses[i].toLowerCase()
    const config = GMX_TOKENS[chainId].find(conf => conf.address.toLowerCase() === tokenAddress)
    if (!config) {
      throw new InvalidArgumentError(`unknown gmx token ${tokenAddress}`)
    }
    const storeToken = store.gmx.tokens[i]
    let token: GmxTokenInfo = {
      // config
      config,
      minProfit: fromUnit(storeToken.minProfit, GMX_BASIS_POINTS_DECIMALS),
      weight: storeToken.weight.toNumber(),
      maxUsdgAmounts: fromWei(storeToken.maxUsdgAmounts),
      maxGlobalShortSizeUsd: fromGmxUsd(storeToken.maxGlobalShortSize),
      maxGlobalLongSizeUsd: fromGmxUsd(storeToken.maxGlobalLongSize),

      // state
      poolAmount: fromUnit(storeToken.poolAmount, config.decimals),
      reservedAmount: fromUnit(storeToken.reservedAmount, config.decimals),
      bufferAmounts: fromUnit(storeToken.bufferAmounts, config.decimals),
      usdgAmount: fromWei(storeToken.usdgAmount),
      redemptionAmount: fromWei(storeToken.redemptionAmount),
      globalShortSizeUsd: fromGmxUsd(storeToken.globalShortSize),
      guaranteedUsd: fromGmxUsd(storeToken.guaranteedUsd),
      contractMinPrice: fromGmxUsd(storeToken.contractMinPrice),
      contractMaxPrice: fromGmxUsd(storeToken.contractMaxPrice),
      fundingRate: fromUnit(storeToken.fundingRate, GMX_FUNDING_RATE_DECIMALS),
      cumulativeFundingRate: fromUnit(storeToken.cumulativeFundingRate, GMX_FUNDING_RATE_DECIMALS),

      // computed
      availableAmount: _0,
      availableUsd: _0,
      maxAvailableShortUsd: _0,
      maxAvailableLongUsd: _0,
      maxLongCapacityUsd: _0
    }

    // computed
    token.availableAmount = token.poolAmount.minus(token.reservedAmount)
    token.maxAvailableShortUsd = new BigNumber(0)
    if (token.maxGlobalShortSizeUsd.gt(0)) {
      if (token.maxGlobalShortSizeUsd.gt(token.globalShortSizeUsd)) {
        token.maxAvailableShortUsd = token.maxGlobalShortSizeUsd.minus(token.globalShortSizeUsd)
      }
    }

    token.availableUsd = token.config.isStable
      ? token.poolAmount.times(token.contractMinPrice)
      : token.availableAmount.times(token.contractMinPrice)

    token.maxAvailableLongUsd = new BigNumber(0)
    if (token.maxGlobalLongSizeUsd.gt(0)) {
      if (token.maxGlobalLongSizeUsd.gt(token.guaranteedUsd)) {
        const remainingLongSizeUsd = token.maxGlobalLongSizeUsd.minus(token.guaranteedUsd)
        token.maxAvailableLongUsd = remainingLongSizeUsd.lt(token.availableUsd)
          ? remainingLongSizeUsd
          : token.availableUsd
      }
    } else {
      token.maxAvailableLongUsd = token.availableUsd
    }

    token.maxLongCapacityUsd =
      token.maxGlobalLongSizeUsd.gt(0) && token.maxGlobalLongSizeUsd.lt(token.availableUsd.plus(token.guaranteedUsd))
        ? token.maxGlobalLongSizeUsd
        : token.availableUsd.plus(token.guaranteedUsd)

    ret[tokenAddress] = token
  }
  return ret
}

function _parseAdapterCollaterals(
  chainId: number,
  aggregatorTokenAddresses: string[],
  store: AggregatorReader.GmxAdapterStorageStructOutput
): { [lowerCaseTokenAddress: string]: AggregatorCollateral } {
  const ret: { [lowerCaseTokenAddress: string]: AggregatorCollateral } = {}
  for (let i = 0; i < aggregatorTokenAddresses.length; i++) {
    const tokenAddress = aggregatorTokenAddresses[i].toLowerCase()
    const aggregatorToken = store.collaterals[i]
    const gmxCollateral = GMX_TOKENS[chainId].find(conf => conf.address.toLowerCase() === tokenAddress)
    if (!gmxCollateral) {
      throw new Error(`missing gmxCollateral[${tokenAddress}]`)
    }
    const token: AggregatorCollateral = {
      boostFeeRate: fromRate(aggregatorToken.boostFeeRate.toNumber()),
      initialMarginRate: fromRate(aggregatorToken.initialMarginRate.toNumber()),
      maintenanceMarginRate: fromRate(aggregatorToken.maintenanceMarginRate.toNumber()),
      liquidationFeeRate: fromRate(aggregatorToken.liquidationFeeRate.toNumber()),
      totalBorrow: fromUnit(aggregatorToken.totalBorrow, gmxCollateral.decimals),
      borrowLimit: fromUnit(aggregatorToken.borrowLimit, gmxCollateral.decimals)
    }
    ret[tokenAddress] = token
  }
  return ret
}

export async function getAggregatorPositionsAndOrders(
  reader: AggregatorReader,
  chainId: number,
  gmxPositionRouter: string,
  gmxOrderBook: string,
  account: string,
  overrides: CallOverrides = {}
): Promise<{
  subAccounts: AggregatorSubAccount[]
}> {
  const store = await reader.getAggregatorSubAccountsOfAccount(gmxPositionRouter, gmxOrderBook, account, overrides)
  return {
    subAccounts: _parseGmxAdapterSubAccounts(account, chainId, store)
  }
}

function _parseGmxAdapterSubAccounts(
  accountAddress: string,
  chainId: number,
  store: AggregatorReader.AggregatorSubAccountStructOutput[]
): AggregatorSubAccount[] {
  const ret: AggregatorSubAccount[] = []
  for (let i of store) {
    const gmxCollateral = GMX_TOKENS[chainId].find(
      conf => conf.address.toLowerCase() === i.collateralAddress.toLowerCase()
    )
    if (!gmxCollateral) {
      throw new Error(`missing gmxCollateral[${i.collateralAddress}]`)
    }
    const sub: AggregatorSubAccount = {
      // key
      proxyAddress: i.proxyAddress,
      projectId: i.projectId.toNumber() as AggregatorProjectId,
      account: accountAddress,
      collateralTokenAddress: i.collateralAddress,
      assetTokenAddress: i.assetAddress,
      isLong: i.isLong,

      // store
      isLiquidating: i.isLiquidating,
      cumulativeDebt: fromUnit(i.cumulativeDebt, gmxCollateral.decimals),
      cumulativeFee: fromUnit(i.cumulativeFee, gmxCollateral.decimals),
      debtEntryFunding: fromWei(i.debtEntryFunding),
      proxyCollateralBalance: fromUnit(i.proxyCollateralBalance, gmxCollateral.decimals),
      proxyEthBalance: fromWei(i.proxyEthBalance),

      // gmx
      gmx: _parseGmxCoreAccount(i),
      gmxOrders: _parseGmxAdapterOrder(accountAddress, chainId, i)
    }
    ret.push(sub)
  }
  return ret
}

function _parseGmxCoreAccount(store: AggregatorReader.AggregatorSubAccountStructOutput): GmxCoreAccount {
  return {
    collateralTokenAddress: store.collateralAddress,
    assetTokenAddress: store.assetAddress,
    isLong: store.isLong,
    sizeUsd: fromGmxUsd(store.gmx.sizeUsd),
    collateralUsd: fromGmxUsd(store.gmx.collateralUsd),
    lastIncreasedTime: store.gmx.lastIncreasedTime.toNumber(),
    entryPrice: fromGmxUsd(store.gmx.entryPrice),
    entryFundingRate: fromUnit(store.gmx.entryFundingRate, GMX_FUNDING_RATE_DECIMALS)
  }
}

function _parseGmxAdapterOrder(
  accountAddress: string,
  chainId: number,
  store: AggregatorReader.AggregatorSubAccountStructOutput
): GmxAdapterOrder[] {
  const ret: GmxAdapterOrder[] = []
  for (let i of store.gmxOrders) {
    const collateralAddress = store.collateralAddress.toLowerCase()
    const gmxCollateral = GMX_TOKENS[chainId].find(conf => conf.address.toLowerCase() === collateralAddress)
    if (!gmxCollateral) {
      throw new InvalidArgumentError(`unknown gmx token ${collateralAddress}`)
    }
    const { category, receiver, gmxOrderIndex, borrow, placeOrderTime } = decodeGmxAdapterOrderHistoryKey(
      i.orderHistoryKey,
      gmxCollateral
    )
    ret.push({
      orderHistoryKey: i.orderHistoryKey,
      // key
      account: accountAddress,
      collateralToken: store.collateralAddress,
      indexToken: store.assetAddress,
      isLong: store.isLong,
      // aggregator order
      category,
      receiver,
      gmxOrderIndex,
      borrow,
      placeOrderTime,
      // gmx order
      isFillOrCancel: i.isFillOrCancel,
      amountIn: fromUnit(i.amountIn, gmxCollateral.decimals),
      collateralDeltaUsd: fromGmxUsd(i.collateralDeltaUsd),
      sizeDeltaUsd: fromGmxUsd(i.sizeDeltaUsd),
      triggerPrice: fromGmxUsd(i.triggerPrice),
      triggerAboveThreshold: i.triggerAboveThreshold,
      slOrderHistoryKey: i.slOrderHistoryKey,
      tpOrderHistoryKey: i.tpOrderHistoryKey
    })
  }
  return ret
}

//            252          248                184          88           0
// +------------+------------+------------------+-----------+-----------+
// | category 4 | receiver 4 | gmxOrderIndex 64 | borrow 96 |  time 88  |
// +------------+------------+------------------+-----------+-----------+
export function decodeGmxAdapterOrderHistoryKey(
  key: BytesLike | Hexable,
  gmxCollateral: GmxTokenConfig
): {
  category: AggregatorOrderCategory
  receiver: GmxAdapterOrderReceiver
  gmxOrderIndex: number
  borrow: BigNumber
  placeOrderTime: number
} {
  const raw = ethers.utils.arrayify(key)
  if (raw.length !== 32) {
    throw new Error(`unrecognized gmxAggregatorOrderHistoryKey: ${key}`)
  }
  return {
    category: (raw[0] >> 4) as AggregatorOrderCategory,
    receiver: (raw[0] & 0xf) as GmxAdapterOrderReceiver,
    gmxOrderIndex: new BigNumber(hexlify(raw.subarray(1, 1 + 8))).toNumber(),
    borrow: new BigNumber(hexlify(raw.subarray(9, 9 + 12))).shiftedBy(-gmxCollateral.decimals),
    placeOrderTime: new BigNumber(hexlify(raw.subarray(21, 21 + 11))).toNumber()
  }
}
