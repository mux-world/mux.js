import BigNumber from 'bignumber.js'
import { _0, _1 } from '../../src/constants'
import { extendExpect } from '../helper'
import {
  computeGmxCoreAccount,
  computeGmxCoreDecrease,
  computeGmxCoreIncrease,
  getGmxCoreTargetUsdgAmount,
  getGmxCoreTokenFeeRate,
  computeGmxCoreSwap
} from '../../src/aggregator/gmxCore'
import { GmxCoreAccount, GmxCoreStorage, GmxTokenConfig } from '../../src/aggregator/types'

extendExpect()

const wbtc = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
const weth = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const usdc = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
const uni = '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0'

export const gmxTokenConfigs: GmxTokenConfig[] = [
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
    symbol: 'USDC',
    decimals: 6,
    address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    isAsset: false,
    isShortable: false,
    isStable: true,
    isNative: false,
    muxAssetId: 0
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
    symbol: 'UNI',
    decimals: 18,
    address: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
    isAsset: true,
    isShortable: true,
    isStable: false,
    isNative: false,
    muxAssetId: undefined
  }
]

// this case is based on arbitrum block number 30928378
export const gmxStorage1: GmxCoreStorage = {
  liquidationFeeUsd: new BigNumber('5'),
  marginFeeRate: new BigNumber('0.0010'),
  swapFeeRate: new BigNumber('0.0030'),
  stableSwapFeeRate: new BigNumber('0.0001'),
  taxRate: new BigNumber('0.0050'),
  stableTaxRate: new BigNumber('0.0005'),
  minExecutionFee: new BigNumber('100000000000000'),
  minProfitTime: 10800,
  totalTokenWeights: 100001,
  usdgSupply: new BigNumber('450672699.269670380741442456'),
  tokens: {
    [weth]: {
      config: gmxTokenConfigs[0],
      poolAmount: new BigNumber('90152.419324530793621652'),
      reservedAmount: new BigNumber('15336.939391773054366155'),
      usdgAmount: new BigNumber('117183799.420481408041866834'),
      maxUsdgAmounts: new BigNumber('120000000'),
      weight: 33000,
      globalShortSizeUsd: new BigNumber('38313428.27015887908245679853294358464'),
      maxGlobalShortSizeUsd: new BigNumber('45000000'),
      maxGlobalLongSizeUsd: new BigNumber('35000000'),
      contractMinPrice: new BigNumber('1295.9'),
      contractMaxPrice: new BigNumber('1295.9'),
      guaranteedUsd: new BigNumber('16988659.265153403287771047904978139301'),
      redemptionAmount: new BigNumber('0.000771664480283972'),
      fundingRate: new BigNumber('0.000017'),
      cumulativeFundingRate: new BigNumber('0.329642'),
      availableAmount: new BigNumber('74815.479932757739255497'),
      availableUsd: new BigNumber('96953380.4448607543011985623'),
      maxAvailableShortUsd: new BigNumber('6686571.72984112091754320146705641536'),
      maxAvailableLongUsd: new BigNumber('18011340.734846596712228952095021860699'),
      maxLongCapacityUsd: new BigNumber('35000000'),
      minProfit: new BigNumber('0'),
      bufferAmounts: new BigNumber('42000')
    },
    [wbtc]: {
      config: gmxTokenConfigs[1],
      poolAmount: new BigNumber('3483.39345364'),
      reservedAmount: new BigNumber('576.74098448'),
      maxUsdgAmounts: new BigNumber('65000000'),
      usdgAmount: new BigNumber('67618459.999763814003068736'),
      weight: 20000,
      globalShortSizeUsd: new BigNumber('9896657.1147779956259402604879153664'),
      maxGlobalShortSizeUsd: new BigNumber('35000000'),
      maxGlobalLongSizeUsd: new BigNumber('35000000'),
      contractMinPrice: new BigNumber('19201'),
      contractMaxPrice: new BigNumber('19201'),
      guaranteedUsd: new BigNumber('10224621.461746700670265015074307155243'),
      redemptionAmount: new BigNumber('0.00005208'),
      fundingRate: new BigNumber('0.000016'),
      cumulativeFundingRate: new BigNumber('0.255642'),
      availableAmount: new BigNumber('2906.65246916'),
      availableUsd: new BigNumber('55810634.06034116'),
      maxAvailableShortUsd: new BigNumber('25103342.8852220043740597395120846336'),
      maxAvailableLongUsd: new BigNumber('24775378.538253299329734984925692844757'),
      maxLongCapacityUsd: new BigNumber('35000000'),
      minProfit: new BigNumber('0'),
      bufferAmounts: new BigNumber('1500')
    },
    [usdc]: {
      config: gmxTokenConfigs[2],
      minProfit: new BigNumber('0'),
      bufferAmounts: new BigNumber('95000000'),
      maxUsdgAmounts: new BigNumber('260000000'),
      poolAmount: new BigNumber('161812535.632363'),
      reservedAmount: new BigNumber('40258588.56764'),
      usdgAmount: new BigNumber('162261961.7884115749847815'),
      weight: 36000,
      globalShortSizeUsd: new BigNumber('0'),
      maxGlobalShortSizeUsd: new BigNumber('0'),
      maxGlobalLongSizeUsd: new BigNumber('0'),
      contractMinPrice: new BigNumber('1'),
      contractMaxPrice: new BigNumber('1'),
      guaranteedUsd: new BigNumber('0'),
      redemptionAmount: new BigNumber('1'),
      fundingRate: new BigNumber('0.000024'),
      cumulativeFundingRate: new BigNumber('0.212231'),
      availableAmount: new BigNumber('121553947.064723'),
      availableUsd: new BigNumber('161812535.632363'),
      maxAvailableShortUsd: new BigNumber('0'),
      maxAvailableLongUsd: new BigNumber('161812535.632363'),
      maxLongCapacityUsd: new BigNumber('161812535.632363')
    },
    [uni]: {
      config: gmxTokenConfigs[5],
      minProfit: new BigNumber('0'),
      bufferAmounts: new BigNumber('20000'),
      maxUsdgAmounts: new BigNumber('2500000'),
      poolAmount: new BigNumber('378463.283077228175177063'),
      reservedAmount: new BigNumber('7780.905800073549572752'),
      usdgAmount: new BigNumber('2443723.884871300109952119'),
      weight: 1000,
      globalShortSizeUsd: new BigNumber('41832.9202892207026833487291954'),
      maxGlobalShortSizeUsd: new BigNumber('50000'),
      maxGlobalLongSizeUsd: new BigNumber('50000'),
      contractMinPrice: new BigNumber('6.389196'),
      contractMaxPrice: new BigNumber('6.414804'),
      guaranteedUsd: new BigNumber('40633.997885071480825984961774754432'),
      redemptionAmount: new BigNumber('0.155889408312397385'),
      fundingRate: new BigNumber('0.000002'),
      cumulativeFundingRate: new BigNumber('0.094548'),
      availableAmount: new BigNumber('370682.377277154625604311'),
      availableUsd: new BigNumber('2368362.362169687225292561423956'),
      maxAvailableShortUsd: new BigNumber('8167.0797107792973166512708046'),
      maxAvailableLongUsd: new BigNumber('9366.002114928519174015038225245568'),
      maxLongCapacityUsd: new BigNumber('50000')
    }
  }
}

