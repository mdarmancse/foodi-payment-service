import rabbitMQ from "helpers/rabbitMQ";
import { paymentRmq } from "config/rmqConfig";

async function consumer() {
    try {
        await rabbitMQ.consumer(
            paymentRmq.EXCHANGE_KEY.ORDER_PAYMENT_SUCCESS,
            paymentRmq.QUEUE.ORDER_PAYMENT_QUEUE_SUCCESS,
            paymentRmq.ROUTING_KEY.ORDER_PAYMENT_ROUTING_KEY,
            async (msg) => {
                let payload = JSON.parse(msg.content);
                console.log(payload);
            },
        );
    } catch (error) {
        console.log("error", error);
    }
}


module.exports = { consumer };
