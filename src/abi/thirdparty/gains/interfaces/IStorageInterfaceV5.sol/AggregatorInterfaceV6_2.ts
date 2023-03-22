/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../../common";

export declare namespace AggregatorInterfaceV6_2 {
  export type PendingSlStruct = {
    trader: PromiseOrValue<string>;
    pairIndex: PromiseOrValue<BigNumberish>;
    index: PromiseOrValue<BigNumberish>;
    openPrice: PromiseOrValue<BigNumberish>;
    buy: PromiseOrValue<boolean>;
    newSl: PromiseOrValue<BigNumberish>;
  };

  export type PendingSlStructOutput = [
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    boolean,
    BigNumber
  ] & {
    trader: string;
    pairIndex: BigNumber;
    index: BigNumber;
    openPrice: BigNumber;
    buy: boolean;
    newSl: BigNumber;
  };
}

export interface AggregatorInterfaceV6_2Interface extends utils.Interface {
  functions: {
    "getPrice(uint256,uint8,uint256)": FunctionFragment;
    "linkFee(uint256,uint256)": FunctionFragment;
    "openFeeP(uint256)": FunctionFragment;
    "pairsStorage()": FunctionFragment;
    "pendingSlOrders(uint256)": FunctionFragment;
    "storePendingSlOrder(uint256,(address,uint256,uint256,uint256,bool,uint256))": FunctionFragment;
    "tokenPriceDai()": FunctionFragment;
    "unregisterPendingSlOrder(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getPrice"
      | "linkFee"
      | "openFeeP"
      | "pairsStorage"
      | "pendingSlOrders"
      | "storePendingSlOrder"
      | "tokenPriceDai"
      | "unregisterPendingSlOrder"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getPrice",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "linkFee",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "openFeeP",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "pairsStorage",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "pendingSlOrders",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "storePendingSlOrder",
    values: [
      PromiseOrValue<BigNumberish>,
      AggregatorInterfaceV6_2.PendingSlStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenPriceDai",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "unregisterPendingSlOrder",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "getPrice", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "linkFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "openFeeP", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pairsStorage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pendingSlOrders",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "storePendingSlOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenPriceDai",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unregisterPendingSlOrder",
    data: BytesLike
  ): Result;

  events: {};
}

export interface AggregatorInterfaceV6_2 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AggregatorInterfaceV6_2Interface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getPrice(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    linkFee(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    openFeeP(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    pairsStorage(overrides?: CallOverrides): Promise<[string]>;

    pendingSlOrders(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[AggregatorInterfaceV6_2.PendingSlStructOutput]>;

    storePendingSlOrder(
      orderId: PromiseOrValue<BigNumberish>,
      p: AggregatorInterfaceV6_2.PendingSlStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    tokenPriceDai(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unregisterPendingSlOrder(
      orderId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  getPrice(
    arg0: PromiseOrValue<BigNumberish>,
    arg1: PromiseOrValue<BigNumberish>,
    arg2: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  linkFee(
    arg0: PromiseOrValue<BigNumberish>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  openFeeP(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  pairsStorage(overrides?: CallOverrides): Promise<string>;

  pendingSlOrders(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<AggregatorInterfaceV6_2.PendingSlStructOutput>;

  storePendingSlOrder(
    orderId: PromiseOrValue<BigNumberish>,
    p: AggregatorInterfaceV6_2.PendingSlStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  tokenPriceDai(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unregisterPendingSlOrder(
    orderId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getPrice(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    linkFee(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    openFeeP(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    pairsStorage(overrides?: CallOverrides): Promise<string>;

    pendingSlOrders(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<AggregatorInterfaceV6_2.PendingSlStructOutput>;

    storePendingSlOrder(
      orderId: PromiseOrValue<BigNumberish>,
      p: AggregatorInterfaceV6_2.PendingSlStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    tokenPriceDai(overrides?: CallOverrides): Promise<BigNumber>;

    unregisterPendingSlOrder(
      orderId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    getPrice(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    linkFee(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    openFeeP(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    pairsStorage(overrides?: CallOverrides): Promise<BigNumber>;

    pendingSlOrders(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    storePendingSlOrder(
      orderId: PromiseOrValue<BigNumberish>,
      p: AggregatorInterfaceV6_2.PendingSlStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    tokenPriceDai(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unregisterPendingSlOrder(
      orderId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getPrice(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    linkFee(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    openFeeP(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    pairsStorage(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pendingSlOrders(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    storePendingSlOrder(
      orderId: PromiseOrValue<BigNumberish>,
      p: AggregatorInterfaceV6_2.PendingSlStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    tokenPriceDai(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unregisterPendingSlOrder(
      orderId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}