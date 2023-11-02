import { SSL, USB } from "config/gatewayType";
import { Order, Refund, Subscription } from "config/paymentType";
import mongoose, { Schema, SchemaTypes } from "mongoose";
import { v4 } from "uuid";

const paymentSchema = new Schema(
  {
    _id: {
      type: SchemaTypes.UUID,
      default: v4,
    },
    amount: {
      type: mongoose.SchemaTypes.Decimal128,
      required: true,
    },

    currency: { type: String },
    gatewayType: {
      type: String,
      enum: [SSL, USB],
    },
    transactionId: { type: String },
    orderId: { type: String },
    subscriptionId: { type: String },
    customerRefundWalletId: { type: String },
    status: { type: String, default: "PENDING" },
    userId: { type: Number, required: true },
    userName: { type: String },
    userPhone: { type: String },
    userEmail: { type: String },
    paymentType: {
      type: String,
      enum: [Subscription, Order, Refund],
      default: Order,
    },
    paymentReference: { type: String },
    paymentMethod: { type: String },
    paymentOrderId: { type: Number },
    paymentId: { type: String },
    channel: { type: String },
    paymentDate: { type: Date, default: Date.now() },
    tranDate: { type: Date },
    cardType: { type: String },
    bankTranId: { type: String },
    cardIssuer: { type: String },
    cardBrand: { type: String },
    cardIssuerCountry: { type: String },
    cardIssuerCountryCode: { type: String },
    currencyRate: { type: String },
    riskLevel: { type: Number },
    riskTitle: { type: String },
    txnId: { type: String },
    error: { type: String },
    isPaid: { type: Boolean, default: false },
    refund_amount: { type: String },
    refund_remarks: { type: String },
    refund_ref_id: { type: String },
    refundStatus: { type: String },
  },
  {
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
    model: "PaymentModel",
    collection: "payments",
    timestamps: true,
  },
);

export const PaymentModel = mongoose.model("PaymentModel", paymentSchema);
