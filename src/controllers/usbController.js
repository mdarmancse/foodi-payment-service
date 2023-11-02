 // @ts-nocheck
import asyncHandler from "express-async-handler";
import axios from "axios";
import { Decimal } from "decimal.js";
import { DateTime } from "luxon";
import { sendData, sendError } from "../helpers";
import { PaymentModel } from "../models";
import { StatusCodes } from "http-status-codes";
import { GatewayType, USBValid } from "config/usbPaymentStatus";
import { generateUUIDv4String } from "config/genUUID";
import { updatePaymentStatusAsync } from "../grpc/ordersClient";



export const initUSB = async (paymentType, req, res) => {
  const userId = req.user.id;
  const currency = process.env.CURRENCY_TYPE;
  const trackingId = generateUUIDv4String(32);

  const authRequestBody = {
    merchantId: process.env.MERCHANT_ID,
    password: process.env.MERCHANT_PASSWORD,
  };

  try {
    const authResponse = await axios.post(
      process.env.AUTH_SIGNIN,
      authRequestBody,
    );

    const token = authResponse.data.token;

    const {
      amount,
      paymentMethod,
      cardType,
      orderId,
      paymentReference,
      successUrl,
      cancelUrl,
      failureUrl,
      customer,
      channel,
    } = req.body;

    const paymentRequestBody = {
      amount,
      currency,
      paymentMethod,
      paymentReference,
      cardType,
      trackingId,
      successUrl,
      cancelUrl,
      failureUrl,
      customer,
      channel,
    };

    const paymentResponse = await axios.post(
      process.env.PAYMENT_REQUEST,
      paymentRequestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const paymentDetail = paymentResponse.data.paymentDetail;

    const checkoutUrl = paymentResponse.data.checkoutUrl;

    const newPayment = new PaymentModel({
      amount,
      currency,
      orderId,
      transactionId: trackingId,
      userId: userId,
      userName: customer.firstName + " " + customer.lastName,
      userPhone: customer.mobileNo,
      userEmail: customer.email,
      paymentType: paymentType,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      gatewayType: GatewayType,
    });

    await newPayment.save();

    sendData(res, {
      paymentDetail,
      checkoutUrl,
    });
  } catch (error) {
    sendError(res, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "USB Payment initialization failed",
    });
  }
};

export const ipn = asyncHandler(async (req, res) => {
  console.log("ipn response", req.body);

  const channelMapping = {
    1: "CITY",
    2: "BRAC",
    3: "BKASH",
    4: "NAGAD",
    5: "UPAY",
    6: "DBBL",
  };

  try {
    const {
      account,
      amount,
      currencyNumber,
      trackingId,
      cardType,
      orderId,
      paymentOrderId,
      txnId,
      statusCodeTxt,
      orderTime,
      paymentId,
      channel,
      firstName,
      lastName,
      mobileNo,
      email,
      error,
    } = req.body;

    const payment = await PaymentModel.findOne({
      transactionId: trackingId,
    });

    const mappedChannel = channelMapping[channel] || channel;

    if (!payment) {
      sendError(res, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Session not found",
      });
      return;
    }

    if (statusCodeTxt === USBValid && paymentOrderId) {
      const authRequestBody = {
        merchantId: process.env.MERCHANT_ID,
        password: process.env.MERCHANT_PASSWORD,
      };

      const authResponse = await axios.post(
        process.env.AUTH_SIGNIN,
        authRequestBody,
      );

      const token = authResponse.data.token;

      const validateRequestBody = {
        paymentOrderId,
      };

      await axios.post(process.env.PAYMENT_ORDER_VERIFY, validateRequestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    const paymentData = {
      account,
      amount: new Decimal(amount),
      orderId,
      currencyNumber,
      trackingId,
      cardType,
      paymentOrderId,
      txnId,
      statusCodeTxt,
      orderTime,
      paymentId,
      channel: mappedChannel,
      firstName,
      lastName,
      mobileNo,
      email,
      error,
    };

    console.log({ paymentData });

    if (
      statusCodeTxt === USBValid &&
      new Decimal(amount.toString()).equals(payment.amount.toString())
    ) {
      await PaymentModel.findByIdAndUpdate(payment._id, {
        isPaid: true,
        status: statusCodeTxt,
        amount: new Decimal(amount.toString()),
        tranDate: orderTime,
        ...paymentData,
      });

      sendData(res, {
        message: "Payment status updated successfully",
      });
    }

    // Send request to order service
    const ordersRes = updatePaymentStatusAsync({
      orderId: "a4133878-b489-46d1-9952-2bb57c357775",
      paymentStatus: statusCodeTxt,
    });



    console.log(ordersRes);


  } catch (error) {
    console.log("erroData", { error });
    sendError(res, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "An error occurred",
    });
  }
});
