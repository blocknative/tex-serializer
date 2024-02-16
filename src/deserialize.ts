import { getTagLengthBytes, tagToParameter } from './constants.ts'

import {
  Deserializer,
  ValueOf,
  SerializerVersion,
  type TransactionV1,
  type Stats,
  type InteractionTypes,
  type MessageV1,
  DeserializedResponse,
  TransactionSegmentStats
} from './types-v1'

export const hexParser = (buf: Buffer) => {
  const parsed = buf.toString('hex')
  const num = parsed && parseInt(parsed, 16)

  /** Hex values 0x9 and below do not get represented as a buffer correctly
   * so the serializer will pad those hex values with a leading zero to prevent becoming an empty string.
   */
  const leadingZeroRemoved = parsed.startsWith('0') ? parsed.slice(1) : parsed
  const hex = typeof num === 'number' && num < 10 ? leadingZeroRemoved : parsed

  return hex ? `0x${hex}` : null
}

export const utf8Parser = (buf: Buffer) => buf.toString('utf8')
export const int8Parser = (buf: Buffer) => buf.readUInt8()
export const int16Parser = (buf: Buffer) => buf.readUInt16BE()
export const int32Parser = (buf: Buffer) => buf.readInt32BE()
export const numberParser = (buf: Buffer) => buf.readDoubleBE()

export const boolParser = (buf: Buffer) =>
  !!parseInt(`0x${buf.toString('hex')}`)

const decode = (
  version: SerializerVersion,
  tag: number,
  value: Buffer
): { key: string; value: unknown } | null => {
  switch (version) {
    case SerializerVersion.v1: {
      return decodeV1(tag, value)
    }

    default: {
      console.warn(`Unrecognized version: ${version}`)
      return null
    }
  }
}

