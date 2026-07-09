import { executeCommand } from "../commands/commands";
import { Command } from "../types/command"

export type Client = {
    fd : number,
    isTxn: boolean,
    cQueue: Command[],
    
}

export function newClient(fd:number,) {
    return {fd: fd, isTxn : false, cQueue: []}
}

export function TxnBegin(c:Client) {
    c.isTxn  = true;
}

export function TxnQueue(c: Client, cmd: Command)
{
    // console.log(c, "\n\n");
    // console.log(cmd, " --- cmd\n\n");
    
    c.cQueue.push(cmd)
}

export function TxnExec (c: Client) : string{
    let buffer: string = `*${c.cQueue.length}\r\n`
    c.cQueue.forEach(item => {
        buffer+= executeCommand(item, c ) as string
    });

    c.cQueue = []
    c.isTxn = false

    return buffer;

}

export function TxnDiscard(c:Client) {
    c.cQueue = [];
    c.isTxn = false

}