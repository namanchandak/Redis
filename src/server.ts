import net from "node:net";

import { handleConnection } from "./networking/connection";
import { shutdown } from "./core/event";

const server = net.createServer((socket: any) => {
  const clientId = `${socket.remoteAddress}:${socket.remotePort}`;

  console.log(`[connect] ${clientId}`);

  socket.on("data", (data: any) => {
    const payload = data.toString();

    console.log(`[recv] ${clientId} -> ${JSON.stringify(payload)}`);

    handleConnection(socket, payload);
  });

  socket.on("end", () => {
    console.log(`[disconnect] ${clientId}`);
  });

   socket.on("error", (err: any) => {
    console.log(`[error] ${clientId}`, err.code);
  });


});



server.listen(8080, "0.0.0.0", () => {
  console.log("Redis-lite listening on 0.0.0.0:8080");
});



process.on('SIGTERM', () => {
  console.log('SIGTERM signal received.');
  server.close(() => {
    console.log('Closed out remaining connections ---');
    // Additional cleanup tasks go here
  });
});

let shuttingDown = false;

process.on("SIGINT", async () => {
    console.log("SIGINT");

    if (shuttingDown) return;
    shuttingDown = true;

        console.log("SIGINT PID:", process.pid);


    try {
        await shutdown();

        server.close(() => {
            console.log("Server closed");
            process.exit(0);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});

export const keyLimit  : number = 100;
export const evictionStrategy: string =  "allkeys-lru" // "allkeys-random"
export const evictionRatio : number = 0.40
