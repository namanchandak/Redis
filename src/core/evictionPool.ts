import { getIdleTime } from "./eviction";

export const ePoolSizeMax = 20

type poolItem = {
    key: string,
    lastAccessedAt : number ;
}

type EvictionPool = {
    pool : poolItem[],
    keySet: Map<string, poolItem>
}

export let pq : EvictionPool;

export function push(key:string, lastAccessedAt: number) {
    // console.log("this");
    //     console.log("here we go");

    
    if(pq.keySet.has(key))
    {
        return ;
    }
    const item : poolItem = {key: key, lastAccessedAt: lastAccessedAt} 
    if(pq.pool.length < ePoolSizeMax ){
        pq.pool.push(item)
        pq.keySet.set(key, item )
        sort()
    }
    else if (getIdleTime(lastAccessedAt) > getIdleTime(pq.pool[pq.pool.length -1].lastAccessedAt)) {
    const removedItem = pq.pool.pop() ; 
    if(removedItem)
    pq.keySet.delete(removedItem.key); // Keep Set in sync
    
    pq.pool.push(item);
    pq.keySet.set(key, item);
    sort();
}
}

export function pop(): poolItem| null {

    // console.log("sfsdfs");
    
    if (pq.pool.length === 0) {
    return null;
}
    const item = pq.pool[0];
    pq.pool.shift()
    return item;
}

function sort() {
    // throw new Error("Function not implemented.");
    pq.pool.sort((a: poolItem ,b: poolItem): any=>{
        getIdleTime(a.lastAccessedAt ) - getIdleTime(b.lastAccessedAt)
    })
    // return pool
}

