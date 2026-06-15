import { promises as fs } from 'fs';
import { store } from './store';


export async function DumpAllAOF()
{
  const filePath = './RedisDB.aof';
  let Aofdata  : string = ''
  store.forEach((item: any, key: string) => {
    // 1. Safely extract the string (change `item.value` to whatever your property is named)
    // If your store just holds mixed types (like numbers), String(item) will fix it.
    const safeKey = String(key);
    const safeValue = typeof item === 'object' && item !== null ? String(item.value) : String(item);

    // 2. Now pass the guaranteed strings to Buffer
    Aofdata += `*3\r\n$3\r\nSET\r\n$${Buffer.byteLength(safeKey)}\r\n${safeKey}\r\n$${Buffer.byteLength(safeValue)}\r\n${safeValue}\r\n`;
  });
  try {
    // This single line creates the file if missing, and appends the data
    await fs.appendFile(filePath, Aofdata);

    console.log(`${filePath} exists (or was created), and data was appended.`);
  } catch (err) {
    console.error(`Failed to append data to ${filePath}:`, err);
  }

}