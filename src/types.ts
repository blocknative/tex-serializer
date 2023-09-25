export type PendingTransaction = {
  hash: string;
  gasPrice: number;
  to: string;
  timestamp: string;
  from: string;
  nonce: number;
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
  to: string;
  gasUsed: number;
  status: string;
};

export type Error = {
  code: number;
  message: string;
};

export type MempoolMessage = {
  feed: "mempool";
  chainId: string;
  transactions: MempoolTransaction[];
};

export type BlockMessage = {
  feed: "block";
  chainId: string;
  transactions: CompletedTransaction[];
  hash: string;
  height: number;
  timestamp: string;
  detectedTimestamp: string;
  txnCount: number;
  baseFeePerGas: string;
};

export type ErrorMessage = {
  feed: "mempool" | "block";
  chainId: string;
  error: Error;
};

export type Message = MempoolMessage | BlockMessage | ErrorMessage;

export type MempoolMessageParser = (message: Buffer) => MempoolMessage;
export type BlockMessageParser = (message: Buffer) => BlockMessage;
export type ErrorMessageParser = (message: Buffer) => ErrorMessage;

export type MempoolMessageEncoder = (message: MempoolMessage) => Buffer;
export type BlockMessageEncoder = (message: BlockMessage) => Buffer;
export type ErrorMessageEncoder = (message: ErrorMessage) => Buffer;

export type MessageParser =
  | MempoolMessageParser
  | BlockMessageParser
  | ErrorMessageParser;

export type MessageEncoder =
  | MempoolMessageEncoder
  | BlockMessageEncoder
  | ErrorMessageEncoder;

export type ValueOf<Obj> = Obj[keyof Obj];
