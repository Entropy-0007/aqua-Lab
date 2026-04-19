/**
 * Provides pure droplet creation, kinematics stepping, landing checks, and splash effects.
 */

import type { ChemicalId, LiquidParticle, Solution, Vector3D } from './@types/domain.types';
import type { Milliliters } from './@types/units.types';

/** Gravity acceleration in m/s^2. */
const GRAVITY_MS2 = 9.81;
/** Conversion factor from m/s^2 to mm/s^2 for millimeter-space integration. */
const GRAVITY_MM_PER_S2 = GRAVITY_MS2 * 1000;
/** Cubic millimeters in one milliliter. */
const CUBIC_MM_PER_ML = 1000;
/** Minimum number of splash particles on impact. */
const MIN_SPLASH_PARTICLE_COUNT = 3;
/** Maximum number of splash particles on impact. */
const MAX_SPLASH_PARTICLE_COUNT = 5;
/** Upper bound multiplier for splash particle radius fraction relative to parent droplet radius. */
const SPLASH_RADIUS_MAX_FRACTION = 0.35;
/** Lower bound multiplier for splash particle radius fraction relative to parent droplet radius. */
const SPLASH_RADIUS_MIN_FRACTION = 0.18;
/** Maximum horizontal splash speed in mm/s. */
const SPLASH_HORIZONTAL_SPEED_MM_PER_S = 120;
/** Minimum upward splash speed in mm/s. */
const SPLASH_UPWARD_SPEED_MIN_MM_PER_S = 140;
/** Maximum upward splash speed in mm/s. */
const SPLASH_UPWARD_SPEED_MAX_MM_PER_S = 260;

/**
 * Creates a droplet particle from source position, launch velocity, and droplet volume.
 * Radius is derived from sphere volume: V = (4/3)pi r^3.
 *
 * @param sourcePosition - Initial droplet position in millimeter-space.
 * @param initialVelocity - Initial droplet velocity in millimeters per second.
 * @param chemicalId - Chemical identity carried by this droplet.
 * @param volumeMl - Droplet volume in milliliters.
 * @returns New droplet particle.
 * @throws {RangeError} Thrown when volume is non-positive or non-finite.
 */
export function createDroplet(
  sourcePosition: Vector3D,
  initialVelocity: Vector3D,
  chemicalId: ChemicalId,
  volumeMl: Milliliters,
): LiquidParticle {
  assertFinitePositiveNumber(Number(volumeMl), 'volumeMl');

  const radiusMm = calculateSphereRadiusFromVolumeMl(volumeMl);
  const id = createDeterministicId('droplet', sourcePosition, initialVelocity, Number(volumeMl));

  return {
    id,
    position: { ...sourcePosition },
    velocity: { ...initialVelocity },
    radius: radiusMm,
    chemical: chemicalId,
    opacity: 1,
    isDroplet: true,
  };
}

/**
 * Advances droplet state one explicit timestep under gravity.
 *
 * Kinematic update:
 * - velocity.y = velocity.y - g * delta
 * - position = position + velocity * delta
 *
 * @param droplet - Input droplet state.
 * @param deltaSeconds - Integration timestep in seconds.
 * @returns Updated droplet state.
 * @throws {RangeError} Thrown when deltaSeconds is negative or non-finite.
 */
export function stepDroplet(droplet: LiquidParticle, deltaSeconds: number): LiquidParticle {
  assertFiniteNonNegativeNumber(deltaSeconds, 'deltaSeconds');

  const nextVelocity = {
    x: droplet.velocity.x,
    y: droplet.velocity.y - GRAVITY_MM_PER_S2 * deltaSeconds,
    z: droplet.velocity.z,
  };

  const nextPosition = {
    x: droplet.position.x + nextVelocity.x * deltaSeconds,
    y: droplet.position.y + nextVelocity.y * deltaSeconds,
    z: droplet.position.z + nextVelocity.z * deltaSeconds,
  };

  return {
    ...droplet,
    position: nextPosition,
    velocity: nextVelocity,
  };
}

/**
 * Checks whether droplet has reached or passed target surface height.
 *
 * Criterion:
 * landed when droplet.position.y <= targetSurfaceHeightMm.
 *
 * @param droplet - Droplet state.
 * @param targetSurfaceHeightMm - Target liquid surface height in millimeters.
 * @returns True when droplet is landed, otherwise false.
 * @throws {RangeError} Thrown when targetSurfaceHeightMm is non-finite.
 */
export function hasDropletLanded(
  droplet: LiquidParticle,
  targetSurfaceHeightMm: number,
): boolean {
  assertFiniteNumber(targetSurfaceHeightMm, 'targetSurfaceHeightMm');
  return droplet.position.y <= targetSurfaceHeightMm;
}

/**
 * Applies droplet impact to target solution and spawns deterministic micro-splash particles.
 *
 * Impact approximation:
 * - Add droplet volume to solvent volume.
 * - Estimate added moles for carried chemical from current in-solution concentration.
 * - Spawn 3-5 deterministic pseudo-random splash particles with upward velocity.
 *
 * @param droplet - Impacting droplet.
 * @param targetSolution - Receiving solution.
 * @returns Updated solution and spawned micro-splash particles.
 * @throws {RangeError} Thrown when target solution volume is negative or invalid.
 */
