import type { Command } from "../types/command";
import { pingCommand } from "./ping.js";

export function executeCommand(command: Command): string {
  switch (command.name) {
    case "PING":
      return pingCommand(command.args);

    default:
      return `-ERR unknown command '${command.name}'\r\n`;
  }
}