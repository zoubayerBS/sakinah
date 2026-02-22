import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Haptics Utilities', () => {
    let originalNavigator;

    beforeEach(() => {
        // Mock navigator.vibrate
        originalNavigator = global.navigator;
        global.navigator = {
            vibrate: vi.fn(),
        };
    });

    afterEach(() => {
        global.navigator = originalNavigator;
        vi.clearAllMocks();
    });

    it('tapLight should call vibrate with 8ms', async () => {
        // Because supportsVibration is evaluated when the module is imported, 
        // we must dynamically import the module AFTER mocking navigator for the test to work
        const haptics = await import('./haptics.js?update=' + Date.now());

        haptics.tapLight();
        expect(global.navigator.vibrate).toHaveBeenCalledWith(8);
    });

    it('tapSuccess should trigger a pattern array', async () => {
        const haptics = await import('./haptics.js?update=' + Date.now());

        haptics.tapSuccess();
        expect(global.navigator.vibrate).toHaveBeenCalledWith([15, 50, 15, 50, 30]);
    });
});
