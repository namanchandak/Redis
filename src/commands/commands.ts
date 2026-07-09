import { Client, TxnBegin, TxnDiscard, TxnExec, TxnQueue } from "../core/comm";
import { encodeSimple } from "../protocol/encoder";
import type { Command } from "../types/command";
import {
  evalBGREWRITEAOF,
  evalDEL,
  evalExpire,
  evalGET,
  evalINCR,
  evalINFO,
  evalMulti,
  evalPING,
  evalSET,
  evalTTL,
} from "./eval.js";

const txnCommands = new Set(["EXEC", "DISCARD"]);

function executeCommandToBuffer(cmd: Command, c: Client) {
  return executeCommand(cmd, c) as string;
}

export function EvalAndRespond(cmds: [Command], c: Client) {
  let response: string = "";
  // console.log("issue 1 -- ", c);

  cmds.forEach((cmd) => {
    if (!c.isTxn) {
      response = executeCommandToBuffer(cmd, c);
    } else if (txnCommands.has(cmd.name)) {
      response = executeCommandToBuffer(cmd, c);
    } else {
      TxnQueue(c, cmd);
      response = encodeSimple("QUEUED");
    }
  });

  return response;
}

export function executeCommand(
  command: Command,
  c: Client,
): string | Promise<String> {
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

    case "MULTI":
      console.log("Before MULTI:", c.isTxn);
      TxnBegin(c);
      console.log("After MULTI:", c);
      return evalMulti(command.args);

    case "EXEC":
      if (!c.isTxn) {
        return encodeSimple(`Error Exec without MULTI`);
      }
      return TxnExec(c);

    case "DISCARD":
      if (!c.isTxn) {
        return encodeSimple(`Error DISCARD without MULTI`);
      }
      TxnDiscard(c);
      return evalMulti(command.args);

    default:
      return `-ERR unknown command '${command.name}'\r\n`;
  }
}