const longPos0: GmxCoreAccount = {
  collateralTokenAddress: wbtc,
  assetTokenAddress: wbtc,
  isLong: true,
  sizeUsd: _0,
  collateralUsd: _0,
  lastIncreasedTime: 0,
  entryPrice: _0,
  entryFundingRate: _0
}

const shortPos0: GmxCoreAccount = {
  collateralTokenAddress: usdc,
  assetTokenAddress: wbtc,
  isLong: false,
  sizeUsd: _0,
  collateralUsd: _0,
  lastIncreasedTime: 0,
  entryPrice: _0,
  entryFundingRate: _0
}

describe('aggregator:gmxCore', () => {
  it('core open long, buyPrice != markPrice', () => {
    const storage1 = {
      ...gmxStorage1,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      longPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.255642'))
    expect(after.afterTrade.computed.leverage).toBeBigNumber(new BigNumber('9.08173562058526740666'))
    expect(after.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('-2.19512195121951219512195121951')) // (40000 - 41000) / 41000 * 90

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('45100'),
          contractMaxPrice: new BigNumber('47100')
        }
      }
    }
    const after2 = computeGmxCoreIncrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('46100'),
      new BigNumber('10'),
      new BigNumber('0')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('100'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.90')) // 10 - 90 * 0.1% - 10 * 0.1%
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('43211.009174311926605504587155963302'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.255642'))
    expect(after2.afterTrade.computed.leverage).toApproximate(new BigNumber('10.1010101010101010101'))
  })

  it('core open short, buyPrice < averagePrice - minProfitBasisPoints', () => {
    const storage1 = {
      ...gmxStorage1,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('40000'),
          minProfit: new BigNumber('0.0075')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      shortPos0,
      new BigNumber('40000'),
      new BigNumber('90'),
      new BigNumber('50')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('49.91')) // 50 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('40000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.212231'))
    expect(after.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('0'))

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('39700'),
          contractMaxPrice: new BigNumber('39700')
        }
      }
    }
    const after2 = computeGmxCoreIncrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('39700'),
      new BigNumber('10'),
      new BigNumber('0')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('100'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('49.9'))
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('39700'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.212231'))

    const computed2 = computeGmxCoreAccount(storage1, after2.afterTrade.gmxAccount, new BigNumber('39000'))
    expect(computed2.computed.pnlUsd).toApproximate(new BigNumber('1.763224181360201511335012594458')) // (39700 - 39000) / 39700 * 100 => 1.7632
  })

  it('core close long', () => {
    const storage1 = {
      ...gmxStorage1,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      longPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.255642'))

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('45100'),
          contractMaxPrice: new BigNumber('47100')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('46100'),
      new BigNumber('90'),
      new BigNumber('4')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.computed.leverage).toApproximate(new BigNumber('0'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('18.82')) // 0.00039957 * 47100 => 18.82 USD
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('0.00039957')) // / 47100
    expect(after2.feeUsd).toApproximate(new BigNumber('0.09')) // 0.00000191 * 47100 => ~0.09 USD
  })

  it('core close long with loss', () => {
    const storage1 = {
      ...gmxStorage1,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      longPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.255642'))

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('39000'),
          contractMaxPrice: new BigNumber('39000')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('39000'),
      new BigNumber('90'),
      new BigNumber('4')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.computed.leverage).toApproximate(new BigNumber('0'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('5.4297560975609756097560975610')) // 10 + (39000 - 41000) 90 / 41000 - 90 * 0.001 * 2
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('0.00013922')) // / 39000
    expect(after2.feeUsd).toApproximate(new BigNumber('0.09')) // 0.00000191 * 47100 => ~0.09 USD
  })

  it('core close short', () => {
    const storage1 = {
      ...gmxStorage1,
      minProfitTime: 0,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000'),
          minProfit: new BigNumber('0.0075')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      shortPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('40000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.212231'))
    expect(after.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('-2.25')) // (40000 - 41000) * 90 / 40000

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('36000'),
          contractMaxPrice: new BigNumber('36000')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('36000'),
      new BigNumber('90'),
      new BigNumber('3')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.computed.leverage).toApproximate(new BigNumber('0'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('18.82')) // 10 + (40000 - 36000) * 90 / 40000 - 90 * 0.1% * 2
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('18.82')) // / 1
    expect(after2.feeUsd).toApproximate(new BigNumber('0.09'))
  })

  it('core close short with loss', () => {
    const storage1 = {
      ...gmxStorage1,
      minProfitTime: 0,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000'),
          minProfit: new BigNumber('0.0075')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      shortPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('40000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.212231'))
    expect(after.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('-2.25')) // (40000 - 41000) * 90 / 40000

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('41000'),
          contractMaxPrice: new BigNumber('41000')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('41000'),
      new BigNumber('90'),
      new BigNumber('3')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('0'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0'))
    expect(after2.afterTrade.computed.leverage).toApproximate(new BigNumber('0'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('7.57')) // 10 + (40000 - 41000) * 90 / 40000 - 90 * 0.1% * 2
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('7.57')) // / 1
    expect(after2.feeUsd).toApproximate(new BigNumber('0.09'))
  })

  it('decrease close long', () => {
    const storage1 = {
      ...gmxStorage1,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      longPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toApproximate(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toApproximate(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toApproximate(new BigNumber('0.255642'))

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('45100'),
          contractMaxPrice: new BigNumber('47100')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('46100'),
      new BigNumber('50'),
      new BigNumber('3')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('40'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('6.91')) // 9.91 - 3
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.255642'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('7.95')) // 3 + (45100 - 41000) * 50 / 41000 - 50 * 0.001
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('0.00016878')) // 7.95 / 47100
    expect(after2.feeUsd).toApproximate(new BigNumber('0.05'))
  })

  it('decrease close long with loss', () => {
    const storage1 = {
      ...gmxStorage1,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      longPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.255642'))

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40590'),
          contractMaxPrice: new BigNumber('40790')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('40690'),
      new BigNumber('50'),
      new BigNumber('0')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('40'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toApproximate(new BigNumber('9.36'))
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.255642'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('0'))
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('0')) // / 40790
    expect(after2.feeUsd).toApproximate(new BigNumber('0.05'))

    const after3 = computeGmxCoreDecrease(
      storage2,
      after2.afterTrade.gmxAccount,
      new BigNumber('40690'),
      new BigNumber('40'),
      new BigNumber('0')
    )
    expect(after3.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('0'))
    expect(after3.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('0'))
    expect(after3.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('0'))
    expect(after3.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0'))
    expect(after3.usdOutAfterFee).toApproximate(new BigNumber('8.92'))
    expect(after3.collateralOutAfterFee).toApproximate(new BigNumber('0.00021868')) // / 40790
    expect(after3.feeUsd).toApproximate(new BigNumber('0.04'))
  })

  it('decrease close short', () => {
    const storage1 = {
      ...gmxStorage1,
      minProfitTime: 0,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000'),
          minProfit: new BigNumber('0.0075')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      shortPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('40000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.212231'))
    expect(after.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('-2.25')) // (40000 - 41000) * 90 / 40000

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('1'),
          contractMaxPrice: new BigNumber('1')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('1'),
      new BigNumber('50'),
      new BigNumber('3')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('40'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('6.91')) // 9.91 - 3
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('40000'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.212231'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('52.94875'))
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('52.94875')) // / 1
    expect(after2.feeUsd).toApproximate(new BigNumber('0.05'))
  })

  it('decrease close short with loss', () => {
    const storage1 = {
      ...gmxStorage1,
      minProfitTime: 0,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000'),
          minProfit: new BigNumber('0.0075')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      shortPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('40000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.212231'))
    expect(after.afterTrade.computed.pnlUsd).toApproximate(new BigNumber('-2.25')) // (40000 - 41000) * 90 / 40000

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('40400'),
          contractMaxPrice: new BigNumber('40400')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('40400'),
      new BigNumber('50'),
      new BigNumber('0')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('40'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toApproximate(new BigNumber('9.36')) // 9.91 - 0.5 (losses) - 0.05 (fees)
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('40000'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.212231'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('0'))
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('0')) // / 1
    expect(after2.feeUsd).toApproximate(new BigNumber('0.05'))

    const after3 = computeGmxCoreDecrease(
      storage2,
      after2.afterTrade.gmxAccount,
      new BigNumber('40400'),
      new BigNumber('40'),
      new BigNumber('0')
    )
    expect(after3.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('0'))
    expect(after3.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('0'))
    expect(after3.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('0'))
    expect(after3.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0'))
    expect(after3.usdOutAfterFee).toApproximate(new BigNumber('8.92'))
    expect(after3.collateralOutAfterFee).toApproximate(new BigNumber('8.92')) // / 1
    expect(after3.feeUsd).toApproximate(new BigNumber('0.04'))
  })

  it('getFee 29700, 29700', () => {
    // usdgAmount(bnb) is 29700, targetAmount(bnb) is 29700
    const storage1 = {
      ...gmxStorage1,
      usdgSupply: new BigNumber('29700'),
      totalTokenWeights: 10000,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('300'),
          contractMaxPrice: new BigNumber('300'),
          weight: 10000,
          usdgAmount: new BigNumber('29700')
        }
      }
    }
    const wethToken = storage1.tokens[wbtc]
    expect(getGmxCoreTargetUsdgAmount(storage1, wethToken)).toBeBigNumber(new BigNumber('29700'))
    const e = (delta: string, fee: string, tax: string, long: boolean, answer: string) => {
      expect(
        getGmxCoreTokenFeeRate(storage1, wethToken, new BigNumber(delta), new BigNumber(fee), new BigNumber(tax), long)
      ).toBeBigNumber(new BigNumber(answer))
    }
    e('1000', '0.0100', '0.0050', true, '0.0100')
    e('5000', '0.0100', '0.0050', true, '0.0104')
    e('1000', '0.0100', '0.0050', false, '0.0100')
    e('5000', '0.0100', '0.0050', false, '0.0104')
    e('1000', '0.0050', '0.0100', true, '0.0051')
    e('5000', '0.0050', '0.0100', true, '0.0058')
    e('1000', '0.0050', '0.0100', false, '0.0051')
    e('5000', '0.0050', '0.0100', false, '0.0058')
  })

  it('getFee 29700, 14850', () => {
    // usdgAmount is 29700, targetAmount(bnb) is 14850
    const storage1 = {
      ...gmxStorage1,
      usdgSupply: new BigNumber('29700'),
      totalTokenWeights: 20000,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('300'),
          contractMaxPrice: new BigNumber('300'),
          weight: 10000,
          usdgAmount: new BigNumber('29700')
        }
      }
    }
    const wethToken = storage1.tokens[wbtc]
    expect(getGmxCoreTargetUsdgAmount(storage1, wethToken)).toBeBigNumber(new BigNumber('14850'))
    const e = (delta: string, fee: string, tax: string, long: boolean, answer: string) => {
      expect(
        getGmxCoreTokenFeeRate(storage1, wethToken, new BigNumber(delta), new BigNumber(fee), new BigNumber(tax), long)
      ).toBeBigNumber(new BigNumber(answer))
    }
    // incrementing bnb has an increased fee, while reducing bnb has a decreased fee
    e('001000', '0.0100', '0.0050', true, '0.0150')
    e('005000', '0.0100', '0.0050', true, '0.0150')
    e('010000', '0.0100', '0.0050', true, '0.0150')
    e('020000', '0.0100', '0.0050', true, '0.0150')
    e('001000', '0.0100', '0.0050', false, '0.0050')
    e('005000', '0.0100', '0.0050', false, '0.0050')
    e('010000', '0.0100', '0.0050', false, '0.0050')
    e('020000', '0.0100', '0.0050', false, '0.0050')
    e('025000', '0.0100', '0.0050', false, '0.0050')
    e('100000', '0.0100', '0.0050', false, '0.0150')
  })

  it('getFee 29700, 37275', () => {
    // usdgAmount(bnb) is 29700, targetAmount(bnb) is 37275
    const storage1 = {
      ...gmxStorage1,
      usdgSupply: new BigNumber('49700'),
      totalTokenWeights: 40000,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('300'),
          contractMaxPrice: new BigNumber('300'),
          weight: 30000,
          usdgAmount: new BigNumber('29700')
        }
      }
    }
    const wethToken = storage1.tokens[wbtc]
    expect(getGmxCoreTargetUsdgAmount(storage1, wethToken)).toBeBigNumber(new BigNumber('37275'))
    const e = (delta: string, fee: string, tax: string, long: boolean, answer: string) => {
      expect(
        getGmxCoreTokenFeeRate(storage1, wethToken, new BigNumber(delta), new BigNumber(fee), new BigNumber(tax), long)
      ).toBeBigNumber(new BigNumber(answer))
    }
    // incrementing bnb has a decreased fee, while reducing bnb has an increased fee
    e('01000', '0.0100', '0.0050', true, '0.0090')
    e('05000', '0.0100', '0.0050', true, '0.0090')
    e('10000', '0.0100', '0.0050', true, '0.0090')
    e('01000', '0.0100', '0.0050', false, '0.0110')
    e('05000', '0.0100', '0.0050', false, '0.0113')
    e('10000', '0.0100', '0.0050', false, '0.0116')
  })

  it('getFee 89100, 36366', () => {
    // usdgAmount(bnb) is 89100, targetAmount(bnb) is 36366
    const storage1 = {
      ...gmxStorage1,
      usdgSupply: new BigNumber('109098'), // original: 109100
      totalTokenWeights: 15000,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          contractMinPrice: new BigNumber('300'),
          contractMaxPrice: new BigNumber('300'),
          weight: 5000,
          usdgAmount: new BigNumber('89100')
        }
      }
    }
    const wethToken = storage1.tokens[wbtc]
    expect(getGmxCoreTargetUsdgAmount(storage1, wethToken)).toBeBigNumber(new BigNumber('36366'))
    const e = (delta: string, fee: string, tax: string, long: boolean, answer: string) => {
      expect(
        getGmxCoreTokenFeeRate(storage1, wethToken, new BigNumber(delta), new BigNumber(fee), new BigNumber(tax), long)
      ).toBeBigNumber(new BigNumber(answer))
    }
    // incrementing bnb has an increased fee, while reducing bnb has a decreased fee
    e('01000', '0.01000', '0.0050', true, '0.0150')
    e('05000', '0.01000', '0.0050', true, '0.0150')
    e('10000', '0.01000', '0.0050', true, '0.0150')
    e('01000', '0.01000', '0.0050', false, '0.0028')
    e('05000', '0.01000', '0.0050', false, '0.0028')
    e('20000', '0.01000', '0.0050', false, '0.0028')
    e('50000', '0.01000', '0.0050', false, '0.0028')
    e('80000', '0.01000', '0.0050', false, '0.0028')
    e('01000', '0.00500', '0.0100', true, '0.0150')
    e('05000', '0.00500', '0.0100', true, '0.0150')
    e('10000', '0.00500', '0.0100', true, '0.0150')
    e('01000', '0.00500', '0.0100', false, '0.0000')
    e('05000', '0.00500', '0.0100', false, '0.0000')
    e('20000', '0.00500', '0.0100', false, '0.0000')
    e('50000', '0.00500', '0.0100', false, '0.0000')
  })

  it('funding', () => {
    const storage1 = {
      ...gmxStorage1,
      tokens: {
        ...gmxStorage1.tokens,
        [wbtc]: {
          ...gmxStorage1.tokens[wbtc],
          cumulativeFundingRate: new BigNumber('0'),
          contractMinPrice: new BigNumber('40000'),
          contractMaxPrice: new BigNumber('41000')
        }
      }
    }
    const after = computeGmxCoreIncrease(
      storage1,
      longPos0,
      new BigNumber('40500'),
      new BigNumber('90'),
      new BigNumber('10')
    )
    expect(after.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('90'))
    expect(after.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('9.91')) // 10 - 90 * 0.1%
    expect(after.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0'))

    const storage2 = {
      ...storage1,
      tokens: {
        ...storage1.tokens,
        [wbtc]: {
          ...storage1.tokens[wbtc],
          contractMinPrice: new BigNumber('45100'),
          contractMaxPrice: new BigNumber('47100')
        }
      }
    }
    const after2 = computeGmxCoreDecrease(
      storage2,
      after.afterTrade.gmxAccount,
      new BigNumber('46100'),
      new BigNumber('50'),
      new BigNumber('3')
    )
    expect(after2.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('40'))
    expect(after2.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('6.91')) // 9.91 - 3
    expect(after2.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after2.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0'))
    expect(after2.usdOutAfterFee).toApproximate(new BigNumber('7.95'))
    expect(after2.collateralOutAfterFee).toApproximate(new BigNumber('0.00016878')) // / 47100

    // increase time
    // funding fee usd = (0.000233 - 0) * 40 = 0.00932
    const storage3 = {
      ...storage2,
      tokens: {
        ...storage2.tokens,
        [wbtc]: {
          ...storage2.tokens[wbtc],
          cumulativeFundingRate: new BigNumber('0.000233'), // 233 / FUNDING_RATE_PRECISION(1000000)
          contractMinPrice: new BigNumber('45100'),
          contractMaxPrice: new BigNumber('47100')
        }
      }
    }
    const after3 = computeGmxCoreDecrease(
      storage3,
      after2.afterTrade.gmxAccount,
      new BigNumber('46100'),
      new BigNumber('0'),
      new BigNumber('1')
    )
    expect(after3.afterTrade.gmxAccount.sizeUsd).toBeBigNumber(new BigNumber('40'))
    expect(after3.afterTrade.gmxAccount.collateralUsd).toBeBigNumber(new BigNumber('5.91')) // 9.91 - 3 - 1
    expect(after3.afterTrade.gmxAccount.entryPrice).toApproximate(new BigNumber('41000'))
    expect(after3.afterTrade.gmxAccount.entryFundingRate).toBeBigNumber(new BigNumber('0.000233'))
    expect(after3.usdOutAfterFee).toApproximate(new BigNumber('0.99068')) // 1 - 0.00932
    expect(after3.collateralOutAfterFee).toApproximate(new BigNumber('0.00002103')) // / 47100
  })

  it('swap - hasDynamicFees = true', () => {
    const storage1 = {
      ...gmxStorage1,
      usdgSupply: new BigNumber('438600006.950096752412274049'),
      tokens: {
        ...gmxStorage1.tokens,
        [weth]: {
          ...gmxStorage1.tokens[weth],
          contractMinPrice: new BigNumber('1323.3'),
          contractMaxPrice: new BigNumber('1323.3'),
          usdgAmount: new BigNumber('114389740.669648261460798459')
        },
        [usdc]: {
          ...gmxStorage1.tokens[usdc],
          contractMinPrice: new BigNumber('1'),
          contractMaxPrice: new BigNumber('1'),
          usdgAmount: new BigNumber('155058666.456248951347459509')
        }
      }
    }
    const after = computeGmxCoreSwap(
      storage1,
      storage1.tokens[usdc],
      storage1.tokens[weth],
      new BigNumber('1'),
      null,
      null
    )
    expect(after.feeRate).toBeBigNumber(new BigNumber('0.004'))
    expect(after.toAmount).toBeBigNumber(new BigNumber('0.00075198'))
    expect(after.feeUsd).toApproximate(new BigNumber('0.003996366'))
  })
})
