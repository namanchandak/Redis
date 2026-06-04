// Remove "export" from the front of this function
function responseRedis(socket, rawData) {
    try {
        // 1. Clean the input and split by lines (\r\n or \n)
        const lines = rawData.trim().split(/\r?\n/);
        if (lines.length === 0 || lines[0] === "") return;

        let cmdName = "";
        let cmdArgs = [];

        // 2. Check if it's a RESP Array (starts with '*')
        if (lines[0].startsWith('*')) {
            // In a RESP array like: *1\r\n$4\r\nping\r\n
            // lines[0] = "*1"
            // lines[1] = "$4"
            // lines[2] = "ping"
            
            // Find the first actual command string (skipping lines starting with $ or *)
            const commandLineIndex = lines.findIndex((line, index) => index > 0 && !line.startsWith('$'));
            
            if (commandLineIndex !== -1) {
                cmdName = lines[commandLineIndex].toUpperCase();
                
                // Extract arguments (any subsequent lines that don't start with '$')
                for (let i = commandLineIndex + 1; i < lines.length; i++) {
                    if (!lines[i].startsWith('$') && lines[i].trim() !== "") {
                        cmdArgs.push(lines[i]);
                    }
                }
            }
        } else {
            // 3. Fallback for Simple Inline Text (e.g., "PING" or "PING hello")
            const parts = lines[0].split(/\s+/);
            cmdName = parts[0].toUpperCase();
            cmdArgs = parts.slice(1);
        }

        // If we couldn't parse a command name, exit early
        if (!cmdName) return;

        const cmd = { name: cmdName, args: cmdArgs };
        const respond = EvalAndRespond(cmd);
        socket.write(respond);

    } catch (error) {
        respondError(socket, error.message);
    }
}

function respondError(socket, errorMessage) {
    socket.write(`-ERR ${errorMessage}\r\n`);
}

function EvalAndRespond(cmd) {
    switch (cmd.name) {
        case "PING":
            return evalPing(cmd.args);
        default:
            return `-ERR unknown command '${cmd.name}'\r\n`;
    }
}

function evalPing(args) {
    if (args.length > 1) throw new Error("wrong number of arguments for 'ping' command");
    return args.length === 0 ? Encode("PONG", "simple") : Encode(args[0], "bulk");
}

function Encode(value, type) {
    const CRLF = "\r\n"; 
    switch (type) {
        case "simple": return `+${value}${CRLF}`;
        case "error":  return `-${value}${CRLF}`;
        case "bulk":
            if (value === null || value === undefined) return `$-1${CRLF}`;
            const stringValue = String(value);
            return `$${stringValue.length}${CRLF}${stringValue}${CRLF}`;
        default:
            throw new Error(`Unsupported RESP type: ${type}`);
    }
}

// CRITICAL: Export the function as an object property
module.exports = { responseRedis };