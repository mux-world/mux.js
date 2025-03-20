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
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface CollateralPoolEventEmitterInterface extends utils.Interface {
  functions: {
    "core()": FunctionFragment;
    "emitAddLiquidity(address,address,uint256,uint256,uint256,uint256)": FunctionFragment;
    "emitClosePosition(bytes32,uint256,uint256,uint256)": FunctionFragment;
    "emitCollectFee(address,uint256,uint256)": FunctionFragment;
    "emitLiquidityBalanceIn(address,uint256,uint256)": FunctionFragment;
    "emitLiquidityBalanceOut(address,uint256,uint256)": FunctionFragment;
    "emitOpenPosition(bytes32,uint256,uint256,uint256)": FunctionFragment;
    "emitRebalance(address,address,address,uint256,uint256,uint256,uint256)": FunctionFragment;
    "emitReceiveFee(address,uint256,uint256)": FunctionFragment;
    "emitRemoveLiquidity(address,address,uint256,uint256,uint256,uint256)": FunctionFragment;
    "emitSetConfig(bytes32,bytes32)": FunctionFragment;
    "emitUpdateMarketBorrowing(bytes32,uint256,uint256)": FunctionFragment;
    "initialize(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "core"
      | "emitAddLiquidity"
      | "emitClosePosition"
      | "emitCollectFee"
      | "emitLiquidityBalanceIn"
      | "emitLiquidityBalanceOut"
      | "emitOpenPosition"
      | "emitRebalance"
      | "emitReceiveFee"
      | "emitRemoveLiquidity"
      | "emitSetConfig"
      | "emitUpdateMarketBorrowing"
      | "initialize"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "core", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "emitAddLiquidity",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitClosePosition",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitCollectFee",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitLiquidityBalanceIn",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitLiquidityBalanceOut",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitOpenPosition",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitRebalance",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitReceiveFee",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitRemoveLiquidity",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "emitSetConfig",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "emitUpdateMarketBorrowing",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "core", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "emitAddLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitClosePosition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitCollectFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitLiquidityBalanceIn",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitLiquidityBalanceOut",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitOpenPosition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitRebalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitReceiveFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitRemoveLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitSetConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitUpdateMarketBorrowing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;

  events: {
    "AddLiquidity(address,address,address,uint256,uint256,uint256,uint256)": EventFragment;
    "ClosePosition(address,bytes32,uint256,uint256,uint256)": EventFragment;
    "CollectFee(address,address,uint256,uint256)": EventFragment;
    "Initialized(uint8)": EventFragment;
    "LiquidityBalanceIn(address,address,uint256,uint256)": EventFragment;
    "LiquidityBalanceOut(address,address,uint256,uint256)": EventFragment;
    "OpenPosition(address,bytes32,uint256,uint256,uint256)": EventFragment;
    "Rebalance(address,address,address,address,uint256,uint256,uint256,uint256)": EventFragment;
    "ReceiveFee(address,address,uint256,uint256)": EventFragment;
    "RemoveLiquidity(address,address,address,uint256,uint256,uint256,uint256)": EventFragment;
    "SetConfig(address,bytes32,bytes32)": EventFragment;
    "UpdateMarketBorrowing(address,bytes32,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AddLiquidity"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ClosePosition"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CollectFee"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LiquidityBalanceIn"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LiquidityBalanceOut"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OpenPosition"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Rebalance"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ReceiveFee"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RemoveLiquidity"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetConfig"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UpdateMarketBorrowing"): EventFragment;
}

export interface AddLiquidityEventObject {
  pool: string;
  account: string;
  tokenAddress: string;
  tokenPrice: BigNumber;
  liquidityFeeCollateral: BigNumber;
  lpPrice: BigNumber;
  shares: BigNumber;
}
export type AddLiquidityEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber, BigNumber, BigNumber],
  AddLiquidityEventObject
>;

export type AddLiquidityEventFilter = TypedEventFilter<AddLiquidityEvent>;

export interface ClosePositionEventObject {
  pool: string;
  marketId: string;
  size: BigNumber;
  averageEntryPrice: BigNumber;
  totalSize: BigNumber;
}
export type ClosePositionEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber],
  ClosePositionEventObject
>;

export type ClosePositionEventFilter = TypedEventFilter<ClosePositionEvent>;

