export type PendingTransaction = {
  hash: string;
  gasPrice: number;
  to: string;
  timestamp: string;
};

export type DroppedTransaction = {
  hash: string;
  dropped: boolean;
};

export type ConfirmedTransaction = {
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

export type PendingMessage = {
  feed: string;
  chainId: string;
  transactions: PendingTransaction[];
};

export type MessageParser = (buf: Buffer) => PendingMessage;
