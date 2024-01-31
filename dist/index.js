// src/constants.ts
var parameterToTag = {
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
  maxFeePerGas: 34
};
var tagToParameter = Object.fromEntries(Object.entries(parameterToTag).map(([parameter, tag]) => [tag, parameter]));
var getTagLengthBytes = (tag) => {
  switch (tag) {
    case 3:
      return 4;
    case 15:
    case 25:
    case 29:
      return 2;
    default:
      return 1;
  }
};

// src/types-v1.ts
var SerializerVersion;
(function(SerializerVersion2) {
  SerializerVersion2[SerializerVersion2["v0"] = 0] = "v0";
  SerializerVersion2[SerializerVersion2["v1"] = 1] = "v1";
})(SerializerVersion || (SerializerVersion = {}));

// src/serialize.ts
var hexEncoder = (hex) => {
  let formatted = hex ? hex.startsWith("0x") ? hex : `0x${hex}` : "";
  const buf = Buffer.from(formatted, "hex");
  const bufLen = Buffer.allocUnsafe(1);
  bufLen.writeUInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};
var utf8Encoder = (str) => {
  const buf = Buffer.from(str, "utf8");
  const bufLen = Buffer.allocUnsafe(1);
  bufLen.writeUInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};
var int8Encoder = (int) => {
  const buf = Buffer.allocUnsafe(1);
  buf.writeUInt8(int);
  const bufLen = Buffer.allocUnsafe(1);
  bufLen.writeUInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};
var int16Encoder = (int) => {
  const buf = Buffer.allocUnsafe(2);
  buf.writeUInt16BE(int);
  const bufLen = Buffer.allocUnsafe(1);
  bufLen.writeUInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};
var numberEncoder = (gwei) => {
  const buf = Buffer.allocUnsafe(8);
  buf.writeDoubleBE(gwei);
  const bufLen = Buffer.allocUnsafe(1);
  bufLen.writeUInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};
var int32Encoder = (int) => {
  const buf = Buffer.allocUnsafe(4);
  buf.writeInt32BE(int);
  const bufLen = Buffer.allocUnsafe(1);
  bufLen.writeUInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};
var boolEncoder = (bool) => {
  const buf = Buffer.allocUnsafe(1);
  buf.writeUInt8(Number(bool));
  const bufLen = Buffer.allocUnsafe(1);
  bufLen.writeUInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};
