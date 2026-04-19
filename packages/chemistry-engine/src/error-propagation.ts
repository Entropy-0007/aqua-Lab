/**
 * Provides pure error-propagation utilities for anomaly-driven measurement corruption.
 */

import type { Anomaly, GlasswareSpec, ParallaxError } from './@types/domain.types';
import type { Milliliters } from './@types/units.types';

/** Degrees-to-radians conversion factor. */
const DEGREES_TO_RADIANS = Math.PI / 180;
/** Cubic millimeters to milliliters conversion factor (1000 mm^3 = 1 mL). */
const CUBIC_MM_PER_ML = 1000;

/**
 * Applies anomaly-introduced volume errors to a true measured volume.
 *
 * @param trueVolumeMl - Ideal or true reference volume in milliliters.
 * @param anomalies - Anomaly list to aggregate.
 * @returns Corrupted measured volume in milliliters.
 * @throws {RangeError} Thrown when trueVolumeMl is not finite.
 */
export function applyAnomalyVolumeErrors(
  trueVolumeMl: Milliliters,
  anomalies: Anomaly[],
): Milliliters {
  assertFiniteNumber(Number(trueVolumeMl), 'trueVolumeMl');

  const totalError = anomalies.reduce((accumulator, anomaly) => {
    if (anomaly.volumeErrorIntroduced === null) {
      return accumulator;
    }

    return accumulator + Number(anomaly.volumeErrorIntroduced);
  }, 0);

  return (Number(trueVolumeMl) + totalError) as Milliliters;
}

/**
 * Estimates parallax error and apparent volume using burette geometry and eye-angle deviation.
 *
 * Geometric model:
 * apparentErrorMm = innerRadiusMm x tan(angleRadians)
 * apparentErrorMl = (pi x innerRadiusMm^2 x apparentErrorMm) / 1000
 *
 * @param trueVolumeMl - True volume reading in milliliters.
 * @param eyeAngleDegrees - Eye-angle deviation from ideal meniscus line of sight.
 * @param buretteInnerRadiusMm - Burette inner radius in millimeters.
 * @returns Structured parallax-error result.
 * @throws {RangeError} Thrown when trueVolumeMl, angle, or radius are invalid.
 */
export function calculateParallaxError(
  trueVolumeMl: Milliliters,
  eyeAngleDegrees: number,
  buretteInnerRadiusMm: number,
): ParallaxError {
  assertFiniteNumber(Number(trueVolumeMl), 'trueVolumeMl');
  assertFiniteNumber(eyeAngleDegrees, 'eyeAngleDegrees');
  assertFinitePositiveNumber(buretteInnerRadiusMm, 'buretteInnerRadiusMm');

  const angleRadians = eyeAngleDegrees * DEGREES_TO_RADIANS;
  const apparentOffsetMm = buretteInnerRadiusMm * Math.tan(angleRadians);
  const crossSectionAreaMm2 = Math.PI * buretteInnerRadiusMm * buretteInnerRadiusMm;
  const errorMl = ((crossSectionAreaMm2 * apparentOffsetMm) / CUBIC_MM_PER_ML) as Milliliters;

  return {
    readingAngleDegrees: eyeAngleDegrees,
    trueVolume: trueVolumeMl,
    apparentVolume: (Number(trueVolumeMl) + Number(errorMl)) as Milliliters,
    error: errorMl,
  };
}

/**
 * Estimates volumetric measurement uncertainty from instrument graduation interval.
 * Rule: uncertainty is half the smallest graduation.
 *
 * @param instrument - Glassware specification including graduation interval.
 * @returns Instrument uncertainty in milliliters.
 * @throws {RangeError} Thrown when graduation interval is not finite or non-positive.
 */
export function estimateMeasurementUncertainty(instrument: GlasswareSpec): Milliliters {
  const graduation = Number(instrument.graduationInterval);
  assertFinitePositiveNumber(graduation, 'instrument.graduationInterval');
  return (graduation / 2) as Milliliters;
}

/**
 * Asserts numeric finiteness.
 *
 * @param value - Value to validate.
 * @param label - Parameter label.
 * @throws {RangeError} Thrown when value is not finite.
 */
function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
}

/**
 * Asserts positivity and finiteness.
 *
 * @param value - Value to validate.
 * @param label - Parameter label.
 * @throws {RangeError} Thrown when value is non-positive or not finite.
 */
function assertFinitePositiveNumber(value: number, label: string): void {
  assertFiniteNumber(value, label);
  if (value <= 0) {
    throw new RangeError(`${label} must be greater than zero.`);
  }
}

