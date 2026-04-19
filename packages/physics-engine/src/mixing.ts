/**
 * Provides pure swirl-event based mixing progress approximations for lab solution handling.
 */

import type { Percentage, Seconds } from './@types/units.types';

/** Maximum stored event age in seconds for active mixing influence. */
const MIXING_EVENT_RETENTION_SECONDS = 10;
/** Minimum mixing percentage considered homogeneous. */
const HOMOGENEITY_THRESHOLD_PERCENT = 95;

/**
 * Represents one swirling/shaking input event with timestamp and normalized intensity.
 */
export interface SwirlingEvent {
  timestamp: Seconds;
  intensity: number;
}

/**
 * Calculates current mixing progress from swirl events using exponential decay.
 *
 * Approximation:
 * - Contribution per event = intensity x exp(-decayRate x ageSeconds)
 * - Progress = (sumContributions / requiredShakes) x 100
 * - Result clamped to [0, 100]
 *
 * @param swirlingEvents - Recorded swirl events.
 * @param requiredShakes - Calibration factor for full mixing.
 * @param decayRatePerSecond - Exponential decay coefficient.
 * @returns Mixing progress in percentage.
 * @throws {RangeError} Thrown when requiredShakes/decay are invalid or event intensities are out of range.
 */
export function calculateMixingProgress(
  swirlingEvents: SwirlingEvent[],
  requiredShakes: number,
  decayRatePerSecond: number,
): Percentage {
  assertFinitePositiveNumber(requiredShakes, 'requiredShakes');
  assertFiniteNonNegativeNumber(decayRatePerSecond, 'decayRatePerSecond');

  if (swirlingEvents.length === 0) {
    return 0 as Percentage;
  }

  for (let index = 0; index < swirlingEvents.length; index += 1) {
    const event = swirlingEvents[index];
    assertFiniteNumber(Number(event.timestamp), `swirlingEvents[${index}].timestamp`);
    assertFiniteNumber(event.intensity, `swirlingEvents[${index}].intensity`);
    if (event.intensity < 0 || event.intensity > 1) {
      throw new RangeError(`swirlingEvents[${index}].intensity must be between 0 and 1.`);
    }
  }

  const latestTimestamp = Math.max(...swirlingEvents.map((event) => Number(event.timestamp)));
  const weightedIntensity = swirlingEvents.reduce((accumulator, event) => {
    const ageSeconds = Math.max(0, latestTimestamp - Number(event.timestamp));
    const decay = Math.exp(-decayRatePerSecond * ageSeconds);
    return accumulator + event.intensity * decay;
  }, 0);

  const rawProgress = (weightedIntensity / requiredShakes) * 100;
  const clampedProgress = Math.max(0, Math.min(100, rawProgress));
  return clampedProgress as Percentage;
}

/**
 * Determines if solution is sufficiently homogeneous.
 *
 * Criterion:
 * homogeneous when mixingProgress >= 95%.
 *
 * @param mixingProgress - Mixing progress in percentage.
 * @returns True if homogeneous, false otherwise.
 * @throws {RangeError} Thrown when mixingProgress is non-finite.
 */
export function isSolutionHomogeneous(mixingProgress: Percentage): boolean {
  assertFiniteNumber(Number(mixingProgress), 'mixingProgress');
  return Number(mixingProgress) >= HOMOGENEITY_THRESHOLD_PERCENT;
}

/**
 * Records a new swirling event and prunes entries older than retention window.
 *
 * Pruning rule:
 * keep events with currentTime - event.timestamp <= 10 seconds.
 *
 * @param existingEvents - Existing swirl event list.
 * @param intensity - New event intensity in [0, 1].
 * @param currentTime - Current simulation timestamp in seconds.
 * @returns New event array with appended and pruned events.
 * @throws {RangeError} Thrown when intensity/time are invalid.
 */
export function recordSwirlingEvent(
  existingEvents: SwirlingEvent[],
  intensity: number,
  currentTime: Seconds,
): SwirlingEvent[] {
  assertFiniteNumber(Number(currentTime), 'currentTime');
  assertFiniteNumber(intensity, 'intensity');
  if (intensity < 0 || intensity > 1) {
    throw new RangeError('intensity must be between 0 and 1.');
  }

  const thresholdTime = Number(currentTime) - MIXING_EVENT_RETENTION_SECONDS;
  const retained = existingEvents.filter((event) => Number(event.timestamp) >= thresholdTime);
  return [...retained, { timestamp: currentTime, intensity }];
}

/**
 * Asserts finite numeric input.
 *
 * @param value - Numeric value to validate.
 * @param label - Parameter label for diagnostics.
 * @returns Nothing.
 * @throws {RangeError} Thrown when value is non-finite.
 */
function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
}

/**
 * Asserts finite non-negative numeric input.
 *
 * @param value - Numeric value to validate.
 * @param label - Parameter label for diagnostics.
 * @returns Nothing.
 * @throws {RangeError} Thrown when value is negative or non-finite.
 */
function assertFiniteNonNegativeNumber(value: number, label: string): void {
  assertFiniteNumber(value, label);
  if (value < 0) {
    throw new RangeError(`${label} must be non-negative.`);
  }
}

/**
 * Asserts finite strictly positive numeric input.
 *
 * @param value - Numeric value to validate.
 * @param label - Parameter label for diagnostics.
 * @returns Nothing.
 * @throws {RangeError} Thrown when value is non-positive or non-finite.
 */
function assertFinitePositiveNumber(value: number, label: string): void {
  assertFiniteNumber(value, label);
  if (value <= 0) {
    throw new RangeError(`${label} must be greater than zero.`);
  }
}

