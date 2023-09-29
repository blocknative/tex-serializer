/** Can have up to 255 tags (1 byte length) */
export const parameterToTag: Record<string, number> = {
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
};

export const tagToParameter: Record<number, string> = Object.fromEntries(
  Object.entries(parameterToTag).map(([parameter, tag]) => [tag, parameter])
);

export const getTagLengthBytes = (tag: number): number => {
  switch (tag) {
    case 3:
    case 15:
      return 2;
    default:
      return 1;
  }
};
