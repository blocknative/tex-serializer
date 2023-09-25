export const hashParser = (buf) => `0x${buf.toString("hex")}`;

export const gweiParser = (buf) => parseFloat(`0x${buf.toString("hex")}`);

export const addressParser = (buf) => `0x${buf.toString("hex")}`;

export const utf8Parser = (buf) => buf.toString("utf8");

export const intParser = (buf) => parseInt(`0x${buf.toString("hex")}`);

export const boolParser = (buf) => !!parseInt(`0x${buf.toString("hex")}`);

const parameterTagParsers = {
  1: ["hash", hashParser],
  2: ["gasPrice", gweiParser],
  3: ["to", addressParser],
  4: ["timestamp", utf8Parser],
  5: ["from", addressParser],
  6: ["nonce", intParser],
  7: ["dropped", boolParser],
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

/**
 * [2byte chainId][....transactions[[2byte transaction length][[1byte parameter tag][1byte parameter length in bytes][variable length parameter value]]]]
 */
export const pendingMessageParser = (buf) => {
  const chainId = buf.readInt16BE(0);

  let transactions = [];
  let cursor = 2;

  // transactions
  while (cursor < buf.byteLength) {
    const transactionLength = buf.readInt16BE(cursor);
    cursor += 2;
    const transactionBuf = buf.subarray(cursor, transactionLength + cursor);
    cursor += transactionLength;

    let txCursor = 0;

    let formattedTransaction = {};
    while (txCursor < transactionBuf.byteLength) {
      const parameterTag = transactionBuf.readInt8(txCursor);
      txCursor += 1;
      const length = transactionBuf.readInt8(txCursor);
      txCursor += 1;
      const value = transactionBuf.subarray(txCursor, length + cursor);
      txCursor += length;
      const [parameter, parser] = parameterTagParsers[parameterTag];
      formattedTransaction[parameter] = parser(value);
    }

    transactions.push(formattedTransaction);
  }

  return {
    feed: "mempool",
    chainId: `0x${chainId.toString(16)}`,
    transactions,
  };
};
