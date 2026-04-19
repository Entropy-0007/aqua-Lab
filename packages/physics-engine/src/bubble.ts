/**
 * Provides pure air-bubble physics approximations for burette error simulation.
 */

import type { AirBubble, Vector3D } from './@types/domain.types';
import type { Milliliters } from './@types/units.types';

/** Gravity acceleration in m/s^2. */
const GRAVITY_MS2 = 9.81;
/** Dynamic viscosity of water at room temperature (Pa.s). */
const WATER_VISCOSITY_PA_S = 0.001002;
/** Density difference between water and air (kg/m^3). */
const WATER_AIR_DENSITY_DIFFERENCE = 998;
/** Millimeters per meter conversion. */
const MILLIMETERS_PER_METER = 1000;
/** Cubic millimeters per milliliter conversion. */
const CUBIC_MM_PER_ML = 1000;

/**
 * Creates a bubble state object at a position and radius.
 *
 * @param position - Initial bubble center position in millimeter-space.
 * @param radiusMm - Bubble radius in millimeters.
 * @returns New bubble object.
 * @throws {RangeError} Thrown when radius is non-positive or non-finite.
 */
export function createAirBubble(position: Vector3D, radiusMm: number): AirBubble {
  assertFinitePositiveNumber(radiusMm, 'radiusMm');

  return {
    id: createDeterministicId(position, radiusMm),
    position: { ...position },
    radiusMm,
    riseVelocity: 0,
    hasPopped: false,
  };
}

/**
 * Advances bubble position by one explicit timestep using simplified Stokes rise velocity.
 *
 * Simplified Stokes law:
 * v = (2/9) x (r^2 x deltaRho x g) / mu
 *
 * @param bubble - Current bubble state.
 * @param deltaSeconds - Integration timestep in seconds.
 * @returns Updated bubble state.
 * @throws {RangeError} Thrown when radius or delta is invalid.
 */
export function stepBubble(bubble: AirBubble, deltaSeconds: number): AirBubble {
  assertFinitePositiveNumber(bubble.radiusMm, 'bubble.radiusMm');
  assertFiniteNonNegativeNumber(deltaSeconds, 'deltaSeconds');

  const radiusMeters = bubble.radiusMm / MILLIMETERS_PER_METER;
  const riseVelocityMs =
    (2 / 9) *
    ((radiusMeters * radiusMeters * WATER_AIR_DENSITY_DIFFERENCE * GRAVITY_MS2) / WATER_VISCOSITY_PA_S);
  const riseVelocityMmPerS = riseVelocityMs * MILLIMETERS_PER_METER;
  const deltaHeight = riseVelocityMmPerS * deltaSeconds;

  return {
    ...bubble,
    position: {
      ...bubble.position,
      y: bubble.position.y + deltaHeight,
    },
    riseVelocity: riseVelocityMmPerS,
  };
}

/**
 * Checks whether bubble has reached or passed a target liquid surface height.
 *
 * @param bubble - Bubble state.
 * @param surfaceHeightMm - Surface height in millimeters.
 * @returns True when bubble center reaches or exceeds surface height.
 * @throws {RangeError} Thrown when surfaceHeightMm is non-finite.
 */
export function hasBubbleReachedSurface(bubble: AirBubble, surfaceHeightMm: number): boolean {
  assertFiniteNumber(surfaceHeightMm, 'surfaceHeightMm');
  return bubble.position.y >= surfaceHeightMm;
}

/**
 * Calculates volumetric reading error equivalent to bubble volume.
 *
 * Sphere volume:
 * V = (4/3)pi r^3, then convert mm^3 to mL with 1000 mm^3 = 1 mL.
 *
 * @param bubble - Bubble state.
 * @returns Volume error in milliliters.
 * @throws {RangeError} Thrown when bubble radius is invalid.
 */
export function calculateVolumeErrorFromBubble(bubble: AirBubble): Milliliters {
  assertFinitePositiveNumber(bubble.radiusMm, 'bubble.radiusMm');
  const volumeMm3 = (4 / 3) * Math.PI * bubble.radiusMm * bubble.radiusMm * bubble.radiusMm;
  return (volumeMm3 / CUBIC_MM_PER_ML) as Milliliters;
}

/**
 * Creates deterministic bubble identifier from position and radius.
 *
 * @param position - Bubble position.
 * @param radiusMm - Bubble radius in millimeters.
 * @returns Deterministic bubble id.
 * @throws {never} This function does not throw.
 */
function createDeterministicId(position: Vector3D, radiusMm: number): string {
  const payload = `${position.x},${position.y},${position.z},${radiusMm}`;
  let hash = 0;
  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash * 33 + payload.charCodeAt(index)) >>> 0;
  }

  return `bubble-${hash.toString(16)}`;
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