export interface CollectFeeEventObject {
  pool: string;
  token: string;
  tokenPrice: BigNumber;
  collateralAmount: BigNumber;
}
export type CollectFeeEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  CollectFeeEventObject
>;

export type CollectFeeEventFilter = TypedEventFilter<CollectFeeEvent>;

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface LiquidityBalanceInEventObject {
  pool: string;
  tokenAddress: string;
  tokenPrice: BigNumber;
  collateralAmount: BigNumber;
}
export type LiquidityBalanceInEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  LiquidityBalanceInEventObject
>;

export type LiquidityBalanceInEventFilter =
  TypedEventFilter<LiquidityBalanceInEvent>;

export interface LiquidityBalanceOutEventObject {
  pool: string;
  tokenAddress: string;
  tokenPrice: BigNumber;
  collateralAmount: BigNumber;
}
export type LiquidityBalanceOutEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  LiquidityBalanceOutEventObject
>;

export type LiquidityBalanceOutEventFilter =
  TypedEventFilter<LiquidityBalanceOutEvent>;

export interface OpenPositionEventObject {
  pool: string;
  marketId: string;
  size: BigNumber;
  averageEntryPrice: BigNumber;
  totalSize: BigNumber;
}
export type OpenPositionEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber],
  OpenPositionEventObject
>;

export type OpenPositionEventFilter = TypedEventFilter<OpenPositionEvent>;

export interface RebalanceEventObject {
  pool: string;
  rebalancer: string;
  token0: string;
  token1: string;
  price0: BigNumber;
  price1: BigNumber;
  amount0: BigNumber;
  amount1: BigNumber;
}
export type RebalanceEvent = TypedEvent<
  [string, string, string, string, BigNumber, BigNumber, BigNumber, BigNumber],
  RebalanceEventObject
>;

export type RebalanceEventFilter = TypedEventFilter<RebalanceEvent>;

export interface ReceiveFeeEventObject {
  pool: string;
  token: string;
  tokenPrice: BigNumber;
  collateralAmount: BigNumber;
}
export type ReceiveFeeEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  ReceiveFeeEventObject
>;

export type ReceiveFeeEventFilter = TypedEventFilter<ReceiveFeeEvent>;

export interface RemoveLiquidityEventObject {
  pool: string;
  account: string;
  collateralAddress: string;
  tokenPrice: BigNumber;
  liquidityFeeCollateral: BigNumber;
  lpPrice: BigNumber;
  shares: BigNumber;
}
export type RemoveLiquidityEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber, BigNumber, BigNumber],
  RemoveLiquidityEventObject
>;

export type RemoveLiquidityEventFilter = TypedEventFilter<RemoveLiquidityEvent>;

export interface SetConfigEventObject {
  pool: string;
  key: string;
  value: string;
}
export type SetConfigEvent = TypedEvent<
  [string, string, string],
  SetConfigEventObject
>;

export type SetConfigEventFilter = TypedEventFilter<SetConfigEvent>;

export interface UpdateMarketBorrowingEventObject {
  pool: string;
  marketId: string;
  feeRateApy: BigNumber;
  cumulatedBorrowingPerUsd: BigNumber;
}
export type UpdateMarketBorrowingEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  UpdateMarketBorrowingEventObject
>;

export type UpdateMarketBorrowingEventFilter =
  TypedEventFilter<UpdateMarketBorrowingEvent>;

