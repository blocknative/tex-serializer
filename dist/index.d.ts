// Generated by dts-bundle-generator v8.1.2

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
	blobCount: number;
	/** hex */
	baseFeePerGas: string;
	gasUsed: number;
	gasLimit: number;
	miner: string;
	blobGasUsed: string;
	excessBlobGas: string;
};
export type ErrorMessage = MessageBase & {
	error: Error;
};
export type AckMessage = {
	id: string;
};
export type TotalMempoolCounts = {
	marketableCount: number;
	totalCount: number;
};
export type Stats = {
	marketableCount: number;
	underpricedCount: number;
	blockedCount: number;
	totalMempoolCounts?: TotalMempoolCounts;
};
export type StatsMessage = MessageBase & {
	stats: Stats;
};
export type TransactionSegmentStats = {
	txnCount: number;
	value: number;
};
export type MarketableSegmentStats = {
	txnCount: number;
	value: number;
	blobCount: number;
};
export type L2SegmentStats = {
	txnCount: number;
	batchesCount: number;
};
export type MempoolSummaryMessage = MessageBase & {
	marketable: MarketableSegmentStats;
	stables: TransactionSegmentStats;
	ethTransfers: TransactionSegmentStats;
	defiSwap: TransactionSegmentStats;
	optimisticL2: L2SegmentStats;
};
export type LatestBlockSummaryMessage = MessageBase & {
	height: number;
	timestamp: string;
	txnCount: number;
	blobCount: number;
	baseFee: string;
	blobBaseFee?: string;
	blobBaseFeeWei: string;
	ethBurned: number;
	totalStaked: string;
	privateTxnCount: number;
	privateBlobCount: number;
	gasUsed: number;
	gasLimit: number;
	blobsOlderThanOneBlock: number;
	blobDiscount: string;
};
export type MessageV1 = MempoolMessageV1 | BlockMessageV1 | ErrorMessage | AckMessage | StatsMessage | MempoolSummaryMessage | LatestBlockSummaryMessage;
export declare enum SerializerVersion {
	"v0" = 0,
	"v1" = 1
}
export type DeserializedResponse = MessageV1 & {
	serializerVersion: SerializerVersion;
};
export type Serializer = (message: MessageV1, version: SerializerVersion) => ArrayBuffer;
export type Deserializer = (message: ArrayBuffer) => DeserializedResponse;
export declare const serialize: Serializer;
export declare const deserialize: Deserializer;

export {};