export function calculateDropletSplashVolume(
  droplet: LiquidParticle,
  targetSolution: Solution,
): { updatedSolution: Solution; splashParticles: LiquidParticle[] } {
  assertFiniteNonNegativeNumber(Number(targetSolution.solventVolume), 'targetSolution.solventVolume');

  const dropletVolumeMl = calculateSphereVolumeMlFromRadius(droplet.radius) as Milliliters;
  const nextVolume = (Number(targetSolution.solventVolume) + Number(dropletVolumeMl)) as Milliliters;

  const updatedChemicals = new Map(targetSolution.chemicals);
  const existingMoles = updatedChemicals.get(droplet.chemical) ?? (0 as number);
  const baseConcentrationMolPerL =
    Number(targetSolution.solventVolume) > 0
      ? existingMoles / (Number(targetSolution.solventVolume) / CUBIC_MM_PER_ML)
      : 0;
  const addedMoles = baseConcentrationMolPerL * (Number(dropletVolumeMl) / CUBIC_MM_PER_ML);
  updatedChemicals.set(droplet.chemical, (existingMoles + addedMoles) as Solution['chemicals'] extends Map<unknown, infer TValue> ? TValue : never);

  const updatedSolution: Solution = {
    chemicals: updatedChemicals,
    solventVolume: nextVolume,
    currentColorHex: targetSolution.currentColorHex,
    ph: targetSolution.ph,
    isMixed: false,
    isContaminated: targetSolution.isContaminated,
  };

  const splashParticles = createSplashParticles(droplet);

  return {
    updatedSolution,
    splashParticles,
  };
}

/**
 * Creates deterministic splash particles from an impacting droplet.
 *
 * @param droplet - Parent droplet.
 * @returns Splash particle list.
 * @throws {never} This function does not throw.
 */
function createSplashParticles(droplet: LiquidParticle): LiquidParticle[] {
  const baseSeed = hashString(droplet.id);
  const countRange = MAX_SPLASH_PARTICLE_COUNT - MIN_SPLASH_PARTICLE_COUNT + 1;
  const count = MIN_SPLASH_PARTICLE_COUNT + (baseSeed % countRange);
  const particles: LiquidParticle[] = [];

  for (let index = 0; index < count; index += 1) {
    const seed = baseSeed + index * 37;
    const randA = pseudoRandomUnit(seed + 11);
    const randB = pseudoRandomUnit(seed + 17);
    const randC = pseudoRandomUnit(seed + 23);

    const theta = randA * 2 * Math.PI;
    const horizontalSpeed = SPLASH_HORIZONTAL_SPEED_MM_PER_S * (0.25 + randB * 0.75);
    const upwardSpeed =
      SPLASH_UPWARD_SPEED_MIN_MM_PER_S +
      randC * (SPLASH_UPWARD_SPEED_MAX_MM_PER_S - SPLASH_UPWARD_SPEED_MIN_MM_PER_S);

    const radiusFraction =
      SPLASH_RADIUS_MIN_FRACTION +
      pseudoRandomUnit(seed + 29) * (SPLASH_RADIUS_MAX_FRACTION - SPLASH_RADIUS_MIN_FRACTION);

    particles.push({
      id: `${droplet.id}-splash-${index + 1}`,
      position: { ...droplet.position },
      velocity: {
        x: Math.cos(theta) * horizontalSpeed,
        y: upwardSpeed,
        z: Math.sin(theta) * horizontalSpeed,
      },
      radius: droplet.radius * radiusFraction,
      chemical: droplet.chemical,
      opacity: 0.7,
      isDroplet: true,
    });
  }

  return particles;
}

/**
 * Computes sphere radius from droplet volume.
 *
 * Formula:
 * r = cbrt((3V)/(4pi)), using V in mm^3.
 *
 * @param volumeMl - Volume in milliliters.
 * @returns Radius in millimeters.
 * @throws {never} This function does not throw.
 */
function calculateSphereRadiusFromVolumeMl(volumeMl: Milliliters): number {
  const volumeMm3 = Number(volumeMl) * CUBIC_MM_PER_ML;
  return Math.cbrt((3 * volumeMm3) / (4 * Math.PI));
}

/**
 * Computes sphere volume from radius.
 *
 * Formula:
 * V = (4/3)pi r^3, then convert mm^3 to mL.
 *
 * @param radiusMm - Radius in millimeters.
 * @returns Volume in milliliters.
 * @throws {never} This function does not throw.
 */
function calculateSphereVolumeMlFromRadius(radiusMm: number): number {
  const volumeMm3 = (4 / 3) * Math.PI * radiusMm * radiusMm * radiusMm;
  return volumeMm3 / CUBIC_MM_PER_ML;
}

/**
 * Creates deterministic identifier from numeric vector payload.
 *
 * @param prefix - Identifier prefix.
 * @param position - Position vector.
 * @param velocity - Velocity vector.
 * @param scalar - Scalar payload.
 * @returns Deterministic identifier.
 * @throws {never} This function does not throw.
 */
function createDeterministicId(
  prefix: string,
  position: Vector3D,
  velocity: Vector3D,
  scalar: number,
): string {
  const payload = `${prefix}:${position.x},${position.y},${position.z}:${velocity.x},${velocity.y},${velocity.z}:${scalar}`;
  return `${prefix}-${hashString(payload).toString(16)}`;
}

/**
 * Hashes a string to a deterministic positive integer.
 *
 * @param input - Input text.
 * @returns Deterministic hash value.
 * @throws {never} This function does not throw.
 */
function hashString(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/**
 * Produces deterministic pseudo-random value in [0, 1) from integer seed.
 *
 * @param seed - Seed integer.
 * @returns Pseudo-random fraction.
 * @throws {never} This function does not throw.
 */
function pseudoRandomUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
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

