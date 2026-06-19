import { evictionRatio } from "../server";

export function evict(store: Map<string, string> ,evictionStrategy: string){
    switch (evictionStrategy) {
        case "simiple-first":
            evictFirst(store)
            break;
        case "allkeys-random":

        evictAllKeysRandom(store)
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
    // console.log("got into evict all keyys random ---------------------", store.size);
    while (evictCount >0 && store.size >0) {

        
        const keys = Array.from(store.keys());
        const delKey = keys[0];
        // console.log("got into evict all keyys random", evictCount, delKey);
        evictCount-=1
        store.delete(delKey)
        
    }

}