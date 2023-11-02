// @ts-nocheck
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
const PROTO_PATH = path.join(__dirname, "..", "protos", "notifications.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH, loaderOptions);
const notificationsPackage =
  grpc.loadPackageDefinition(packageDef).notificationsPackage;

const client = new notificationsPackage.userAccounting(
  process.env.NOTIFICATION_GRPC_URL,
  grpc.credentials.createInsecure(),
);

/**
 * paymentNotification
 */
export function paymentNotificationAsync(payload) {
  return new Promise((resolve, reject) => {
    client.paymentNotification(payload, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response);
    });
  });
}
