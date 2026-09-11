import { describe, expect, it, vi } from 'vitest';
import { waitForMapLoad } from './map-load';

function fakeMap() {
  let loadListener: (() => void) | undefined;
  return {
    source: {
      once: vi.fn((_event: 'load', listener: () => void) => {
        loadListener = listener;
      }),
      off: vi.fn(),
    },
    load: () => loadListener?.(),
  };
}

describe('waitForMapLoad', () => {
  it('resolves when the map loads and removes its listener', async () => {
    const map = fakeMap();
    const promise = waitForMapLoad(map.source, new AbortController().signal);
    map.load();
    await expect(promise).resolves.toBeUndefined();
    expect(map.source.off).toHaveBeenCalledOnce();
  });

  it('rejects when the map does not load before the timeout', async () => {
    vi.useFakeTimers();
    const map = fakeMap();
    const promise = waitForMapLoad(
      map.source,
      new AbortController().signal,
      100,
    );
    const rejection = expect(promise).rejects.toThrow(
      'Mapbox did not load within 100 ms',
    );
    await vi.advanceTimersByTimeAsync(100);
    await rejection;
    vi.useRealTimers();
  });

  it('cancels pending initialization during teardown', async () => {
    const map = fakeMap();
    const controller = new AbortController();
    const promise = waitForMapLoad(map.source, controller.signal);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});
