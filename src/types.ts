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

export type Transaction = MempoolTransaction | CompletedTransaction;

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
};

export type ErrorMessage = MessageBase & {
  error: Error;
};

export type UnsubscribeMessage = MessageBase & {
  unsubscribe: true;
};

export type Message =
  | MempoolMessage
  | BlockMessage
  | ErrorMessage
  | UnsubscribeMessage;

export type MempoolMessageParser = (message: Buffer) => MempoolMessage;
export type BlockMessageParser = (message: Buffer) => BlockMessage;
export type ErrorMessageParser = (message: Buffer) => ErrorMessage;
export type UnsubscribeMessageParser = (message: Buffer) => UnsubscribeMessage;

export type MempoolMessageEncoder = (message: MempoolMessage) => Buffer;
export type BlockMessageEncoder = (message: BlockMessage) => Buffer;
export type ErrorMessageEncoder = (message: ErrorMessage) => Buffer;
export type UnsubscribeMessageEncoder = (message: UnsubscribeMessage) => Buffer;

export type MessageParser =
  | MempoolMessageParser
  | BlockMessageParser
  | ErrorMessageParser
  | UnsubscribeMessageParser;

export type MessageEncoder =
  | MempoolMessageEncoder
  | BlockMessageEncoder
  | ErrorMessageEncoder
  | UnsubscribeMessageEncoder;

export type ValueOf<Obj> = Obj[keyof Obj];
