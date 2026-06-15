import { DumpAllAOF } from "../core/aof.js";
import { Delete, Get, newObject, Obj, Put } from "../core/store.js";
import { encodeBulk, encodeNumber, encodeSimple } from "../protocol/encoder.js";

export function evalPING(args: string[]): string {
  if (args.length > 1) {
    throw new Error("wrong number of arguments for 'ping' command");
  }

  return args.length === 0 ? encodeSimple("PONG") : encodeBulk(args[0]);
}

export function evalSET(args: string[]): string {
  if (args.length <= 1) {
    throw new Error("Error wrong number of arguments for set command");
  }

  const  key = args[0], value = args[1];
  let exDurationMs = -1;

  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case "ex": {
        i++;
        if (i == args.length) {
          console.log(args);
          
          throw new Error("Error syntax error");
        }

        const exDurationSec = Number(args[i]);
        exDurationMs = exDurationSec * 1000;
      }
      break;
      default: {
        console.log("error ", args[i], i);
        
        throw new Error(`Error Syntax errror , ${args[i]}` );
      }
    }
  }

  Put(key, newObject(value, exDurationMs));

  return "+OK\r\n"

}

export function evalGET(args: string[])
{
  if(args.length != 1)
  {
    throw new Error("Error wrong number of arguments for get command");
  }


  const key = args[0];
  const obj: Obj = Get(key)
  // console.log(obj , "---");
  

  if(!obj)
  {
    return encodeSimple("No Value for this key found")
  }

  // check expire
  if(obj.ExpiresAt <=  Date.now() && obj.ExpiresAt != -1)
  {

    console.log("expire there ");
    
    return encodeSimple("No Value for this key found")
  }

  return encodeBulk(obj.value)

}

export function evalTTL(args: string[]){

  if(args.length != 1)
  {
    throw new Error("Error wrong number of arguments for get command");
    
  }

  // console.log("naman 1234"  , args);
  


  const key = args[0];
  const obj: Obj = Get(key)
  
  

  if(!obj )
  {
    // no key found
    // console.log(obj, "naman is there");
    return encodeSimple("-2")
  }


  // check expire
  else if(obj.ExpiresAt == -1)
  {
    return encodeSimple("-1")
  }

    const duration = obj.ExpiresAt - Date.now()

    if(duration <= 0 ){
      
    // no key found
    // console.log(obj, "naman is there");
    return encodeSimple("-2")
  
    }

    // console.log(obj, duration, "----", encodeNumber(duration));
    

  return encodeNumber(duration/1000)
  
}

export function evalDEL(args: string[]): string {

  let countDelete = 0;
  for(let i=0; i< args.length; i++)
  {
    if(Delete(args[i]))
    {
      countDelete ++;
    }
  }

  return encodeNumber(countDelete)
  
}


export function evalExpire(args: string[]) : string {

  if(args.length <= 1)
  {
    throw new Error(`(error ) err wrong number of arguments for 'expire' command`)
  }

  const key = args[0]
  const duration : number = Number(args[1]);
  if(Number.isNaN(duration))
  {
    throw new Error(`(error ) err value is not an integer or out of range`)
  }
  
  const obj : Obj = Get(key)
  if(!obj)
  {
    return encodeNumber(0)
  }

  obj.ExpiresAt = Date.now() + duration *1000
  return encodeNumber(1)
}

export function evalBGREWRITEAOF(args: string[]): string{

  DumpAllAOF();
  return "+OK\r\n"
 
}