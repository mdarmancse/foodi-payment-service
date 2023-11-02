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
const PROTO_PATH = path.join(__dirname, "..", "protos", "userAccounting.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH, loaderOptions);
const userAccountingPackage =
  grpc.loadPackageDefinition(packageDef).userAccountingPackage;

const client = new userAccountingPackage.userAccounting(
  process.env.USER_ACCOUNTING_GRPC_URL,
  grpc.credentials.createInsecure(),
);

/**
 * updateSubscriptionPaymentStatus
 */
export function updateSubscriptionPaymentStatusAsync(payload) {
  console.log({ payload });
  return new Promise((resolve, reject) => {
    client.updateSubscriptionPaymentStatus(payload, (err, response) => {
      if (err) {
        console.log({err})
        reject(err);
        return;
      }
      console.log({response});
      resolve(response);
    });
  });
}
