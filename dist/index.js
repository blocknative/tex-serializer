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
  maxFeePerGas: 34,
  baseFee: 35,
  value: 36,
  marketable: 37,
  stables: 38,
  ethTransfers: 39,
  privateTxnCount: 40,
  excessBlobGas: 41,
  ethBurned: 42,
  batchesCount: 43,
  optimisticL2: 44,
  defiSwap: 45,
  totalStaked: 46,
  blobCount: 47,
  privateBlobCount: 48,
  blobBaseFee: 49,
  blobsOlderThanOneBlock: 50,
  blobGasUsed: 51,
  blobBaseFeeWei: 52,
  blobDiscount: 53,
  marketableCount: 54,
  underpricedCount: 55,
  blockedCount: 56,
  totalMempoolCounts: 57,
  totalCount: 58
};
var tagToParameter = Object.fromEntries(Object.entries(parameterToTag).map(([parameter, tag]) => [tag, parameter]));
var getTagLengthBytes = (tag) => {
  switch (tag) {
    case 3:
      return 4;
    case 15:
    case 25:
    case 29:
    case 37:
    case 38:
    case 39:
    case 44:
    case 45:
    case 57:
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
  const number = parseInt(hex, 16);
  const withoutPrefix = hex ? hex.startsWith("0x") ? hex.slice(2) : hex : "";
  const padded = number < 10 ? `0${withoutPrefix}` : withoutPrefix;
  const buf = Buffer.from(padded, "hex");
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
    case "blobsOlderThanOneBlock":
    case "privateTxnCount":
    case "privateBlobCount":
    case "blobCount":
    case "batchesCount":
    case "totalCount":
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
    case "totalStaked":
    case "baseFee":
    case "blobBaseFeeWei":
    case "blobDiscount":
    case "blobBaseFee":
    case "totalStaked":
    case "baseFeePerGas":
    case "gasPrice":
    case "maxFeePerGas":
    case "maxPriorityFeePerGas":
    case "blobGasUsed":
    case "excessBlobGas": {
      const encodedLengthAndValue = utf8Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "dropped":
    case "private": {
      const encodedLengthAndValue = boolEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "feed":
    case "id":
    case "message":
    case "status":
    case "timestamp": {
      const encodedLengthAndValue = utf8Encoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "gasLimit":
    case "ethBurned":
    case "gasUsed":
    case "value": {
      const encodedLengthAndValue = numberEncoder(value);
      return Buffer.concat([tagBuf, encodedLengthAndValue]);
    }
    case "height":
    case "index":
    case "marketableCount":
    case "underpricedCount":
    case "blockedCount":
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
    case "stables":
    case "ethTransfers":
    case "defiSwap": {
      let encodedHomepagePending = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV1(key2, value2);
        if (encoded) {
          encodedHomepagePending = Buffer.concat([
            encodedHomepagePending,
            encoded
          ]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedHomepagePending.byteLength);
      return Buffer.concat([tagBuf, len, encodedHomepagePending]);
    }
    case "optimisticL2": {
      let encodedHomepagePending = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV1(key2, value2);
        if (encoded) {
          encodedHomepagePending = Buffer.concat([
            encodedHomepagePending,
            encoded
          ]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedHomepagePending.byteLength);
      return Buffer.concat([tagBuf, len, encodedHomepagePending]);
    }
    case "marketable": {
      let encodedHomepagePending = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV1(key2, value2);
        if (encoded) {
          encodedHomepagePending = Buffer.concat([
            encodedHomepagePending,
            encoded
          ]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedHomepagePending.byteLength);
      return Buffer.concat([tagBuf, len, encodedHomepagePending]);
    }
    case "totalMempoolCounts": {
      let encodedHomepagePending = Buffer.allocUnsafe(0);
      Object.entries(value).forEach(([key2, value2]) => {
        const encoded = encodeV1(key2, value2);
        if (encoded) {
          encodedHomepagePending = Buffer.concat([
            encodedHomepagePending,
            encoded
          ]);
        }
      });
      const len = Buffer.allocUnsafe(2);
      len.writeUInt16BE(encodedHomepagePending.byteLength);
      return Buffer.concat([tagBuf, len, encodedHomepagePending]);
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
var hexParser = (buf) => {
  const parsed = buf.toString("hex");
  const num = parsed && parseInt(parsed, 16);
  const leadingZeroRemoved = parsed.startsWith("0") ? parsed.slice(1) : parsed;
  const hex = typeof num === "number" && num < 10 ? leadingZeroRemoved : parsed;
  return hex ? `0x${hex}` : null;
};
var utf8Parser = (buf) => buf.toString("utf8");
var int8Parser = (buf) => buf.readUInt8();
var int16Parser = (buf) => buf.readUInt16BE();
var int32Parser = (buf) => buf.readInt32BE();
var numberParser = (buf) => buf.readDoubleBE();
var boolParser = (buf) => !!parseInt(`0x${buf.toString("hex")}`);
var decode = (version, tag, value) => {
  switch (version) {
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
    case "blobsOlderThanOneBlock":
    case "privateTxnCount":
    case "privateBlobCount":
    case "blobCount":
    case "batchesCount":
    case "totalCount":
    case "txnCount": {
      const decodedValue = int16Parser(value);
      return { key, value: decodedValue };
    }
    case "chainId":
    case "hash":
    case "miner":
    case "from":
    case "to": {
      const decodedValue = hexParser(value);
      return { key, value: decodedValue };
    }
    case "totalStaked":
    case "baseFee":
    case "blobBaseFeeWei":
    case "blobDiscount":
    case "blobBaseFee":
    case "baseFeePerGas":
    case "gasPrice":
    case "maxFeePerGas":
    case "maxPriorityFeePerGas":
    case "blobGasUsed":
    case "excessBlobGas": {
      const decodedValue = utf8Parser(value);
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
    case "ethBurned":
    case "gasUsed":
    case "value": {
      const decodedValue = numberParser(value);
      return { key, value: decodedValue };
    }
    case "height":
    case "index":
    case "marketableCount":
    case "underpricedCount":
    case "blockedCount":
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
    case "stables":
    case "ethTransfers":
    case "defiSwap": {
      const decodedTransactionSegmentStats = {};
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
          decodedTransactionSegmentStats[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}  ${val}`);
        }
      }
      return { key, value: decodedTransactionSegmentStats };
    }
    case "optimisticL2": {
      const decodedL2SegmentStats = {};
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
          decodedL2SegmentStats[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}  ${val}`);
        }
      }
      return { key, value: decodedL2SegmentStats };
    }
    case "marketable": {
      const decodedMarketableSegmentStats = {};
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
          decodedMarketableSegmentStats[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}  ${val}`);
        }
      }
      return { key, value: decodedMarketableSegmentStats };
    }
    case "totalMempoolCounts": {
      const decodedTotalMempoolCounts = {};
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
          decodedTotalMempoolCounts[key2] = value2;
        } else {
          console.warn(`Unknown tag: ${tag2}  ${val}`);
        }
      }
      return { key, value: decodedTotalMempoolCounts };
    }
    default:
      return null;
  }
};
var deserialize = (data) => {
  const buf = Buffer.from(data);
  const message = {};
  let cursor = 0;
  let version = SerializerVersion.v1;
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
  deserialize,
  SerializerVersion
};
