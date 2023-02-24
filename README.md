# mux.js - MUX Protocol JavaScript API

## Install

```
npm install --save @mux-network/mux.js
```

## Tutorial

MUX currently supports Arbitrum, Avalanche, BSC and Fantom networks. The following code all uses Arbitrum in the examples.

**1. Connects to Arbitrum**

```js
import { JsonRpcProvider } from '@ethersproject/providers'

const provider = new JsonRpcProvider('https://arb1.arbitrum.io/rpc')
```

**2. List asset IDs and symbols**

```js
import { getReaderContract, getChainStorage } from '@mux-network/mux.js'

const reader = await getReaderContract(provider)
const chainStorage = await getChainStorage(reader)
for (let asset of chainStorage.assets) {
  console.log(`assetId: ${asset.id} symbol: ${asset.symbol} tokenAddress: ${asset.tokenAddress}`)
}
```

This returns

```
assetId: 0 symbol: USDC tokenAddress: 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8
assetId: 1 symbol: USDT tokenAddress: 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9
assetId: 2 symbol: DAI tokenAddress: 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1
assetId: 3 symbol: ETH tokenAddress: 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
assetId: 4 symbol: BTC tokenAddress: 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f
...
```

**3. Calculate a subAccountId**

A sub-account is a segregated account nested under an ETH address; each { address, collateral asset, underlying asset, long/short } pair is a sub-account. The following example calculates a sub-account for long ETH, with USDC as collateral.

```js
import { encodeSubAccountId } from '@mux-network/mux.js'

const traderAddress = '' // paste your ETH address here
const subAccountId = encodeSubAccountId(traderAddress, 0 /* USDC */, 3 /* ETH */, true /* long */)
console.log(subAccountId)
```

**4. Get the trader's position size**

```js
import { getSubAccounts } from '@mux-network/mux.js'

const subAccounts = await getSubAccounts(reader, [subAccountId])
const subAccount = subAccounts[subAccountId]
console.log(`position: ${subAccount.size.toFixed()}`)
```

**5. Calculate margin balance**

Calculating margin balance requires asset price (ex: ETH price). Reading ETH price is not contained in mux.js. However, you can read assets price and info from the  [Broker API](https://app.mux.network/api/liquidityAsset).

```js
import { computeSubAccount } from '@mux-network/mux.js'
import BigNumber from 'bignumber.js'

const computed = computeSubAccount(
  chainStorage.assets,
  subAccountId,
  subAccount,
  new BigNumber('1'), // collateral (USDC) price
  new BigNumber('1000') // asset (ETH) price
)
console.log(`marginBalance(usd): ${computed.computed.marginBalanceUsd}`)
```

**6. Open a position (place a position order)**

In this example, we deposit 10 USDC and long 0.01 ETH using the market price. Do not forget to approve USDC to OrderBook before opening the position (not included in this example). The OrderBook addresses are different between different chains. Please check CHAIN_ID_TO_ORDER_BOOK_ADDRESS in mux.js for the addresses.

```js
import { CHAIN_ID_TO_ORDER_BOOK_ADDRESS, OrderBook__factory, PositionOrderFlags } from '@mux-network/mux.js'

const privateKey = '' // paste your private key here
const wallet = new ethers.Wallet(privateKey, provider)
const orderBookAddress = CHAIN_ID_TO_ORDER_BOOK_ADDRESS[42161 /* Arbitrum chain ID */]
const orderBook = OrderBook__factory.connect(orderBookAddress, wallet)
const tx = await orderBook.placePositionOrder2(
  subAccountId,
  new BigNumber('10').shiftedBy(6).toFixed(), // deposit $10 as collateral. USDC.decimals = 6
  new BigNumber('0.01').shiftedBy(18).toFixed(), // position 0.01 ETH. decimals is always 18
  '0', // limit price must be 0 for a market order
  0, // only used when close a position
  PositionOrderFlags.OpenPosition + PositionOrderFlags.MarketOrder, // check PositionOrderFlags for details
  0, // a default deadline will be applied on a market order
  '0x0000000000000000000000000000000000000000000000000000000000000000' // an empty referral code
)
console.log(`placing order. tx: ${tx.hash}`)
await tx.wait()
```

## Test

```
npm run test
```
