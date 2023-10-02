# Serializer

A custom serializer and deserializer for WebSocket messages used in Transaction Explorer to minimize bandwidth requirements.

## Overview

A custom [TLV (Type Length Value)](https://devopedia.org/tlv-format) scheme is used for serialization. Each parameter of a message is encoded with a:

- Type (or tag) that indicates how to interpret the value. Always 1 byte.
- Length that indicates how long the value is which allows for variable length values. Usually 1 byte, but sometimes 2 bytes for larger values. See `getTagLengthBytes` helper in `./constants.ts` which defines the length bytes per tag.
- Value which is the encoded value.

All data parameters and their corresponding tags are defined in the `parameterToTag` object in the `./constants.ts` file. Since the tag length is always 1 byte, we can define up to 255 unique parameters without a breaking change.

To add a new parameter, add it to the `parameterToTag` object with a unique tag number (just add 1 to the last added). Then add the parameter and how to encode/decode it to the encode and decode functions in `serialize.ts` and `deserialize.ts`. The design is backwards compatible, so any new tags that get added will be ignored by deserializers that have not been updated to recognize the new tag.

There can be nested TLV's to represent nested parameters in a message object as can be seen currently with the `transactions` and `error` parameters.

If adding a new message type, ensure you add to the `types.ts` file as well as adding a test for the new message.

## Installing module

```bash
yarn add https://github.com/blocknative/tex-serializer.git
```

## Running locally

To install dependencies:

```bash
bun install
```

To build:

```bash
bun run build
```

Test:

```bash
bun run test
```
