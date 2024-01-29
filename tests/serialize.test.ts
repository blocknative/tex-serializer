import { expect, test } from 'bun:test'
import { serialize } from '../src/serialize.ts'
import { deserialize } from '../src/deserialize.ts'
import { Version } from '../src/types-v1'

import {
  ackMessage,
  blockMessage,
  errorMessage,
  mempoolMessage,
  statsMessage
} from './data.ts'

test('Successfully serializes and deserializes a mempool message', () => {
  const serialized = serialize(mempoolMessage, Version.v0)
  const deserialized = deserialize(serialized, Version.v0)

  expect(deserialized).toStrictEqual(mempoolMessage)
})

test.only('Successfully serializes and deserializes a block message', () => {
  const serialized = serialize(blockMessage, Version.v0)
  const deserialized = deserialize(serialized, Version.v0)

  expect(deserialized).toStrictEqual(blockMessage)
})

test('Successfully serializes and deserializes a error message', () => {
  const serialized = serialize(errorMessage, Version.v0)
  const deserialized = deserialize(serialized, Version.v0)

  expect(deserialized).toStrictEqual(errorMessage)
})

test('Successfully serializes and deserializes an ACK message', () => {
  const serialized = serialize(ackMessage, Version.v0)
  const deserialized = deserialize(serialized, Version.v0)

  expect(deserialized).toStrictEqual(ackMessage)
})

test('Succesfully serializes and deserializes a Mempool Stats message', () => {
  const serialized = serialize(statsMessage, Version.v0)
  const deserialized = deserialize(serialized, Version.v0)

  expect(deserialized).toStrictEqual(statsMessage)
})
