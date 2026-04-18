/**
 * Defines top-level simulation session types, user actions, and trial records.
 */

import type { Anomaly } from './anomaly.types';
import type { Chemical, ChemicalId } from './chemical.types';
import type { GlasswareInstance } from './glassware.types';
import type { MilligramsPerLiter, Milliliters, Seconds } from './units.types';

/** Enumerates the sequential phases of an EDTA titration simulation session. */
export enum SimulationPhase {
  SETUP = 'SETUP',
  SAMPLE_PREPARATION = 'SAMPLE_PREPARATION',
  INDICATOR_ADDITION = 'INDICATOR_ADDITION',
  TITRATION = 'TITRATION',
  ENDPOINT_DETECTION = 'ENDPOINT_DETECTION',
  RESULT_CALCULATION = 'RESULT_CALCULATION',
  COMPLETE = 'COMPLETE',
}

/** Enumerates all user-triggered actions that can be logged in a session. */
export enum UserAction {
  SELECT_GLASSWARE = 'SELECT_GLASSWARE',
  FILL_GLASSWARE = 'FILL_GLASSWARE',
  DISPENSE_LIQUID = 'DISPENSE_LIQUID',
  OPEN_STOPCOCK = 'OPEN_STOPCOCK',
  CLOSE_STOPCOCK = 'CLOSE_STOPCOCK',
  SHAKE_FLASK = 'SHAKE_FLASK',
  READ_BURETTE = 'READ_BURETTE',
  RECORD_VALUE = 'RECORD_VALUE',
  ADD_CHEMICAL = 'ADD_CHEMICAL',
  RINSE_GLASSWARE = 'RINSE_GLASSWARE',
  RESET = 'RESET',
}

/** Represents a single recorded experiment trial and its measured outcomes. */
export interface ExperimentRecord {
  readonly trialNumber: number;
  readonly initialBuretteReading: Milliliters;
  readonly finalBuretteReading: Milliliters;
  readonly volumeEDTAUsed: Milliliters;
  readonly calculatedHardness: MilligramsPerLiter | null;
  readonly endpointReached: boolean;
  readonly anomaliesEncountered: readonly Anomaly[];
  readonly durationSeconds: Seconds;
  readonly isOutlier: boolean;
}

/** Represents a timestamped user action entry used for analytics and replay support. */
export interface UserActionLogEntry {
  readonly timestamp: Seconds;
  readonly action: UserAction;
  readonly payload: Record<string, unknown>;
}

/** Represents the complete mutable session snapshot for the simulation runtime. */
export interface SimulationState {
  readonly phase: SimulationPhase;
  readonly glassware: Map<string, GlasswareInstance>;
  readonly activeChemicals: Map<ChemicalId, Chemical>;
  readonly currentTrial: ExperimentRecord | null;
  readonly completedTrials: readonly ExperimentRecord[];
  readonly activeAnomalies: readonly Anomaly[];
  readonly elapsedTime: Seconds;
  readonly selectedGlasswareId: string | null;
  readonly userActionLog: readonly UserActionLogEntry[];
}
