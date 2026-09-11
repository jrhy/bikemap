import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RidesPanel } from './RidesPanel';
import type { useRideRecording } from '@/hooks';
import { MAP_EVENTS } from '@/events';

// Mock useRideRecording hook — rebuilt each test via beforeEach
const showToast = vi.fn();
function createMockHook(): ReturnType<typeof useRideRecording> {
  return {
    isRecording: false,
    isPaused: false,
    hasRecovery: false,
    elapsedTime: 0,
    liveDistance: 0,
    liveElevationGain: 0,
    liveSpeed: 5,
    liveElevation: 201.9,
    grade: 2.4,
    pausedSeconds: 0,
    startRecording: vi.fn(),
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    stopRecording: vi.fn().mockResolvedValue(null),
    recoverRide: vi.fn().mockResolvedValue(null),
    continueRide: vi.fn().mockResolvedValue(undefined),
    dismissRecovery: vi.fn(),
  };
}

let mockHook = createMockHook();

vi.mock('@/hooks', () => ({
  useRideRecording: () => mockHook,
  useToast: () => ({
    message: null,
    isFadingOut: false,
    showToast,
  }),
}));

vi.mock('./sidebar/RideHistory', () => ({
  RideHistory: () => <div data-testid="ride-history" />,
}));

vi.mock('./styles', () => ({
  TOGGLE_BTN_CLASS: 'toggle-btn',
  TOGGLE_ICON_CLASS: 'toggle-icon',
}));

function openPanel() {
  fireEvent.click(screen.getByLabelText('Open rides panel'));
}

