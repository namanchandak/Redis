const net = require('net');

let concurrentConnections = 0;

const server = net.createServer((socket) => {
    concurrentConnections++;
    
    // Identify the client using their unique Port and IP
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[New Connection] ID: ${clientId}`);

    socket.on('data', (data) => {
        // Convert the buffer to a string
        const received = data.toString();
        
        // Log who sent the message and what thes raw data looks like
        console.log(`[Message from ${clientId}]: ${received}`);
        
        socket.write(`Server received your data, ${clientId}\n`);
    });

    socket.on('end', () => {
        concurrentConnections--;
        console.log(`[Disconnected] ID: ${clientId}`);
    });
});

server.listen(8080, '0.0.0.0', () => {
    console.log("Server listening on 0.0.0.0:8080");
});