import net from "node:net";

import { handleConnection } from "./networking/connection";

const server = net.createServer((socket) => {
  const clientId = `${socket.remoteAddress}:${socket.remotePort}`;

  console.log(`[connect] ${clientId}`);

  socket.on("data", (data: Buffer) => {
    const payload = data.toString();

    console.log(`[recv] ${clientId} -> ${JSON.stringify(payload)}`);

    handleConnection(socket, payload);
  });

  socket.on("end", () => {
    console.log(`[disconnect] ${clientId}`);
  });
});

server.listen(8080, "0.0.0.0", () => {
  console.log("Redis-lite listening on 0.0.0.0:8080");
});