describe('RidesPanel', () => {
  beforeEach(() => {
    mockHook = createMockHook();
  });

  it('shows metric live readings in the floating HUD', () => {
    mockHook.isRecording = true;
    render(<RidesPanel />);
    expect(screen.getByLabelText('Speed')).toHaveTextContent('18.0 km/h');
    expect(screen.getByLabelText('Grade')).toHaveTextContent('+2%');
  });

  it('renders toggle button', () => {
    render(<RidesPanel />);
    expect(screen.getByLabelText('Open rides panel')).toBeInTheDocument();
  });

  it('opens panel on toggle click', () => {
    render(<RidesPanel />);
    openPanel();
    expect(screen.getByText('My Rides')).toBeInTheDocument();
  });

  it('shows Record a Ride button when not recording', () => {
    render(<RidesPanel />);
    openPanel();
    expect(screen.getByText('Record a Ride')).toBeInTheDocument();
  });

  it('calls startRecording when Record button clicked', () => {
    render(<RidesPanel />);
    openPanel();
    fireEvent.click(screen.getByText('Record a Ride'));
    expect(mockHook.startRecording).toHaveBeenCalled();
  });

  it('shows recording controls when recording', () => {
    mockHook.isRecording = true;
    render(<RidesPanel />);
    openPanel();
    expect(screen.getByLabelText('Finish ride')).toBeInTheDocument();
    expect(screen.getByLabelText('Pause')).toBeInTheDocument();
  });

  it('shows a Paused chip instead of the title when paused', () => {
    mockHook.isRecording = true;
    mockHook.isPaused = true;
    render(<RidesPanel />);
    openPanel();

    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('shows a one-time toast when recording starts', () => {
    showToast.mockClear();
    render(<RidesPanel />);
    fireEvent.click(screen.getByText('Record a Ride'));

    expect(showToast).toHaveBeenCalledWith(
      expect.stringContaining('keep this tab open'),
    );
  });

  it('replaces ride history with a full recording dashboard', () => {
    mockHook.isRecording = true;
    mockHook.elapsedTime = 3723;
    mockHook.liveDistance = 12400;
    mockHook.liveElevationGain = 318;
    render(<RidesPanel />);
    openPanel();

    expect(screen.queryByTestId('ride-history')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Recording ride' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1:02:03')).toBeInTheDocument();
    expect(screen.getByText('12.4 km')).toBeInTheDocument();
    expect(screen.getByText('318 m')).toBeInTheDocument();
  });

  it('renders the recording hierarchy with grade and avg speed', () => {
    mockHook.isRecording = true;
    mockHook.liveDistance = 12500;
    mockHook.elapsedTime = 2700;
    mockHook.grade = 2.4;
    render(<RidesPanel />);
    openPanel();

    expect(screen.getByText('12.5 km')).toBeInTheDocument(); // distance primary
    expect(screen.getByText('+2%')).toBeInTheDocument(); // grade
    expect(screen.getByText('16.7 km/h')).toBeInTheDocument(); // avg = 12500 m / 2700 s
    expect(screen.queryByLabelText('Elevation')).not.toBeInTheDocument();
  });

  it('renders the small stat digits in the LCD font', () => {
    mockHook.isRecording = true;
    mockHook.liveDistance = 12500;
    mockHook.elapsedTime = 2700;
    mockHook.liveElevationGain = 318;
    render(<RidesPanel />);
    openPanel();

    const grade = screen.getByText('+2%');
    expect(grade).toHaveClass('font-lcd');
    expect(screen.getByText('16.7 km/h')).toHaveClass('font-lcd');
    expect(screen.getByText('318 m')).toHaveClass('font-lcd');
  });

  it('shows a dash for grade before the window fills', () => {
    mockHook.isRecording = true;
    mockHook.grade = null;
    render(<RidesPanel />);
    openPanel();

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows the paused caption when pause time has accumulated', () => {
    mockHook.isRecording = true;
    mockHook.pausedSeconds = 75;
    render(<RidesPanel />);
    openPanel();

    expect(screen.getByText('paused 1:15')).toBeInTheDocument();
  });

  it('announces when the full recording dashboard is paused', () => {
    mockHook.isRecording = true;
    mockHook.isPaused = true;
    render(<RidesPanel />);
    openPanel();

    expect(
      screen.getByRole('heading', { name: 'Ride paused' }),
    ).toBeInTheDocument(); // sr-only h2
  });

  it('calls pauseRecording when Pause clicked', () => {
    mockHook.isRecording = true;
    render(<RidesPanel />);
    openPanel();
    fireEvent.click(screen.getByLabelText('Pause'));
    expect(mockHook.pauseRecording).toHaveBeenCalled();
  });

  it('shows Resume when paused', () => {
    mockHook.isRecording = true;
    mockHook.isPaused = true;
    render(<RidesPanel />);
    openPanel();
    expect(screen.getByLabelText('Resume')).toBeInTheDocument();
  });

  it('calls stopRecording when Finish clicked', async () => {
    mockHook.isRecording = true;
    render(<RidesPanel />);
    openPanel();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Finish ride'));
    });

    expect(mockHook.stopRecording).toHaveBeenCalled();
  });

  it('shows recovery CTA when hasRecovery is true', () => {
    mockHook.hasRecovery = true;
    render(<RidesPanel />);
    openPanel();
    expect(screen.getByText('Unfinished ride found')).toBeInTheDocument();
    expect(screen.getByText('Save it')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
  });

  it('calls recoverRide on Save it click', async () => {
    mockHook.hasRecovery = true;
    render(<RidesPanel />);
    openPanel();

    await act(async () => {
      fireEvent.click(screen.getByText('Save it'));
    });

    expect(mockHook.recoverRide).toHaveBeenCalled();
  });

  it('calls dismissRecovery on Discard click', () => {
    mockHook.hasRecovery = true;
    render(<RidesPanel />);
    openPanel();
    fireEvent.click(screen.getByText('Discard'));
    expect(mockHook.dismissRecovery).toHaveBeenCalled();
  });

  it('dispatches RIDES_PANEL_TOGGLE on toggle', () => {
    const events: CustomEvent[] = [];
    const handler = (e: Event) => events.push(e as CustomEvent);
    window.addEventListener(MAP_EVENTS.RIDES_PANEL_TOGGLE, handler);
    try {
      render(<RidesPanel />);
      openPanel();

      expect(events).toHaveLength(1);
      expect(events[0].detail.isOpen).toBe(true);
    } finally {
      window.removeEventListener(MAP_EVENTS.RIDES_PANEL_TOGGLE, handler);
    }
  });

  it('dispatches panel-close when sidebar opens', () => {
    const events: CustomEvent[] = [];
    const handler = (e: Event) => events.push(e as CustomEvent);
    window.addEventListener(MAP_EVENTS.RIDES_PANEL_TOGGLE, handler);

    try {
      render(<RidesPanel />);
      openPanel(); // opens panel, dispatches isOpen: true

      act(() => {
        window.dispatchEvent(
          new CustomEvent(MAP_EVENTS.SIDEBAR_TOGGLE, {
            detail: { isOpen: true },
          }),
        );
      });

      // Should have dispatched isOpen: false after the sidebar opened
      const closeEvent = events.find((e) => e.detail.isOpen === false);
      expect(closeEvent).toBeDefined();
    } finally {
      window.removeEventListener(MAP_EVENTS.RIDES_PANEL_TOGGLE, handler);
    }
  });
});
