export const parameterToTag: Record<string, number> = {
  hash: 1,
  gasPrice: 2,
  to: 3,
  timestamp: 4,
  from: 5,
  nonce: 6,
  dropped: 7,
  // 8: ['index', ],
  // 9: ['gasUsed', ],
  // 10: ['status', ],
  // 11: ['code', ],
  // 12: ['message', ],
  // 13: ['chainId', ],
  // 14: ['height', ],
  // 15: ['detectedTimestamp', ],
  // 16: ['txnCount', ],
  // 17: ['baseFeePerGas', ]
};

export const tagToParameter: Record<number, string> = Object.fromEntries(
  Object.entries(parameterToTag).map(([parameter, tag]) => [tag, parameter])
);
