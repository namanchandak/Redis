export type Obj = {
    TypeEncoding: number;
    value: any;
    lastAccessedAt: number

} | null

export const OBJ_TYPE_STRING: number = 0<< 4

export const OBJ_ENCODING_RAW: number = 0 
export const OBJ_ENCODING_INT: number = 1
export const OBJ_ENCODING_EMBSTR: number = 8
