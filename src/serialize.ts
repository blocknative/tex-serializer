import { parameterToTag } from "./constants.ts";
import { Buffer } from "buffer";

import { CompletedTransaction, MempoolTransaction, Message } from "./types.ts";

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
  const tagBuf = Buffer.from([0]);
  tagBuf.writeInt8(parameterToTag[key]);

  console.log("tag:", parameterToTag[key]);

  switch (key) {
    case "chainId": {
      const encodedLengthAndValue = hexEncoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "feed": {
      const encodedLengthAndValue = utf8Encoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "transactions": {
      let allEncodedTransactions = Buffer.from("");

      for (const transaction of value as (
        | MempoolTransaction
        | CompletedTransaction
      )[]) {
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

      const txsLength = Buffer.from([0, 0]);
      txsLength.writeInt16BE(allEncodedTransactions.byteLength);

      return Buffer.concat([tagBuf, txsLength, allEncodedTransactions]);
    }
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
    case "height": {
      const encodedLengthAndValue = intEncoder(value as number);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "detectedTimestamp": {
      const encodedLengthAndValue = utf8Encoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "txnCount": {
      const encodedLengthAndValue = intEncoder(value as number);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "baseFeePerGas": {
      const encodedLengthAndValue = gweiEncoder(value as number);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "error": {
      let encodedError = Buffer.from("");

      Object.entries(value as Error).forEach(([key, value]) => {
        const encoded = encode(key, value);

        if (encoded) {
          encodedError = Buffer.concat([encodedError, encoded]);
        } else {
          console.log(`Unknown error parameter: ${key}`);
        }
      });

      const len = Buffer.from([0, 0]);
      len.writeInt16BE(encodedError.byteLength);

      return Buffer.concat([tagBuf, len, encodedError]);
    }
    case "code": {
      const encodedLengthAndValue = intEncoder(value as number);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "message": {
      const encodedLengthAndValue = utf8Encoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "status": {
      const encodedLengthAndValue = utf8Encoder(value as string);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    default:
      return null;
  }
};

export const serialize = (message: Message) => {
  let encoded = Buffer.from("");

  Object.entries(message).forEach(([key, value]) => {
    const encodedKeyValue = encode(key, value);

    if (encodedKeyValue) {
      encoded = Buffer.concat([encoded, encodedKeyValue]);
    }
  });

  return encoded;
};
