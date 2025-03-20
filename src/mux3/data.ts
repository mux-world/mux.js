import { BytesLike, ethers } from 'ethers'
import { arrayify, Hexable, hexlify } from 'ethers/lib/utils'
import { Mux3Order, Mux3Storage, Mux3OrderPayload } from './types'
import { OrderDataStructOutput } from '../abi/mux3/OrderBook'
import { Mux3OrderType, Mux3PositionOrderFlags } from './constants'
import { fromUnit, fromWei } from '../data'
import { DECIMALS } from '../constants'

// contracts format
// |----- 160 -----|------ 96 ------|
// | user address  | position index |
export function encodeMux3RawPositionId(account: BytesLike | Hexable, index: number | ethers.BigNumber): string {
  return hexlify(ethers.utils.solidityPack(['address', 'uint96'], [account, index]))
}

export function decodeMux3RawPositionId(
  positionId: BytesLike | Hexable
): {
  account: string
  rawIndex: ethers.BigNumber
} {
  const bytes = arrayify(positionId)
  const account = hexlify(bytes.slice(0, 20))
  const rawIndex = ethers.BigNumber.from(hexlify(bytes.slice(20, 32)))
  return { account, rawIndex }
}

// UI encode more info into rawIndex
// |----- 160 -----|-------- 48 -------|----- 48 ------|
// | user address  | collateral prefix | market prefix |
export function encodeMux3PositionId(
  account: BytesLike | Hexable,
  collateralToken: BytesLike | Hexable,
  marketId: BytesLike | Hexable
): string {
  const collateralPrefix = hexlify(arrayify(collateralToken).slice(0, 6))
  const marketPrefix = hexlify(arrayify(marketId).slice(0, 6))
  return hexlify(ethers.utils.solidityPack(['address', 'uint48', 'uint48'], [account, collateralPrefix, marketPrefix]))
}

export function decodeMux3PositionId(
  positionId: BytesLike | Hexable
): {
  account: string
  collateralPrefix: string
  marketPrefix: string
} {
  const bytes = arrayify(positionId)
  const account = hexlify(bytes.slice(0, 20))
  const collateralPrefix = hexlify(bytes.slice(20, 26))
  const marketPrefix = hexlify(bytes.slice(26, 32))
  return { account, collateralPrefix, marketPrefix }
}

export function isMux3CrossMargin(positionId: string) {
  try {
    const { rawIndex } = decodeMux3RawPositionId(positionId)
    return rawIndex?.toString() === '0'
  } catch (e) {
    throw new Error(`invalid mux3 positionId: ${positionId}`)
  }
}

export function parseMux3Order(a: OrderDataStructOutput, chainStorage: Mux3Storage): Mux3Order {
  return {
    account: a.account,
    orderId: a.id.toNumber(),
    orderType: a.orderType as Mux3OrderType,
    version: a.version,
    placeOrderTime: a.placeOrderTime.toNumber(),
    payload: a.payload, // decode me according to orderType
    ...parseMux3OrderPayload(a.payload, a.orderType as Mux3OrderType, chainStorage)
  }
}

