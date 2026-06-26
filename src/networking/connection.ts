import type { Socket } from "node:net";

import { executeCommand } from "../commands/commands";
import { parseCommand } from "../protocol/resp";

export function handleConnection(socket: Socket, rawData: string): void {
  try {
    const command = parseCommand(rawData);

    if (!command) {
      return;
    }
    
    let pipedResult = ""

    command.forEach(element => {
        const response = executeCommand(element);
        pipedResult += response
    });

    socket.write(pipedResult);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "internal error";

    socket.write(`-ERR ${message}\r\n`);
  }
}
