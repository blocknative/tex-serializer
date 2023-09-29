import { getTagLengthBytes, tagToParameter } from "./constants.ts";
import { Deserializer, Error, Message, Transaction, ValueOf } from "./types.ts";

export const hexParser = (buf: Buffer) => `0x${buf.toString("hex")}`;
export const addressParser = (buf: Buffer) => {
  const parsed = buf.toString("hex");
  return parsed ? `0x${parsed}` : null;
};
export const utf8Parser = (buf: Buffer) => buf.toString("utf8");
export const int8Parser = (buf: Buffer) => buf.readInt8();
export const int16Parser = (buf: Buffer) => buf.readInt16BE();
export const int32Parser = (buf: Buffer) => buf.readInt32BE();
export const numberParser = (buf: Buffer) => buf.readDoubleBE();

export const boolParser = (buf: Buffer) =>
  !!parseInt(`0x${buf.toString("hex")}`);

const decode = (
  tag: number,
  value: Buffer
): { key: string; value: unknown } | null => {
  const key = tagToParameter[tag];

  switch (key) {
    case "chainId": {
      const decodedValue = int16Parser(value);
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
      const decodedValue = numberParser(value);
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
      const decodedValue = int32Parser(value);
      return { key, value: decodedValue };
    }
    case "gasUsed": {
      const decodedValue = int32Parser(value);
      return { key, value: decodedValue };
    }
    case "index": {
      const decodedValue = int32Parser(value);
      return { key, value: decodedValue };
    }
    case "dropped": {
      const decodedValue = boolParser(value);
      return { key, value: decodedValue };
    }
    case "height": {
      const decodedValue = int32Parser(value);
      return { key, value: decodedValue };
    }
    case "txnCount": {
      const decodedValue = int16Parser(value);
      return { key, value: decodedValue };
    }
    case "baseFeePerGas": {
      const decodedValue = numberParser(value);
      return { key, value: decodedValue };
    }
    case "maxPriorityFeePerGas": {
      const decodedValue = numberParser(value);
      return { key, value: decodedValue };
    }
    case "gasLimit": {
      const decodedValue = int32Parser(value);
      return { key, value: decodedValue };
    }
    case "error": {
      const decodedError: Error = {} as Error;
      let cursor = 0;

      while (cursor < value.byteLength) {
        const tag = value.readInt8(cursor);
        cursor++;

        let len: number;

        if (getTagLengthBytes(tag) === 2) {
          len = value.readInt16BE(cursor);
          cursor += 2;
        } else {
          len = value.readInt8(cursor);
          cursor++;
        }

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
      const decodedValue = int8Parser(value);
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
    case "id": {
      const decodedValue = utf8Parser(value);
      return { key, value: decodedValue };
    }
    default:
      return null;
  }
};

export const deserialize: Deserializer = (buf) => {
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
