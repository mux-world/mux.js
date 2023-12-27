import BigNumber from 'bignumber.js'
import { GmxTokenConfig } from './types'

export const CHAIN_ID_TO_AGGREGATOR_READER_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x697af744dCe3229cd43a16554B67267686FaDdAc'
}

export const CHAIN_ID_TO_AGGREGATOR_FACTORY_ADDRESS: { [chainID: number]: string } = {
  // arb1
  42161: '0x2ff2f1D9826ae2410979ae19B88c361073Ab0918'
}

export const CHAIN_ID_TO_AGGREGATOR_SHORT_FUNDING_ASSET_ID: { [chainID: number]: number } = {
  42161: 3
}

export const GMX_BASIS_POINTS_DECIMALS = 4
export const GMX_FUNDING_RATE_DECIMALS = 6
export const GMX_PRICE_DECIMALS = 30
export const GMX_MAX_LEVERAGE = 100
export const GMX_CORE_INITIAL_LEVERAGE = new BigNumber('30')
export const GMX_AGGREGATOR_BORROW_RATE = new BigNumber('0.005')

// should be gmx Timelock.marginFeeBasisPoints (instead of Vault.marginFeeBasisPoints). we
// override it just like their UI
export const GMX_POSITION_FEE_RATE = new BigNumber('0.0010')

export const GMX_TOKENS: { [chainID: number]: GmxTokenConfig[] } = {
  // arb1
  42161: [
    {
      symbol: 'ETH',
      decimals: 18,
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      isAsset: true,
      isShortable: true,
      isStable: false,
      isNative: true,
      muxAssetId: 3
    },
    {
      symbol: 'BTC',
      decimals: 8,
      address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      isAsset: true,
      isShortable: true,
      isStable: false,
      isNative: false,
      muxAssetId: 4
    },
    {
      symbol: 'USDC.e',
      decimals: 6,
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      isAsset: false,
      isShortable: false,
      isStable: true,
      isNative: false,
      muxAssetId: 0
    },
    {
      symbol: 'USDC',
      decimals: 6,
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      isAsset: false,
      isShortable: false,
      isStable: true,
      isNative: false,
      muxAssetId: 11
    },
    {
      symbol: 'USDT',
      decimals: 6,
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      isAsset: false,
      isShortable: false,
      isStable: true,
      isNative: false,
      muxAssetId: 1
    },
    {
      symbol: 'DAI',
      decimals: 18,
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      isAsset: false,
      isShortable: false,
      isStable: true,
      isNative: false,
      muxAssetId: 2
    },
    {
      symbol: 'LINK',
      decimals: 18,
      address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      isAsset: true,
      isStable: false,
      isShortable: true,
      isNative: false,
      muxAssetId: undefined
    },
    {
      symbol: 'UNI',
      decimals: 18,
      address: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
      isAsset: true,
      isStable: false,
      isShortable: true,
      isNative: false,
      muxAssetId: undefined
    }
  ]
}
