/** Can have up to 255 tags (1 byte length) */
export const parameterToTag: Record<string, number> = {
  serializerVersion: 0,
  chainId: 1,
  feed: 2,
  transactions: 3,
  hash: 4,
  gasPrice: 5,
  to: 6,
  timestamp: 7,
  from: 8,
  nonce: 9,
  dropped: 10,
  height: 11,
  maxPriorityFeePerGas: 12,
  txnCount: 13,
  baseFeePerGas: 14,
  error: 15,
  code: 16,
  message: 17,
  status: 18,
  gasLimit: 19,
  gasUsed: 20,
  index: 21,
  id: 22,
  private: 23,
  interactionType: 24,
  stats: 25,
  erc20: 26,
  erc721: 27,
  erc777: 28,
  interactionTypes: 29,
  eoa: 30,
  contract: 31,
  creation: 32,
  miner: 33,
  maxFeePerGas: 34,
  baseFee: 35,
  value: 36,
  marketable: 37,
  stables: 38,
  ethTransfers: 39,
  privateTxnCount: 40,
  lastBaseFee: 41,
  ethBurned: 42,
  batchesCount: 43,
  optimisticL2: 44,
  defiSwap: 45,
  totalStaked: 46
}

export const tagToParameter: Record<number, string> = Object.fromEntries(
  Object.entries(parameterToTag).map(([parameter, tag]) => [tag, parameter])
)

export const getTagLengthBytes = (tag: number): number => {
  switch (tag) {
    case 3:
      return 4
    case 15:
    case 25:
    case 29:
    case 37:
    case 38:
    case 39:
    case 44:
    case 45:
      return 2
    default:
      return 1
  }
}
