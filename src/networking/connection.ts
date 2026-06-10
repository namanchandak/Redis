  // import type { Socket } from "node:net"; // Node built-ins don't need extensions

  // Add .ts to these relative paths
  import { executeCommand } from "../commands/commands";
  import { parseCommand } from "../protocol/resp";

export function handleConnection(rawData: string): string {
  try {
    const command = parseCommand(rawData);

    if (!command) {
      return "-ERR unknown command\r\n";
    }

    // Fix: Just call and return this once
    return executeCommand(command); 

  } catch (error) {
    const message = error instanceof Error ? error.message : "internal error";
    
    // CRITICAL FIX: Actually return the error string!
    // Without this, 'response' becomes undefined, crashing the server on Buffer.byteLength()
    return `-ERR ${message}\r\n`; 
  }
}