/**
 * Provides pure endpoint-detection utilities for EDTA titration state evaluation.
 */

import type { EndpointStatus, IndicatorBehavior } from './@types/domain.types';
import type { Milliliters, Moles, MolesPerLiter } from './@types/units.types';

/** Milliliters to liters conversion factor. */
const MILLILITERS_PER_LITER = 1000;
/** Empirical sigmoid steepness used to model visual endpoint transition sharpness. */
const COLOR_TRANSITION_SIGMOID_STEEPNESS = 4;
/** pH target associated with sharp endpoint behavior for Eriochrome Black T systems. */
const SHARP_ENDPOINT_TARGET_PH = 10;
/** Allowed pH tolerance around target for sharp endpoint response. */
const SHARP_ENDPOINT_PH_TOLERANCE = 0.2;
/** Reference Eriochrome Black T below-endpoint color in hex format. */
const ERIOCHROME_BELOW_ENDPOINT_HEX = '#C0392B';
/** Reference Eriochrome Black T at-endpoint color in hex format. */
const ERIOCHROME_AT_ENDPOINT_HEX = '#1B6CA8';

/**
 * Calculates remaining metal-ion concentration after EDTA consumption in flask volume.
 *
 * Remaining metal ions = initialMetalMoles - edtaDispensedMoles, with 1:1 stoichiometry.
 *
 * @param initialMetalMoles - Initial total moles of titratable metal ions.
 * @param edtaDispensedMoles - Moles of EDTA dispensed into flask.
 * @param flaskVolumeMl - Flask solution volume in milliliters.
 * @returns Remaining metal-ion concentration in mol/L.
 * @throws {RangeError} Thrown when inputs are non-finite, metal moles are negative, or flask volume is non-positive.
 */
export function calculateMetalIonConcentrationInFlask(
  initialMetalMoles: Moles,
  edtaDispensedMoles: Moles,
  flaskVolumeMl: Milliliters,
): MolesPerLiter {
  assertFiniteNonNegativeNumber(Number(initialMetalMoles), 'initialMetalMoles');
  assertFiniteNumber(Number(edtaDispensedMoles), 'edtaDispensedMoles');
  assertFinitePositiveNumber(Number(flaskVolumeMl), 'flaskVolumeMl');

  const remainingMoles = Number(initialMetalMoles) - Number(edtaDispensedMoles);
  const flaskVolumeLiters = Number(flaskVolumeMl) / MILLILITERS_PER_LITER;
  return (remainingMoles / flaskVolumeLiters) as MolesPerLiter;
}

/**
 * Determines endpoint status from current metal-ion concentration and indicator threshold behavior.
 *
 * Threshold model:
 * - concentration < 0 -> overshot
 * - concentration <= 1x threshold -> reached
 * - concentration > 1x and <= 5x threshold -> approaching
 * - concentration > 5x threshold -> not-reached
 *
 * @param metalIonConcentration - Current metal-ion concentration in mol/L.
 * @param indicatorBehavior - Indicator threshold and color behavior parameters.
 * @returns Endpoint status classification.
 * @throws {RangeError} Thrown when concentration/threshold are non-finite or threshold is non-positive.
 */
export function determineEndpointStatus(
  metalIonConcentration: MolesPerLiter,
  indicatorBehavior: IndicatorBehavior,
): EndpointStatus {
  const concentrationValue = Number(metalIonConcentration);
  const thresholdValue = Number(indicatorBehavior.transitionMetalConcentrationThreshold);

  assertFiniteNumber(concentrationValue, 'metalIonConcentration');
  assertFinitePositiveNumber(thresholdValue, 'indicatorBehavior.transitionMetalConcentrationThreshold');

  if (concentrationValue < 0) {
    return 'overshot';
  }

  if (concentrationValue <= thresholdValue) {
    return 'reached';
  }

  if (concentrationValue <= thresholdValue * 5) {
    return 'approaching';
  }

  return 'not-reached';
}

/**
 * Calculates interpolated solution color based on proximity to indicator threshold.
 * Uses a sigmoid response to emulate realistic, non-linear visual transition.
 *
 * @param metalIonConcentration - Current metal-ion concentration in mol/L.
 * @param indicatorBehavior - Indicator color and threshold behavior parameters.
 * @returns Hex color string for current solution appearance.
 * @throws {RangeError} Thrown when concentration/threshold are invalid or colors are not valid hex strings.
 */
