import type { Command } from "../types/command";
import { evalGET, evalPING, evalSET, evalTTL } from "./eval.js";

export function executeCommand(command: Command): string {
  switch (command.name) {
    case "PING":
      return evalPING(command.args);
    case "SET":
      return evalSET(command.args);

    case "GET":
      return evalGET(command.args);

    case "TTL":
      return evalTTL(command.args);

    default:
      return `-ERR unknown command '${command.name}'\r\n`;
  }
}