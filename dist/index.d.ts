// Generated by dts-bundle-generator v8.1.2

export type PendingTransaction = {
	hash: string;
	gasPrice: number;
	to: string;
	timestamp: string;
	from: string;
	nonce: number;
	maxPriorityFeePerGas?: number;
};
export type DroppedTransaction = {
	hash: string;
	dropped: boolean;
};
export type MempoolTransaction = PendingTransaction | DroppedTransaction;
export type CompletedTransaction = {
	hash: string;
	index: number;
	gasPrice: number;
	to: string | null;
	gasUsed: number;
	status: string;
};
export type Error = {
	code: number;
	message: string;
};
export type MessageBase = {
	feed: string;
	chainId: string;
};
export type MempoolMessage = MessageBase & {
	transactions: MempoolTransaction[];
};
export type BlockMessage = MessageBase & {
	transactions: CompletedTransaction[];
	hash: string;
	height: number;
	timestamp: string;
	txnCount: number;
	baseFeePerGas: number;
	gasUsed: number;
	gasLimit: number;
	miner: string;
};
export type ErrorMessage = Partial<MessageBase> & {
	error: Error;
};
export type AckMessage = {
	id: string;
};
export type Stats = {
	erc20: number;
	erc721: number;
	erc777: number;
	interactionTypes: InteractionTypes;
};
export type InteractionTypes = {
	eoa: number;
	contract: number;
	creation: number;
};
export type StatsMessage = MessageBase & {
	stats: Stats;
};
export type Message = MempoolMessage | BlockMessage | ErrorMessage | AckMessage | StatsMessage;
export type Type0 = {
	/** hex */
	gasPrice: string;
};
export type Type2 = {
	/** hex */
	maxFeePerGas: string;
	/** hex */
	maxPriorityFeePerGas: string;
};
export type PendingTransactionBase = {
	hash: string;
	timestamp: string;
	from: string;
	to: string;
	nonce: number;
};
export type PendingTransactionV1 = PendingTransactionBase & (Type0 | Type2);
export type DroppedTransaction = {
	hash: string;
	dropped: boolean;
};
export type MempoolTransactionV1 = PendingTransactionV1 | DroppedTransaction;
export type Error = {
	code: number;
	message: string;
};
export type MessageBase = {
	feed: string;
	chainId: string;
};
export type MempoolMessageV1 = MessageBase & {
	transactions: MempoolTransactionV1[];
};
export type BlockMessageV1 = MessageBase & {
	/** tx hashes included in block */
	transactions: {
		hash: string;
	}[];
	hash: string;
	height: number;
	timestamp: string;
	txnCount: number;
	/** hex */
	baseFeePerGas: string;
	gasUsed: number;
	gasLimit: number;
	miner: string;
};
export type ErrorMessage = MessageBase & {
	error: Error;
};
export type AckMessage = {
	id: string;
};
export type Stats = {
	erc20: number;
	erc721: number;
	erc777: number;
	interactionTypes: InteractionTypes;
};
export type InteractionTypes = {
	eoa: number;
	contract: number;
	creation: number;
};
export type StatsMessage = MessageBase & {
	stats: Stats;
};
export type TransactionSegmentStats = {
	txnCount: number;
	value: number;
};
export type MempoolSummaryMessage = MessageBase & {
	marketable: TransactionSegmentStats;
	stables: TransactionSegmentStats;
	defiSwap?: TransactionSegmentStats;
	optimisticL2?: {
		txnCount: number;
		batchesCount: number;
	};
};
export type LatestBlockSummaryMessage = MessageBase & {
	stables: TransactionSegmentStats;
	ethBurned?: number;
	totalStaked?: number;
	height: number;
	txnCount: number;
	privateTxnCount: number;
	baseFee: string;
	baseFeeTrend?: string;
};
export type MessageV1 = MempoolMessageV1 | BlockMessageV1 | ErrorMessage | AckMessage | StatsMessage | MempoolSummaryMessage | LatestBlockSummaryMessage;
export declare enum SerializerVersion {
	"v0" = 0,
	"v1" = 1
}
export type DeserializedResponse = (MessageV1 | Message) & {
	serializerVersion: SerializerVersion;
};
export type Serializer = (message: MessageV1 | Message, version: SerializerVersion) => ArrayBuffer;
export type Deserializer = (message: ArrayBuffer) => DeserializedResponse;
export declare const serialize: Serializer;
export declare const deserialize: Deserializer;

export {};
