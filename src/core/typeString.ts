import { OBJ_ENCODING_EMBSTR, OBJ_ENCODING_INT, OBJ_ENCODING_RAW, OBJ_TYPE_STRING } from "./object";


type deduceType = {
    oType: number,
    oEnc: number
}

export function  deduceTypeEncoding(v: string): deduceType{
    const oType: number = OBJ_TYPE_STRING
    if(typeof(Number(v)) == "number")
    {
        return { oType: oType, oEnc: OBJ_ENCODING_INT }
    }
    else if(v.length <= 44)
    {
        return {oType: oType , oEnc: OBJ_ENCODING_EMBSTR};
    }
    return {oType:  oType, oEnc: OBJ_ENCODING_RAW};
}