var encode = (version, key, value) => {
  switch (version) {
    case SerializerVersion.v0: {
      return encodeV0(key, value);
    }
    case SerializerVersion.v1: {
      return encodeV1(key, value);
    }
    default: {
      console.warn(`Unrecognized version: ${version}`);
      return null;
    }
  }
};
var encodeV1 = (key, value) => {
  const tag = parameterToTag[key];
  if (typeof tag === "undefined") {
    console.warn(`Unrecognized object parameter: ${key}`);
    return null;
  }
  const tagBuf = Buffer.allocUnsafe(1);
  tagBuf.writeUInt8(tag);
  switch (key) {
    case "chainId": {
      const encodedLengthAndValue = hexEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "code":
    case "serializerVersion": {
      const encodedLengthAndValue = int8Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "hash": {
      const encodedLengthAndValue = hexEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "txnCount": {
      const encodedLengthAndValue = int16Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "miner":
    case "from":
    case "to":
    case "baseFeePerGas":
    case "gasPrice":
    case "maxFeePerGas":
    case "maxPriorityFeePerGas": {
      const encodedLengthAndValue = hexEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "dropped":
    case "private": {
      const encodedLengthAndValue = boolEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "feed":
    case "id":
    case "interactionType":
    case "message":
    case "status":
    case "timestamp": {
      const encodedLengthAndValue = utf8Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "gasLimit":
    case "gasUsed": {
      const encodedLengthAndValue = numberEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "creation":
    case "contract":
    case "eoa":
    case "erc20":
    case "erc721":
    case "erc777":
    case "height":
    case "index":
    case "nonce": {
      const encodedLengthAndValue = int32Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "transactions": {
      let allEncodedTransactions = Buffer.allocUnsafe(0);
      for (const transaction of value) {
        try {
          let encodedTransaction = Buffer.allocUnsafe(0);
          Object.entries(transaction).forEach(([key2, value2]) => {
            const encoded = encodeV1(key2, value2);
            if (encoded) {
              encodedTransaction = Buffer.concat([encodedTransaction, encoded]);
            }
          });
          const encodedTransactionsLength = Buffer.allocUnsafe(2);
          encodedTransactionsLength.writeUInt16BE(encodedTransaction.byteLength);
          allEncodedTransactions = Buffer.concat([
            allEncodedTransactions,
            Buffer.concat([encodedTransactionsLength, encodedTransaction])
          ]);
        } catch (error) {
          const { message } = error;
          console.error(`Error serializing transaction: ${message}`);
        }
      }
      const txsLength = Buffer.allocUnsafe(4);
      txsLength.writeUInt32BE(allEncodedTransactions.byteLength);
      return Buffer.concat([tagBuf, txsLength, allEncodedTransactions]);
    }
    case "error": {
      let encodedError = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV1(key2, value2);
        if (encoded) {
          encodedError = Buffer.concat([encodedError, encoded]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedError.byteLength);
      return Buffer.concat([tagBuf, len, encodedError]);
    }
    case "stats": {
      let encodedStats = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV1(key2, value2);
        if (encoded) {
          encodedStats = Buffer.concat([encodedStats, encoded]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedStats.byteLength);
      return Buffer.concat([tagBuf, len, encodedStats]);
    }
    case "interactionTypes": {
      let encodedInteractionTypes = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV1(key2, value2);
        if (encoded) {
          encodedInteractionTypes = Buffer.concat([
            encodedInteractionTypes,
            encoded
          ]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedInteractionTypes.byteLength);
      return Buffer.concat([tagBuf, len, encodedInteractionTypes]);
    }
    default:
      return null;
  }
};
var encodeV0 = (key, value) => {
  const tag = parameterToTag[key];
  if (typeof tag === "undefined") {
    console.warn(`Unrecognized object parameter: ${key}`);
    return null;
  }
  const tagBuf = Buffer.allocUnsafe(1);
  tagBuf.writeUInt8(tag);
  switch (key) {
    case "chainId": {
      const encodedLengthAndValue = int32Encoder(parseInt(value, 16));
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "code":
    case "serializerVersion": {
      const encodedLengthAndValue = int8Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "hash": {
      const encodedLengthAndValue = hexEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "txnCount": {
      const encodedLengthAndValue = int16Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "miner":
    case "from":
    case "to": {
      const encodedLengthAndValue = hexEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "dropped":
    case "private": {
      const encodedLengthAndValue = boolEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "baseFeePerGas":
    case "gasPrice":
    case "maxPriorityFeePerGas": {
      const encodedLengthAndValue = numberEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "feed":
    case "id":
    case "interactionType":
    case "message":
    case "status":
    case "timestamp": {
      const encodedLengthAndValue = utf8Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "creation":
    case "contract":
    case "eoa":
    case "erc20":
    case "erc721":
    case "erc777":
    case "gasLimit":
    case "gasUsed":
    case "height":
    case "index":
    case "nonce": {
      const encodedLengthAndValue = int32Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "transactions": {
      let allEncodedTransactions = Buffer.allocUnsafe(0);
      for (const transaction of value) {
        try {
          let encodedTransaction = Buffer.allocUnsafe(0);
          Object.entries(transaction).forEach(([key2, value2]) => {
            const encoded = encodeV0(key2, value2);
            if (encoded) {
              encodedTransaction = Buffer.concat([encodedTransaction, encoded]);
            }
          });
          const encodedTransactionsLength = Buffer.allocUnsafe(2);
          encodedTransactionsLength.writeUInt16BE(encodedTransaction.byteLength);
          allEncodedTransactions = Buffer.concat([
            allEncodedTransactions,
            Buffer.concat([encodedTransactionsLength, encodedTransaction])
          ]);
        } catch (error) {
          const { message } = error;
          console.error(`Error serializing transaction: ${message}`);
        }
      }
      const txsLength = Buffer.allocUnsafe(4);
      txsLength.writeUInt32BE(allEncodedTransactions.byteLength);
      return Buffer.concat([tagBuf, txsLength, allEncodedTransactions]);
    }
    case "error": {
      let encodedError = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV0(key2, value2);
        if (encoded) {
          encodedError = Buffer.concat([encodedError, encoded]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedError.byteLength);
      return Buffer.concat([tagBuf, len, encodedError]);
    }
    case "stats": {
      let encodedStats = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV0(key2, value2);
        if (encoded) {
          encodedStats = Buffer.concat([encodedStats, encoded]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedStats.byteLength);
      return Buffer.concat([tagBuf, len, encodedStats]);
    }
    case "interactionTypes": {
      let encodedInteractionTypes = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV0(key2, value2);
        if (encoded) {
          encodedInteractionTypes = Buffer.concat([
            encodedInteractionTypes,
            encoded
          ]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedInteractionTypes.byteLength);
      return Buffer.concat([tagBuf, len, encodedInteractionTypes]);
    }
    default:
      return null;
  }
};
var serialize = (message, version) => {
  let encoded = Buffer.allocUnsafe(0);
  const encodedVersion = encode(version, "serializerVersion", version);
  encoded = Buffer.concat([encoded, encodedVersion]);
  Object.entries(message).forEach(([key, value]) => {
    if (typeof value === "undefined")
      return;
    const encodedKeyValue = encode(version, key, value);
    if (encodedKeyValue) {
      encoded = Buffer.concat([encoded, encodedKeyValue]);
    }
  });
  return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength);
};
// src/deserialize.ts
var hexParser = (buf, key) => {
  const parsed = buf.toString("hex");
  return parsed || null;
};
var utf8Parser = (buf) => buf.toString("utf8");
var int8Parser = (buf) => buf.readUInt8();
var int16Parser = (buf) => buf.readUInt16BE();
var int32Parser = (buf) => buf.readInt32BE();
var numberParser = (buf) => buf.readDoubleBE();
var boolParser = (buf) => !!parseInt(`0x${buf.toString("hex")}`);
var decode = (version, tag, value) => {
  switch (version) {
    case SerializerVersion.v0: {
      return decodeV0(tag, value);
    }
    case SerializerVersion.v1: {
      return decodeV1(tag, value);
    }
    default: {
      console.warn(`Unrecognized version: ${version}`);
      return null;
    }
  }
};
var decodeV1 = (tag, value) => {
  const key = tagToParameter[tag];
  switch (key) {
    case "code":
    case "serializerVersion": {
      const decodedValue = int8Parser(value);
      return { key, value: decodedValue };
    }
    case "txnCount": {
      const decodedValue = int16Parser(value);
      return { key, value: decodedValue };
    }
    case "miner":
    case "from":
    case "to": {
      const decodedValue = hexParser(value, key);
      return { key, value: decodedValue };
    }
    case "chainId":
    case "hash":
    case "baseFeePerGas":
    case "gasPrice":
    case "maxFeePerGas":
    case "maxPriorityFeePerGas": {
      const decodedValue = hexParser(value, key);
      return { key, value: decodedValue };
    }
    case "dropped":
    case "private": {
      const decodedValue = boolParser(value);
      return { key, value: decodedValue };
    }
    case "feed":
    case "id":
    case "interactionType":
    case "message":
    case "status":
    case "timestamp": {
      const decodedValue = utf8Parser(value);
      return { key, value: decodedValue };
    }
    case "gasLimit":
    case "gasUsed": {
      const decodedValue = numberParser(value);
      return { key, value: decodedValue };
    }
    case "creation":
    case "contract":
    case "eoa":
    case "erc20":
    case "erc721":
    case "erc777":
    case "height":
    case "index":
    case "nonce": {
      const decodedValue = int32Parser(value);
      return { key, value: decodedValue };
    }
    case "transactions": {
      let transactions = [];
      let cursor = 0;
      while (cursor < value.byteLength) {
        const txLen = value.readUInt16BE(cursor);
        cursor += 2;
        const txVal = value.subarray(cursor, cursor + txLen);
        cursor += txLen;
        let txCursor = 0;
        const transaction = {};
        while (txCursor < txVal.byteLength) {
          const tag2 = txVal.readUInt8(txCursor);
          txCursor++;
          let len;
          if (getTagLengthBytes(tag2) === 2) {
            len = txVal.readUInt16BE(txCursor);
            txCursor += 2;
          } else {
            len = txVal.readUInt8(txCursor);
            txCursor++;
          }
          const val = txVal.subarray(txCursor, txCursor + len);
          txCursor += len;
          let decoded = null;
          try {
            decoded = decodeV1(tag2, val);
          } catch (error) {
            const { message } = error;
            console.error(`Error decoding tag: ${tag2}, value: ${val} - ${message}`);
          }
          if (decoded) {
            const { key: key2, value: value2 } = decoded;
            transaction[key2] = value2;
          } else {
            console.warn(`Unknown tag: ${tag2}`);
          }
        }
        transactions.push(transaction);
      }
      return { key, value: transactions };
    }
    case "error": {
      const decodedError = {};
      let cursor = 0;
      while (cursor < value.byteLength) {
        const tag2 = value.readUInt8(cursor);
        cursor++;
        let len;
        if (getTagLengthBytes(tag2) === 2) {
          len = value.readUInt16BE(cursor);
          cursor += 2;
        } else {
          len = value.readUInt8(cursor);
          cursor++;
        }
        const val = value.subarray(cursor, len + cursor);
        cursor += len;
        const decoded = decodeV1(tag2, val);
        if (decoded) {
          const { key: key2, value: value2 } = decoded;
          decodedError[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}`);
        }
      }
      return { key, value: decodedError };
    }
    case "stats": {
      const decodedStats = {};
      let cursor = 0;
      while (cursor < value.byteLength) {
        const tag2 = value.readUInt8(cursor);
        cursor++;
        let len;
        if (getTagLengthBytes(tag2) === 2) {
          len = value.readUInt16BE(cursor);
          cursor += 2;
        } else {
          len = value.readUInt8(cursor);
          cursor++;
        }
        const val = value.subarray(cursor, len + cursor);
        cursor += len;
        const decoded = decodeV1(tag2, val);
        if (decoded) {
          const { key: key2, value: value2 } = decoded;
          decodedStats[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}`);
        }
      }
      return { key, value: decodedStats };
    }
    case "interactionTypes": {
      const decodedInteractionTypes = {};
      let cursor = 0;
      while (cursor < value.byteLength) {
        const tag2 = value.readUInt8(cursor);
        cursor++;
        let len;
        if (getTagLengthBytes(tag2) === 2) {
          len = value.readUInt16BE(cursor);
          cursor += 2;
        } else {
          len = value.readUInt8(cursor);
          cursor++;
        }
        const val = value.subarray(cursor, len + cursor);
        cursor += len;
        const decoded = decodeV1(tag2, val);
        if (decoded) {
          const { key: key2, value: value2 } = decoded;
          decodedInteractionTypes[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}`);
        }
      }
      return { key, value: decodedInteractionTypes };
    }
    default:
      return null;
  }
};
var decodeV0 = (tag, value) => {
  const key = tagToParameter[tag];
  switch (key) {
    case "chainId": {
      const decodedValue = int32Parser(value);
      return { key, value: `0x${decodedValue.toString(16)}` };
    }
    case "code":
    case "serializerVersion": {
      const decodedValue = int8Parser(value);
      return { key, value: decodedValue };
    }
    case "hash": {
      const decodedValue = hexParser(value, key);
      return { key, value: decodedValue };
    }
    case "txnCount": {
      const decodedValue = int16Parser(value);
      return { key, value: decodedValue };
    }
    case "miner":
    case "from":
    case "to": {
      const decodedValue = hexParser(value, key);
      return { key, value: decodedValue };
    }
    case "dropped":
    case "private": {
      const decodedValue = boolParser(value);
      return { key, value: decodedValue };
    }
    case "baseFeePerGas":
    case "gasPrice":
    case "maxPriorityFeePerGas": {
      const decodedValue = numberParser(value);
      return { key, value: decodedValue };
    }
    case "feed":
    case "id":
    case "interactionType":
    case "message":
    case "status":
    case "timestamp": {
      const decodedValue = utf8Parser(value);
      return { key, value: decodedValue };
    }
    case "creation":
    case "contract":
    case "eoa":
    case "erc20":
    case "erc721":
    case "erc777":
    case "gasLimit":
    case "gasUsed":
    case "height":
    case "index":
    case "nonce": {
      const decodedValue = int32Parser(value);
      return { key, value: decodedValue };
    }
    case "transactions": {
      let transactions = [];
      let cursor = 0;
      while (cursor < value.byteLength) {
        const txLen = value.readUInt16BE(cursor);
        cursor += 2;
        const txVal = value.subarray(cursor, cursor + txLen);
        cursor += txLen;
        let txCursor = 0;
        const transaction = {};
        while (txCursor < txVal.byteLength) {
          const tag2 = txVal.readUInt8(txCursor);
          txCursor++;
          let len;
          if (getTagLengthBytes(tag2) === 2) {
            len = txVal.readUInt16BE(txCursor);
            txCursor += 2;
          } else {
            len = txVal.readUInt8(txCursor);
            txCursor++;
          }
          const val = txVal.subarray(txCursor, txCursor + len);
          txCursor += len;
          let decoded = null;
          try {
            decoded = decodeV0(tag2, val);
          } catch (error) {
            const { message } = error;
            console.error(`Error decoding tag: ${tag2}, value: ${val} - ${message}`);
          }
          if (decoded) {
            const { key: key2, value: value2 } = decoded;
            transaction[key2] = value2;
          } else {
            console.warn(`Unknown tag: ${tag2}`);
          }
        }
        transactions.push(transaction);
      }
      return { key, value: transactions };
    }
    case "error": {
      const decodedError = {};
      let cursor = 0;
      while (cursor < value.byteLength) {
        const tag2 = value.readUInt8(cursor);
        cursor++;
        let len;
        if (getTagLengthBytes(tag2) === 2) {
          len = value.readUInt16BE(cursor);
          cursor += 2;
        } else {
          len = value.readUInt8(cursor);
          cursor++;
        }
        const val = value.subarray(cursor, len + cursor);
        cursor += len;
        const decoded = decodeV0(tag2, val);
        if (decoded) {
          const { key: key2, value: value2 } = decoded;
          decodedError[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}`);
        }
      }
      return { key, value: decodedError };
    }
    case "stats": {
      const decodedStats = {};
      let cursor = 0;
      while (cursor < value.byteLength) {
        const tag2 = value.readUInt8(cursor);
        cursor++;
        let len;
        if (getTagLengthBytes(tag2) === 2) {
          len = value.readUInt16BE(cursor);
          cursor += 2;
        } else {
          len = value.readUInt8(cursor);
          cursor++;
        }
        const val = value.subarray(cursor, len + cursor);
        cursor += len;
        const decoded = decodeV0(tag2, val);
        if (decoded) {
          const { key: key2, value: value2 } = decoded;
          decodedStats[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}`);
        }
      }
      return { key, value: decodedStats };
    }
    case "interactionTypes": {
      const decodedInteractionTypes = {};
      let cursor = 0;
      while (cursor < value.byteLength) {
        const tag2 = value.readUInt8(cursor);
        cursor++;
        let len;
        if (getTagLengthBytes(tag2) === 2) {
          len = value.readUInt16BE(cursor);
          cursor += 2;
        } else {
          len = value.readUInt8(cursor);
          cursor++;
        }
        const val = value.subarray(cursor, len + cursor);
        cursor += len;
        const decoded = decodeV0(tag2, val);
        if (decoded) {
          const { key: key2, value: value2 } = decoded;
          decodedInteractionTypes[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}`);
        }
      }
      return { key, value: decodedInteractionTypes };
    }
    default:
      return null;
  }
};
var deserialize = (data) => {
  const buf = Buffer.from(data);
  const message = {};
  let cursor = 0;
  let version = SerializerVersion.v0;
  while (cursor < buf.byteLength) {
    const tag = buf.readUInt8(cursor);
    cursor++;
    let len;
    const tagLengthBytes = getTagLengthBytes(tag);
    if (tagLengthBytes === 4) {
      len = buf.readUint32BE(cursor);
      cursor += 4;
    } else if (tagLengthBytes === 2) {
      len = buf.readUInt16BE(cursor);
      cursor += 2;
    } else {
      len = buf.readUInt8(cursor);
      cursor++;
    }
    const val = buf.subarray(cursor, cursor + len);
    cursor += len;
    const decoded = decode(version, tag, val);
    if (decoded) {
      const { key, value } = decoded;
      if (key === "serializerVersion") {
        version = value;
      }
      message[key] = value;
    } else {
      console.warn(`Unknown tag: ${tag}`);
    }
  }
  return message;
};
export {
  serialize,
  deserialize
};
