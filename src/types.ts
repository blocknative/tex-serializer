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
  stats: Stats;
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

export type ErrorMessage = Partial<MessageBase> & {
  error: Error;
};

export type AckMessage = {
  id: string;
};

export type Message = MempoolMessage | BlockMessage | ErrorMessage | AckMessage;

export type ValueOf<Obj> = Obj[keyof Obj];

export type Serializer = (message: Message) => ArrayBuffer;
export type Deserializer = (message: ArrayBuffer) => Message;

export type Stats = {
  erc20: number
  erc721: number
  erc777: number
  interactionTypes: { eoa: number; contract: number; creation: number }
}
