import type { Command } from "../types/command";
import { evalBGREWRITEAOF, evalDEL, evalExpire, evalGET, evalINCR, evalINFO, evalPING, evalSET, evalTTL } from "./eval.js";

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

    case "DEL":
      return evalDEL(command.args);

    case "EXPIRE":
      return evalExpire(command.args);
    
    case "BGREWRITEAOF":
      return evalBGREWRITEAOF(command.args);  

    case "INCR":
      return evalINCR(command.args);  

    case "INFO":
      return evalINFO(command.args);  

    default:
      return `-ERR unknown command '${command.name}'\r\n`;
  }
}