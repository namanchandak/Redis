import { evalBGREWRITEAOF } from "../commands/eval";

export async function shutdown() {
    console.log("shutdown called");
    await evalBGREWRITEAOF([]);
}