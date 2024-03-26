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
