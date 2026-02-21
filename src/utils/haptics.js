/**
 * Haptic Feedback Utility
 * Provides tactile feedback on supported devices (mobile browsers).
 */

const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Light tap — for UI interactions (toggle, select)
 */
export const tapLight = () => {
    if (supportsVibration) navigator.vibrate(8);
};

/**
 * Medium tap — for confirmations (bookmark, +1 progress)
 */
export const tapMedium = () => {
    if (supportsVibration) navigator.vibrate(15);
};

/**
 * Success pattern — for achievements (Khitma complete, daily goal met)
 */
export const tapSuccess = () => {
    if (supportsVibration) navigator.vibrate([15, 50, 15, 50, 30]);
};

/**
 * Soft tick — for page turns, counters
 */
export const tapTick = () => {
    if (supportsVibration) navigator.vibrate(5);
};
