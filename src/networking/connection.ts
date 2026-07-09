import type { Socket } from "node:net";

import { EvalAndRespond, executeCommand } from "../commands/commands";
import { parseCommand } from "../protocol/resp";
import { Client } from "../core/comm";

export function handleConnection(socket: Socket, rawData: string, c: Client): void {
  try {
    const command = parseCommand(rawData);

    if (!command) {
      return;
    }
    
    let pipedResult = ""
    // console.log(c , " --- issue");
    
    command.forEach(element => {
        const response = EvalAndRespond([element], c);
        pipedResult += response
    });

    socket.write(pipedResult);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "internal error";

      // console.log(error ,  "\n\n\n", message);
      

    socket.write(`-ERR ${message}\r\n`);
  }
}