export function parseMux3OrderPayload(
  payload: string,
  orderType: Mux3OrderType,
  chainStorage: Mux3Storage
): Mux3OrderPayload {
  if (orderType === Mux3OrderType.Position) {
    const [
      positionId,
      marketId,
      size,
      flags,
      limitPrice,
      expiration,
      lastConsumedToken,
      collateralToken,
      collateralAmount,
      withdrawUsd,
      withdrawSwapToken,
      withdrawSwapSlippage,
      tpPriceDiff,
      slPriceDiff,
      tpslExpiration,
      tpslFlags,
      tpslWithdrawSwapToken,
      tpslWithdrawSwapSlippage
    ] = ethers.utils.defaultAbiCoder.decode(
      [
        'bytes32', // positionId
        'bytes32', // marketId
        'uint256', // size
        'uint256', // flags
        'uint256', // limitPrice
        'uint64', // expiration
        'address', // lastConsumedToken
        'address', // collateralToken
        'uint256', // collateralAmount
        'uint256', // withdrawUsd
        'address', // withdrawSwapToken
        'uint256', // withdrawSwapSlippage
        'uint256', // tpPriceDiff
        'uint256', // slPriceDiff
        'uint64', // tpslExpiration
        'uint256', // tpslFlags
        'address', // tpslWithdrawSwapToken
        'uint256' // tpslWithdrawSwapSlippage
      ],
      payload
    )

    let collateralDecimals = 0
    if (collateralToken !== ethers.constants.AddressZero) {
      const collateral = chainStorage.collaterals[collateralToken.toLowerCase()]
      if (!collateral) {
        throw new Error(`collateral not found: ${collateralToken}`)
      }
      collateralDecimals = collateral.decimals
    }

    return {
      positionOrder: {
        positionId,
        marketId,
        size: fromWei(size),
        flags: flags.toNumber() as Mux3PositionOrderFlags,
        limitPrice: fromWei(limitPrice),
        expiration: expiration.toNumber(),
        lastConsumedToken: lastConsumedToken.toLowerCase(),
        collateralToken: collateralToken.toLowerCase(),
        collateralAmount: fromUnit(collateralAmount, collateralDecimals),
        withdrawUsd: fromWei(withdrawUsd),
        withdrawSwapToken: withdrawSwapToken.toLowerCase(),
        withdrawSwapSlippage: fromWei(withdrawSwapSlippage),
        tpPriceDiff: fromWei(tpPriceDiff),
        slPriceDiff: fromWei(slPriceDiff),
        tpslExpiration: tpslExpiration.toNumber(),
        tpslFlags: tpslFlags.toNumber() as Mux3PositionOrderFlags,
        tpslWithdrawSwapToken: tpslWithdrawSwapToken.toLowerCase(),
        tpslWithdrawSwapSlippage: fromWei(tpslWithdrawSwapSlippage)
      }
    }
  } else if (orderType === Mux3OrderType.Liquidity) {
    const [poolAddress, token, rawAmount, isAdding, isUnwrapWeth] = ethers.utils.defaultAbiCoder.decode(
      [
        'address', // poolAddress
        'address', // token
        'uint256', // rawAmount
        'bool', // isAdding
        'bool' // isUnwrapWeth
      ],
      payload
    )

    let collateralDecimals = DECIMALS
    if (isAdding) {
      const pool = chainStorage.pools[poolAddress.toLowerCase()]
      if (!pool) {
        throw new Error(`pool not found: ${poolAddress}`)
      }
      const collateral = chainStorage.collaterals[pool.collateralToken.toLowerCase()]
      if (!collateral) {
        throw new Error(`collateral not found: ${pool.collateralToken}`)
      }
      collateralDecimals = collateral.decimals
    }

    return {
      liquidityOrder: {
        poolAddress: poolAddress.toLowerCase(),
        token: token.toLowerCase(),
        rawAmount: fromUnit(rawAmount, collateralDecimals),
        isAdding,
        isUnwrapWeth
      }
    }
  } else if (orderType === Mux3OrderType.Withdrawal) {
    const [positionId, tokenAddress, rawAmount, isUnwrapWeth] = ethers.utils.defaultAbiCoder.decode(
      [
        'bytes32', // positionId
        'address', // tokenAddress
        'uint256', // rawAmount
        'bool' // isUnwrapWeth
      ],
      payload
    )

    const collateral = chainStorage.collaterals[(tokenAddress as string).toLowerCase()]
    if (!collateral) {
      throw new Error(`collateral not found: ${tokenAddress}`)
    }

    return {
      withdrawOrder: {
        positionId,
        rawAmount: fromUnit(rawAmount, collateral.decimals),
        tokenAddress: tokenAddress.toLowerCase(),
        isUnwrapWeth
      }
    }
  } else if (orderType === Mux3OrderType.Adl) {
    const [positionId, size, price, profitToken, isUnwrapWeth] = ethers.utils.defaultAbiCoder.decode(
      [
        'bytes32', // positionId
        'uint256', // size
        'uint256', // price
        'address', // profitToken
        'bool' // isUnwrapWeth
      ],
      payload
    )

    return {
      adlOrder: {
        positionId,
        size: fromWei(size),
        price: fromWei(price),
        profitToken: profitToken.toLowerCase(),
        isUnwrapWeth
      }
    }
  }
  return {}
}
