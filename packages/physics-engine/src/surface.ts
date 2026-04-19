/**
 * Provides pure surface-geometry and burette-reading approximations for laboratory liquid columns.
 */

import type { GlasswareSpec } from './@types/domain.types';
import type { Milliliters } from './@types/units.types';

/** Gravity acceleration in m/s^2 for capillary-length approximation. */
const GRAVITY_MS2 = 9.81;
/** Cubic millimeters per milliliter conversion. */
const CUBIC_MM_PER_ML = 1000;
/** Millimeters per meter conversion. */
const MILLIMETERS_PER_METER = 1000;
/** Degrees to radians conversion factor. */
const DEGREES_TO_RADIANS = Math.PI / 180;

/**
 * Calculates liquid surface height from volume and cylindrical cross-section.
 *
 * Approximation:
 * h = V / (pi r^2), with V converted from mL to mm^3.
 *
 * @param volumeMl - Liquid volume in milliliters.
 * @param glasswareSpec - Vessel geometry specification.
 * @returns Surface height in millimeters.
 * @throws {RangeError} Thrown when volume is negative/non-finite or radius is invalid.
 */
export function calculateSurfaceHeight(
  volumeMl: Milliliters,
  glasswareSpec: GlasswareSpec,
): number {
  assertFiniteNonNegativeNumber(Number(volumeMl), 'volumeMl');
  assertFinitePositiveNumber(glasswareSpec.innerRadiusMm, 'glasswareSpec.innerRadiusMm');

  const volumeMm3 = Number(volumeMl) * CUBIC_MM_PER_ML;
  const areaMm2 = Math.PI * glasswareSpec.innerRadiusMm * glasswareSpec.innerRadiusMm;
  return volumeMm3 / areaMm2;
}

/**
 * Calculates meniscus depth using capillary-length-based approximation.
 *
 * Steps:
 * - Capillary length lambda = sqrt(sigma / (rho g))
 * - Meniscus depth approx lambda^2 / r for concave water meniscus in glass tube.
 *
 * @param tubeRadiusMm - Tube inner radius in millimeters.
 * @param liquidDensity - Liquid density in kg/m^3.
 * @param surfaceTension - Surface tension in N/m.
 * @returns Meniscus depth in millimeters.
 * @throws {RangeError} Thrown when parameters are non-positive or non-finite.
 */
export function calculateMeniscusDepth(
  tubeRadiusMm: number,
  liquidDensity: number,
  surfaceTension: number,
): number {
  assertFinitePositiveNumber(tubeRadiusMm, 'tubeRadiusMm');
  assertFinitePositiveNumber(liquidDensity, 'liquidDensity');
  assertFinitePositiveNumber(surfaceTension, 'surfaceTension');

  const radiusMeters = tubeRadiusMm / MILLIMETERS_PER_METER;
  const capillaryLengthMeters = Math.sqrt(surfaceTension / (liquidDensity * GRAVITY_MS2));
  const depthMeters = (capillaryLengthMeters * capillaryLengthMeters) / radiusMeters;
  return depthMeters * MILLIMETERS_PER_METER;
}

/**
 * Calculates true burette reading using the bottom of a concave meniscus.
 *
 * Approximation:
 * - Bottom meniscus height = surfaceHeight - meniscusDepth.
 * - Reading volume = (pi r^2 x effectiveHeight) / 1000.
 *
 * @param surfaceHeightMm - Measured surface height in millimeters.
 * @param glasswareSpec - Burette geometry specification.
 * @param meniscusDepthMm - Meniscus depth in millimeters.
 * @returns True burette reading in milliliters.
 * @throws {RangeError} Thrown when geometry or heights are invalid.
 */
export function getCorrectBuretteReading(
  surfaceHeightMm: number,
  glasswareSpec: GlasswareSpec,
  meniscusDepthMm: number,
): Milliliters {
  assertFiniteNumber(surfaceHeightMm, 'surfaceHeightMm');
  assertFinitePositiveNumber(glasswareSpec.innerRadiusMm, 'glasswareSpec.innerRadiusMm');
  assertFiniteNonNegativeNumber(meniscusDepthMm, 'meniscusDepthMm');

  const effectiveHeightMm = Math.max(0, surfaceHeightMm - meniscusDepthMm);
  const areaMm2 = Math.PI * glasswareSpec.innerRadiusMm * glasswareSpec.innerRadiusMm;
  const volumeMl = (areaMm2 * effectiveHeightMm) / CUBIC_MM_PER_ML;
  return volumeMl as Milliliters;
}

/**
 * Calculates apparent burette reading under parallax from non-perpendicular eye angle.
 *
 * Approximation:
 * - Apparent displacement = meniscusDepth x tan(eyeAngle - 90 deg).
 * - Convert displacement to volume through burette cross-sectional area.
 *
 * @param trueReading - True burette reading in milliliters.
 * @param eyeAngleDegrees - Viewing angle in degrees.
 * @param meniscusDepthMm - Meniscus depth in millimeters.
 * @param buretteInnerRadiusMm - Burette inner radius in millimeters.
 * @returns Apparent burette reading in milliliters.
 * @throws {RangeError} Thrown when inputs are non-finite or radius is non-positive.
 */
export function getApparentBuretteReading(
  trueReading: Milliliters,
  eyeAngleDegrees: number,
  meniscusDepthMm: number,
  buretteInnerRadiusMm: number,
): Milliliters {
  assertFiniteNumber(Number(trueReading), 'trueReading');
  assertFiniteNumber(eyeAngleDegrees, 'eyeAngleDegrees');
  assertFiniteNonNegativeNumber(meniscusDepthMm, 'meniscusDepthMm');
  assertFinitePositiveNumber(buretteInnerRadiusMm, 'buretteInnerRadiusMm');

  const angleDeviationRadians = (eyeAngleDegrees - 90) * DEGREES_TO_RADIANS;
  const apparentDisplacementMm = meniscusDepthMm * Math.tan(angleDeviationRadians);
  const areaMm2 = Math.PI * buretteInnerRadiusMm * buretteInnerRadiusMm;
  const displacementMl = (areaMm2 * apparentDisplacementMm) / CUBIC_MM_PER_ML;
  return (Number(trueReading) + displacementMl) as Milliliters;
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

