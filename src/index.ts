import { mempoolMessage } from "./data.ts";
import { deserialize } from "./deserialize.ts";
import { serialize } from "./serialize.ts";

export { serialize } from "./serialize.ts";
export { deserialize } from "./deserialize.ts";

const serialized = serialize(mempoolMessage);

console.log({ serialized });

const deserialized = deserialize(serialized);

console.log({ deserialized });
