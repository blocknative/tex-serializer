import { expect, test } from 'bun:test'
import { serialize } from '../src/serialize.ts'
import { deserialize } from '../src/deserialize.ts'
import { SerializerVersion } from '../src/types-v1'

import {
  ackMessage,
  blockMessage,
  errorMessage,
  mempoolMessage,
  statsMessage,
  homepagePendingMessage,
  homepageConfirmedMessage
} from './data.ts'

test('Successfully serializes and deserializes a mempool message', () => {
  const serialized = serialize(mempoolMessage, SerializerVersion.v1)
  const deserialized = deserialize(serialized)

  expect(deserialized).toStrictEqual({
    serializerVersion: 1,
    ...mempoolMessage
  })
})

test('Successfully serializes and deserializes a block message', () => {
  const serialized = serialize(blockMessage, SerializerVersion.v1)
  const deserialized = deserialize(serialized)

  expect(deserialized).toStrictEqual({ serializerVersion: 1, ...blockMessage })
})

test('Successfully serializes and deserializes a error message', () => {
  const serialized = serialize(errorMessage, SerializerVersion.v1)
  const deserialized = deserialize(serialized)

  expect(deserialized).toStrictEqual({ serializerVersion: 1, ...errorMessage })
})

test('Successfully serializes and deserializes an ACK message', () => {
  const serialized = serialize(ackMessage, SerializerVersion.v1)
  const deserialized = deserialize(serialized)

  expect(deserialized).toStrictEqual({ serializerVersion: 1, ...ackMessage })
})

test('Successfully serializes and deserializes a Mempool Stats message', () => {
  const serialized = serialize(statsMessage, SerializerVersion.v1)
  const deserialized = deserialize(serialized)

  expect(deserialized).toStrictEqual({ serializerVersion: 1, ...statsMessage })
})

test('Successfully serializes and deserializes a Homepage Pending message', () => {
  const serialized = serialize(homepagePendingMessage, SerializerVersion.v1)
  const deserialized = deserialize(serialized)

  expect(deserialized).toStrictEqual({ serializerVersion: 1, ...homepagePendingMessage })
})

test('Successfully serializes and deserializes a Homepage Confirmed message', () => {
  const serialized = serialize(homepageConfirmedMessage, SerializerVersion.v1)
  const deserialized = deserialize(serialized)

  expect(deserialized).toStrictEqual({ serializerVersion: 1, ...homepageConfirmedMessage })
})
