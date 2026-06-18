import { evictionStrategy, keyLimit } from "../server";
import { evict } from "./eviction";
import { Obj } from "./object";
import { keySpaceStats } from "./stats";

// export type Obj = {
//     value: any
//     ExpiresAt : number
// } | null

export const store = new  Map() 

export function newObject(value: any, durationMs : number, oType: number, oEnc: number): Obj{
    let expiresAt = -1;
    if(durationMs >0)
    {
        const timeNow = Date.now()
        expiresAt = timeNow + durationMs 
    }
    const dataObject : Obj = {
        value: value,
        ExpiresAt: expiresAt,
        TypeEncoding: oType | oEnc
    } ;
    return dataObject

}


export function Put(key: string, obj: Obj )
{
    if( store.size > keyLimit )
    {

        evict(store, evictionStrategy)
    }    
    if(!keySpaceStats[0] )
    {
        keySpaceStats[0] = new Map<string, number>
    }
    const keysCount : number = keySpaceStats[0].get("keys") || 0  
    keySpaceStats[0].set("keys", keysCount+1) 
    store.set(key, obj)
}

export function Get(key: string): Obj | null
{
    // console.log("erere -");
    const val :Obj = store.get(key)
    if(val && key && val.ExpiresAt <= Date.now() && val.ExpiresAt != -1)
    {   
        
        store.delete(key)
        return null;

    }
    return val

}

export function Delete(key: string) : boolean {

    const keyPresent = Get(key)

    store.delete(key); 

    if(!keyPresent)
        return false;

    const keysCount : number = keySpaceStats[0].get("keys") || 1
    keySpaceStats[0].set("keys", keysCount - 1)   

    return true;

}


