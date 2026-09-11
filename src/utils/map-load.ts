const MAP_LOAD_TIMEOUT_MS = 20_000;

interface MapLoadEventSource {
  once: (event: 'load', listener: () => void) => unknown;
  off: (event: 'load', listener: () => void) => unknown;
}

export function waitForMapLoad(
  map: MapLoadEventSource,
  signal: AbortSignal,
  timeoutMs = MAP_LOAD_TIMEOUT_MS,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeoutId);
      map.off('load', handleLoad);
      signal.removeEventListener('abort', handleAbort);
    };
    const handleLoad = () => {
      cleanup();
      resolve();
    };
    const handleAbort = () => {
      cleanup();
      const error = new Error('Map initialization cancelled');
      error.name = 'AbortError';
      reject(error);
    };
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Mapbox did not load within ${timeoutMs} ms`));
    }, timeoutMs);

    map.once('load', handleLoad);
    signal.addEventListener('abort', handleAbort, { once: true });
  });
}
