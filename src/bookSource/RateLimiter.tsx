/**
 * @copyright 2024 Adam (charrondev) Charron
 * @license AGPL-3.0-only
 */

export class RateLimiter {
    private currentPromise: Promise<any> | null = null;

    constructor(private elapsedMs: number) {}

    public async wait() {
        if (this.currentPromise) {
            await this.currentPromise;
        }

        // Add a new one
        this.currentPromise = new Promise((resolve) => {
            setTimeout(resolve, this.elapsedMs);
        });
    }
}
