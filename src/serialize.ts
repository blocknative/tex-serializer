import { parameterToTag } from './constants.ts'

import {
  TransactionSegmentStats,
  L2SegmentStats,
  Serializer,
  SerializerVersion,
  type MempoolTransactionV1,
  type CompletedTransaction,
  type Stats,
  type InteractionTypes,
  MarketableSegmentStats
} from './types-v1.ts'

const hexEncoder = (hex: string) => {
  const number = parseInt(hex, 16)
  const withoutPrefix = hex ? (hex.startsWith('0x') ? hex.slice(2) : hex) : ''

  /** Hex values 0x9 and below do not get represented as a buffer correctly
   * so need to be padded with a leading zero to prevent becoming an empty string.
   * Deserializer will strip the leading zero if the resulting num < 10
   */
  const padded = number < 10 ? `0${withoutPrefix}` : withoutPrefix
  const buf = Buffer.from(padded, 'hex')

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

const encode = (
  version: SerializerVersion,
  key: string,
  value: unknown
): Buffer | null => {
  switch (version) {
    case SerializerVersion.v1: {
      return encodeV1(key, value)
    }
    default: {
      console.warn(`Unrecognized version: ${version}`)
      return null
    }
  }
}

const encodeV1 = (key: string, value: unknown): Buffer | null => {
  const tag = parameterToTag[key]

  if (typeof tag === 'undefined') {
    console.warn(`Unrecognized object parameter: ${key}`)
    return null
  }

  const tagBuf = Buffer.allocUnsafe(1)
  tagBuf.writeUInt8(tag)

  switch (key) {
    case 'chainId': {
      const encodedLengthAndValue = hexEncoder(value as string)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'code':
    case 'serializerVersion': {
      const encodedLengthAndValue = int8Encoder(value as number)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'hash': {
      const encodedLengthAndValue = hexEncoder(value as string)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'privateTxnCount':
    case 'privateBlobCount':
    case 'blobCount':
    case 'batchesCount':
    case 'txnCount': {
      const encodedLengthAndValue = int16Encoder(value as number)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'miner':
    case 'from':
    case 'to': {
      const encodedLengthAndValue = hexEncoder(value as string)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'totalStaked':
    case 'baseFee':
    case 'blobBaseFee':
    case 'totalStaked':
    case 'baseFeePerGas':
    case 'gasPrice':
    case 'maxFeePerGas':
    case 'maxPriorityFeePerGas': {
      const encodedLengthAndValue = utf8Encoder(value as string)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'dropped':
    case 'private': {
      const encodedLengthAndValue = boolEncoder(value as boolean)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'baseFeeTrend':
    case 'feed':
    case 'id':
    case 'interactionType':
    case 'message':
    case 'status':
    case 'timestamp': {
      const encodedLengthAndValue = utf8Encoder(value as string)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'gasLimit':
    case 'ethBurned':
    case 'gasUsed':
    case 'value': {
      const encodedLengthAndValue = numberEncoder(value as number)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'creation':
    case 'contract':
    case 'eoa':
    case 'erc20':
    case 'erc721':
    case 'erc777':
    case 'height':
    case 'index':
    case 'nonce': {
      const encodedLengthAndValue = int32Encoder(value as number)
      return Buffer.concat([tagBuf, encodedLengthAndValue])
    }

    case 'transactions': {
      let allEncodedTransactions = Buffer.allocUnsafe(0)

      for (const transaction of value as (
        | MempoolTransactionV1
        | CompletedTransaction
      )[]) {
        try {
          let encodedTransaction = Buffer.allocUnsafe(0)

          Object.entries(transaction).forEach(([key, value]) => {
            const encoded = encodeV1(key, value)

            if (encoded) {
              encodedTransaction = Buffer.concat([encodedTransaction, encoded])
            }
          })

          const encodedTransactionsLength = Buffer.allocUnsafe(2)
          encodedTransactionsLength.writeUInt16BE(encodedTransaction.byteLength)

          allEncodedTransactions = Buffer.concat([
            allEncodedTransactions,
            Buffer.concat([encodedTransactionsLength, encodedTransaction])
          ])
        } catch (error) {
          const { message } = error as Error
          console.error(`Error serializing transaction: ${message}`)
        }
      }

      const txsLength = Buffer.allocUnsafe(4)
      txsLength.writeUInt32BE(allEncodedTransactions.byteLength)

      return Buffer.concat([tagBuf, txsLength, allEncodedTransactions])
    }

    case 'error': {
      let encodedError = Buffer.allocUnsafe(0)

      Object.entries(value as Error).forEach(([key, value]) => {
        const encoded = encodeV1(key, value)

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
        const encoded = encodeV1(key, value)

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
        const encoded = encodeV1(key, value)

        if (encoded) {
          encodedInteractionTypes = Buffer.concat([
            encodedInteractionTypes,
            encoded
          ])
        }
      })

      const len = Buffer.allocUnsafe(2)
      len.writeUInt16BE(encodedInteractionTypes.byteLength)

      return Buffer.concat([tagBuf, len, encodedInteractionTypes])
    }

    case 'stables':
    case 'ethTransfers':
    case 'defiSwap': {
      let encodedHomepagePending = Buffer.allocUnsafe(0)

      Object.entries(value as TransactionSegmentStats).forEach(
        ([key, value]) => {
          const encoded = encodeV1(key, value)

          if (encoded) {
            encodedHomepagePending = Buffer.concat([
              encodedHomepagePending,
              encoded
            ])
          }
        }
      )

      const len = Buffer.allocUnsafe(2)
      len.writeUInt16BE(encodedHomepagePending.byteLength)

      return Buffer.concat([tagBuf, len, encodedHomepagePending])
    }

    case 'optimisticL2': {
      let encodedHomepagePending = Buffer.allocUnsafe(0)

      Object.entries(value as L2SegmentStats).forEach(([key, value]) => {
        const encoded = encodeV1(key, value)

        if (encoded) {
          encodedHomepagePending = Buffer.concat([
            encodedHomepagePending,
            encoded
          ])
        }
      })

      const len = Buffer.allocUnsafe(2)
      len.writeUInt16BE(encodedHomepagePending.byteLength)

      return Buffer.concat([tagBuf, len, encodedHomepagePending])
    }
    case 'marketable': {
      let encodedHomepagePending = Buffer.allocUnsafe(0)

      Object.entries(value as MarketableSegmentStats).forEach(
        ([key, value]) => {
          const encoded = encodeV1(key, value)

          if (encoded) {
            encodedHomepagePending = Buffer.concat([
              encodedHomepagePending,
              encoded
            ])
          }
        }
      )

      const len = Buffer.allocUnsafe(2)
      len.writeUInt16BE(encodedHomepagePending.byteLength)

      return Buffer.concat([tagBuf, len, encodedHomepagePending])
    }
    default:
      return null
  }
}

export const serialize: Serializer = (message, version) => {
  let encoded = Buffer.allocUnsafe(0)

  // encode version first
  const encodedVersion = encode(version, 'serializerVersion', version)
  encoded = Buffer.concat([encoded, encodedVersion!])

  Object.entries(message).forEach(([key, value]) => {
    // don't serialize undefined values
    if (typeof value === 'undefined') return

    const encodedKeyValue = encode(version, key, value)

    if (encodedKeyValue) {
      encoded = Buffer.concat([encoded, encodedKeyValue])
    }
  })

  return encoded.buffer.slice(
    encoded.byteOffset,
    encoded.byteOffset + encoded.byteLength
  ) as ArrayBuffer
}
