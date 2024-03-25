/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

export class DbError extends Error {
    constructor(
        public description: string,
        public query: string,
        public params: any = {},
    ) {
        super("Database error occurred.");
        this.name = "DbError";
    }
}

export class NetworkError extends Error {
    constructor(
        public description: string,
        public method: string,
        public url: string,
        public params: any = {},
        public responseCode: number = 500,
        public responseBody: any = null,
    ) {
        super("Network error occurred.");
        this.name = "NetworkError";
    }
}
