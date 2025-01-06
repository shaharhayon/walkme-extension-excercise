const MINUTE = 60;

// // Production
// export default {
//     TRACKED_URL:'facebook.com',
//     SESSION_TIMEOUT: 5 * MINUTE,
//     SESSION_COOLDOWN: 10 * MINUTE,
//     DAILY_TIMEOUT: 60 * MINUTE
// } as const;

// // Testing
export default {
    TRACKED_URL:'facebook.com',
    SESSION_TIMEOUT: 20,
    SESSION_COOLDOWN: 10,
    DAILY_TIMEOUT: 40
} as const;