/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
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
