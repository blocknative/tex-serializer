const hexEncoder = (hash) => {
  const withoutPrefix = hash.slice(2);
  const buf = Buffer.from(withoutPrefix, "hex");
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const gweiEncoder = (gwei) => {
  const buf = Buffer.from(gwei.toString(16), "hex");
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const utf8Encoder = (str) => {
  const buf = Buffer.from(str, "utf8");
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const intEncoder = (int) => {
  const buf = Buffer.from([0, 0]);
  buf.writeInt16BE(int);
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const boolEncoder = (bool) => {
  const buf = Buffer.from([0]);
  buf.writeInt8(Number(bool));
  const bufLen = Buffer.from([0]);
  bufLen.writeInt8(buf.byteLength);
  return Buffer.concat([bufLen, buf]);
};

const parameterTagEncoders = {
  h: [1, hexEncoder],
  g: [2, gweiEncoder],
  to: [3, hexEncoder],
  t: [4, utf8Encoder],
  f: [5, hexEncoder],
  n: [6, intEncoder],
  d: [7, boolEncoder],
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

export const encodePendingTransactions = (transactions) => {
  let allEncodedTransactions = Buffer.from("");

  for (const transaction of transactions) {
    let encodedTransaction = Buffer.from("");
    const keys = Object.keys(transaction);

    keys.forEach((key) => {
      const [tag, encoder] = parameterTagEncoders[key];
      const tagBuf = Buffer.from([0]);
      tagBuf.writeInt8(tag);
      const value = transaction[key];
      const encodedLengthAndValue = encoder(value);
      const encoded = Buffer.concat([tagBuf, encodedLengthAndValue]);
      encodedTransaction = Buffer.concat([encodedTransaction, encoded]);
    });

    const encodedTransactionLength = Buffer.from([0, 0]);
    encodedTransactionLength.writeInt16BE(encodedTransaction.byteLength);

    allEncodedTransactions = Buffer.concat([
      allEncodedTransactions,
      Buffer.concat([encodedTransactionLength, encodedTransaction]),
    ]);
  }

  return allEncodedTransactions;
};
