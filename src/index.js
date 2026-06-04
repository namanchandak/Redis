const net = require('net');

// FIX: Added curly braces to destructure the exported module object
const { responseRedis } = require('./sycn_tcp'); 

const server = net.createServer((socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[New Connection] ID: ${clientId}`);

    socket.on('data', (data) => {
        const received = data.toString();
        console.log(`[Raw Data from ${clientId}]: ${JSON.stringify(received)}`);
        
        // This will now execute safely
        responseRedis(socket, received);
    });

    socket.on('end', () => {
        console.log(`[Disconnected] ID: ${clientId}`);
    });
});

server.listen(8080, '0.0.0.0', () => {
    console.log("Redis-lite server listening on 0.0.0.0:8080");
});