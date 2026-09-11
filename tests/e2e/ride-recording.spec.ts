import { expect, test } from '@playwright/test';
import { riverwalkRide, type GpsFix } from './fixtures/ride';

declare global {
  interface Window {
    emitTestGpsFix: (fix: GpsFix) => void;
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const watchers = new Map<number, PositionCallback>();
    let nextWatchId = 1;

    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        watchPosition(success: PositionCallback) {
          const watchId = nextWatchId++;
          watchers.set(watchId, success);
          return watchId;
        },
        clearWatch(watchId: number) {
          watchers.delete(watchId);
        },
        getCurrentPosition() {},
      },
    });

    window.emitTestGpsFix = (fix) => {
      const position = {
        coords: {
          latitude: fix.latitude,
          longitude: fix.longitude,
          altitude: fix.altitude,
          accuracy: fix.accuracy,
          altitudeAccuracy: fix.altitudeAccuracy,
          heading: null,
          speed: fix.speed,
        },
        timestamp: Date.now(),
      } as GeolocationPosition;

      for (const success of watchers.values()) success(position);
    };

    localStorage.setItem('bikechatt-welcome-dismissed', '1');
  });
});

test('shows a live ride from synthesized GPS fixes', async ({ page }) => {
  const rideStart = new Date('2025-06-01T12:00:00Z');
  await page.clock.install({ time: new Date('2025-06-01T11:59:00Z') });
  await page.goto('/');
  const ridesPanelButton = page.getByRole('button', {
    name: 'Open rides panel',
  });
  await expect(ridesPanelButton).toBeVisible();
  await page.clock.pauseAt(rideStart);

  await ridesPanelButton.click();
  await page.getByRole('button', { name: 'Record a Ride' }).click();
  await expect(
    page.getByRole('heading', { name: 'Recording ride' }),
  ).toBeVisible();

  for (const fix of riverwalkRide) {
    await page.evaluate((gpsFix) => window.emitTestGpsFix(gpsFix), fix);
  }
  await page.clock.runFor(120_000);
  // A current fix keeps the live speed populated after the simulated ride.
  const currentFix = riverwalkRide[riverwalkRide.length - 1];
  await page.evaluate((gpsFix) => window.emitTestGpsFix(gpsFix), currentFix);

  await expect(page.getByText('0.5 km').first()).toBeVisible();
  await expect(page.getByText('18.0 km/h', { exact: true })).toBeVisible();
  await expect(page.getByText('2:00', { exact: true })).toBeVisible();

  const recordingPanel = page
    .getByRole('heading', { name: 'Recording ride' })
    .locator('..');
  await expect(recordingPanel).toHaveScreenshot('ride-recording.png', {
    animations: 'disabled',
  });
});
