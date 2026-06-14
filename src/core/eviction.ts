export function evict(store: Map<string, string> ){
    evictFirst(store)
}

function evictFirst(store : Map<string, string>  ) {

    const keys = Array.from(store.keys());
    const delKey = keys[0];
    
    
    
    store.delete(delKey)
}