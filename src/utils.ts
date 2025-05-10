import knex from "knex";

export class DbUtils {
    static uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(
            /[018]/g,
            (c: string) =>
                (
                    parseInt(c) ^
                    (crypto.getRandomValues(new Uint8Array(1))[0] &
                        (15 >> (parseInt(c) / 4)))
                ).toString(16),
        );
    }

    static currentDate(): Date {
        return new Date();
    }

    static query() {
        return knex({});
    }
}

export function spaceshipCompare(a: any, b: any): number {
    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    } else {
        return 0;
    }
}

export function hashString(str: string, maxLength = 50) {
    return cyrb53(str).toString().slice(0, maxLength);
}

function cyrb53(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function asyncAnimationFrame<T>(callback: () => T): Promise<T> {
    return new Promise<T>((resolve) => {
        requestAnimationFrame(() => {
            const result = callback();
            resolve(result);
        });
    });
}