const decodeV1 = (
  tag: number,
  value: Buffer
): { key: string; value: unknown } | null => {
  const key = tagToParameter[tag]

  switch (key) {
    case 'code':
    case 'serializerVersion': {
      const decodedValue = int8Parser(value)
      return { key, value: decodedValue }
    }

    case 'privateTxnCount':
    case 'batchesCount':
    case 'txnCount': {
      const decodedValue = int16Parser(value)
      return { key, value: decodedValue }
    }

    case 'chainId':
    case 'hash':
    case 'miner':
    case 'from':
    case 'to': {
      const decodedValue = hexParser(value)
      return { key, value: decodedValue }
    }

    case 'baseFee':
    case 'baseFeePerGas':
    case 'gasPrice':
    case 'maxFeePerGas':
    case 'maxPriorityFeePerGas': {
      const decodedValue = utf8Parser(value)
      return { key, value: decodedValue }
    }

    case 'dropped':
    case 'private': {
      const decodedValue = boolParser(value)
      return { key, value: decodedValue }
    }

    case 'baseFeeTrend':
    case 'feed':
    case 'id':
    case 'interactionType':
    case 'message':
    case 'status':
    case 'timestamp': {
      const decodedValue = utf8Parser(value)
      return { key, value: decodedValue }
    }

    case 'gasLimit':
    case 'ethBurned':
    case 'gasUsed':
    case 'value': {
      const decodedValue = numberParser(value)
      return { key, value: decodedValue }
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
      const decodedValue = int32Parser(value)
      return { key, value: decodedValue }
    }

    case 'transactions': {
      let transactions: TransactionV1[] = []
      let cursor = 0

      while (cursor < value.byteLength) {
        const txLen = value.readUInt16BE(cursor)
        cursor += 2
        const txVal = value.subarray(cursor, cursor + txLen)
        cursor += txLen

        // tx params
        let txCursor = 0
        const transaction: TransactionV1 = {} as TransactionV1

        while (txCursor < txVal.byteLength) {
          const tag = txVal.readUInt8(txCursor)
          txCursor++

          let len: number

          if (getTagLengthBytes(tag) === 2) {
            len = txVal.readUInt16BE(txCursor)
            txCursor += 2
          } else {
            len = txVal.readUInt8(txCursor)
            txCursor++
          }

          const val = txVal.subarray(txCursor, txCursor + len)
          txCursor += len

          let decoded: { key: string; value: unknown } | null = null

          try {
            decoded = decodeV1(tag, val)
          } catch (error) {
            const { message } = error as Error
            console.error(
              `Error decoding tag: ${tag}, value: ${val} - ${message}`
            )
          }

          if (decoded) {
            const { key, value } = decoded
            transaction[key as keyof TransactionV1] =
              value as ValueOf<TransactionV1>
          } else {
            console.warn(`Unknown tag: ${tag}`)
          }
        }

        transactions.push(transaction)
      }

      return { key, value: transactions }
    }

    case 'error': {
      const decodedError: Error = {} as Error
      let cursor = 0

      while (cursor < value.byteLength) {
        const tag = value.readUInt8(cursor)
        cursor++

        let len: number

        if (getTagLengthBytes(tag) === 2) {
          len = value.readUInt16BE(cursor)
          cursor += 2
        } else {
          len = value.readUInt8(cursor)
          cursor++
        }

        const val = value.subarray(cursor, len + cursor)
        cursor += len
        const decoded = decodeV1(tag, val)

        if (decoded) {
          const { key, value } = decoded
          // @ts-ignore
          decodedError[key as keyof Error] = value as ValueOf<Error>
        } else {
          console.warn(`Unknown tag: ${tag}`)
        }
      }

      return { key, value: decodedError }
    }

    case 'stats': {
      const decodedStats: Stats = {} as Stats
      let cursor = 0

      while (cursor < value.byteLength) {
        const tag = value.readUInt8(cursor)
        cursor++

        let len: number

        if (getTagLengthBytes(tag) === 2) {
          len = value.readUInt16BE(cursor)
          cursor += 2
        } else {
          len = value.readUInt8(cursor)
          cursor++
        }

        const val = value.subarray(cursor, len + cursor)
        cursor += len
        const decoded = decodeV1(tag, val)

        if (decoded) {
          const { key, value } = decoded
          // @ts-ignore
          decodedStats[key as keyof Stats] = value as ValueOf<Stats>
        } else {
          console.warn(`Unknown tag: ${tag}`)
        }
      }

      return { key, value: decodedStats }
    }

    case 'interactionTypes': {
      const decodedInteractionTypes: InteractionTypes = {} as InteractionTypes
      let cursor = 0

      while (cursor < value.byteLength) {
        const tag = value.readUInt8(cursor)
        cursor++

        let len: number

        if (getTagLengthBytes(tag) === 2) {
          len = value.readUInt16BE(cursor)
          cursor += 2
        } else {
          len = value.readUInt8(cursor)
          cursor++
        }

        const val = value.subarray(cursor, len + cursor)
        cursor += len
        const decoded = decodeV1(tag, val)

        if (decoded) {
          const { key, value } = decoded
          // @ts-ignore
          decodedInteractionTypes[key as keyof InteractionTypes] =
            value as ValueOf<InteractionTypes>
        } else {
          console.warn(`Unknown tag: ${tag}`)
        }
      }

      return { key, value: decodedInteractionTypes }
    }

    case 'marketable':
    case 'stables':
    case 'ethTransfers':
    case 'optimisticL2':
    case 'defiSwap': {
      const decodedTransactionSegmentStats: TransactionSegmentStats =
        {} as TransactionSegmentStats
      let cursor = 0

      while (cursor < value.byteLength) {
        const tag = value.readUInt8(cursor)
        cursor++

        let len: number

        if (getTagLengthBytes(tag) === 2) {
          len = value.readUInt16BE(cursor)
          cursor += 2
        } else {
          len = value.readUInt8(cursor)
          cursor++
        }

        const val = value.subarray(cursor, len + cursor)
        cursor += len
        const decoded = decodeV1(tag, val)

        if (decoded) {
          const { key, value } = decoded
          // @ts-ignore
          decodedTransactionSegmentStats[key as keyof TransactionSegmentStats] =
            value as ValueOf<TransactionSegmentStats>
        } else {
          console.warn(`Unknown tag: ${tag}  ${val}`)
        }
      }

      return { key, value: decodedTransactionSegmentStats }
    }
    default:
      return null
  }
}

export const deserialize: Deserializer = data => {
  const buf = Buffer.from(data)

  const message: DeserializedResponse = {} as DeserializedResponse

  let cursor = 0
  let version = SerializerVersion.v1

  while (cursor < buf.byteLength) {
    const tag = buf.readUInt8(cursor)
    cursor++

    let len: number
    const tagLengthBytes = getTagLengthBytes(tag)

    if (tagLengthBytes === 4) {
      len = buf.readUint32BE(cursor)
      cursor += 4
    } else if (tagLengthBytes === 2) {
      len = buf.readUInt16BE(cursor)
      cursor += 2
    } else {
      len = buf.readUInt8(cursor)
      cursor++
    }

    const val = buf.subarray(cursor, cursor + len)
    cursor += len

    const decoded = decode(version, tag, val)

    if (decoded) {
      const { key, value } = decoded
      if (key === 'serializerVersion') {
        version = value as number
      }

      message[key as keyof MessageV1] = value as ValueOf<MessageV1>
    } else {
      console.warn(`Unknown tag: ${tag}`)
    }
  }

  return message
}
