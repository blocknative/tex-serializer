import { expect, test } from "vitest";
import { serialize } from "../src/serialize.ts";
import { blockMessage, mempoolMessage } from "./data.ts";
import { deserialize } from "../src/deserialize.ts";

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

// test("Successfully serializes and deserializes a error message", () => {
//   const serialized = serialize(mempoolMessage);
//   const deserialized = deserialize(serialized);

//   expect(deserialized).toStrictEqual(mempoolMessage);
// });

// test("Successfully serializes and deserializes an ACK message", () => {
//   const serialized = serialize(mempoolMessage);
//   const deserialized = deserialize(serialized);

//   expect(deserialized).toStrictEqual(mempoolMessage);
// });
