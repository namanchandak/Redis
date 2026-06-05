import { encodeBulk, encodeSimple } from "../protocol/encoder.js";

export function pingCommand(args: string[]): string {
  if (args.length > 1) {
    throw new Error("wrong number of arguments for 'ping' command");
  }

  return args.length === 0
    ? encodeSimple("PONG")
    : encodeBulk(args[0]);
}