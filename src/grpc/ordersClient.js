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
const PROTO_PATH = path.join(__dirname, "..", "protos", "orders.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH, loaderOptions);
const orderPackage = grpc.loadPackageDefinition(packageDef).orderPackage;

const client = new orderPackage.Orders(
  process.env.ORDER_GRPC_URL,
  grpc.credentials.createInsecure(),
);

/**
 * Update Payment Status
 */
export function updatePaymentStatusAsync(payload) {
  return new Promise((resolve, reject) => {
    client.updatePaymentStatus(payload, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response);
    });
  });
}
