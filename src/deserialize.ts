import { tagToParameter } from "./constants.ts";
import { MempoolMessage, MempoolTransaction, ValueOf } from "./types.ts";

export const hashParser = (buf: Buffer) => `0x${buf.toString("hex")}`;

export const gweiParser = (buf: Buffer) =>
  parseFloat(`0x${buf.toString("hex")}`);

export const addressParser = (buf: Buffer) => `0x${buf.toString("hex")}`;
export const utf8Parser = (buf: Buffer) => buf.toString("utf8");
export const intParser = (buf: Buffer) => parseInt(`0x${buf.toString("hex")}`);

export const boolParser = (buf: Buffer) =>
  !!parseInt(`0x${buf.toString("hex")}`);

const decode = (
  tag: number,
  value: Buffer
): { key: string; value: unknown } | null => {
  const key = tagToParameter[tag];

  switch (key) {
    case "hash": {
      const decodedValue = hashParser(value);
      return { key, value: decodedValue };
    }
    case "gasPrice": {
      const decodedValue = gweiParser(value);
      return { key, value: decodedValue };
    }
    case "to": {
      const decodedValue = addressParser(value);
      return { key, value: decodedValue };
    }
    case "timestamp": {
      const decodedValue = utf8Parser(value);
      return { key, value: decodedValue };
    }
    case "from": {
      const decodedValue = addressParser(value);
      return { key, value: decodedValue };
    }
    case "nonce": {
      const decodedValue = intParser(value);
      return { key, value: decodedValue };
    }
    case "dropped": {
      const decodedValue = boolParser(value);
      return { key, value: decodedValue };
    }
    default:
      return null;
  }
};

/**
 * [2byte chainId][....transactions[[2byte transaction length][[1byte parameter tag][1byte parameter length in bytes][variable length parameter value]]]]
 */
export const mempoolMessageParser = (buf: Buffer): MempoolMessage => {
  const chainId = buf.readInt16BE(0);

  let transactions: MempoolTransaction[] = [];
  let cursor = 2;

  // transactions
  while (cursor < buf.byteLength) {
    const transactionLength = buf.readInt16BE(cursor);
    cursor += 2;
    const transactionBuf = buf.subarray(cursor, transactionLength + cursor);
    cursor += transactionLength;

    let txCursor = 0;

    const formattedTransaction: MempoolTransaction = {} as MempoolTransaction;

    while (txCursor < transactionBuf.byteLength) {
      const parameterTag = transactionBuf.readInt8(txCursor);
      txCursor += 1;
      const length = transactionBuf.readInt8(txCursor);
      txCursor += 1;
      const value = transactionBuf.subarray(txCursor, length + cursor);
      txCursor += length;
      const decoded = decode(parameterTag, value);

      if (decoded) {
        const { key, value } = decoded;
        formattedTransaction[key as keyof MempoolTransaction] =
          value as ValueOf<MempoolTransaction>;
      } else {
        console.warn(`Unknown parameter tag: ${parameterTag}`);
      }
    }

    transactions.push(formattedTransaction);
  }

  return {
    feed: "mempool",
    chainId: `0x${chainId.toString(16)}`,
    transactions,
  };
};
