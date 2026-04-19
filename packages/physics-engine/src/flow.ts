/**
 * Provides pure flow-rate and volume-dispensing calculations for lab glassware outlets.
 */

import type { Milliliters, MillilitersPerSecond, Seconds } from './@types/units.types';

/** Gravitational acceleration in m/s^2. */
const GRAVITY_MS2 = 9.81;
/** Millimeters in one meter. */
const MILLIMETERS_PER_METER = 1000;
/** Cubic millimeters in one milliliter. */
const CUBIC_MM_PER_ML = 1000;
/** Flow threshold separating dropwise discharge from continuous stream. */
const DROP_FORMATION_THRESHOLD_ML_PER_S = 0.08 as MillilitersPerSecond;
/** Canonical single-drop volume approximation used for interval estimation. */
const NOMINAL_DROP_VOLUME_ML = 0.05 as Milliliters;

/**
 * Calculates outlet flow rate using Torricelli's theorem and a stopcock restriction factor.
 *
 * Approximation:
 * - Exit speed v = sqrt(2gh) where h is liquid head in meters.
 * - Volumetric flow Q = A x v.
 * - Effective flow = Q x restrictionFactor(angle), with 0 deg -> 0 and 90 deg -> 1.
 *
 * @param stopcockAngleDegrees - Stopcock opening angle in degrees.
 * @param liquidHeightMm - Liquid head above outlet in millimeters.
 * @param tubeRadiusMm - Tube inner radius in millimeters.
 * @returns Flow rate in milliliters per second.
 * @throws {RangeError} Thrown when any input is non-finite or geometrically invalid.
 */
export function calculateFlowRate(
  stopcockAngleDegrees: number,
  liquidHeightMm: number,
  tubeRadiusMm: number,
): MillilitersPerSecond {
  assertFiniteNumber(stopcockAngleDegrees, 'stopcockAngleDegrees');
  assertFiniteNonNegativeNumber(liquidHeightMm, 'liquidHeightMm');
  assertFinitePositiveNumber(tubeRadiusMm, 'tubeRadiusMm');

  const clampedAngle = Math.max(0, Math.min(90, stopcockAngleDegrees));
  if (clampedAngle === 0 || liquidHeightMm === 0) {
    return 0 as MillilitersPerSecond;
  }

  const restrictionFactor = mapStopcockAngleToRestriction(clampedAngle);
  const headMeters = liquidHeightMm / MILLIMETERS_PER_METER;
  const exitVelocityMs = Math.sqrt(2 * GRAVITY_MS2 * headMeters);
  const crossSectionAreaMm2 = Math.PI * tubeRadiusMm * tubeRadiusMm;
  const velocityMmPerS = exitVelocityMs * MILLIMETERS_PER_METER;
  const volumetricFlowMm3PerS = crossSectionAreaMm2 * velocityMmPerS;
  const volumetricFlowMlPerS = (volumetricFlowMm3PerS / CUBIC_MM_PER_ML) * restrictionFactor;

  return volumetricFlowMlPerS as MillilitersPerSecond;
}

/**
 * Calculates dispensed volume over an explicit integration step.
 *
 * Euler step:
 * volume = flowRate x deltaTime
 *
 * @param flowRateMlPerS - Flow rate in milliliters per second.
 * @param deltaSeconds - Time-step in seconds.
 * @returns Dispensed volume in milliliters for the step.
 * @throws {RangeError} Thrown when flow rate or delta is invalid.
 */
export function calculateVolumeDispensed(
  flowRateMlPerS: MillilitersPerSecond,
  deltaSeconds: number,
): Milliliters {
  assertFiniteNonNegativeNumber(Number(flowRateMlPerS), 'flowRateMlPerS');
  assertFiniteNonNegativeNumber(deltaSeconds, 'deltaSeconds');
  return (Number(flowRateMlPerS) * deltaSeconds) as Milliliters;
}

/**
 * Determines whether discharge is in dropwise mode versus continuous stream mode.
 *
 * Criterion:
 * drop formation when flowRate < DROP_FORMATION_THRESHOLD_ML_PER_S.
 *
 * @param flowRateMlPerS - Flow rate in milliliters per second.
 * @returns True for dropwise mode, false for stream mode.
 * @throws {RangeError} Thrown when flow rate is invalid.
 */
export function isDropFormation(flowRateMlPerS: MillilitersPerSecond): boolean {
  assertFiniteNonNegativeNumber(Number(flowRateMlPerS), 'flowRateMlPerS');
  return Number(flowRateMlPerS) < Number(DROP_FORMATION_THRESHOLD_ML_PER_S);
}

/**
 * Estimates interval between individual drops during dropwise discharge.
 *
 * Approximation:
 * interval = nominalDropVolume / flowRate.
 *
 * @param flowRateMlPerS - Flow rate in milliliters per second.
 * @returns Time between drops in seconds.
 * @throws {RangeError} Thrown when flow rate is non-positive or invalid.
 */
export function calculateDropInterval(flowRateMlPerS: MillilitersPerSecond): Seconds {
  assertFinitePositiveNumber(Number(flowRateMlPerS), 'flowRateMlPerS');
  return (Number(NOMINAL_DROP_VOLUME_ML) / Number(flowRateMlPerS)) as Seconds;
}

/**
 * Maps stopcock angle to restriction factor in [0, 1].
 * Uses a smooth quadratic opening response to approximate needle/stopcock behavior.
 *
 * @param angleDegrees - Clamped angle in degrees.
 * @returns Restriction multiplier.
 * @throws {never} This function does not throw.
 */
function mapStopcockAngleToRestriction(angleDegrees: number): number {
  const normalized = angleDegrees / 90;
  return normalized * normalized;
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

