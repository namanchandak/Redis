import { promises as fs } from 'fs';
import { store } from './store';

export async function DumpAllAOF() {
  const filePath = './RedisDB.aof';
  let Aofdata: string = '';

//    console.log("DumpAllAOF started");

//    console.log("SET store:", store);
// console.log("SET size:", store.size);


  store.forEach((item: any, key: string) => {
    // Safely extract the strings
            // console.log(key, item);

    const safeKey = String(key);
    const safeValue = typeof item === 'object' && item !== null ? String(item.value) : String(item);
    
    // Format as Redis RESP protocol
    Aofdata += `*3\r\n$3\r\nSET\r\n$${Buffer.byteLength(safeKey)}\r\n${safeKey}\r\n$${Buffer.byteLength(safeValue)}\r\n${safeValue}\r\n`;
  });

  // console.log(Aofdata, store.size, " 0-s-df-s----s-s-");
  

  try {
    // FIX: Use appendFile instead of writeFile
    await fs.writeFile(filePath, Aofdata);    console.log(`${filePath} exists (or was created), and data was appended.`);
  } catch (err) {
    console.error(`Failed to append data to ${filePath}:`, err);
  }
}