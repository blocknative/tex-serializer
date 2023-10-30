import { parameterToTag } from './constants.ts'

import {
  CompletedTransaction,
  InteractionTypes,
  MempoolTransaction,
  Serializer,
  Stats,
} from './types.ts'

const hexEncoder = (hash: string | null) => {
  const withoutPrefix = hash ? hash.slice(2) : ''
  const buf = Buffer.from(withoutPrefix, 'hex')
  const bufLen = Buffer.allocUnsafe(1)
  bufLen.writeUInt8(buf.byteLength)
  return Buffer.concat([bufLen, buf])
}

const utf8Encoder = (str: string) => {
  const buf = Buffer.from(str, 'utf8')
  const bufLen = Buffer.allocUnsafe(1)
  bufLen.writeUInt8(buf.byteLength)
  return Buffer.concat([bufLen, buf])
}

const int8Encoder = (int: number) => {
  const buf = Buffer.allocUnsafe(1)
  buf.writeUInt8(int)
  const bufLen = Buffer.allocUnsafe(1)
  bufLen.writeUInt8(buf.byteLength)
  return Buffer.concat([bufLen, buf])
}

const int16Encoder = (int: number) => {
  const buf = Buffer.allocUnsafe(2)
  buf.writeUInt16BE(int)
  const bufLen = Buffer.allocUnsafe(1)
  bufLen.writeUInt8(buf.byteLength)
  return Buffer.concat([bufLen, buf])
}

const numberEncoder = (gwei: number) => {
  const buf = Buffer.allocUnsafe(8)
  buf.writeDoubleBE(gwei)
  const bufLen = Buffer.allocUnsafe(1)
  bufLen.writeUInt8(buf.byteLength)
  return Buffer.concat([bufLen, buf])
}

const int32Encoder = (int: number) => {
  const buf = Buffer.allocUnsafe(4)
  buf.writeInt32BE(int)
  const bufLen = Buffer.allocUnsafe(1)
  bufLen.writeUInt8(buf.byteLength)
  return Buffer.concat([bufLen, buf])
}

const boolEncoder = (bool: boolean) => {
  const buf = Buffer.allocUnsafe(1)
  buf.writeUInt8(Number(bool))
  const bufLen = Buffer.allocUnsafe(1)
  bufLen.writeUInt8(buf.byteLength)
  return Buffer.concat([bufLen, buf])
}

const encode = (key: string, value: unknown): Buffer | null => {
  const tag = parameterToTag[key]

  if (!tag) {
    console.warn(`Unrecognized object parameter: ${key}`)
    return null
  }

  const tagBuf = Buffer.allocUnsafe(1)
  tagBuf.writeUInt8(tag)

  switch (key) {
    case 'chainId': {
      const encodedLengthAndValue = int32Encoder(parseInt(value as string, 16))
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'code': {
      const encodedLengthAndValue = int8Encoder(value as number)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'hash': {
      const encodedLengthAndValue = hexEncoder(value as string)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'txnCount': {
      const encodedLengthAndValue = int16Encoder(value as number)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'from':
    case 'to': {
      const encodedLengthAndValue = hexEncoder(value as string)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'dropped':
    case 'private': {
      const encodedLengthAndValue = boolEncoder(value as boolean)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'baseFeePerGas':
    case 'gasPrice':
    case 'maxPriorityFeePerGas': {
      const encodedLengthAndValue = numberEncoder(value as number)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'feed':
    case 'id':
    case 'interactionType':
    case 'message':
    case 'status':
    case 'timestamp': {
      const encodedLengthAndValue = utf8Encoder(value as string)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'creation':
    case 'contract':
    case 'eoa':
    case 'erc20':
    case 'erc721':
    case 'erc777':
    case 'gasLimit':
    case 'gasUsed':
    case 'height':
    case 'index':
    case 'nonce': {
      const encodedLengthAndValue = int32Encoder(value as number)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }
    case 'transactions': {
      let allEncodedTransactions = Buffer.allocUnsafe(0)

      for (const transaction of value as (
        | MempoolTransaction
        | CompletedTransaction
      )[]) {
        let encodedTransaction = Buffer.allocUnsafe(0)

        Object.entries(transaction).forEach(([key, value]) => {
          const encoded = encode(key, value)
          if (encoded) {
            encodedTransaction = Buffer.concat([encodedTransaction, encoded])
          }
        })

        const encodedTransactionsLength = Buffer.allocUnsafe(2)
        encodedTransactionsLength.writeUInt16BE(encodedTransaction.byteLength)

        allEncodedTransactions = Buffer.concat([
          allEncodedTransactions,
          Buffer.concat([encodedTransactionsLength, encodedTransaction]),
        ])
      }

      const txsLength = Buffer.allocUnsafe(4)
      txsLength.writeUInt32BE(allEncodedTransactions.byteLength)

      return Buffer.concat([tagBuf, txsLength, allEncodedTransactions])
    }
    case 'error': {
      let encodedError = Buffer.allocUnsafe(0)

      Object.entries(value as Error).forEach(([key, value]) => {
        const encoded = encode(key, value)

        if (encoded) {
          encodedError = Buffer.concat([encodedError, encoded])
        }
      })

      const len = Buffer.allocUnsafe(2)
      len.writeUInt16BE(encodedError.byteLength)

      return Buffer.concat([tagBuf, len, encodedError])
    }
    case 'stats': {
      let encodedStats = Buffer.allocUnsafe(0)

      Object.entries(value as Stats).forEach(([key, value]) => {
        const encoded = encode(key, value)

        if (encoded) {
          encodedStats = Buffer.concat([encodedStats, encoded])
        }
      })

      const len = Buffer.allocUnsafe(2)
      len.writeUInt16BE(encodedStats.byteLength)

      return Buffer.concat([tagBuf, len, encodedStats])
    }
    case 'interactionTypes': {
      let encodedInteractionTypes = Buffer.allocUnsafe(0)

      Object.entries(value as InteractionTypes).forEach(([key, value]) => {
        const encoded = encode(key, value)

        if (encoded) {
          encodedInteractionTypes = Buffer.concat([
            encodedInteractionTypes,
            encoded,
          ])
        }
      })

      const len = Buffer.allocUnsafe(2)
      len.writeUInt16BE(encodedInteractionTypes.byteLength)

      return Buffer.concat([tagBuf, len, encodedInteractionTypes])
    }
    default:
      return null
  }
}

export const serialize: Serializer = message => {
  let encoded = Buffer.allocUnsafe(0)

  Object.entries(message).forEach(([key, value]) => {
    // don't serialize undefined values
    if (typeof value === 'undefined') return

    const encodedKeyValue = encode(key, value)

    if (encodedKeyValue) {
      encoded = Buffer.concat([encoded, encodedKeyValue])
    }
  })

  return encoded.buffer.slice(
    encoded.byteOffset,
    encoded.byteOffset + encoded.byteLength
  ) as ArrayBuffer
}
