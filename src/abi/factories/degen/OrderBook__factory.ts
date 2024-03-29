/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  OrderBook,
  OrderBookInterface,
} from "../../degen/OrderBook";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "id",
            type: "uint64",
          },
          {
            internalType: "enum OrderType",
            name: "orderType",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "version",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "placeOrderTime",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "payload",
            type: "bytes",
          },
        ],
        indexed: false,
        internalType: "struct OrderData",
        name: "orderData",
        type: "tuple",
      },
    ],
    name: "CancelOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "subAccountId",
            type: "bytes32",
          },
          {
            internalType: "uint96",
            name: "size",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "price",
            type: "uint96",
          },
          {
            internalType: "uint8",
            name: "profitTokenId",
            type: "uint8",
          },
        ],
        indexed: false,
        internalType: "struct AdlOrderParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "FillAdlOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "id",
            type: "uint64",
          },
          {
            internalType: "enum OrderType",
            name: "orderType",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "version",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "placeOrderTime",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "payload",
            type: "bytes",
          },
        ],
        indexed: false,
        internalType: "struct OrderData",
        name: "orderData",
        type: "tuple",
      },
    ],
    name: "FillOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "rawAmount",
            type: "uint96",
          },
          {
            internalType: "uint8",
            name: "assetId",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "isAdding",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct LiquidityOrderParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "NewLiquidityOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "subAccountId",
            type: "bytes32",
          },
          {
            internalType: "uint96",
            name: "collateral",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "size",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "price",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "tpPrice",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "slPrice",
            type: "uint96",
          },
          {
            internalType: "uint32",
            name: "expiration",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "tpslExpiration",
            type: "uint32",
          },
          {
            internalType: "uint8",
            name: "profitTokenId",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "tpslProfitTokenId",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "flags",
            type: "uint8",
          },
        ],
        indexed: false,
        internalType: "struct PositionOrderParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "NewPositionOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "subAccountId",
            type: "bytes32",
          },
          {
            internalType: "uint96",
            name: "rawAmount",
            type: "uint96",
          },
          {
            internalType: "uint8",
            name: "profitTokenId",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "isProfit",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct WithdrawalOrderParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "NewWithdrawalOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum OrderType",
        name: "orderType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPaused",
        type: "bool",
      },
    ],
    name: "Pause",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint96[]",
        name: "prices",
        type: "uint96[]",
      },
    ],
    name: "ReportLiquidityOrderPrice",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "SetConfig",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
    ],
    name: "cancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "assetId",
        type: "uint8",
      },
    ],
    name: "claimBrokerGasRebate",
    outputs: [
      {
        internalType: "uint256",
        name: "rawAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "subAccountId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256",
      },
    ],
    name: "depositCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "assetId",
        type: "uint8",
      },
      {
        internalType: "uint96",
        name: "rawAmount",
        type: "uint96",
      },
    ],
    name: "donateLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "subAccountId",
            type: "bytes32",
          },
          {
            internalType: "uint96",
            name: "size",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "price",
            type: "uint96",
          },
          {
            internalType: "uint8",
            name: "profitTokenId",
            type: "uint8",
          },
        ],
        internalType: "struct AdlOrderParams",
        name: "orderParams",
        type: "tuple",
      },
      {
        internalType: "uint96",
        name: "tradingPrice",
        type: "uint96",
      },
      {
        internalType: "uint96[]",
        name: "markPrices",
        type: "uint96[]",
      },
    ],
    name: "fillAdlOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        internalType: "uint96[]",
        name: "markPrices",
        type: "uint96[]",
      },
    ],
    name: "fillLiquidityOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        internalType: "uint96",
        name: "filledAmount",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "tradingPrice",
        type: "uint96",
      },
      {
        internalType: "uint96[]",
        name: "markPrices",
        type: "uint96[]",
      },
    ],
    name: "fillPositionOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        internalType: "uint96[]",
        name: "markPrices",
        type: "uint96[]",
      },
    ],
    name: "fillWithdrawalOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
    ],
    name: "getOrder",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "id",
            type: "uint64",
          },
          {
            internalType: "enum OrderType",
            name: "orderType",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "version",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "placeOrderTime",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "payload",
            type: "bytes",
          },
        ],
        internalType: "struct OrderData",
        name: "",
        type: "tuple",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "begin",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "end",
        type: "uint256",
      },
    ],
    name: "getOrders",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "id",
            type: "uint64",
          },
          {
            internalType: "enum OrderType",
            name: "orderType",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "version",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "placeOrderTime",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "payload",
            type: "bytes",
          },
        ],
        internalType: "struct OrderData[]",
        name: "orderDataArray",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "totalCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "begin",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "end",
        type: "uint256",
      },
    ],
    name: "getOrdersOf",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "id",
            type: "uint64",
          },
          {
            internalType: "enum OrderType",
            name: "orderType",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "version",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "placeOrderTime",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "payload",
            type: "bytes",
          },
        ],
        internalType: "struct OrderData[]",
        name: "orderDataArray",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "totalCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
    ],
    name: "getParameter",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "mlpToken",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "subAccountId",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "profitAssetId",
        type: "uint8",
      },
      {
        internalType: "uint96",
        name: "tradingPrice",
        type: "uint96",
      },
      {
        internalType: "uint96[]",
        name: "assetPrices",
        type: "uint96[]",
      },
    ],
    name: "liquidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nextOrderId",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum OrderType",
        name: "orderType",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isPaused",
        type: "bool",
      },
    ],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint96",
            name: "rawAmount",
            type: "uint96",
          },
          {
            internalType: "uint8",
            name: "assetId",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "isAdding",
            type: "bool",
          },
        ],
        internalType: "struct LiquidityOrderParams",
        name: "orderParams",
        type: "tuple",
      },
    ],
    name: "placeLiquidityOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "subAccountId",
            type: "bytes32",
          },
          {
            internalType: "uint96",
            name: "collateral",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "size",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "price",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "tpPrice",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "slPrice",
            type: "uint96",
          },
          {
            internalType: "uint32",
            name: "expiration",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "tpslExpiration",
            type: "uint32",
          },
          {
            internalType: "uint8",
            name: "profitTokenId",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "tpslProfitTokenId",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "flags",
            type: "uint8",
          },
        ],
        internalType: "struct PositionOrderParams",
        name: "orderParams",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "referralCode",
        type: "bytes32",
      },
    ],
    name: "placePositionOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "subAccountId",
            type: "bytes32",
          },
          {
            internalType: "uint96",
            name: "rawAmount",
            type: "uint96",
          },
          {
            internalType: "uint8",
            name: "profitTokenId",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "isProfit",
            type: "bool",
          },
        ],
        internalType: "struct WithdrawalOrderParams",
        name: "orderParams",
        type: "tuple",
      },
    ],
    name: "placeWithdrawalOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "setConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "updateFundingState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "subAccountId",
        type: "bytes32",
      },
    ],
    name: "withdrawAllCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class OrderBook__factory {
  static readonly abi = _abi;
  static createInterface(): OrderBookInterface {
    return new utils.Interface(_abi) as OrderBookInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OrderBook {
    return new Contract(address, _abi, signerOrProvider) as OrderBook;
  }
}
