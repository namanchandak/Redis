
export type Obj = {
    value: any
    ExpiresAt : number
}

const store = new Map()

export function newObject(value: any, durationMs : number): Obj{
    let expiresAt = -1;
    if(durationMs >0)
    {
        const timeNow = Date.now()
        expiresAt = timeNow + durationMs 
    }
    const dataObject : Obj = {
        value: value,
        ExpiresAt: expiresAt
    } ;
    return dataObject

}


export function Put(key: string, obj: Obj )
{
    console.log(key, obj , "----");
    
    store.set(key, obj)
}

export function Get(key: string): Obj
{
    return store.get(key)

}

export function Delete(key: string) : boolean {

    const keyPresent = Get(key)

    store.delete(key); 

    if(!keyPresent)
        return false;

    return true;

}


