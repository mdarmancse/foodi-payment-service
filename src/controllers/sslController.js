// @ts-nocheck
import {
  SSLCommerz,
  SSLCommerzIpnRoute,
  SSLInitSuccess,
} from "config/sslCommerz";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { PaymentModel } from "../models";
import { Subscription } from "config/paymentType";
import { GatewayType, SSLValid, UserEmail } from "config/sslCommerzPaymentStatus";
import { camelCase } from "lodash";
import { DateTime } from "luxon";
import { v4 } from "uuid";
import { Decimal } from "decimal.js";
import { sendData, sendError } from "../helpers";
import { updatePaymentStatusAsync } from "../grpc/ordersClient";
import { updateSubscriptionPaymentStatusAsync } from "grpc/userAccountingClient";
import rabbitMQ from "../helpers/rabbitMQ";
import { paymentRmq } from "../config/rmqConfig";

export const initSSL = async (paymentType, req, res) => {
  const userId = req.user.id;
  const tranId = v4();
  const currency = process.env.CURRENCY;

  const {
    amount,
    paymentMethod,
    paymentReference,
    successUrl,
    cancelUrl,
    failureUrl,
    customer,
  } = req.body;

  const session = await SSLCommerz.init({
    total_amount: amount,
    currency: currency,
    tran_id: tranId,
    success_url: successUrl,
    fail_url: failureUrl,
    cancel_url: cancelUrl,
    ipn_url: SSLCommerzIpnRoute,
    product_name: Subscription,
    product_category: Subscription,
    value_a: paymentReference,
    value_b: userId,
    value_c: paymentType,
    product_profile: "general",
    cus_name: customer.firstName + " " + customer.lastName,
    cus_email: customer.email || UserEmail,
    cus_phone: customer.mobileNo || " ",
    shipping_method: "NO",
    emi_option: 0,
  });

  if (session.status === SSLInitSuccess) {
    // save payment session
    await PaymentModel.create({
      transactionId: tranId,
      currency: currency,
      gatewayType: GatewayType,
      userId: userId,
      amount: amount,
      paymentType: paymentType,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      userName: customer.firstName + " " + customer.lastName,
      userPhone: customer.mobileNo || " ",
      userEmail: customer.email || " ",
    });

    sendData(res, {
      gatewayUrl: session.GatewayPageURL,
    });
  } else {
    sendError(res, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "SSLCommerz initialization failed",
    });
  }
};

//SSLCommerz initiateRefund

function getPaymentData(response) {
  const fields = [
    "status",
    "store_amount",
    "card_type",
    "card_no",
    "currency",
    "bank_tran_id",
    "card_issuer",
    "card_brand",
    "card_issuer_country",
    "card_issuer_country_code",
    "currency_type",
    "currency_amount",
    "currency_rate",
    "risk_level",
    "risk_title",
    "error",
  ];

  return fields.reduce((prev, cur) => {
    return {
      ...prev,
      ...(cur in response ? { [camelCase(cur)]: response[cur] } : {}),
    };
  }, {});
}

export const ipnSSL = asyncHandler(async (req, res) => {

  const { status, tran_id, val_id } = req.body;
  const orderId = req.body.value_a;
  const subscriptionId = req.body.value_a;
  const userId = req.body.value_b;
  const paymentType = req.body.value_c;

  const statusMapping = {
    VALID: "APPROVED",
    FAILED: "DECLINED",
    CANCELLED: "CANCELLED",
    EXPIRED: "TIMEOUT",
    PENDING: "PENDING",
  };

  const payment = await PaymentModel.findOne({ transactionId: tran_id });

  if (!payment) {
    sendError(res, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Session not found",
    });
  }

  if (status === SSLValid && val_id) {
    const validationResp = await SSLCommerz.validate({
      val_id,
    });

    const {
      status: validationStatus,
      tran_date,
      amount: validationAmount,
    } = validationResp;

    const paymentData = getPaymentData(validationResp);

    if (
      validationStatus === SSLValid &&
      new Decimal(validationAmount.toString()).equals(payment.amount.toString())
    ) {

      const mappedStatus = statusMapping[validationStatus] || "UNKNOWN";

      // update  payment status
     await PaymentModel.findByIdAndUpdate(payment._id, {
        isPaid: true,
        status: mappedStatus,
        tranDate: DateTime.fromSQL(tran_date, { zone: "utc" }).toISO(),
        amount: new Decimal(validationAmount.toString()),
        ...paymentData,
      });

      sendData(res, {
        message: "Payment status updated successfully",
      });



      if (paymentType === "ORDER") {

        // Send Status to order service

        const results =  await updatePaymentStatusAsync({
          orderId: orderId,
          paymentStatus: mappedStatus,
        });

        await rabbitMQ.publish(
            paymentRmq.EXCHANGE_KEY.ORDER_PAYMENT_ADD,
            paymentRmq.ROUTING_KEY.ORDER_PAYMENT_ROUTING_KEY,
            paymentRmq.QUEUE.ORDER_PAYMENT_QUEUE_ADD,
            JSON.stringify(results),
        );
      }

      if (paymentType === "SUBSCRIPTION") {

        //  Send subscriptionTypeId to user accounting service

        const results =  await updateSubscriptionPaymentStatusAsync({
          userId: userId,
          subscriptionTypeId: subscriptionId,
        });
        await rabbitMQ.publish(
            paymentRmq.EXCHANGE_KEY.SUBSCRIPTION_PAYMENT_ADD,
            paymentRmq.ROUTING_KEY.SUBSCRIPTION_PAYMENT_ROUTING_KEY,
            paymentRmq.QUEUE.SUBSCRIPTION_PAYMENT_QUEUE_ADD,
            JSON.stringify(results),
        );
      }
    } else {
      sendError(res, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong",
      });
    }
  }

  // Could not validate payment, so update the payment entry with
  // available data
  const paymentData = getPaymentData(req.body);
  const { tran_date } = req.body;

  await PaymentModel.findByIdAndUpdate(payment._id, {
    tranDate: DateTime.fromSQL(tran_date, { zone: "utc" }).toISO(),
    ...paymentData,
  });
});

export const initRefund = async (paymentType, req, res) => {

  const { refund_amount, refund_remarks, bank_tran_id, refe_id } = req.body;

  try {
    // Find the payment based on bank_tran_id
    const payment = await PaymentModel.findOne({ bankTranId: bank_tran_id });

    if (!payment) {
      sendData(res, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Payment not found for the given bank_tran_id",
      });
      return;
    }

    const data = await SSLCommerz.initiateRefund({
      refund_amount,
      refund_remarks,
      bank_tran_id,
      refe_id,
    });

    const responseData = {
      refundStatus: data.status === "success" ? "success" : "failure",
      refund_ref_id: data.refund_ref_id,
      trans_id: data.trans_id,
      message: data.errorReason || "Successfully returned your amount",
    };

    // Update the payment document with refund information
    await PaymentModel.findByIdAndUpdate(
      payment._id,
      {
        refund_amount,
        refund_remarks,
        paymentType: paymentType,
        returnStatus: responseData.refundStatus,
        ...responseData,
      },
      { new: true }, // Retrieve the updated document
    );

    sendData(res, responseData);
  } catch (error) {
    console.error("Error in refund process:", error);
    sendError(res, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "An error occurred during refund process",
    });
  }
};

