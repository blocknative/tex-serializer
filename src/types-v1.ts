import { Message } from './types'

export type Type0 = {
  /** hex */
  gasPrice: string
}

export type Type2 = {
  /** hex */
  maxFeePerGas: string
  /** hex */
  maxPriorityFeePerGas: string
}

export type PendingTransactionBase = {
  hash: string
  timestamp: string
  from: string
  to: string
  nonce: number
}

export type PendingTransactionV1 = PendingTransactionBase & (Type0 | Type2)

export type DroppedTransaction = {
  hash: string
  dropped: boolean
}

export type MempoolTransactionV1 = PendingTransactionV1 | DroppedTransaction

export type TransactionV1 = MempoolTransactionV1

export type Error = {
  code: number
  message: string
}

type MessageBase = {
  feed: string
  chainId: string
}

export type MempoolMessageV1 = MessageBase & {
  transactions: MempoolTransactionV1[]
}

export type BlockMessageV1 = MessageBase & {
  /** tx hashes included in block */
  transactions: string[]
  hash: string
  height: number
  timestamp: string
  txnCount: number
  /** hex */
  baseFeePerGas: string
  gasUsed: number
  gasLimit: number
  miner: string
}

export type ErrorMessage = MessageBase & {
  error: Error
}

export type AckMessage = {
  id: string
}

export type Stats = {
  erc20: number
  erc721: number
  erc777: number
  interactionTypes: InteractionTypes
}

export type InteractionTypes = {
  eoa: number
  contract: number
  creation: number
}

export type StatsMessage = MessageBase & {
  stats: Stats
}

export type MessageV1 =
  | MempoolMessageV1
  | BlockMessageV1
  | ErrorMessage
  | AckMessage
  | StatsMessage

export type ValueOf<Obj> = Obj[keyof Obj]

export const enum SerializerVersion {
  'v0',
  'v1'
}

export type DeserializedResponse = (MessageV1 | Message) & {
  version: SerializerVersion
}

export type Serializer = (
  message: MessageV1 | Message,
  version: SerializerVersion
) => ArrayBuffer

export type Deserializer = (message: ArrayBuffer) => DeserializedResponse
