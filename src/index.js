const net = require('net');

// 1. Variable to track concurrent TCP connections
let concurrentConnections = 0;

const server = net.createServer((socket) => {
    // Increment when a new client connects
    concurrentConnections++;
    console.log(`New client connected. Total connections: ${concurrentConnections}`);

    // Handle incoming data (The "Read" process)
    // In Node.js, this is event-driven rather than a manual blocking system call
    socket.on('data', (data) => {
        const message = data.toString().trim();

        // 2 & 3. Log the command and return the response
        if (message) {
            console.log(`User Command: ${message}`);
            
            // Echo the response back to the client
            socket.write(`Echo: ${message}\n`);
        }
    });

    // Manage disconnection to keep the counter accurate
    socket.on('end', () => {
        concurrentConnections--;
        console.log(`Client disconnected. Total connections: ${concurrentConnections}`);
    });

    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    });
});

// Start the server on port 8080
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Echo server listening on port ${PORT}`);
});