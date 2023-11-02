const SSLCommerzPayment = require("sslcommerz-lts");

const isLive = process.env.SSL_COMMERZ_LIVE?.toLowerCase() === "true";
const sslCommerzStoreId = process.env.SSL_COMMERZ_STORE_ID || "";
const sslCommerzStorePassword = process.env.SSL_COMMERZ_STORE_PASSWORD || "";
const SSLInitSuccess = "SUCCESS";

const SSLCommerzIpnRoute = process.env.IPN_listener || "";

const SSLCommerz = new SSLCommerzPayment(
  sslCommerzStoreId,
  sslCommerzStorePassword,
  isLive,
);

module.exports = {
  SSLCommerz,
  SSLInitSuccess,
  SSLCommerzIpnRoute,
  
};
