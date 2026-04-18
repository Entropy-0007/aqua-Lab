/**
 * Defines anomaly-tracking state and intent actions for experimental error management.
 */

import type { StateCreator } from 'zustand';

import type { Anomaly } from '../../types/anomaly.types';
import type { Milliliters, Seconds } from '../../types/units.types';
import type { RootStore } from '../store';

/** Represents state fields for active/resolved anomalies and accumulated error metrics. */
export interface AnomalySliceState {
  activeAnomalies: Anomaly[];
  resolvedAnomalies: Anomaly[];
  totalVolumeErrorAccumulated: Milliliters;
}

/** Represents all mutation intents for anomaly tracking and lifecycle transitions. */
export interface AnomalySliceActions {
  /** Triggers and records a new anomaly with generated identity and timestamp metadata. */
  triggerAnomaly: (anomaly: Omit<Anomaly, 'id' | 'triggeredAt'>) => void;
  /** Resolves an active anomaly and moves it to resolved anomaly history. */
  resolveAnomaly: (id: string) => void;
  /** Marks an anomaly as user-seen while keeping it active for later resolution. */
  acknowledgeAnomaly: (id: string) => void;
  /** Recomputes total active volume error from current anomaly set. */
  calculateTotalVolumeError: () => void;
  /** Clears all anomaly data and returns to an empty anomaly state. */
  clearAllAnomalies: () => void;
  /** Resets this slice to initial anomaly defaults. */
  resetAnomalyState: () => void;
}

/** Represents the complete anomaly slice contract. */
export type AnomalySlice = AnomalySliceState & AnomalySliceActions;

/** Prefix used to mark acknowledged anomalies in human-readable descriptions. */
const ACKNOWLEDGED_PREFIX = '[ACKNOWLEDGED] ';
/** Zero-valued branded milliliter constant for error accumulation initialization. */
const ZERO_MILLILITERS = 0 as Milliliters;

/** Creates initial state fields for anomaly slice defaults. */
const createInitialAnomalySliceState = (): AnomalySliceState => ({
  activeAnomalies: [],
  resolvedAnomalies: [],
  totalVolumeErrorAccumulated: ZERO_MILLILITERS,
});

/** Creates a UUID string for anomaly records. */
const createUuid = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `anomaly-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Sums volume errors for active anomalies, ignoring null volume-error entries. */
const computeVolumeErrorSum = (anomalies: readonly Anomaly[]): Milliliters => {
  const sum = anomalies.reduce((acc, item) => {
    if (item.volumeErrorIntroduced === null) {
      return acc;
    }

    return acc + Number(item.volumeErrorIntroduced);
  }, 0);

  return sum as Milliliters;
};

/** Creates the anomaly slice with typed state, reducers, and reset support. */
export const createAnomalySlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  AnomalySlice
> = (set, get) => ({
  ...createInitialAnomalySliceState(),

  triggerAnomaly: (anomalyInput) => {
    const triggeredAt = get().elapsedTime as Seconds;

    set(
      (state) => {
        const anomaly: Anomaly = {
          ...anomalyInput,
          id: createUuid(),
          triggeredAt,
        };

        state.activeAnomalies.push(anomaly);
      },
      false,
      'anomaly/triggerAnomaly',
    );
  },

  resolveAnomaly: (id) => {
    set(
      (state) => {
        const index = state.activeAnomalies.findIndex((item: Anomaly) => item.id === id);
        if (index < 0) {
          throw new Error(`Cannot resolve anomaly: ${id} was not found.`);
        }

        const [resolved] = state.activeAnomalies.splice(index, 1);
        state.resolvedAnomalies.push(resolved);
      },
      false,
      'anomaly/resolveAnomaly',
    );
  },

  acknowledgeAnomaly: (id) => {
    set(
      (state) => {
        const index = state.activeAnomalies.findIndex((item: Anomaly) => item.id === id);
        if (index < 0) {
          throw new Error(`Cannot acknowledge anomaly: ${id} was not found.`);
        }

        const anomaly = state.activeAnomalies[index];
        if (!anomaly.description.startsWith(ACKNOWLEDGED_PREFIX)) {
          state.activeAnomalies[index] = {
            ...anomaly,
            description: `${ACKNOWLEDGED_PREFIX}${anomaly.description}`,
          };
        }
      },
      false,
      'anomaly/acknowledgeAnomaly',
    );
  },

  calculateTotalVolumeError: () => {
    set(
      (state) => {
        state.totalVolumeErrorAccumulated = computeVolumeErrorSum(state.activeAnomalies);
      },
      false,
      'anomaly/calculateTotalVolumeError',
    );
  },

  clearAllAnomalies: () => {
    set(
      (state) => {
        state.activeAnomalies = [];
        state.resolvedAnomalies = [];
        state.totalVolumeErrorAccumulated = ZERO_MILLILITERS;
      },
      false,
      'anomaly/clearAllAnomalies',
    );
  },

  resetAnomalyState: () => {
    set(
      (state) => {
        const initial = createInitialAnomalySliceState();
        state.activeAnomalies = initial.activeAnomalies;
        state.resolvedAnomalies = initial.resolvedAnomalies;
        state.totalVolumeErrorAccumulated = initial.totalVolumeErrorAccumulated;
      },
      false,
      'anomaly/resetAnomalyState',
    );
  },
});
