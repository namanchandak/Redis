import { evictionRatio, keyLimit } from "../server";
import { ePoolSizeMax, pop, pq, push } from "./evictionPool";
import { Delete, getCurrentClock, store } from "./store";

export function evict(store: Map<string, string> ,evictionStrategy: string){
    switch (evictionStrategy) {
        case "simiple-first":
            evictFirst(store)
            break;
        case "allkeys-random":

        evictAllKeysRandom(store)
            break;

        case "allkeys-lru":
        evictAllKeysLRU()
        break;
    
        default:
            break;
    }
    
}

function evictFirst(store : Map<string, string>  ) {
    const keys = Array.from(store.keys());
    const delKey = keys[0];
    store.delete(delKey)
}

function evictAllKeysRandom(store : Map<string, string> )
{
    
    let evictCount :  number= store.size * evictionRatio
    while (evictCount >0 && store.size >0) {
        const keys = Array.from(store.keys());
        const delKey = keys[0];
        evictCount-=1
        store.delete(delKey)
        
    }

}

export function getIdleTime(lastAccessedAt: number): number
{
    const currentClock = getCurrentClock();
    if(currentClock >= lastAccessedAt)
    {
        return currentClock - lastAccessedAt
    }
    return (lastAccessedAt - currentClock )+ currentClock ;
}


function populateEvictionPool()
{
    let sampleSize = ePoolSizeMax;
    // 
    const iterator = store.keys(); // Get the iterator
    
    // Note: To make this truly random like Redis, you'd want to pick random keys.
    // However, JS Maps preserve insertion order, making true random sampling tricky.
    // For a basic approximation, grabbing the first few from the iterator works.
    for (let i = 0; i < sampleSize; i++) {
        const result = iterator.next();
        if (result.done) break;
        
        const key = result.value;
        const obj = store.get(key);
        push(key, obj.lastAccessedAt);
    }

} 

function evictAllKeysLRU() {

    console.log("eviction called");
    
    populateEvictionPool()
    const evictCount = evictionRatio * keyLimit
    for(let i=0; i< evictCount && pq.pool.length >0 ; i++)
    {
        const item = pop()
        if(!item)
            return 
        Delete(item.key)
    }

}