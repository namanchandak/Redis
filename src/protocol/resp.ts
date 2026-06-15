import type { Command, RedisCommands } from "../types/command";

export function parseCommand(rawData: string): RedisCommands | null {
  const commands: Command[] = [];
  let currentIndex = 0;

  // Loop through the raw data until we've parsed all commands
  while (currentIndex < rawData.length) {
    // Get the remaining unparsed portion of the string
    const remainingData = rawData.slice(currentIndex);

    // If only whitespace or newlines are left, we are done
    if (remainingData.trim() === "") {
      break;
    }

    let parsedData: { Command: Command; index: number } | null = null;

    // Route to the correct parser
    if (remainingData.startsWith("*")) {
      parsedData = parseRespArray(remainingData);
    } else {
      parsedData = parseInlineCommand(remainingData);
    }

    // If parsing failed or returned 0 (preventing infinite loops), break out
    if (!parsedData || parsedData.index === 0) {
      break;
    }

    // Store the command and advance the cursor for the next iteration
    commands.push(parsedData.Command);
    currentIndex += parsedData.index;
  }

  // Return the array of commands, cast to your RedisCommands interface
  return commands.length > 0 ? (commands as RedisCommands) : null;
}

function parseRespArray(textBuffer: string): { Command: Command; index: number } | null {
  // We split by \r\n just to make reading lines easier, but we will calculate exact character counts.
  const lines = textBuffer.split('\r\n');
  
  if (lines.length === 0 || !lines[0].startsWith('*')) return null;

  // Get the number of elements in the RESP array (e.g., *3 means 3 elements)
  const numElements = parseInt(lines[0].substring(1), 10);
  if (isNaN(numElements)) return null;

  const args: string[] = [];
  let currentLineIdx = 1;
  
  // Track how many characters we've consumed (Length of "*N" + length of "\r\n")
  let consumedChars = lines[0].length + 2; 

  for (let i = 0; i < numElements; i++) {
    // 1. Read the length line (e.g., "$3")
    if (currentLineIdx >= lines.length) return null;
    const lengthLine = lines[currentLineIdx];
    consumedChars += lengthLine.length + 2;
    currentLineIdx++;

    // 2. Read the actual data line (e.g., "SET")
    if (currentLineIdx >= lines.length) return null;
    const dataLine = lines[currentLineIdx];
    args.push(dataLine);
    consumedChars += dataLine.length + 2;
    currentLineIdx++;
  }

  if (args.length === 0) return null;

  return {
    Command: {
      name: args[0].toUpperCase(),
      args: args.slice(1),
    },
    index: consumedChars, // Exactly where the next command starts
  };
}

function parseInlineCommand(textBuffer: string): { Command: Command; index: number } {
  // Find the end of the current line
  const crlfIndex = textBuffer.indexOf('\r\n');
  const endIndex = crlfIndex !== -1 ? crlfIndex : textBuffer.length;
  
  // Extract just the current command
  const currentLine = textBuffer.slice(0, endIndex);
  const parts = currentLine.trim().split(/\s+/);

  return {
    Command: {
      name: parts[0].toUpperCase(),
      args: parts.slice(1),
    },
    // If \r\n was found, advance past it (+2). Otherwise, we're at the end of the string.
    index: crlfIndex !== -1 ? crlfIndex + 2 : textBuffer.length,
  };
}