/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  AggregatorInterfaceV6_2,
  AggregatorInterfaceV6_2Interface,
} from "../../../../../thirdparty/gains/interfaces/IStorageInterfaceV5.sol/AggregatorInterfaceV6_2";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "enum AggregatorInterfaceV6_2.OrderType",
        name: "",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "linkFee",
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
        name: "",
        type: "uint256",
      },
    ],
    name: "openFeeP",
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
    name: "pairsStorage",
    outputs: [
      {
        internalType: "contract GNSPairsStorageV6",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "pendingSlOrders",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "trader",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "pairIndex",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "openPrice",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "buy",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "newSl",
            type: "uint256",
          },
        ],
        internalType: "struct AggregatorInterfaceV6_2.PendingSl",
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
        internalType: "uint256",
        name: "orderId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "address",
            name: "trader",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "pairIndex",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "openPrice",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "buy",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "newSl",
            type: "uint256",
          },
        ],
        internalType: "struct AggregatorInterfaceV6_2.PendingSl",
        name: "p",
        type: "tuple",
      },
    ],
    name: "storePendingSlOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenPriceDai",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderId",
        type: "uint256",
      },
    ],
    name: "unregisterPendingSlOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class AggregatorInterfaceV6_2__factory {
  static readonly abi = _abi;
  static createInterface(): AggregatorInterfaceV6_2Interface {
    return new utils.Interface(_abi) as AggregatorInterfaceV6_2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AggregatorInterfaceV6_2 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as AggregatorInterfaceV6_2;
  }
}