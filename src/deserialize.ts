import Big from "big.js";
import { getTagLengthBytes, tagToParameter } from "./constants.ts";
import { Error, Message, Transaction, ValueOf } from "./types.ts";

export const hexParser = (buf: Buffer) => `0x${buf.toString("hex")}`;

export const gweiParser = (buf: Buffer) => {
  const numString = buf.toString("utf-8");
  return new Big(numString).toNumber();
};

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
    case "chainId": {
      const decodedValue = intParser(value);
      return { key, value: `0x${decodedValue.toString(16)}` };
    }
    case "feed": {
      const decodedValue = utf8Parser(value);
      return { key, value: decodedValue };
    }
    case "transactions": {
      let transactions: Transaction[] = [];
      let cursor = 0;

      while (cursor < value.byteLength) {
        const txLen = value.readInt16BE(cursor);
        cursor += 2;
        const txVal = value.subarray(cursor, cursor + txLen);
        cursor += txLen;

        // tx params
        let txCursor = 0;
        const transaction: Transaction = {} as Transaction;

        while (txCursor < txVal.byteLength) {
          const tag = txVal.readInt8(txCursor);
          txCursor++;

          let len: number;

          if (getTagLengthBytes(tag) === 2) {
            len = txVal.readInt16BE(txCursor);
            txCursor += 2;
          } else {
            len = txVal.readInt8(txCursor);
            txCursor++;
          }

          const val = txVal.subarray(txCursor, txCursor + len);
          txCursor += len;
          const decoded = decode(tag, val);

          if (decoded) {
            const { key, value } = decoded;
            transaction[key as keyof Transaction] =
              value as ValueOf<Transaction>;
          } else {
            console.warn(`Unknown tag: ${tag}`);
          }
        }

        transactions.push(transaction);
      }

      return { key, value: transactions };
    }
    case "hash": {
      const decodedValue = hexParser(value);
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
    case "height": {
      const decodedValue = intParser(value);
      return { key, value: decodedValue };
    }
    case "detectedTimestamp": {
      const decodedValue = utf8Parser(value);
      return { key, value: decodedValue };
    }
    case "txnCount": {
      const decodedValue = intParser(value);
      return { key, value: decodedValue };
    }
    case "baseFeePerGas": {
      const decodedValue = gweiParser(value);
      return { key, value: decodedValue };
    }
    case "error": {
      const decodedError: Error = {} as Error;
      let cursor = 0;

      while (cursor < value.byteLength) {
        const tag = value.readInt8(cursor);
        cursor++;
        const len = value.readInt16BE(cursor);
        cursor += 2;
        const val = value.subarray(cursor, len + cursor);
        cursor += len;
        const decoded = decode(tag, val);

        if (decoded) {
          const { key, value } = decoded;
          // @ts-ignore
          decodedError[key as keyof Error] = value as ValueOf<Error>;
        } else {
          console.warn(`Unknown tag: ${tag}`);
        }
      }

      return { key, value: decodedError };
    }
    case "code": {
      const decodedValue = intParser(value);
      return { key, value: decodedValue };
    }
    case "message": {
      const decodedValue = utf8Parser(value);
      return { key, value: decodedValue };
    }
    case "status": {
      const decodedValue = utf8Parser(value);
      return { key, value: decodedValue };
    }
    default:
      return null;
  }
};

export const deserialize = (buf: Buffer): Message => {
  const message: Message = {} as Message;
  let cursor = 0;

  while (cursor < buf.byteLength) {
    const tag = buf.readInt8(cursor);
    cursor++;

    let len: number;

    if (getTagLengthBytes(tag) === 2) {
      len = buf.readInt16BE(cursor);
      cursor += 2;
    } else {
      len = buf.readInt8(cursor);
      cursor++;
    }

    const val = buf.subarray(cursor, cursor + len);
    cursor += len;

    const decoded = decode(tag, val);

    if (decoded) {
      const { key, value } = decoded;
      message[key as keyof Message] = value as ValueOf<Message>;
    } else {
      console.warn(`Unknown tag: ${tag}`);
    }
  }

  return message;
};
