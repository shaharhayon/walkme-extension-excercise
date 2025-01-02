const MINUTE = 60;
export default {
    TRACKED_URL:'facebook.com',
    // SESSION_TIMEOUT: 5 * MINUTE,
    SESSION_TIMEOUT: 10,
    SESSION_COOLDOWN: 10 * MINUTE,
    DAILY_TIMEOUT: 60 * MINUTE
} as const;