export function calculateSolutionColorHex(
  metalIonConcentration: MolesPerLiter,
  indicatorBehavior: IndicatorBehavior,
): string {
  const concentrationValue = Number(metalIonConcentration);
  const thresholdValue = Number(indicatorBehavior.transitionMetalConcentrationThreshold);

  assertFiniteNumber(concentrationValue, 'metalIonConcentration');
  assertFinitePositiveNumber(thresholdValue, 'indicatorBehavior.transitionMetalConcentrationThreshold');

  const below = parseHexColor(indicatorBehavior.colorBelowEndpoint);
  const at = parseHexColor(indicatorBehavior.colorAtEndpoint);

  if (concentrationValue < 0) {
    return toHexColor(at);
  }

  const concentrationRatio = concentrationValue / thresholdValue;
  const endpointWeight = 1 / (1 + Math.exp(COLOR_TRANSITION_SIGMOID_STEEPNESS * (concentrationRatio - 1)));

  return toHexColor({
    r: interpolateChannel(below.r, at.r, endpointWeight),
    g: interpolateChannel(below.g, at.g, endpointWeight),
    b: interpolateChannel(below.b, at.b, endpointWeight),
  });
}

/**
 * Determines whether endpoint response is expected to be sharp for given indicator and buffer pH.
 *
 * @param indicator - Indicator behavior profile.
 * @param bufferPH - Current buffered pH.
 * @returns True when pH is near 10 and indicator matches Eriochrome Black T color profile; otherwise false.
 * @throws {RangeError} Thrown when bufferPH is non-finite.
 */
export function isEndpointSharp(indicator: IndicatorBehavior, bufferPH: number): boolean {
  assertFiniteNumber(bufferPH, 'bufferPH');

  const nearTargetPh = Math.abs(bufferPH - SHARP_ENDPOINT_TARGET_PH) <= SHARP_ENDPOINT_PH_TOLERANCE;
  const isEriochromeProfile =
    normalizeHex(indicator.colorBelowEndpoint) === normalizeHex(ERIOCHROME_BELOW_ENDPOINT_HEX) &&
    normalizeHex(indicator.colorAtEndpoint) === normalizeHex(ERIOCHROME_AT_ENDPOINT_HEX);

  return nearTargetPh && isEriochromeProfile;
}

/**
 * Interpolates a color channel with clamped weight.
 *
 * @param from - Start channel value.
 * @param to - End channel value.
 * @param weight - Interpolation weight in [0, 1].
 * @returns Interpolated channel integer.
 * @throws {never} This function does not throw.
 */
function interpolateChannel(from: number, to: number, weight: number): number {
  const clampedWeight = Math.max(0, Math.min(1, weight));
  return Math.round(from + (to - from) * clampedWeight);
}

/**
 * Parses a 6-digit hex color string into RGB channels.
 *
 * @param value - Hex color string.
 * @returns RGB channel object.
 * @throws {RangeError} Thrown when the color string is not valid 6-digit hex.
 */
function parseHexColor(value: string): Readonly<{ r: number; g: number; b: number }> {
  const normalized = normalizeHex(value);
  if (!/^#[0-9A-F]{6}$/.test(normalized)) {
    throw new RangeError(`Invalid hex color: ${value}`);
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

/**
 * Formats RGB channels into uppercase 6-digit hex color.
 *
 * @param rgb - RGB channel values.
 * @returns Hex color string.
 * @throws {never} This function does not throw.
 */
function toHexColor(rgb: Readonly<{ r: number; g: number; b: number }>): string {
  const r = clampColorChannel(rgb.r).toString(16).padStart(2, '0');
  const g = clampColorChannel(rgb.g).toString(16).padStart(2, '0');
  const b = clampColorChannel(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

/**
 * Normalizes a hex color string to uppercase with leading hash.
 *
 * @param value - Raw hex color string.
 * @returns Normalized hex string.
 * @throws {never} This function does not throw.
 */
function normalizeHex(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
}

/**
 * Clamps a channel value into valid 8-bit range.
 *
 * @param value - Raw channel value.
 * @returns Clamped integer channel value.
 * @throws {never} This function does not throw.
 */
function clampColorChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Asserts that a number is finite.
 *
 * @param value - Value to validate.
 * @param label - Parameter label for error messages.
 * @throws {RangeError} Thrown when value is not finite.
 */
function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
}

/**
 * Asserts that a number is finite and non-negative.
 *
 * @param value - Value to validate.
 * @param label - Parameter label for error messages.
 * @throws {RangeError} Thrown when value is negative or not finite.
 */
function assertFiniteNonNegativeNumber(value: number, label: string): void {
  assertFiniteNumber(value, label);
  if (value < 0) {
    throw new RangeError(`${label} must be non-negative.`);
  }
}

/**
 * Asserts that a number is finite and strictly positive.
 *
 * @param value - Value to validate.
 * @param label - Parameter label for error messages.
 * @throws {RangeError} Thrown when value is non-positive or not finite.
 */
function assertFinitePositiveNumber(value: number, label: string): void {
  assertFiniteNumber(value, label);
  if (value <= 0) {
    throw new RangeError(`${label} must be greater than zero.`);
  }
}
