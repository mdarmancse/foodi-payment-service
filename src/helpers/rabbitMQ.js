import amqp from "amqplib";

const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_URI}`;

function closedConnection(connection) {
  // console.log("\nClosing Connection...\n");

  setTimeout(() => {
    connection.close();
    process.emit("0");
  }, 500);
}

async function publish(exchange, routingKey, queueName, msgPayload) {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  // Ensure the exchange exists
  await channel.assertExchange(exchange, "fanout", { durable: true });

  // Ensure the queue exists
  await channel.assertQueue(queueName, { durable: true });

  // Bind the queue to the exchange with the routing key
  await channel.bindQueue(queueName, exchange, routingKey);
  await channel.publish(exchange, routingKey, Buffer.from(msgPayload), {
    persistent: true,
  });

  console.log({ msgPayload });

  closedConnection(connection);
}

async function consumer(exchange, queueName, routingKey, ACK) {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, "fanout", { durable: true });

  const q = await channel.assertQueue(
    queueName,
    { durable: true },
    { exclusive: false },
  );

  await channel.bindQueue(queueName, exchange, routingKey);

  console.log(" [*] Waiting for messages in %s", q.queue);

  await channel.consume(
    q.queue,
    async (msg) => {
      try {
        // process the message here
        await ACK(msg);

        // acknowledge receipt of the message
        console.log("message ack");
        channel.ack(msg);
      } catch (error) {
        console.error(error);
        // reject the message and requeue it
        console.log("message is not ack");

        // channel.reject(msg, true);
        channel.ack(msg);
      }
    },
    { noAck: false },
  );
}

module.exports = { publish, consumer };
