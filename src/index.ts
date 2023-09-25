import { mempoolMessageParser } from "./deserialize.js";
import { Buffer } from "buffer";
import { encodeMempoolMessage } from "./serialize.js";

import {
  ErrorMessage,
  MempoolMessage,
  Message,
  MessageParser,
} from "./types.js";

const messageTagToParser: Record<number, MessageParser> = {
  1: mempoolMessageParser,
  // 2: ["block"],
  // 3: ["error"],
  // 4: ["unsubscribe"],
};

export const serialize = (message: Message) => {
  const { feed } = message;
  if ((message as ErrorMessage).error) {
    // error encoder
  } else if (feed === "mempool") {
    return encodeMempoolMessage(message as MempoolMessage);
  } else if (feed === "block") {
    // block encoder
  }

  throw new Error("Unrecognized message type");
};

export const deserialize = (message: Buffer) => {
  const messageTag = message.readInt8(0);
  const parser = messageTagToParser[messageTag];
  const parsed = parser(message.subarray(1));
  return parsed;
};
