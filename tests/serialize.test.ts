import { expect, test } from 'bun:test'
import { serialize } from '../src/serialize.ts'
import { deserialize } from '../src/deserialize.ts'
import { SerializerVersion } from '../src/types-v1'

import {
  ackMessage,
  blockMessage,
  errorMessage,
  mempoolMessage,
  statsMessage
} from './data.ts'

test('Successfully serializes and deserializes a mempool message', () => {
  const serialized = serialize(mempoolMessage, SerializerVersion.v0)
  const deserialized = deserialize(serialized)

  expect({
    serializerVersion: SerializerVersion.v0,
    ...deserialized
  }).toStrictEqual({
    serializerVersion: SerializerVersion.v0,
    ...mempoolMessage
  })
})

test('Successfully serializes and deserializes a block message', () => {
  const serialized = serialize(blockMessage, SerializerVersion.v0)
  const deserialized = deserialize(serialized)

  expect({
    serializerVersion: SerializerVersion.v0,
    ...deserialized
  }).toStrictEqual({ serializerVersion: SerializerVersion.v0, ...blockMessage })
})

test('Successfully serializes and deserializes a error message', () => {
  const serialized = serialize(errorMessage, SerializerVersion.v0)
  const deserialized = deserialize(serialized)

  expect({
    serializerVersion: SerializerVersion.v0,
    ...deserialized
  }).toStrictEqual({ serializerVersion: SerializerVersion.v0, ...errorMessage })
})

test('Successfully serializes and deserializes an ACK message', () => {
  const serialized = serialize(ackMessage, SerializerVersion.v0)
  const deserialized = deserialize(serialized)

  expect({
    serializerVersion: SerializerVersion.v0,
    ...deserialized
  }).toStrictEqual({ serializerVersion: SerializerVersion.v0, ...ackMessage })
})

test('Succesfully serializes and deserializes a Mempool Stats message', () => {
  const serialized = serialize(statsMessage, SerializerVersion.v0)
  const deserialized = deserialize(serialized)

  expect({
    serializerVersion: SerializerVersion.v0,
    ...deserialized
  }).toStrictEqual({ serializerVersion: SerializerVersion.v0, ...statsMessage })
})
