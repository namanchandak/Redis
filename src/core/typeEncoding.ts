export function getType(te: number) : number{
    return (te >> 4) << 4
}

export function getEncoding(te: number): number{
    return te & 0b00001111;

}

export function assertType(te:number, t: number): Error | null {
    if(getType(te) != t)
    {
        throw new Error("the operation is not permitted on this type");
        
    }
    return null;
    
}

export function assertEncoding(te: number,e : number) : Error | null {
    if(getEncoding(te) != e)
    {
        throw new Error("the operation is not permitted on this type");
        
    }
    return null;
    
}