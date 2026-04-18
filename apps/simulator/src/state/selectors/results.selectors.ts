/**
 * Defines derived result selectors for simulation reporting and readiness checks.
 */

import { SimulationPhase } from '../../types/simulation.types';
import type { ExperimentRecord } from '../../types/simulation.types';
import type { MilligramsPerLiter, Milliliters } from '../../types/units.types';
import type { RootState } from '../store';

/** Outlier threshold ratio used for trial deviation detection against mean hardness. */
const OUTLIER_DEVIATION_RATIO = 0.1;
/** Zero-valued branded milliliter constant for accumulated-error fallback returns. */
const ZERO_MILLILITERS = 0 as Milliliters;

/** Cache map for memoized average-hardness selector results. */
const averageHardnessCache = new WeakMap<RootState, MilligramsPerLiter | null>();
/** Cache map for memoized outlier selector results. */
const trialOutliersCache = new WeakMap<RootState, ExperimentRecord[]>();
/** Cache map for memoized final-hardness selector results. */
const finalHardnessCache = new WeakMap<RootState, MilligramsPerLiter | null>();

/** Returns trials that contain valid hardness measurements. */
const getValidHardnessTrials = (state: RootState): readonly ExperimentRecord[] =>
  state.completedTrials.filter((trial) => trial.calculatedHardness !== null);

/** Computes arithmetic mean hardness from valid trials and returns null when unavailable. */
const computeAverageHardness = (state: RootState): MilligramsPerLiter | null => {
  const validTrials = getValidHardnessTrials(state);
  if (validTrials.length === 0) {
    return null;
  }

  const total = validTrials.reduce(
    (sum, trial) => sum + Number(trial.calculatedHardness as MilligramsPerLiter),
    0,
  );

  return (total / validTrials.length) as MilligramsPerLiter;
};

/** Determines whether a trial's hardness deviates from a reference mean by more than threshold ratio. */
const isOutlier = (trial: ExperimentRecord, mean: MilligramsPerLiter): boolean => {
  const trialValue = Number(trial.calculatedHardness as MilligramsPerLiter);
  const meanValue = Number(mean);
  if (meanValue === 0) {
    return false;
  }

  const deviationRatio = Math.abs((trialValue - meanValue) / meanValue);
  return deviationRatio > OUTLIER_DEVIATION_RATIO;
};

/** Selects the average hardness of valid completed trials. */
export const selectAverageHardness = (state: RootState): MilligramsPerLiter | null => {
  const cached = averageHardnessCache.get(state);
  if (cached !== undefined || averageHardnessCache.has(state)) {
    return cached ?? null;
  }

  const computed = computeAverageHardness(state);
  averageHardnessCache.set(state, computed);
  return computed;
};

/** Selects whether the simulation has reached a state ready for result calculation. */
export const selectIsReadyToCalculate = (state: RootState): boolean => {
  const phaseReady =
    state.phase === SimulationPhase.RESULT_CALCULATION || state.phase === SimulationPhase.COMPLETE;
  const trialReady = state.currentTrial !== null && state.currentTrial.endpointReached;
  const chemistryReady = Number(state.titrantConsumedMl) > 0;

  return phaseReady && trialReady && chemistryReady;
};

/** Selects trials whose hardness values deviate by more than 10% from the mean. */
export const selectTrialOutliers = (state: RootState): ExperimentRecord[] => {
  const cached = trialOutliersCache.get(state);
  if (cached !== undefined || trialOutliersCache.has(state)) {
    return cached ?? [];
  }

  const mean = selectAverageHardness(state);
  if (mean === null) {
    const none: ExperimentRecord[] = [];
    trialOutliersCache.set(state, none);
    return none;
  }

  const outliers = getValidHardnessTrials(state).filter((trial) => isOutlier(trial, mean));
  trialOutliersCache.set(state, outliers);
  return outliers;
};

/** Selects summed volume error from all active anomalies. */
export const selectAccumulatedVolumeError = (state: RootState): Milliliters => {
  const total = state.activeAnomalies.reduce((sum, anomaly) => {
    if (anomaly.volumeErrorIntroduced === null) {
      return sum;
    }

    return sum + Number(anomaly.volumeErrorIntroduced);
  }, 0);

  return total === 0 ? ZERO_MILLILITERS : (total as Milliliters);
};

/** Selects final hardness result as the mean of non-outlier valid trials, or null when unavailable. */
export const selectFinalHardnessResult = (state: RootState): MilligramsPerLiter | null => {
  const cached = finalHardnessCache.get(state);
  if (cached !== undefined || finalHardnessCache.has(state)) {
    return cached ?? null;
  }

  const outlierIds = new Set(selectTrialOutliers(state).map((trial) => trial.trialNumber));
  const inlierTrials = getValidHardnessTrials(state).filter((trial) => !outlierIds.has(trial.trialNumber));

  if (inlierTrials.length === 0) {
    finalHardnessCache.set(state, null);
    return null;
  }

  const total = inlierTrials.reduce(
    (sum, trial) => sum + Number(trial.calculatedHardness as MilligramsPerLiter),
    0,
  );
  const result = (total / inlierTrials.length) as MilligramsPerLiter;

  finalHardnessCache.set(state, result);
  return result;
};

