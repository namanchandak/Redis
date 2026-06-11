import { Epoll } from "epoll";
import fs from "fs";
import net from "net";

function runAsyncTCPServer() {
  console.log("server running on port");
  const max_client = 20000;

  // I am creating epoll event object
  const poller = new Epoll((err: any, fd: any, events: any) => {
    // Read GPIO value file. Reading also clears the interrupt.
    // const buffer = Buffer.alloc(1);
    // fs.readSync(fd, buffer, 0, 1, 0);
    // console.log(buffer.toString() === "1" ? "pressed" : "released");



    if (err) {
    console.error("Epoll error:", err);
    return;
  }

  // 2. Check if the event is EPOLLIN (Data available to read)
  if (events & Epoll.EPOLLIN) {
    // Create a temporary buffer to read the incoming chunk
    const tempBuffer = Buffer.alloc(1024); 
    
    try {
      // Read the data directly from the file descriptor
      const bytesRead = fs.readSync(fd, tempBuffer, 0, tempBuffer.length, null);
      
      if (bytesRead > 0) {
        // Slice the buffer to the actual number of bytes read
        const chunk = tempBuffer.subarray(0, bytesRead);
        
        // Save the new data into our global variable
        savedData = Buffer.concat([savedData, chunk]);
        
        console.log(`[FD ${fd}] New data chunk:`, chunk.toString());
        console.log(`[FD ${fd}] Total saved data so far:`, savedData.toString());
      }
    } catch (readErr) {
      // Handle cases where the socket might have closed
      console.error("Error reading from FD or socket closed:", readErr);
      poller.remove(fd); // Use epoll_ctl(EPOLL_CTL_DEL) to stop monitoring
    }
  }




  });

  const client = net.createConnection({ port: 8080, host: "localhost" });

  client.on("connect", () => {
    // Access the internal libuv file descriptor
    const fd = client._handle ? client._handle.fd : null;
    console.log(`Connected! Socket File Descriptor (FD): ${fd}`);
  });

  const epollFd =  poller.add(0);

}
