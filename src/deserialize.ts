import { getTagLengthBytes, tagToParameter } from './constants.ts'
import {
  Deserializer,
  ValueOf,
  SerializerVersion,
  DeserializedResponse, TransactionSegmentStats
} from './types-v1'

import {
  Error,
  InteractionTypes,
  Message,
  Stats,
  Transaction
} from './types.ts'

export const hexParser = (buf: Buffer) => {
  const parsed = buf.toString('hex')
  return parsed ? `0x${parsed}` : null
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
    case SerializerVersion.v0: {
      return decodeV0(tag, value)
    }

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
    case 'gasUsed': {
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
      let transactions: Transaction[] = []
      let cursor = 0

      while (cursor < value.byteLength) {
        const txLen = value.readUInt16BE(cursor)
        cursor += 2
        const txVal = value.subarray(cursor, cursor + txLen)
        cursor += txLen

        // tx params
        let txCursor = 0
        const transaction: Transaction = {} as Transaction

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
            transaction[key as keyof Transaction] =
              value as ValueOf<Transaction>
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

    case 'stables':
    case 'marketable': {
      const decodedStats: TransactionSegmentStats = {} as TransactionSegmentStats
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
          decodedStats[key as keyof TransactionSegmentStats] = value as ValueOf<TransactionSegmentStats>
        } else {
          console.warn(`Unknown tag: ${tag}  ${val}`)
        }
      }

      return { key, value: decodedStats }
    }
    default:
      return null
  }
}

const decodeV0 = (
  tag: number,
  value: Buffer
): { key: string; value: unknown } | null => {
  const key = tagToParameter[tag]

  switch (key) {
    case 'chainId': {
      const decodedValue = int32Parser(value)
      return { key, value: `0x${decodedValue.toString(16)}` }
    }

    case 'code':
    case 'serializerVersion': {
      const decodedValue = int8Parser(value)
      return { key, value: decodedValue }
    }

    case 'hash': {
      const decodedValue = hexParser(value)
      return { key, value: decodedValue }
    }

    case 'txnCount': {
      const decodedValue = int16Parser(value)
      return { key, value: decodedValue }
    }

    case 'miner':
    case 'from':
    case 'to': {
      const decodedValue = hexParser(value)
      return { key, value: decodedValue }
    }

    case 'dropped':
    case 'private': {
      const decodedValue = boolParser(value)
      return { key, value: decodedValue }
    }

    case 'baseFeePerGas':
    case 'gasPrice':
    case 'maxPriorityFeePerGas': {
      const decodedValue = numberParser(value)
      return { key, value: decodedValue }
    }

    case 'feed':
    case 'id':
    case 'interactionType':
    case 'message':
    case 'status':
    case 'timestamp': {
      const decodedValue = utf8Parser(value)
      return { key, value: decodedValue }
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
      const decodedValue = int32Parser(value)
      return { key, value: decodedValue }
    }

    case 'transactions': {
      let transactions: Transaction[] = []
      let cursor = 0

      while (cursor < value.byteLength) {
        const txLen = value.readUInt16BE(cursor)
        cursor += 2
        const txVal = value.subarray(cursor, cursor + txLen)
        cursor += txLen

        // tx params
        let txCursor = 0
        const transaction: Transaction = {} as Transaction

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
            decoded = decodeV0(tag, val)
          } catch (error) {
            const { message } = error as Error
            console.error(
              `Error decoding tag: ${tag}, value: ${val} - ${message}`
            )
          }

          if (decoded) {
            const { key, value } = decoded
            transaction[key as keyof Transaction] =
              value as ValueOf<Transaction>
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
        const decoded = decodeV0(tag, val)

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
        const decoded = decodeV0(tag, val)

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
        const decoded = decodeV0(tag, val)

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

    default:
      return null
  }
}

export const deserialize: Deserializer = data => {
  const buf = Buffer.from(data)

  const message: DeserializedResponse = {} as DeserializedResponse

  let cursor = 0
  let version = SerializerVersion.v0

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

      message[key as keyof Message] = value as ValueOf<Message>
    } else {
      console.warn(`Unknown tag: ${tag}`)
    }
  }

  return message
}
