/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { OrderBook, OrderBookInterface } from "../OrderBook";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newBroker",
        type: "address",
      },
    ],
    name: "AddBroker",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newRebalancer",
        type: "address",
      },
    ],
    name: "AddRebalancer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "enum OrderType",
        name: "orderType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bytes32[3]",
        name: "orderData",
        type: "bytes32[3]",
      },
    ],
    name: "CancelOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "enum OrderType",
        name: "orderType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bytes32[3]",
        name: "orderData",
        type: "bytes32[3]",
      },
    ],
    name: "FillOrder",
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
        indexed: false,
        internalType: "uint8",
        name: "assetId",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "rawAmount",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isAdding",
        type: "bool",
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
        internalType: "bytes32",
        name: "subAccountId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "collateral",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "size",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "price",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "profitTokenId",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "flags",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "deadline",
        type: "uint32",
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
        internalType: "bytes32",
        name: "subAccountId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "collateral",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "size",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "price",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "profitTokenId",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "flags",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "deadline",
        type: "uint32",
      },
      {
        components: [
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
            internalType: "uint8",
            name: "tpslProfitTokenId",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "tpslDeadline",
            type: "uint32",
          },
        ],
        indexed: false,
        internalType: "struct PositionOrderExtra",
        name: "extra",
        type: "tuple",
      },
    ],
    name: "NewPositionOrderExtra",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "rebalancer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "tokenId0",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "tokenId1",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "rawAmount0",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "maxRawAmount1",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "userData",
        type: "bytes32",
      },
    ],
    name: "NewRebalanceOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "subAccountId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "orderId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "rawAmount",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "profitTokenId",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isProfit",
        type: "bool",
      },
    ],
    name: "NewWithdrawalOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "isPaused",
        type: "bool",
      },
    ],
    name: "PauseLiquidityOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "isPaused",
        type: "bool",
      },
    ],
    name: "PausePositionOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "pendingOwner",
        type: "address",
      },
    ],
    name: "PrepareToTransferOwnership",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "broker",
        type: "address",
      },
    ],
    name: "RemoveBroker",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "rebalancer",
        type: "address",
      },
    ],
    name: "RemoveRebalancer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "aggregatorAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isEnable",
        type: "bool",
      },
    ],
    name: "SetAggregator",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint32",
        name: "oldLockPeriod",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "newLockPeriod",
        type: "uint32",
      },
    ],
    name: "SetLiquidityLockPeriod",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "assetId",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "lotSize",
        type: "uint96",
      },
    ],
    name: "SetLotSize",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newMaintainer",
        type: "address",
      },
    ],
    name: "SetMaintainer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint32",
        name: "marketOrderTimeout",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "maxLimitOrderTimeout",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "cancelCoolDown",
        type: "uint32",
      },
    ],
    name: "SetOrderTimeout",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newReferralManager",
        type: "address",
      },
    ],
    name: "SetReferralManager",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newBroker",
        type: "address",
      },
    ],
    name: "addBroker",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newRebalancer",
        type: "address",
      },
    ],
    name: "addRebalancer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "broker",
        type: "address",
      },
    ],
    name: "brokers",
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
    name: "cancelCoolDown",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
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
    inputs: [],
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
        internalType: "uint96",
        name: "collateralPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "assetPrice",
        type: "uint96",
      },
    ],
    name: "collectFundingFee",
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
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256",
      },
    ],
    name: "depositCollateral",
    outputs: [],
    stateMutability: "payable",
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
        name: "assetPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "mlpPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "currentAssetValue",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "targetAssetValue",
        type: "uint96",
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
        name: "collateralPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "assetPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "profitAssetPrice",
        type: "uint96",
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
        internalType: "uint96",
        name: "price0",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "price1",
        type: "uint96",
      },
    ],
    name: "fillRebalanceOrder",
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
        name: "collateralPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "assetPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "profitAssetPrice",
        type: "uint96",
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
        internalType: "bytes32[3]",
        name: "",
        type: "bytes32[3]",
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
    inputs: [],
    name: "getOrderCount",
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
        internalType: "bytes32[3][]",
        name: "orderArray",
        type: "bytes32[3][]",
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
        name: "pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "mlp",
        type: "address",
      },
      {
        internalType: "address",
        name: "weth",
        type: "address",
      },
      {
        internalType: "address",
        name: "nativeUnwrapper",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "isLiquidityOrderPaused",
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
    name: "isPositionOrderPaused",
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
        name: "collateralPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "assetPrice",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "profitAssetPrice",
        type: "uint96",
      },
    ],
    name: "liquidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidityLockPeriod",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maintainer",
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
    inputs: [],
    name: "marketOrderTimeout",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxLimitOrderTimeout",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
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
    inputs: [],
    name: "owner",
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
        internalType: "bool",
        name: "isPositionOrderPaused_",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isLiquidityOrderPaused_",
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
        internalType: "uint8",
        name: "assetId",
        type: "uint8",
      },
      {
        internalType: "uint96",
        name: "rawAmount",
        type: "uint96",
      },
      {
        internalType: "bool",
        name: "isAdding",
        type: "bool",
      },
    ],
    name: "placeLiquidityOrder",
    outputs: [],
    stateMutability: "payable",
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
        internalType: "uint96",
        name: "collateralAmount",
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
        internalType: "uint8",
        name: "profitTokenId",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "flags",
        type: "uint8",
      },
      {
        internalType: "uint32",
        name: "deadline",
        type: "uint32",
      },
      {
        internalType: "bytes32",
        name: "referralCode",
        type: "bytes32",
      },
      {
        components: [
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
            internalType: "uint8",
            name: "tpslProfitTokenId",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "tpslDeadline",
            type: "uint32",
          },
        ],
        internalType: "struct PositionOrderExtra",
        name: "extra",
        type: "tuple",
      },
    ],
    name: "placePositionOrder3",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "tokenId0",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "tokenId1",
        type: "uint8",
      },
      {
        internalType: "uint96",
        name: "rawAmount0",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "maxRawAmount1",
        type: "uint96",
      },
      {
        internalType: "bytes32",
        name: "userData",
        type: "bytes32",
      },
    ],
    name: "placeRebalanceOrder",
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
    name: "placeWithdrawalOrder",
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
    name: "positionOrderExtras",
    outputs: [
      {
        components: [
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
            internalType: "uint8",
            name: "tpslProfitTokenId",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "tpslDeadline",
            type: "uint32",
          },
        ],
        internalType: "struct PositionOrderExtra",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "rebalancer",
        type: "address",
      },
    ],
    name: "rebalancers",
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
        internalType: "uint8",
        name: "tokenId",
        type: "uint8",
      },
      {
        internalType: "uint96",
        name: "muxTokenAmount",
        type: "uint96",
      },
    ],
    name: "redeemMuxToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "referralManager",
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
        internalType: "address",
        name: "broker",
        type: "address",
      },
    ],
    name: "removeBroker",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "rebalancer",
        type: "address",
      },
    ],
    name: "removeRebalancer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceBroker",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceRebalancer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "aggregatorAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isEnable",
        type: "bool",
      },
    ],
    name: "setAggregator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gasLimit",
        type: "uint256",
      },
    ],
    name: "setCallbackGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "bool",
        name: "enable",
        type: "bool",
      },
    ],
    name: "setCallbackWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "newLiquidityLockPeriod",
        type: "uint32",
      },
    ],
    name: "setLiquidityLockPeriod",
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
        name: "lotSize",
        type: "uint96",
      },
    ],
    name: "setLotSize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newMaintainer",
        type: "address",
      },
    ],
    name: "setMaintainer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "marketOrderTimeout_",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "maxLimitOrderTimeout_",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "cancelCoolDown_",
        type: "uint32",
      },
    ],
    name: "setOrderTimeout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newReferralManager",
        type: "address",
      },
    ],
    name: "setReferralManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "takeOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "stableUtilization",
        type: "uint32",
      },
      {
        internalType: "uint8[]",
        name: "unstableTokenIds",
        type: "uint8[]",
      },
      {
        internalType: "uint32[]",
        name: "unstableUtilizations",
        type: "uint32[]",
      },
      {
        internalType: "uint96[]",
        name: "unstablePrices",
        type: "uint96[]",
      },
    ],
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
