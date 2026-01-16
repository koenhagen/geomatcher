function mulberry32(seed: number) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function seededShuffle<T>(array: T[], seed: number): T[] {
    const rand = mulberry32(seed);
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        if (arr[i] === undefined || arr[j] === undefined) {
            throw new Error('Input array must not be sparse or contain undefined elements');
        }
        const temp = arr[i] as T;
        arr[i] = arr[j] as T;
        arr[j] = temp;
    }
    return arr;
}