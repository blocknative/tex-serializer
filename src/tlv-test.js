import { mempoolMessage } from "./data.js";
import { encodePendingTransactions } from "./encoders.js";
import { pendingMessageParser } from "./parsers.js";

/**
 * [1byte message tag][variable length message]
 */
const messageTagParsers = {
  1: pendingMessageParser,
  // 2: ["block"],
  // 3: ["error"],
  // 4: ["unsubscribe"],
};

const serialize = (message) => {
  const { chainId, transactions } = message;
  const transactionsBuf = encodePendingTransactions(transactions);
  const chainIdBuf = Buffer.from([0, 0]);
  chainIdBuf.writeInt16BE(parseInt(chainId, 16));

  return Buffer.concat([Buffer.from([1]), chainIdBuf, transactionsBuf]);
};

const deserialize = (message) => {
  const messageTag = message.readInt8(0);
  const parser = messageTagParsers[messageTag];
  const parsed = parser(message.subarray(1));
  return parsed;
};

const formattedMempoolMessage = {
  chainId: mempoolMessage.data.chainId,
  transactions: mempoolMessage.data.txs,
};

const serialized = serialize(formattedMempoolMessage);

console.log({ serialized, size: serialized.byteLength });

const deserialized = deserialize(serialized);

console.log({ deserialized });
