/**
 * Provides pure utilities for combining, diluting, and contaminating chemical solutions.
 */

import type { Chemical, Solution } from './@types/domain.types';
import type { Milliliters, Moles } from './@types/units.types';

/** Neutral-water reference pH used for dilution blending approximation. */
const NEUTRAL_PH = 7;
/** Fully transparent white color used as dilution visual reference. */
const DILUTION_REFERENCE_COLOR = '#FFFFFF';

/**
 * Merges two solutions by summing chemical moles and solvent volumes.
 * Output is intentionally marked as not mixed to require an explicit mixing step.
 *
 * @param solutionA - First solution input.
 * @param solutionB - Second solution input.
 * @returns Combined solution object.
 * @throws {RangeError} Thrown when volumes are non-finite or negative.
 */
export function mergeSolutions(solutionA: Solution, solutionB: Solution): Solution {
  assertFiniteNonNegativeNumber(Number(solutionA.solventVolume), 'solutionA.solventVolume');
  assertFiniteNonNegativeNumber(Number(solutionB.solventVolume), 'solutionB.solventVolume');

  const volumeA = Number(solutionA.solventVolume);
  const volumeB = Number(solutionB.solventVolume);
  const totalVolumeMl = (volumeA + volumeB) as Milliliters;

  const mergedChemicals = new Map(solutionA.chemicals);
  for (const [chemicalId, moles] of solutionB.chemicals.entries()) {
    const current = mergedChemicals.get(chemicalId) ?? (0 as Moles);
    mergedChemicals.set(chemicalId, (Number(current) + Number(moles)) as Moles);
  }

  const ratioA = totalVolumeMl === 0 ? 0.5 : volumeA / Number(totalVolumeMl);
  const weightedPh = totalVolumeMl === 0 ? NEUTRAL_PH : (solutionA.ph * volumeA + solutionB.ph * volumeB) / Number(totalVolumeMl);

  return {
    chemicals: mergedChemicals,
    solventVolume: totalVolumeMl,
    currentColorHex: calculateBlendedColor(solutionA.currentColorHex, solutionB.currentColorHex, ratioA),
    ph: weightedPh,
    isMixed: false,
    isContaminated: solutionA.isContaminated || solutionB.isContaminated,
  };
}

/**
 * Dilutes a solution by adding solvent volume while preserving moles of dissolved species.
 * Concentrations are therefore reduced proportionally via updated volume representation.
 *
 * @param solution - Original solution.
 * @param diluent - Added diluent volume in milliliters.
 * @returns Diluted solution.
 * @throws {RangeError} Thrown when volumes are non-finite, original volume is negative, or diluent is negative.
 */
export function diluteSolution(solution: Solution, diluent: Milliliters): Solution {
  assertFiniteNonNegativeNumber(Number(solution.solventVolume), 'solution.solventVolume');
  assertFiniteNonNegativeNumber(Number(diluent), 'diluent');

  const originalVolume = Number(solution.solventVolume);
  const addedVolume = Number(diluent);
  const totalVolume = (originalVolume + addedVolume) as Milliliters;

  const ratioOriginal = totalVolume === 0 ? 1 : originalVolume / Number(totalVolume);
  const dilutedPh = totalVolume === 0 ? solution.ph : solution.ph * ratioOriginal + NEUTRAL_PH * (1 - ratioOriginal);

  return {
    chemicals: new Map(solution.chemicals),
    solventVolume: totalVolume,
    currentColorHex: calculateBlendedColor(solution.currentColorHex, DILUTION_REFERENCE_COLOR, ratioOriginal),
    ph: dilutedPh,
    isMixed: false,
    isContaminated: solution.isContaminated,
  };
}

/**
 * Blends two hex colors according to the fraction of solution A.
 *
 * @param colorA - Hex color for solution A.
 * @param colorB - Hex color for solution B.
 * @param ratioA - Fraction of contribution from solution A in [0, 1].
 * @returns Hex color string for blended solution.
 * @throws {RangeError} Thrown when ratioA is outside [0, 1] or colors are invalid.
 */
export function calculateBlendedColor(colorA: string, colorB: string, ratioA: number): string {
  assertFiniteNumber(ratioA, 'ratioA');
  if (ratioA < 0 || ratioA > 1) {
    throw new RangeError('ratioA must be between 0 and 1.');
  }

  const rgbA = parseHexColor(colorA);
  const rgbB = parseHexColor(colorB);
  const ratioB = 1 - ratioA;

  const blended = {
    r: Math.round(rgbA.r * ratioA + rgbB.r * ratioB),
    g: Math.round(rgbA.g * ratioA + rgbB.g * ratioB),
    b: Math.round(rgbA.b * ratioA + rgbB.b * ratioB),
  };

  return toHexColor(blended);
}

/**
 * Adds contaminant moles into a solution and marks contamination status.
 * Color is adjusted by blending current color with contaminant color by contaminant mole fraction.
 *
 * @param solution - Solution to contaminate.
 * @param contaminant - Contaminant chemical descriptor.
 * @param contaminantMoles - Added contaminant amount in moles.
 * @returns New contaminated solution.
 * @throws {RangeError} Thrown when contaminant moles are negative or non-finite.
 */
export function contaminateSolution(
  solution: Solution,
  contaminant: Chemical,
  contaminantMoles: Moles,
): Solution {
  assertFiniteNonNegativeNumber(Number(contaminantMoles), 'contaminantMoles');

  const mergedChemicals = new Map(solution.chemicals);
  const currentMoles = mergedChemicals.get(contaminant.id) ?? (0 as Moles);
  mergedChemicals.set(contaminant.id, (Number(currentMoles) + Number(contaminantMoles)) as Moles);

  const totalMolesBefore = Array.from(solution.chemicals.values()).reduce(
    (accumulator, value) => accumulator + Number(value),
    0,
  );
  const totalMolesAfter = totalMolesBefore + Number(contaminantMoles);
  const originalFraction = totalMolesAfter <= 0 ? 1 : totalMolesBefore / totalMolesAfter;

  return {
    chemicals: mergedChemicals,
    solventVolume: solution.solventVolume,
    currentColorHex: calculateBlendedColor(
      solution.currentColorHex,
      contaminant.colorHex,
      originalFraction,
    ),
    ph: solution.ph,
    isMixed: false,
    isContaminated: true,
  };
}

/**
 * Parses a 6-digit hex color string into RGB channels.
 *
 * @param value - Input hex color string.
 * @returns RGB channel object.
 * @throws {RangeError} Thrown when color format is invalid.
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
 * @param rgb - RGB values.
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
 * Normalizes hex color string to uppercase with leading hash.
 *
 * @param value - Input color string.
 * @returns Normalized hex color.
 * @throws {never} This function does not throw.
 */
function normalizeHex(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
}

/**
 * Clamps color channel value to [0, 255].
 *
 * @param value - Channel value.
 * @returns Clamped integer.
 * @throws {never} This function does not throw.
 */
function clampColorChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Asserts that a numeric value is finite.
 *
 * @param value - Numeric value to validate.
 * @param label - Parameter label.
 * @throws {RangeError} Thrown when value is not finite.
 */
function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
}

/**
 * Asserts that a numeric value is finite and non-negative.
 *
 * @param value - Numeric value to validate.
 * @param label - Parameter label.
 * @throws {RangeError} Thrown when value is negative or not finite.
 */
function assertFiniteNonNegativeNumber(value: number, label: string): void {
  assertFiniteNumber(value, label);
  if (value < 0) {
    throw new RangeError(`${label} must be non-negative.`);
  }
}

