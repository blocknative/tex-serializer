import { parameterToTag } from "./constants.ts";
import { MempoolMessage } from "./types.ts";
import { Buffer } from "buffer";

const hexEncoder = (hash: string) => {
  const withoutPrefix = hash.slice(2);
  const buf = Buffer.from(withoutPrefix, "hex");
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const gweiEncoder = (gwei: number) => {
  const buf = Buffer.from(gwei.toString(16), "hex");
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const utf8Encoder = (str: string) => {
  const buf = Buffer.from(str, "utf8");
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const intEncoder = (int: number) => {
  const buf = Buffer.from([0, 0]);
  buf.writeInt16BE(int);
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const boolEncoder = (bool: boolean) => {
  const buf = Buffer.from([0]);
  buf.writeInt8(Number(bool));
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const encode = (key: string, value: unknown): Buffer | null => {
  const tagBuf = Buffer.from([]);
  tagBuf.writeInt8(parameterToTag[key]);

  switch (key) {
    case "hash": {
      const encodedLengthAndValue = hexEncoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "gasPrice": {
      const encodedLengthAndValue = gweiEncoder(value as number);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "to": {
      const encodedLengthAndValue = hexEncoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "timestamp": {
      const encodedLengthAndValue = utf8Encoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "from": {
      const encodedLengthAndValue = hexEncoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "nonce": {
      const encodedLengthAndValue = intEncoder(value as number);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "dropped": {
      const encodedLengthAndValue = boolEncoder(value as boolean);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    default:
      return null;
  }
};

export const encodeMempoolMessage = (message: MempoolMessage) => {
  const { chainId, transactions } = message;
  const chainIdBuf = Buffer.from([0, 0]);
  chainIdBuf.writeInt16BE(parseInt(chainId, 16));

  let allEncodedTransactions = Buffer.from("");

  for (const transaction of transactions) {
    let encodedTransaction = Buffer.from("");
    Object.entries(transaction).forEach(([key, value]) => {
      const encoded = encode(key, value);
      if (encoded) {
        encodedTransaction = Buffer.concat([encodedTransaction, encoded]);
      } else {
        console.warn(`Unrecognized parameter: ${key}`);
      }
    });

    const encodedTransactionLength = Buffer.from([0, 0]);
    encodedTransactionLength.writeInt16BE(encodedTransaction.byteLength);

    allEncodedTransactions = Buffer.concat([
      allEncodedTransactions,
      Buffer.concat([encodedTransactionLength, encodedTransaction]),
    ]);
  }

  return Buffer.concat([Buffer.from([1]), chainIdBuf, allEncodedTransactions]);
};
