import { evictionStrategy, keyLimit } from "../server";
import { evict } from "./eviction";
import { Obj } from "./object";
import { keySpaceStats } from "./stats";

export const store = new Map();
export const expires = new Map();

export function setExpire(obj: Obj, expDurationMs: number) {
  expires.set(obj, expDurationMs + Date.now());
}

export function getCurrentClock() {
  return Date.now() & 0x00ffffff;
}

export function newObject(
  value: any,
  expDurationMs: number,
  oType: number,
  oEnc: number,
): Obj {
  // let expiresAt = -1;

  const dataObject: Obj = {
    value: value,
    lastAccessedAt: getCurrentClock(),
    TypeEncoding: oType | oEnc,
  };

  if (expDurationMs > 0) {
    setExpire(dataObject, expDurationMs);
  }

  return dataObject;
}

export function Put(key: string, obj: Obj )
{

    // console.log("entering data dragon");
    
    if( store.size > keyLimit )
    {
        // console.log("got into evict");
        
        evict(store, evictionStrategy)
    }    
    if(!keySpaceStats[0] )
    {
        keySpaceStats[0] = new Map<string, number>
    }
    const keysCount : number = keySpaceStats[0].get("keys") || 0  
    
    store.set(key, {...obj, lastAccessedAt: getCurrentClock()})
    keySpaceStats[0].set("keys", keysCount+1) 
}

export function Get(key: string): Obj | null {
    const val: Obj = store.get(key);
    
    
    if (!val) {
    return null;
  }
    // console.log("erere - ---", val);


  if ( hasExpired(val)) {
    store.delete(key);
    return null;
  }
//   val.lastAccessedAt = getCurrentClock();
  store.set(key, {...val, lastAccessedAt: getCurrentClock() })

  return val;
}

export function Delete(key: string): boolean {
  const keyPresent = Get(key);
  store.delete(key);
  expires.delete(key);

  if (!keyPresent) return false;

  const keysCount: number = keySpaceStats[0].get("keys") || 1;
  keySpaceStats[0].set("keys", keysCount - 1);

  return true;
}

export function hasExpired(val: Obj): boolean {
    // console.log(val, " ---val is + expired");
  if (!val) return false;
    
  return expires.get(val.lastAccessedAt) <= Date.now();
}

export function getExpire(obj: Obj) {
    // console.log("here we go");
    
  return expires.get(obj);
}
