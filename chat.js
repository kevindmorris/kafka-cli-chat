import { randomUUID } from "crypto";
import { Kafka } from "kafkajs";
import readline from "readline";

const username = process.argv[2] || `User-${randomUUID().slice(0, 4)}`;
const topic = "chat";

const kafka = new Kafka({ clientId: "cli-chat", brokers: ["localhost:9092"] });

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: `chat-group-${username}` });

await producer.connect();
await consumer.connect();

await consumer.subscribe({ topic, fromBeginning: false });

consumer.run({
  eachMessage: async ({ message }) => {
    const raw = message.value?.toString();
    if (!raw) return;

    try {
      const msg = JSON.parse(raw);
      if (msg.from === username) return;

      const time = new Date(msg.timestamp).toLocaleTimeString();
      if (msg.type === "status") {
        console.log(`[${time}] *** ${msg.from} ${msg.text} ***`);
      } else {
        console.log(`[${time}] ${msg.from}: ${msg.text}`);
      }
      process.stdout.write("> ");
    } catch {
      console.log("⚠️ Malformed message:", raw);
    }
  },
});

await producer.send({
  topic,
  messages: [
    {
      value: JSON.stringify({
        type: "status",
        from: username,
        text: "has joined the chat 🚀",
        timestamp: new Date().toISOString(),
      }),
    },
  ],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});
rl.prompt();

rl.on("line", async (line) => {
  const text = line.trim();
  if (!text) return rl.prompt();

  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify({
          type: "message",
          from: username,
          text,
          timestamp: new Date().toISOString(),
        }),
      },
    ],
  });

  rl.prompt();
});

const shutdown = async () => {
  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify({
          type: "status",
          from: username,
          text: "has left the chat 👋",
          timestamp: new Date().toISOString(),
        }),
      },
    ],
  });

  rl.close();
  await producer.disconnect();
  await consumer.disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
