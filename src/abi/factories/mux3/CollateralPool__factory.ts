/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  CollateralPool,
  CollateralPoolInterface,
} from "../../mux3/CollateralPool";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "core_",
        type: "address",
      },
      {
        internalType: "address",
        name: "orderBook_",
        type: "address",
      },
      {
        internalType: "address",
        name: "weth_",
        type: "address",
      },
      {
        internalType: "address",
        name: "eventEmitter_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "len1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "len2",
        type: "uint256",
      },
    ],
    name: "AllocationLengthMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "positionSize1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "positionSize2",
        type: "uint256",
      },
    ],
    name: "AllocationPositionMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "ArrayAppendFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "maxX",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "xi",
        type: "int256",
      },
    ],
    name: "BadAllocation",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "capacity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "old",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "appending",
        type: "uint256",
      },
    ],
    name: "CapacityExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "CollateralAlreadyExist",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "CollateralNotExist",
    type: "error",
  },
  {
    inputs: [],
    name: "CreateProxyFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "DuplicatedAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "key",
        type: "string",
      },
    ],
    name: "EssentialConfigNotSet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "expectedId",
        type: "bytes32",
      },
    ],
    name: "IdMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "leverage",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "leverageLimit",
        type: "uint256",
      },
    ],
    name: "InitialLeverageOutOfRange",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "required",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "remain",
        type: "uint256",
      },
    ],
    name: "InsufficientCollateral",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "collateralToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredAmount",
        type: "uint256",
      },
    ],
    name: "InsufficientCollateralBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requiredUsd",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "remainUsd",
        type: "uint256",
      },
    ],
    name: "InsufficientCollateralUsd",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requiredLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "liquidityBalance",
        type: "uint256",
      },
    ],
    name: "InsufficientLiquidity",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "key",
        type: "string",
      },
    ],
    name: "InvalidAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "a",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "b",
        type: "uint256",
      },
    ],
    name: "InvalidArrayLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "closingSize",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "positionSize",
        type: "uint256",
      },
    ],
    name: "InvalidCloseSize",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "decimals",
        type: "uint256",
      },
    ],
    name: "InvalidDecimals",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "key",
        type: "string",
      },
    ],
    name: "InvalidId",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "positionSize",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lotSize",
        type: "uint256",
      },
    ],
    name: "InvalidLotSize",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
    ],
    name: "InvalidMarketId",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
    ],
    name: "InvalidPrice",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expiration",
        type: "uint256",
      },
    ],
    name: "InvalidPriceExpiration",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "InvalidPriceTimestamp",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "sequence",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expectedSequence",
        type: "uint256",
      },
    ],
    name: "InvalidSequence",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
    ],
    name: "InvalidSinger",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expected",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
    ],
    name: "LimitPriceNotMet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
    ],
    name: "MarketAlreadyExist",
    type: "error",
  },
  {
    inputs: [],
    name: "MarketFull",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
    ],
    name: "MarketNotExists",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
    ],
    name: "MarketTradeDisabled",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "oracleId",
        type: "bytes32",
      },
    ],
    name: "MissingPrice",
    type: "error",
  },
  {
    inputs: [],
    name: "MissingSignature",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "positionId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "NotOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "positionId",
        type: "bytes32",
      },
    ],
    name: "OnlySingleMarketPositionAllowed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
    ],
    name: "OutOfBound",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "PoolAlreadyExist",
    type: "error",
  },
  {
    inputs: [],
    name: "PoolBankrupt",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "PoolNotExists",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "positionId",
        type: "bytes32",
      },
    ],
    name: "PositionAccountAlreadyExist",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "positionId",
        type: "bytes32",
      },
    ],
    name: "PositionAccountNotExist",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "positionId",
        type: "bytes32",
      },
    ],
    name: "PositionNotClosed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "blockTimestamp",
        type: "uint256",
      },
    ],
    name: "PriceExpired",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "positionId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "safeType",
        type: "uint256",
      },
    ],
    name: "SafePositionAccount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "positionId",
        type: "bytes32",
      },
    ],
    name: "UnauthorizedAgent",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "UnauthorizedCaller",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "requiredRole",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "UnauthorizedRole",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expected",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
    ],
    name: "UnexpectedState",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "decimals",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expectDecimals",
        type: "uint256",
      },
    ],
    name: "UnmatchedDecimals",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "positionId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "safeType",
        type: "uint256",
      },
    ],
    name: "UnsafePositionAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
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
    name: "SetValue",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "rawCollateralAmount",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isUnwrapWeth",
            type: "bool",
          },
        ],
        internalType: "struct ICollateralPool.AddLiquidityArgs",
        name: "args",
        type: "tuple",
      },
    ],
    name: "addLiquidity",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "collateralPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lpPrice",
            type: "uint256",
          },
        ],
        internalType: "struct ICollateralPool.AddLiquidityResult",
        name: "result",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
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
        name: "marketId",
        type: "bytes32",
      },
    ],
    name: "borrowingFeeRateApy",
    outputs: [
      {
        internalType: "uint256",
        name: "feeRateApy",
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
        name: "marketId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "size",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "entryPrice",
        type: "uint256",
      },
    ],
    name: "closePosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "collateralToken",
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
        name: "key",
        type: "bytes32",
      },
    ],
    name: "configValue",
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
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAumUsd",
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
    inputs: [],
    name: "getCollateralTokenUsd",
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
    inputs: [],
    name: "getReservedUsd",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "address",
        name: "collateralToken_",
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
    name: "liquidityBalances",
    outputs: [
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "balances",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
    ],
    name: "makeBorrowingContext",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "poolId",
            type: "uint256",
          },
          {
            internalType: "int256",
            name: "k",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "b",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "poolSizeUsd",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "reservedUsd",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "reserveRate",
            type: "int256",
          },
          {
            internalType: "bool",
            name: "isDraining",
            type: "bool",
          },
        ],
        internalType: "struct IBorrowingRate.AllocatePool",
        name: "poolFr",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "keyPrefixes",
        type: "bytes32[]",
      },
    ],
    name: "marketConfigs",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "marketIds",
        type: "bytes32[]",
      },
      {
        internalType: "bytes32[][]",
        name: "values",
        type: "bytes32[][]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
    ],
    name: "marketState",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "isLong",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "totalSize",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "averageEntryPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "cumulatedBorrowingPerUsd",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastBorrowingUpdateTime",
            type: "uint256",
          },
        ],
        internalType: "struct MarketState",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketStates",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "marketIds",
        type: "bytes32[]",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "isLong",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "totalSize",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "averageEntryPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "cumulatedBorrowingPerUsd",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastBorrowingUpdateTime",
            type: "uint256",
          },
        ],
        internalType: "struct MarketState[]",
        name: "states",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "markets",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "size",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "entryPrice",
        type: "uint256",
      },
    ],
    name: "openPosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "size",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "entryPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "marketPrice",
        type: "uint256",
      },
    ],
    name: "positionPnl",
    outputs: [
      {
        internalType: "int256",
        name: "pnlUsd",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "cappedPnlUsd",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "rawAmount",
        type: "uint256",
      },
    ],
    name: "realizeLoss",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "pnlUsd",
        type: "uint256",
      },
    ],
    name: "realizeProfit",
    outputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
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
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "rawAmount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxRawAmount1",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "userData",
        type: "bytes",
      },
    ],
    name: "rebalance",
    outputs: [
      {
        internalType: "uint256",
        name: "rawAmount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "rawAmount",
        type: "uint256",
      },
    ],
    name: "receiveFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isUnwrapWeth",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "extraFeeCollateral",
            type: "uint256",
          },
        ],
        internalType: "struct ICollateralPool.RemoveLiquidityArgs",
        name: "args",
        type: "tuple",
      },
    ],
    name: "removeLiquidity",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "rawCollateralAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "collateralPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lpPrice",
            type: "uint256",
          },
        ],
        internalType: "struct ICollateralPool.RemoveLiquidityResult",
        name: "result",
        type: "tuple",
      },
    ],
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
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
    ],
    name: "setMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "marketId",
        type: "bytes32",
      },
    ],
    name: "updateMarketBorrowing",
    outputs: [
      {
        internalType: "uint256",
        name: "newCumulatedBorrowingPerUsd",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

export class CollateralPool__factory {
  static readonly abi = _abi;
  static createInterface(): CollateralPoolInterface {
    return new utils.Interface(_abi) as CollateralPoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CollateralPool {
    return new Contract(address, _abi, signerOrProvider) as CollateralPool;
  }
}
