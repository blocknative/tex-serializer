import { expect, test } from "bun:test";
import { serialize } from "../src/serialize.ts";
import { deserialize } from "../src/deserialize.ts";

import {
  ackMessage,
  blockMessage,
  errorMessage,
  mempoolMessage,
  statsMessage,
} from "./data.ts";

test("Successfully serializes and deserializes a mempool message", () => {
  const serialized = serialize(mempoolMessage);
  const deserialized = deserialize(serialized);

  expect(deserialized).toStrictEqual(mempoolMessage);
});

test("Successfully serializes and deserializes a block message", () => {
  const serialized = serialize(blockMessage);
  const deserialized = deserialize(serialized);

  expect(deserialized).toStrictEqual(blockMessage);
});

test("Successfully serializes and deserializes a error message", () => {
  const serialized = serialize(errorMessage);
  const deserialized = deserialize(serialized);

  expect(deserialized).toStrictEqual(errorMessage);
});

test("Successfully serializes and deserializes an ACK message", () => {
  const serialized = serialize(ackMessage);
  const deserialized = deserialize(serialized);

  expect(deserialized).toStrictEqual(ackMessage);
});

test("Succesfully serializes and deserializes a Mempool Stats message", () => {
  const serialized = serialize(statsMessage);
  const deserialized = deserialize(serialized);

  expect(deserialized).toStrictEqual(statsMessage);
});
