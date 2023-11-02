const paymentRmq = {
  EXCHANGE_KEY: {
    ORDER_PAYMENT_ADD: "Foodi.Events:OrderPaymentAdd",
    SUBSCRIPTION_PAYMENT_ADD: "Foodi.Events:SubscriptionPaymentAdd",

    ORDER_PAYMENT_SUCCESS: "Foodi.Events:OrderPaymentSuccess",
    ORDER_PAYMENT_FAIL: "Foodi.Events:OrderPaymentFail",

    SUBSCRIPTION_PAYMENT_SUCCESS: "Foodi.Events:SubscriptionPaymentSuccess",
    SUBSCRIPTION_PAYMENT_FAIL: "Foodi.Events:SubscriptionPaymentFail",

  },
  ROUTING_KEY: {
    ORDER_PAYMENT_ROUTING_KEY: "order-payment-routing-key",
    SUBSCRIPTION_PAYMENT_ROUTING_KEY: "subscription-payment-routing-key",
  },
  QUEUE: {
    ORDER_PAYMENT_QUEUE_ADD: "order-payment-queue-add-consumer",
    SUBSCRIPTION_PAYMENT_QUEUE_ADD: "subscription-payment-queue-add-consumer",

    ORDER_PAYMENT_QUEUE_SUCCESS: "order-payment-queue-success",
    ORDER_PAYMENT_QUEUE_FAIL: "order-payment-queue-fail",

    SUBSCRIPTION_PAYMENT_QUEUE_SUCCESS: "subscription-payment-queue-success",
    SUBSCRIPTION_PAYMENT_QUEUE_FAIL: "subscription-payment-queue-fail",

  },
};



module.exports = {
  paymentRmq
};
