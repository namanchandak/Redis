import type { Command } from "../types/command";

export function parseCommand(rawData: string): Command | null {
  const lines = rawData.trim().split(/\r?\n/);

  if (lines.length === 0 || lines[0] === "") {
    return null;
  }

  if (lines[0].startsWith("*")) {
    return parseRespArray(lines);
  }

  return parseInlineCommand(lines[0]);
}

function parseRespArray(lines: string[]): Command | null {
  const commandIndex = lines.findIndex(
    (line, index) => index > 0 && !line.startsWith("$")
  );

  if (commandIndex === -1) {
    return null;
  }

  const name = lines[commandIndex].toUpperCase();
  const args: string[] = [];

  for (let i = commandIndex + 1; i < lines.length; i++) {
    if (!lines[i].startsWith("$") && lines[i].trim() !== "") {
      args.push(lines[i]);
    }
  }

  return {
    name,
    args,
  };
}

function parseInlineCommand(line: string): Command {
  const parts = line.trim().split(/\s+/);

  return {
    name: parts[0].toUpperCase(),
    args: parts.slice(1),
  };
}