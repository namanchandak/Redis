export const keySpaceStats: Map<string , number>[] = Array.from({length: 4}, ()=> new Map<string, number>) 

export function updateDBStats(num: number, metric: string, value: number) {
    keySpaceStats[num].set(metric, value)
}