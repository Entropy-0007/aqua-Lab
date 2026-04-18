/**
 * Defines simulation lifecycle state and trial-management actions for the Zustand store.
 */

import type { StateCreator } from 'zustand';

import { SimulationPhase } from '../../types/simulation.types';
import type {
  ExperimentRecord,
  UserAction,
  UserActionLogEntry,
} from '../../types/simulation.types';
import type { Milliliters, Seconds } from '../../types/units.types';
import type { RootStore } from '../store';

/** Represents state fields for simulation lifecycle and trial tracking. */
export interface SimulationSliceState {
  phase: SimulationPhase;
  currentTrial: ExperimentRecord | null;
  completedTrials: ExperimentRecord[];
  elapsedTime: Seconds;
  userActionLog: UserActionLogEntry[];
}

/** Represents all mutation intents for simulation lifecycle and trial tracking. */
export interface SimulationSliceActions {
  /** Advances to the next phase in the canonical lifecycle sequence. */
  advancePhase: () => void;
  /** Force-sets the current simulation phase for administrative control paths. */
  setPhase: (phase: SimulationPhase) => void;
  /** Creates and assigns a fresh current trial record. */
  startNewTrial: () => void;
  /** Finalizes and archives the current trial after completion validation. */
  finalizeCurrentTrial: () => void;
  /** Appends a user action entry with the current simulation timestamp. */
  logUserAction: (action: UserAction, payload: Record<string, unknown>) => void;
  /** Increments elapsed simulation time by a positive delta. */
  tickElapsedTime: (deltaSeconds: number) => void;
  /** Resets this slice to its initial lifecycle and trial state. */
  resetSimulation: () => void;
}

/** Represents the complete simulation slice contract. */
export type SimulationSlice = SimulationSliceState & SimulationSliceActions;

/** Canonical lifecycle order for phase progression validation. */
const PHASE_SEQUENCE: readonly SimulationPhase[] = [
  SimulationPhase.SETUP,
  SimulationPhase.SAMPLE_PREPARATION,
  SimulationPhase.INDICATOR_ADDITION,
  SimulationPhase.TITRATION,
  SimulationPhase.ENDPOINT_DETECTION,
  SimulationPhase.RESULT_CALCULATION,
  SimulationPhase.COMPLETE,
];

/** Zero-valued seconds constant for branded time initialization. */
const ZERO_SECONDS = 0 as Seconds;
/** Zero-valued milliliters constant for branded volume initialization. */
const ZERO_MILLILITERS = 0 as Milliliters;

/** Builds a fresh initial state object for simulation lifecycle fields. */
const createInitialSimulationSliceState = (): SimulationSliceState => ({
  phase: SimulationPhase.SETUP,
  currentTrial: null,
  completedTrials: [],
  elapsedTime: ZERO_SECONDS,
  userActionLog: [],
});

/** Creates a new trial record initialized to safe default values. */
const createEmptyTrial = (trialNumber: number): ExperimentRecord => ({
  trialNumber,
  initialBuretteReading: ZERO_MILLILITERS,
  finalBuretteReading: ZERO_MILLILITERS,
  volumeEDTAUsed: ZERO_MILLILITERS,
  calculatedHardness: null,
  endpointReached: false,
  anomaliesEncountered: [],
  durationSeconds: ZERO_SECONDS,
  isOutlier: false,
});

/** Validates whether a trial has reached a minimally complete finalizable state. */
const isTrialComplete = (trial: ExperimentRecord): boolean => {
  const hasNonNegativeVolume = Number(trial.volumeEDTAUsed) >= 0;
  const hasReadingOrder = Number(trial.finalBuretteReading) >= Number(trial.initialBuretteReading);
  return trial.endpointReached && hasNonNegativeVolume && hasReadingOrder;
};

/** Creates the simulation slice with typed state, reducers, and reset support. */
export const createSimulationSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  SimulationSlice
> = (set, get) => ({
  ...createInitialSimulationSliceState(),

  advancePhase: () => {
    set(
      (state) => {
        const currentIndex = PHASE_SEQUENCE.indexOf(state.phase);
        if (currentIndex === -1) {
          throw new Error(`Invalid phase transition source: ${state.phase}`);
        }

        const nextPhase = PHASE_SEQUENCE[currentIndex + 1];
        if (nextPhase === undefined) {
          throw new Error(`Invalid phase transition from terminal phase: ${state.phase}`);
        }

        state.phase = nextPhase;
      },
      false,
      'simulation/advancePhase',
    );
  },

  setPhase: (phase) => {
    set(
      (state) => {
        state.phase = phase;
      },
      false,
      'simulation/setPhase',
    );
  },

  startNewTrial: () => {
    set(
      (state) => {
        if (state.currentTrial !== null) {
          throw new Error('Cannot start a new trial while a current trial is active.');
        }

        const trialNumber = state.completedTrials.length + 1;
        state.currentTrial = createEmptyTrial(trialNumber);
      },
      false,
      'simulation/startNewTrial',
    );
  },

  finalizeCurrentTrial: () => {
    set(
      (state) => {
        if (state.currentTrial === null) {
          throw new Error('Cannot finalize trial: no active current trial.');
        }

        if (!isTrialComplete(state.currentTrial)) {
          throw new Error('Cannot finalize trial: current trial is incomplete.');
        }

        state.completedTrials.push(state.currentTrial);
        state.currentTrial = null;
      },
      false,
      'simulation/finalizeCurrentTrial',
    );
  },

  logUserAction: (action, payload) => {
    const timestamp = get().elapsedTime;
    set(
      (state) => {
        state.userActionLog.push({
          timestamp,
          action,
          payload,
        });
      },
      false,
      'simulation/logUserAction',
    );
  },

  tickElapsedTime: (deltaSeconds) => {
    set(
      (state) => {
        if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
          throw new Error('Elapsed time delta must be a finite non-negative number.');
        }

        const nextValue = Number(state.elapsedTime) + deltaSeconds;
        state.elapsedTime = nextValue as Seconds;
      },
      false,
      'simulation/tickElapsedTime',
    );
  },

  resetSimulation: () => {
    set(
      (state) => {
        const initialState = createInitialSimulationSliceState();
        state.phase = initialState.phase;
        state.currentTrial = initialState.currentTrial;
        state.completedTrials = initialState.completedTrials;
        state.elapsedTime = initialState.elapsedTime;
        state.userActionLog = initialState.userActionLog;
      },
      false,
      'simulation/resetSimulation',
    );
  },
});

