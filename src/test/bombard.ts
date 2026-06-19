import net from "node:net";
import crypto from "node:crypto";

const HOST = "127.0.0.1";
const PORT = 8080;

const CONNECTIONS = 1000;
const OPS_PER_CONNECTION = 1000;

function randomString(length: number): string {
  return crypto.randomBytes(length).toString("hex");
}

function redisSet(key: string, value: string): string {
  return (
    `*3\r\n` +
    `$3\r\nSET\r\n` +
    `$${key.length}\r\n${key}\r\n` +
    `$${value.length}\r\n${value}\r\n`
  );
}

function startClient(id: number) {
  const socket = net.createConnection({
    host: HOST,
    port: PORT,
  });

  socket.on("connect", () => {
    console.log(`Client ${id} connected`);

    let sent = 0;

    const interval = setInterval(() => {
      for (let i = 0; i < OPS_PER_CONNECTION; i++) {
        const key = `user:${randomString(8)}`;
        const value = randomString(128);

        socket.write(redisSet(key, value));
        sent++;
      }

      console.log(`Client ${id}: ${sent} SETs`);
    }, 1000);
  });

  socket.on("error", (err) => {
    console.error(`Client ${id}`, err.message);
  });

  socket.on("close", () => {
    console.log(`Client ${id} disconnected`);
  });
}

for (let i = 0; i < CONNECTIONS; i++) {
  startClient(i);
}