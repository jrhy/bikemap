import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MAP_EVENTS } from '@/events';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faStopwatch,
  faPause,
  faPlay,
  faFlagCheckered,
} from '@fortawesome/free-solid-svg-icons';
import { TOGGLE_BTN_CLASS, TOGGLE_ICON_CLASS } from './styles';
import { cn } from '@/lib/utils';
import { useRideRecording, useToast } from '@/hooks';
import {
  formatElapsed,
  formatDistance,
  formatElevation,
  formatSpeed,
  formatGrade,
} from '@/utils/format';
import { RideHistory } from './sidebar/RideHistory';

const PulseDot = memo(function PulseDot() {
  return (
    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot shrink-0 self-center mt-px" />
  );
});

export function RidesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const {
    message: toastMessage,
    isFadingOut: toastFadingOut,
    showToast,
  } = useToast();

  const {
    isRecording,
    isPaused,
    hasRecovery,
    elapsedTime,
    liveDistance,
    liveElevationGain,
    liveSpeed,
    grade,
    pausedSeconds,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    recoverRide,
    continueRide,
    dismissRecovery,
  } = useRideRecording(showToast);

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const isRecordingRef = useRef(false);
  isRecordingRef.current = isRecording;

  const toggle = useCallback(() => {
    const next = !isOpenRef.current;
    setIsOpen(next);
    window.dispatchEvent(
      new CustomEvent(MAP_EVENTS.RIDES_PANEL_TOGGLE, {
        detail: { isOpen: next },
      }),
    );
  }, []);

  const handleRecoverRide = useCallback(async () => {
    const ride = await recoverRide();
    if (ride) {
      showToast('Ride recovered!');
      window.dispatchEvent(
        new CustomEvent(MAP_EVENTS.RIDE_SELECT, {
          detail: { rideId: ride.id },
        }),
      );
    }
  }, [recoverRide, showToast]);

  const handleContinueRide = useCallback(async () => {
    await continueRide();
    showToast('Ride resumed — keep going!');
  }, [continueRide, showToast]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { isOpen: sidebarOpen } = (e as CustomEvent).detail;
      if (sidebarOpen && isOpenRef.current) {
        setIsOpen(false);
        window.dispatchEvent(
          new CustomEvent(MAP_EVENTS.RIDES_PANEL_TOGGLE, {
            detail: { isOpen: false },
          }),
        );
      }
    };
    window.addEventListener(MAP_EVENTS.SIDEBAR_TOGGLE, handler);
    return () => window.removeEventListener(MAP_EVENTS.SIDEBAR_TOGGLE, handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (window.innerWidth > 768) return;
      if (!isOpen) return;
      if (toggleRef.current?.contains(event.target as Node)) return;
      if (panelRef.current?.contains(event.target as Node)) return;
      toggle();
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () =>
      document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen, toggle]);

  useEffect(() => {
    const handleSelect = (e: Event) => {
      const { rideId, openPanel } = (e as CustomEvent).detail;
      setSelectedRideId(rideId);
      if (openPanel && !isOpenRef.current) {
        setIsOpen(true);
        window.dispatchEvent(
          new CustomEvent(MAP_EVENTS.RIDES_PANEL_TOGGLE, {
            detail: { isOpen: true },
          }),
        );
      }
    };
    const handleDeselect = () => setSelectedRideId(null);

    window.addEventListener(MAP_EVENTS.RIDE_SELECT, handleSelect);
    window.addEventListener(MAP_EVENTS.RIDE_DESELECT, handleDeselect);
    return () => {
      window.removeEventListener(MAP_EVENTS.RIDE_SELECT, handleSelect);
      window.removeEventListener(MAP_EVENTS.RIDE_DESELECT, handleDeselect);
    };
  }, []);

  const handleRideSelect = useCallback(
    (rideId: string) => {
      setSelectedRideId(rideId);
      window.dispatchEvent(
        new CustomEvent(MAP_EVENTS.RIDE_SELECT, { detail: { rideId } }),
      );
      window.dispatchEvent(new CustomEvent(MAP_EVENTS.ROUTE_DESELECT));
      window.dispatchEvent(new CustomEvent(MAP_EVENTS.TRAIL_DESELECT));
      if (window.innerWidth <= 768 && isOpen) {
        toggle();
      }
    },
    [isOpen, toggle],
  );

  const handleRecordClick = useCallback(async () => {
    if (isRecording) {
      const ride = await stopRecording();
      if (ride) {
        showToast('Ride saved!');
        window.dispatchEvent(
          new CustomEvent(MAP_EVENTS.RIDE_SELECT, {
            detail: { rideId: ride.id },
          }),
        );
      } else {
        showToast('Ride too short to save — keep recording longer');
      }
    } else {
      startRecording();
      showToast('Recording — keep this tab open. The screen will stay on.');
    }
  }, [isRecording, stopRecording, startRecording, showToast]);

  return (
    <>
      {/* Toggle button */}
      <div
        className={cn(
          'fixed right-4 top-[calc(1.25rem+env(safe-area-inset-top))]',
          isOpen ? 'z-[960]' : 'z-[900]',
          isRecording && !isOpen && 'animate-recording-pulse rounded-full',
        )}
      >
        <button
          ref={toggleRef}
          onClick={toggle}
          className={cn(
            TOGGLE_BTN_CLASS,
            isRecording && '[&_svg]:text-red-500',
          )}
          type="button"
          aria-label={isOpen ? 'Close rides panel' : 'Open rides panel'}
        >
          <FontAwesomeIcon
            icon={isOpen ? faTimes : faStopwatch}
            className={TOGGLE_ICON_CLASS}
          />
        </button>
      </div>

      {/* Floating recording HUD — visible when recording with panel closed */}
      {isRecording && !isOpen && (
        <div className="fixed top-[calc(22px+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[800] bg-white rounded-xl shadow-lg py-2 px-3 flex flex-wrap items-center gap-2.5 text-sm max-md:top-[calc(76px+env(safe-area-inset-top))] max-md:left-2 max-md:right-2 max-md:translate-x-0">
          <PulseDot />
          <span className="font-bold tabular-nums text-gray-700">
            {formatElapsed(elapsedTime)}
          </span>
          <span className="tabular-nums text-gray-500">
            {formatDistance(liveDistance)}
          </span>
          <span className="tabular-nums text-gray-500">
            ↑{formatElevation(liveElevationGain)}
          </span>
          <span
            role="group"
            className="tabular-nums text-gray-500"
            aria-label="Speed"
          >
            {liveSpeed == null ? '— km/h' : formatSpeed(liveSpeed)}
          </span>
          <span
            role="group"
            className="tabular-nums text-gray-500"
            aria-label="Grade"
          >
            {grade == null ? '— %' : formatGrade(grade)}
          </span>
          <div className="flex gap-1.5 ml-auto">
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center cursor-pointer border-none hover:bg-gray-200 text-xs"
              onClick={isPaused ? resumeRecording : pauseRecording}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer border-none hover:bg-red-600 text-xs"
              onClick={handleRecordClick}
              aria-label="Finish ride"
            >
              <FontAwesomeIcon icon={faFlagCheckered} />
            </button>
          </div>
        </div>
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed top-0 right-0 h-full w-[280px] bg-white shadow-[-2px_0_5px_rgba(0,0,0,0.1)] z-[950] overflow-hidden transition-transform duration-300 ease-in-out flex flex-col',
          'max-md:w-full max-md:max-w-[320px]',
          isRecording && 'w-screen max-w-none max-md:max-w-none',
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none',
        )}
      >
        {isRecording ? (
          <>
            <h2 className="sr-only">
              {isPaused ? 'Ride paused' : 'Recording ride'}
            </h2>
            <p aria-live="polite" className="sr-only">
              {isPaused ? 'Ride paused' : 'Recording ride'}
            </p>
          </>
        ) : (
          <div className="border-b border-gray-200 px-4 pb-2 pt-[calc(1rem+env(safe-area-inset-top))]">
            <h2 className="m-0 text-base font-semibold text-gray-700">
              My Rides
            </h2>
          </div>
        )}

        {/* Recording overlay: status + controls replace the header/footer.
            Right inset clears the fixed panel-toggle button (right-4, 44px). */}
        {isRecording && (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 pl-4 pr-16 pt-[calc(.75rem+env(safe-area-inset-top))]">
            {isPaused ? (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                Paused
              </span>
            ) : (
              <PulseDot />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={isPaused ? 'Resume' : 'Pause'}
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-gray-100 text-gray-700 shadow-sm transition-colors hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
              </button>
              <button
                type="button"
                aria-label="Finish ride"
                onClick={handleRecordClick}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faFlagCheckered} />
              </button>
            </div>
          </div>
        )}

        <div
          className={cn(
            'relative flex-1 overflow-y-auto px-4 py-3',
            isRecording && 'flex overflow-hidden p-0',
          )}
        >
          {toastMessage && (
            <div
              className={cn(
                'absolute left-4 right-4 px-3 py-2 bg-gray-700 text-white rounded-md text-[13px] text-center animate-toast-slide-in z-10 pointer-events-none',
                isRecording
                  ? 'top-[calc(4.25rem+env(safe-area-inset-top))]'
                  : 'top-2',
                toastFadingOut &&
                  'opacity-0 transition-opacity duration-300 ease-in',
              )}
            >
              {toastMessage}
            </div>
          )}
          {hasRecovery && !isRecording && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <p className="font-medium text-amber-800 mb-2">
                Unfinished ride found
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600"
                  onClick={handleContinueRide}
                >
                  Continue
                </button>
                <button
                  type="button"
                  className="flex-1 px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-medium hover:bg-amber-600"
                  onClick={handleRecoverRide}
                >
                  Save it
                </button>
                <button
                  type="button"
                  className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50"
                  onClick={dismissRecovery}
                >
                  Discard
                </button>
              </div>
            </div>
          )}
          {isRecording ? (
            <RecordingDashboard
              elapsedTime={elapsedTime}
              distance={liveDistance}
              elevationGain={liveElevationGain}
              speed={liveSpeed}
              grade={grade}
              pausedSeconds={pausedSeconds}
            />
          ) : (
            <RideHistory
              selectedRideId={selectedRideId}
              onRideSelect={handleRideSelect}
            />
          )}
        </div>

        {/* Record entry point (recording controls live in the top overlay) */}
        {!isRecording && (
          <div className="border-t border-gray-200 px-4 py-3">
            <button
              type="button"
              className="w-full flex items-center gap-2 py-5 px-3.5 border border-gray-200 rounded-lg bg-white cursor-pointer text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={handleRecordClick}
            >
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <span>Record a Ride</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function PrimaryStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-h-0 flex-1 basis-0 flex-col items-center justify-center">
      <span className="text-[min(20vw,15dvh)] font-bold leading-none tabular-nums tracking-tight text-gray-900 landscape:text-[min(11vw,20dvh)]">
        {value}
      </span>
      <span className="mt-2 text-sm font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
    </div>
  );
}

function TertiaryStat({
  value,
  unit,
  label,
}: {
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <span className="flex items-baseline gap-1">
        <span className="font-lcd text-xl leading-none text-gray-800">
          {value}
        </span>
        <span className="text-[11px] font-medium text-gray-500">{unit}</span>
      </span>
      <span className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>
    </div>
  );
}

interface RecordingDashboardProps {
  elapsedTime: number;
  distance: number;
  elevationGain: number;
  speed: number | null;
  grade: number | null;
  pausedSeconds: number;
}

function RecordingDashboard({
  elapsedTime,
  distance,
  elevationGain,
  speed,
  grade,
  pausedSeconds,
}: RecordingDashboardProps) {
  // Moving time is what elapsedTime already measures (pause-excluded),
  // so average speed is a pure derivation — no hook state needed.
  const avgSpeed = elapsedTime > 0 ? distance / elapsedTime : null;
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))] landscape:max-w-5xl landscape:flex-row landscape:items-stretch landscape:gap-8 landscape:px-8">
      <PrimaryStat value={formatDistance(distance)} label="Distance" />
      <PrimaryStat
        value={speed == null ? '— km/h' : formatSpeed(speed)}
        label="Speed"
      />
      {/* Portrait: one row (label · value · paused caption) to save height;
          landscape: centered column. */}
      <div className="flex items-baseline justify-center gap-3 border-t border-gray-200 py-3 landscape:w-48 landscape:flex-col landscape:items-center landscape:flex-none landscape:justify-center landscape:gap-0 landscape:border-t-0 landscape:border-l landscape:py-0 landscape:pl-8">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Time
        </span>
        <span className="text-[clamp(1.75rem,7vw,3.5rem)] font-bold leading-none tabular-nums tracking-tight text-gray-800 landscape:text-3xl">
          {formatElapsed(elapsedTime)}
        </span>
        {pausedSeconds > 0 && (
          <span className="text-xs tabular-nums text-gray-400">
            paused {formatElapsed(pausedSeconds)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-gray-200 py-3 landscape:mt-0 landscape:flex landscape:w-64 landscape:flex-none landscape:flex-col landscape:justify-center landscape:gap-3 landscape:border-t-0 landscape:border-l landscape:py-0 landscape:pl-8">
        <TertiaryStat
          value={grade == null ? '—' : String(Math.round(grade))}
          unit="%"
          label="Grade"
        />
        <TertiaryStat
          value={avgSpeed == null ? '—' : (avgSpeed * 3.6).toFixed(1)}
          unit="km/h"
          label="Avg"
        />
        <TertiaryStat
          value={String(Math.round(elevationGain))}
          unit="m"
          label="Climbing"
        />
      </div>
    </div>
  );
}