export interface CollateralPoolEventEmitter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: CollateralPoolEventEmitterInterface;

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
    core(overrides?: CallOverrides): Promise<[string]>;

    emitAddLiquidity(
      account: PromiseOrValue<string>,
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
      lpPrice: PromiseOrValue<BigNumberish>,
      shares: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitClosePosition(
      marketId: PromiseOrValue<BytesLike>,
      size: PromiseOrValue<BigNumberish>,
      averageEntryPrice: PromiseOrValue<BigNumberish>,
      totalSize: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitCollectFee(
      token: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitLiquidityBalanceIn(
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitLiquidityBalanceOut(
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitOpenPosition(
      marketId: PromiseOrValue<BytesLike>,
      size: PromiseOrValue<BigNumberish>,
      averageEntryPrice: PromiseOrValue<BigNumberish>,
      totalSize: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitRebalance(
      rebalancer: PromiseOrValue<string>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      price0: PromiseOrValue<BigNumberish>,
      price1: PromiseOrValue<BigNumberish>,
      amount0: PromiseOrValue<BigNumberish>,
      amount1: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitReceiveFee(
      token: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitRemoveLiquidity(
      account: PromiseOrValue<string>,
      collateralAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
      lpPrice: PromiseOrValue<BigNumberish>,
      shares: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitSetConfig(
      key: PromiseOrValue<BytesLike>,
      value: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    emitUpdateMarketBorrowing(
      marketId: PromiseOrValue<BytesLike>,
      feeRateApy: PromiseOrValue<BigNumberish>,
      cumulatedBorrowingPerUsd: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    initialize(
      _core: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  core(overrides?: CallOverrides): Promise<string>;

  emitAddLiquidity(
    account: PromiseOrValue<string>,
    tokenAddress: PromiseOrValue<string>,
    tokenPrice: PromiseOrValue<BigNumberish>,
    liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
    lpPrice: PromiseOrValue<BigNumberish>,
    shares: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitClosePosition(
    marketId: PromiseOrValue<BytesLike>,
    size: PromiseOrValue<BigNumberish>,
    averageEntryPrice: PromiseOrValue<BigNumberish>,
    totalSize: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitCollectFee(
    token: PromiseOrValue<string>,
    tokenPrice: PromiseOrValue<BigNumberish>,
    collateralAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitLiquidityBalanceIn(
    tokenAddress: PromiseOrValue<string>,
    tokenPrice: PromiseOrValue<BigNumberish>,
    collateralAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitLiquidityBalanceOut(
    tokenAddress: PromiseOrValue<string>,
    tokenPrice: PromiseOrValue<BigNumberish>,
    collateralAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitOpenPosition(
    marketId: PromiseOrValue<BytesLike>,
    size: PromiseOrValue<BigNumberish>,
    averageEntryPrice: PromiseOrValue<BigNumberish>,
    totalSize: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitRebalance(
    rebalancer: PromiseOrValue<string>,
    token0: PromiseOrValue<string>,
    token1: PromiseOrValue<string>,
    price0: PromiseOrValue<BigNumberish>,
    price1: PromiseOrValue<BigNumberish>,
    amount0: PromiseOrValue<BigNumberish>,
    amount1: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitReceiveFee(
    token: PromiseOrValue<string>,
    tokenPrice: PromiseOrValue<BigNumberish>,
    collateralAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitRemoveLiquidity(
    account: PromiseOrValue<string>,
    collateralAddress: PromiseOrValue<string>,
    tokenPrice: PromiseOrValue<BigNumberish>,
    liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
    lpPrice: PromiseOrValue<BigNumberish>,
    shares: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitSetConfig(
    key: PromiseOrValue<BytesLike>,
    value: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  emitUpdateMarketBorrowing(
    marketId: PromiseOrValue<BytesLike>,
    feeRateApy: PromiseOrValue<BigNumberish>,
    cumulatedBorrowingPerUsd: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  initialize(
    _core: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    core(overrides?: CallOverrides): Promise<string>;

    emitAddLiquidity(
      account: PromiseOrValue<string>,
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
      lpPrice: PromiseOrValue<BigNumberish>,
      shares: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitClosePosition(
      marketId: PromiseOrValue<BytesLike>,
      size: PromiseOrValue<BigNumberish>,
      averageEntryPrice: PromiseOrValue<BigNumberish>,
      totalSize: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitCollectFee(
      token: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitLiquidityBalanceIn(
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitLiquidityBalanceOut(
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitOpenPosition(
      marketId: PromiseOrValue<BytesLike>,
      size: PromiseOrValue<BigNumberish>,
      averageEntryPrice: PromiseOrValue<BigNumberish>,
      totalSize: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitRebalance(
      rebalancer: PromiseOrValue<string>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      price0: PromiseOrValue<BigNumberish>,
      price1: PromiseOrValue<BigNumberish>,
      amount0: PromiseOrValue<BigNumberish>,
      amount1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitReceiveFee(
      token: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitRemoveLiquidity(
      account: PromiseOrValue<string>,
      collateralAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
      lpPrice: PromiseOrValue<BigNumberish>,
      shares: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitSetConfig(
      key: PromiseOrValue<BytesLike>,
      value: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    emitUpdateMarketBorrowing(
      marketId: PromiseOrValue<BytesLike>,
      feeRateApy: PromiseOrValue<BigNumberish>,
      cumulatedBorrowingPerUsd: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    initialize(
      _core: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "AddLiquidity(address,address,address,uint256,uint256,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      account?: PromiseOrValue<string> | null,
      tokenAddress?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      liquidityFeeCollateral?: null,
      lpPrice?: null,
      shares?: null
    ): AddLiquidityEventFilter;
    AddLiquidity(
      pool?: PromiseOrValue<string> | null,
      account?: PromiseOrValue<string> | null,
      tokenAddress?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      liquidityFeeCollateral?: null,
      lpPrice?: null,
      shares?: null
    ): AddLiquidityEventFilter;

    "ClosePosition(address,bytes32,uint256,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      marketId?: PromiseOrValue<BytesLike> | null,
      size?: null,
      averageEntryPrice?: null,
      totalSize?: null
    ): ClosePositionEventFilter;
    ClosePosition(
      pool?: PromiseOrValue<string> | null,
      marketId?: PromiseOrValue<BytesLike> | null,
      size?: null,
      averageEntryPrice?: null,
      totalSize?: null
    ): ClosePositionEventFilter;

    "CollectFee(address,address,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      token?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      collateralAmount?: null
    ): CollectFeeEventFilter;
    CollectFee(
      pool?: PromiseOrValue<string> | null,
      token?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      collateralAmount?: null
    ): CollectFeeEventFilter;

    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "LiquidityBalanceIn(address,address,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      tokenAddress?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      collateralAmount?: null
    ): LiquidityBalanceInEventFilter;
    LiquidityBalanceIn(
      pool?: PromiseOrValue<string> | null,
      tokenAddress?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      collateralAmount?: null
    ): LiquidityBalanceInEventFilter;

    "LiquidityBalanceOut(address,address,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      tokenAddress?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      collateralAmount?: null
    ): LiquidityBalanceOutEventFilter;
    LiquidityBalanceOut(
      pool?: PromiseOrValue<string> | null,
      tokenAddress?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      collateralAmount?: null
    ): LiquidityBalanceOutEventFilter;

    "OpenPosition(address,bytes32,uint256,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      marketId?: PromiseOrValue<BytesLike> | null,
      size?: null,
      averageEntryPrice?: null,
      totalSize?: null
    ): OpenPositionEventFilter;
    OpenPosition(
      pool?: PromiseOrValue<string> | null,
      marketId?: PromiseOrValue<BytesLike> | null,
      size?: null,
      averageEntryPrice?: null,
      totalSize?: null
    ): OpenPositionEventFilter;

    "Rebalance(address,address,address,address,uint256,uint256,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      rebalancer?: null,
      token0?: PromiseOrValue<string> | null,
      token1?: PromiseOrValue<string> | null,
      price0?: null,
      price1?: null,
      amount0?: null,
      amount1?: null
    ): RebalanceEventFilter;
    Rebalance(
      pool?: PromiseOrValue<string> | null,
      rebalancer?: null,
      token0?: PromiseOrValue<string> | null,
      token1?: PromiseOrValue<string> | null,
      price0?: null,
      price1?: null,
      amount0?: null,
      amount1?: null
    ): RebalanceEventFilter;

    "ReceiveFee(address,address,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      token?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      collateralAmount?: null
    ): ReceiveFeeEventFilter;
    ReceiveFee(
      pool?: PromiseOrValue<string> | null,
      token?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      collateralAmount?: null
    ): ReceiveFeeEventFilter;

    "RemoveLiquidity(address,address,address,uint256,uint256,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      account?: PromiseOrValue<string> | null,
      collateralAddress?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      liquidityFeeCollateral?: null,
      lpPrice?: null,
      shares?: null
    ): RemoveLiquidityEventFilter;
    RemoveLiquidity(
      pool?: PromiseOrValue<string> | null,
      account?: PromiseOrValue<string> | null,
      collateralAddress?: PromiseOrValue<string> | null,
      tokenPrice?: null,
      liquidityFeeCollateral?: null,
      lpPrice?: null,
      shares?: null
    ): RemoveLiquidityEventFilter;

    "SetConfig(address,bytes32,bytes32)"(
      pool?: PromiseOrValue<string> | null,
      key?: null,
      value?: null
    ): SetConfigEventFilter;
    SetConfig(
      pool?: PromiseOrValue<string> | null,
      key?: null,
      value?: null
    ): SetConfigEventFilter;

    "UpdateMarketBorrowing(address,bytes32,uint256,uint256)"(
      pool?: PromiseOrValue<string> | null,
      marketId?: PromiseOrValue<BytesLike> | null,
      feeRateApy?: null,
      cumulatedBorrowingPerUsd?: null
    ): UpdateMarketBorrowingEventFilter;
    UpdateMarketBorrowing(
      pool?: PromiseOrValue<string> | null,
      marketId?: PromiseOrValue<BytesLike> | null,
      feeRateApy?: null,
      cumulatedBorrowingPerUsd?: null
    ): UpdateMarketBorrowingEventFilter;
  };

  estimateGas: {
    core(overrides?: CallOverrides): Promise<BigNumber>;

    emitAddLiquidity(
      account: PromiseOrValue<string>,
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
      lpPrice: PromiseOrValue<BigNumberish>,
      shares: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitClosePosition(
      marketId: PromiseOrValue<BytesLike>,
      size: PromiseOrValue<BigNumberish>,
      averageEntryPrice: PromiseOrValue<BigNumberish>,
      totalSize: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitCollectFee(
      token: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitLiquidityBalanceIn(
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitLiquidityBalanceOut(
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitOpenPosition(
      marketId: PromiseOrValue<BytesLike>,
      size: PromiseOrValue<BigNumberish>,
      averageEntryPrice: PromiseOrValue<BigNumberish>,
      totalSize: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitRebalance(
      rebalancer: PromiseOrValue<string>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      price0: PromiseOrValue<BigNumberish>,
      price1: PromiseOrValue<BigNumberish>,
      amount0: PromiseOrValue<BigNumberish>,
      amount1: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitReceiveFee(
      token: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitRemoveLiquidity(
      account: PromiseOrValue<string>,
      collateralAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
      lpPrice: PromiseOrValue<BigNumberish>,
      shares: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitSetConfig(
      key: PromiseOrValue<BytesLike>,
      value: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    emitUpdateMarketBorrowing(
      marketId: PromiseOrValue<BytesLike>,
      feeRateApy: PromiseOrValue<BigNumberish>,
      cumulatedBorrowingPerUsd: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    initialize(
      _core: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    core(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    emitAddLiquidity(
      account: PromiseOrValue<string>,
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
      lpPrice: PromiseOrValue<BigNumberish>,
      shares: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitClosePosition(
      marketId: PromiseOrValue<BytesLike>,
      size: PromiseOrValue<BigNumberish>,
      averageEntryPrice: PromiseOrValue<BigNumberish>,
      totalSize: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitCollectFee(
      token: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitLiquidityBalanceIn(
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitLiquidityBalanceOut(
      tokenAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitOpenPosition(
      marketId: PromiseOrValue<BytesLike>,
      size: PromiseOrValue<BigNumberish>,
      averageEntryPrice: PromiseOrValue<BigNumberish>,
      totalSize: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitRebalance(
      rebalancer: PromiseOrValue<string>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      price0: PromiseOrValue<BigNumberish>,
      price1: PromiseOrValue<BigNumberish>,
      amount0: PromiseOrValue<BigNumberish>,
      amount1: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitReceiveFee(
      token: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      collateralAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitRemoveLiquidity(
      account: PromiseOrValue<string>,
      collateralAddress: PromiseOrValue<string>,
      tokenPrice: PromiseOrValue<BigNumberish>,
      liquidityFeeCollateral: PromiseOrValue<BigNumberish>,
      lpPrice: PromiseOrValue<BigNumberish>,
      shares: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitSetConfig(
      key: PromiseOrValue<BytesLike>,
      value: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    emitUpdateMarketBorrowing(
      marketId: PromiseOrValue<BytesLike>,
      feeRateApy: PromiseOrValue<BigNumberish>,
      cumulatedBorrowingPerUsd: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    initialize(
      _core: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
