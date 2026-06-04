// Remove "export" from the front of this function
function responseRedis(socket, rawData) {
    try {
        const cleanData = rawData.trim().split(/\s+/);
        const cmdName = cleanData[0].toUpperCase();
        const cmdArgs = cleanData.slice(1);

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