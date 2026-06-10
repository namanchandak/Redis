import koffi from 'koffi';
import { handleConnection } from './networking/connection';

// ============================================================
// LIBC + SYSCALL SETUP
// ============================================================

const libc = koffi.load('libc.so.6');

// --- Network Constants ---
const AF_INET    = 2;
const SOCK_STREAM = 1;
const INADDR_ANY  = 0;

// --- epoll Constants ---
const EPOLLIN        = 0x0001;
const EPOLL_CTL_ADD  = 1;

// --- fcntl Constants ---
const O_NONBLOCK = 0o4000;
const F_GETFL    = 3;
const F_SETFL    = 4;

// --- Server Limits ---
const BACKLOG            = 50000;
const MAX_EPOLL_EVENTS   = 1024;
const READ_BUFFER_SIZE   = 1024;

// ============================================================
// C STRUCTS
// ============================================================

const sockaddr_in = koffi.struct('sockaddr_in', {
    sin_family : 'int16',
    sin_port   : 'uint16',
    sin_addr   : 'uint32',
    sin_zero   : koffi.array('char', 8),
});

const epoll_event = koffi.struct('epoll_event', {
    events : 'uint32',
    data   : 'uint64', // uint64 safely holds fd without union padding issues
});

// ============================================================
// SYSCALL BINDINGS
// ============================================================

const socket       = libc.func('int socket(int domain, int type, int protocol)');
const bind         = libc.func('int bind(int sockfd, const sockaddr_in *addr, int addrlen)');
const listen       = libc.func('int listen(int sockfd, int backlog)');
const accept       = libc.func('int accept(int sockfd, _Out_ uint8_t *addr, _Inout_ int *addrlen)');
const fcntl        = libc.func('int fcntl(int fd, int cmd, int arg)');
const epoll_create1 = libc.func('int epoll_create1(int flags)');
const epoll_ctl    = libc.func('int epoll_ctl(int epfd, int op, int fd, const epoll_event *event)');
const epoll_wait   = libc.func('int epoll_wait(int epfd, _Out_ uint8_t *events, int maxevents, int timeout)');
const read         = libc.func('int read(int fd, _Out_ uint8_t *buf, int count)');
const write        = libc.func('int write(int fd, const char *buf, int count)');
const close        = libc.func('int close(int fd)');
const htons        = libc.func('uint16_t htons(uint16_t hostshort)');

// ============================================================
// HELPERS
// ============================================================

function setNonBlocking(fd: number): void {
    const flags = fcntl(fd, F_GETFL, 0);
    fcntl(fd, F_SETFL, flags | O_NONBLOCK);
}

function registerWithEpoll(epollFd: number, fd: number): void {
    const event = { events: EPOLLIN, data: fd };
    epoll_ctl(epollFd, EPOLL_CTL_ADD, fd, event);
}

// ============================================================
// SERVER
// ============================================================

function startServer(port: number): void {
    let concurrentClients = 0;

    // ---- Phase 1: Create & configure the server socket ----

    const serverFd = socket(AF_INET, SOCK_STREAM, 0);
    if (serverFd < 0) throw new Error('Failed to create socket');

    setNonBlocking(serverFd);

    const serverAddr = {
        sin_family : AF_INET,
        sin_port   : htons(port),
        sin_addr   : INADDR_ANY,
        sin_zero   : [0, 0, 0, 0, 0, 0, 0, 0],
    };

    if (bind(serverFd, serverAddr, koffi.sizeof(sockaddr_in)) < 0) throw new Error('Bind failed');
    if (listen(serverFd, BACKLOG) < 0)                             throw new Error('Listen failed');

    // ---- Phase 2: Set up epoll and register server socket ----

    const epollFd = epoll_create1(0);
    if (epollFd < 0) throw new Error('epoll_create1 failed');

    registerWithEpoll(epollFd, serverFd);

    console.log(`🚀 Server listening on port ${port} using native epoll`);

    // ---- Phase 3: Pre-allocate reusable buffers ----

    const eventSize      = koffi.sizeof(epoll_event);
    const eventsBuffer   = Buffer.alloc(eventSize * MAX_EPOLL_EVENTS);
    const clientAddrBuf  = Buffer.alloc(koffi.sizeof(sockaddr_in));
    const clientAddrLen  = Buffer.alloc(4);
    clientAddrLen.writeInt32LE(koffi.sizeof(sockaddr_in), 0);

    // ============================================================
    // EVENT LOOP
    // ============================================================

    function acceptClient(): void {
        const clientFd = accept(serverFd, clientAddrBuf, clientAddrLen);
        if (clientFd < 0) return;

        setNonBlocking(clientFd);
        registerWithEpoll(epollFd, clientFd);
        concurrentClients++;
    }

    function handleClientData(clientFd: number): void {
        const readBuffer = Buffer.alloc(READ_BUFFER_SIZE);
        const bytesRead  = read(clientFd, readBuffer, READ_BUFFER_SIZE);

        if (bytesRead > 0) {
            const data = readBuffer.subarray(0, bytesRead).toString('utf8');            
            const response = handleConnection(data);   // now returns RESP string

              write(clientFd, response, Buffer.byteLength(response));
              return;

        }

        // bytesRead === 0 means clean disconnect, < 0 means error — either way close
        close(clientFd);
        concurrentClients--;
    }

    function processEvents(): void {
        // Block for up to 10ms waiting for I/O events
        // Short enough not to stall V8, long enough to avoid busy-spinning
        const nEvents = epoll_wait(epollFd, eventsBuffer, MAX_EPOLL_EVENTS, 10);

        for (let i = 0; i < nEvents; i++) {
            const offset  = i * eventSize;
            const event   = koffi.decode(eventsBuffer.subarray(offset, offset + eventSize), epoll_event);
            const readyFd = Number(event.data);

            if (readyFd === serverFd) {
                acceptClient();
            } else {
                handleClientData(readyFd);
            }
        }

        // Schedule next tick without blocking Node's thread
        setImmediate(processEvents);
    }

    processEvents();
}

startServer(8085);