import { mempoolMessage } from "./data.ts";
import { Timestamp } from "@bufbuild/protobuf";
import {
  WebSocketResponse,
  Data,
  PendingTx,
  DroppedTx,
  MempoolData,
  MempoolTx,
} from "./gen/message_pb.ts";

const { status, feed, data } = mempoolMessage;

const response = new WebSocketResponse({ status, feed });

const txs = data.txs.map(
  (tx) =>
    new MempoolTx({
      tx: tx.d
        ? { case: "dropped", value: new DroppedTx(tx) }
        : {
            case: "pending",
            value: new PendingTx({
              ...tx,
              t: Timestamp.fromDate(new Date(tx.t!)),
            }),
          },
    })
);

const mempoolData = new MempoolData({ chainId: data.chainId, txs });
response.data = new Data({ data: { case: "mempool", value: mempoolData } });

const serializedResponse = response.toBinary();

console.log({ serializedResponse });

const decode = new WebSocketResponse();

const deserialized = decode.fromBinary(serializedResponse);

console.log({
  deserialized: deserialized.toJson(),
  serializedResponseLength: serializedResponse.byteLength,
  originalLength: new Blob([JSON.stringify(mempoolData)]).size,
});
