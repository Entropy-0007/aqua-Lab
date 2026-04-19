/**
 * Provides pure stoichiometric and hardness-calculation utilities for EDTA titration workflows.
 */

import type {
  MilligramsPerLiter,
  Milliliters,
  Moles,
  MolesPerLiter,
  Percentage,
} from './@types/units.types';

/** Defines hardness range boundaries reported as mg/L CaCO3 equivalent. */
interface HardnessRange {
  min: MilligramsPerLiter;
  max: MilligramsPerLiter | null;
}

/** Enumerates supported hardness classifications. */
type HardnessClassification = 'SOFT' | 'MODERATELY_HARD' | 'HARD' | 'VERY_HARD';

/** Milliliters to liters conversion factor. */
const MILLILITERS_PER_LITER = 1000;
/** Molar mass of CaCO3 for hardness reporting in mg/mol. */
const CACO3_MOLAR_MASS_MG_PER_MOL = 100_090;
/** Default Grubbs significance level used by average-volume helper. */
const DEFAULT_GRUBBS_SIGNIFICANCE_LEVEL = 0.05 as const;

/**
 * Standard water-hardness classes reported as mg/L CaCO3 equivalent.
 * Source: common water-quality classification ranges used in analytical chemistry education.
 */
export const STANDARD_HARDNESS_VALUES: Readonly<Record<HardnessClassification, HardnessRange>> = {
  SOFT: { min: 0 as MilligramsPerLiter, max: 75 as MilligramsPerLiter },
  MODERATELY_HARD: { min: 75 as MilligramsPerLiter, max: 150 as MilligramsPerLiter },
  HARD: { min: 150 as MilligramsPerLiter, max: 300 as MilligramsPerLiter },
  VERY_HARD: { min: 300 as MilligramsPerLiter, max: null },
};

/**
 * Two-sided Grubbs critical values for alpha = 0.05 and 0.01 with sample size n = 3..10.
 * Source: standard analytical chemistry Grubbs test lookup tables.
 */
const GRUBBS_CRITICAL_VALUES: Readonly<Record<0.05 | 0.01, Readonly<Record<number, number>>>> = {
  0.05: {
    3: 1.155,
    4: 1.481,
    5: 1.715,
    6: 1.887,
    7: 2.020,
    8: 2.126,
    9: 2.215,
    10: 2.290,
  },
  0.01: {
    3: 1.155,
    4: 1.496,
    5: 1.764,
    6: 1.973,
    7: 2.139,
    8: 2.274,
    9: 2.387,
    10: 2.482,
  },
};

/**
 * Converts a titrant volume and molar concentration into moles of EDTA.
 *
 * @param volumeEdtaMl - Dispensed EDTA volume in milliliters.
 * @param concentrationEdta - EDTA concentration in mol/L.
 * @returns Calculated EDTA amount in moles.
 * @throws {RangeError} Thrown when volume or concentration is negative or not finite.
 */
export function calculateMolesEDTA(
  volumeEdtaMl: Milliliters,
  concentrationEdta: MolesPerLiter,
): Moles {
  assertFiniteNonNegativeNumber(Number(volumeEdtaMl), 'volumeEdtaMl');
  assertFiniteNonNegativeNumber(Number(concentrationEdta), 'concentrationEdta');

  const volumeLiters = Number(volumeEdtaMl) / MILLILITERS_PER_LITER;
  return (volumeLiters * Number(concentrationEdta)) as Moles;
}

/**
 * Converts moles of EDTA to total moles of complexed divalent metal ions.
 * Uses the 1:1 stoichiometric ratio for EDTA with Ca2+/Mg2+ in hardness titration.
 *
 * @param molesEdta - Moles of EDTA consumed.
 * @returns Equivalent moles of total metal ions.
 * @throws {RangeError} Thrown when molesEdta is negative or not finite.
 */
export function calculateTotalMetalIons(molesEdta: Moles): Moles {
  assertFiniteNonNegativeNumber(Number(molesEdta), 'molesEdta');
  return molesEdta;
}

/**
 * Calculates water hardness reported as mg/L CaCO3 equivalent.
 *
 * Formula: hardness = (molesMetalIons x 100090 mg/mol) / sampleVolume(L)
 *
 * @param molesMetalIons - Moles of total metal ions in the analyzed sample.
 * @param sampleVolumeMl - Original sample volume in milliliters.
 * @returns Hardness in mg/L CaCO3 equivalent.
 * @throws {RangeError} Thrown when moles are negative, sample volume is non-positive, or inputs are not finite.
 */
export function calculateWaterHardness(
  molesMetalIons: Moles,
  sampleVolumeMl: Milliliters,
): MilligramsPerLiter {
  assertFiniteNonNegativeNumber(Number(molesMetalIons), 'molesMetalIons');
  assertFinitePositiveNumber(Number(sampleVolumeMl), 'sampleVolumeMl');

  const sampleVolumeLiters = Number(sampleVolumeMl) / MILLILITERS_PER_LITER;
  const hardness = (Number(molesMetalIons) * CACO3_MOLAR_MASS_MG_PER_MOL) / sampleVolumeLiters;
  return hardness as MilligramsPerLiter;
}

/**
 * Classifies hardness into standard water-quality categories.
 *
 * @param hardnessMgPerL - Hardness value in mg/L CaCO3 equivalent.
 * @returns Hardness classification label.
 * @throws {RangeError} Thrown when hardness is negative or not finite.
 */
export function classifyHardness(hardnessMgPerL: MilligramsPerLiter): string {
  const value = Number(hardnessMgPerL);
  assertFiniteNonNegativeNumber(value, 'hardnessMgPerL');

  if (value < Number(STANDARD_HARDNESS_VALUES.SOFT.max)) {
    return 'SOFT';
  }

  if (value < Number(STANDARD_HARDNESS_VALUES.MODERATELY_HARD.max)) {
    return 'MODERATELY_HARD';
  }

  if (value < Number(STANDARD_HARDNESS_VALUES.HARD.max)) {
    return 'HARD';
  }

  return 'VERY_HARD';
}

/**
 * Calculates percent titration error between measured and true volumes.
 *
 * Formula: (|measured - true| / true) x 100
 *
 * @param measuredVolume - Measured volume in milliliters.
 * @param trueVolume - True reference volume in milliliters.
 * @returns Absolute percentage error.
 * @throws {RangeError} Thrown when true volume is non-positive or inputs are not finite.
 */
export function calculateTitrationError(
  measuredVolume: Milliliters,
  trueVolume: Milliliters,
): Percentage {
  assertFiniteNonNegativeNumber(Number(measuredVolume), 'measuredVolume');
  assertFinitePositiveNumber(Number(trueVolume), 'trueVolume');

  const absoluteDifference = Math.abs(Number(measuredVolume) - Number(trueVolume));
  const errorPercentage = (absoluteDifference / Number(trueVolume)) * 100;
  return errorPercentage as Percentage;
}

/**
 * Calculates average trial volume after excluding Grubbs-test outliers.
 *
 * @param volumes - Array of trial volumes in milliliters.
 * @returns Mean of cleaned trial volumes.
 * @throws {RangeError} Thrown when volumes is empty, contains invalid numbers, or unsupported sample sizes for Grubbs.
 */
export function calculateAverageVolume(volumes: Milliliters[]): Milliliters {
  if (volumes.length === 0) {
    throw new RangeError('volumes must contain at least one value.');
  }

  const numericValues = volumes.map((value) => Number(value));
  numericValues.forEach((value, index) => {
    assertFiniteNonNegativeNumber(value, `volumes[${index}]`);
  });

  const cleaned = applyGrubbsTest(numericValues, DEFAULT_GRUBBS_SIGNIFICANCE_LEVEL);
  if (cleaned.length === 0) {
    throw new RangeError('No values remain after outlier filtering.');
  }

  const sum = cleaned.reduce((accumulator, value) => accumulator + value, 0);
  return (sum / cleaned.length) as Milliliters;
}

/**
 * Applies iterative two-sided Grubbs outlier filtering.
 *
 * Critical value table used (n = 3..10):
 * alpha 0.05: {3:1.155,4:1.481,5:1.715,6:1.887,7:2.020,8:2.126,9:2.215,10:2.290}
 * alpha 0.01: {3:1.155,4:1.496,5:1.764,6:1.973,7:2.139,8:2.274,9:2.387,10:2.482}
 *
 * @param values - Numeric values to evaluate.
 * @param significanceLevel - Significance level used for critical-value lookup.
 * @returns New array with detected outliers removed.
 * @throws {RangeError} Thrown when values contain invalid numbers or sample size is unsupported for Grubbs (n > 10).
 */
export function applyGrubbsTest(values: number[], significanceLevel: 0.05 | 0.01): number[] {
  if (values.length === 0) {
    return [];
  }

  values.forEach((value, index) => {
    assertFiniteNumber(value, `values[${index}]`);
  });

  if (values.length > 10) {
    throw new RangeError('Grubbs critical-value table supports sample sizes n = 3..10 only.');
  }

  const filtered = [...values];

  while (filtered.length >= 3) {
    const n = filtered.length;
    const mean = calculateMean(filtered);
    const stdDev = calculateSampleStandardDeviation(filtered, mean);

    if (stdDev === 0) {
      break;
    }

    const candidate = findMaxDeviationCandidate(filtered, mean);
    const grubbsStatistic = candidate.deviation / stdDev;
    const criticalValue = getGrubbsCriticalValue(n, significanceLevel);

    if (grubbsStatistic <= criticalValue) {
      break;
    }

    filtered.splice(candidate.index, 1);
  }

  return filtered;
}

/**
 * Returns the arithmetic mean of numeric values.
 *
 * @param values - Input values.
 * @returns Arithmetic mean.
 * @throws {never} This function does not throw.
 */
function calculateMean(values: number[]): number {
  const sum = values.reduce((accumulator, value) => accumulator + value, 0);
  return sum / values.length;
}

/**
 * Returns sample standard deviation using denominator (n - 1).
 *
 * @param values - Input values.
 * @param mean - Precomputed arithmetic mean.
 * @returns Sample standard deviation.
 * @throws {never} This function does not throw.
 */
function calculateSampleStandardDeviation(values: number[], mean: number): number {
  if (values.length < 2) {
    return 0;
  }

  const varianceNumerator = values.reduce((accumulator, value) => {
    const difference = value - mean;
    return accumulator + difference * difference;
  }, 0);

  return Math.sqrt(varianceNumerator / (values.length - 1));
}

/**
 * Finds the value with maximum absolute deviation from mean.
 *
 * @param values - Input values.
 * @param mean - Reference mean.
 * @returns Index and deviation of max-deviation candidate.
 * @throws {never} This function does not throw.
 */
function findMaxDeviationCandidate(
  values: number[],
  mean: number,
): Readonly<{ index: number; deviation: number }> {
  let maxIndex = 0;
  let maxDeviation = Math.abs(values[0] - mean);

  for (let index = 1; index < values.length; index += 1) {
    const deviation = Math.abs(values[index] - mean);
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
      maxIndex = index;
    }
  }

  return { index: maxIndex, deviation: maxDeviation };
}

/**
 * Gets Grubbs critical value for a sample size and significance level.
 *
 * @param sampleSize - Current sample size.
 * @param significanceLevel - Selected significance level.
 * @returns Grubbs critical value.
 * @throws {RangeError} Thrown when sample size is outside supported lookup-table range.
 */
function getGrubbsCriticalValue(sampleSize: number, significanceLevel: 0.05 | 0.01): number {
  const value = GRUBBS_CRITICAL_VALUES[significanceLevel][sampleSize];
  if (value === undefined) {
    throw new RangeError('Grubbs critical-value table supports sample sizes n = 3..10 only.');
  }

  return value;
}

/**
 * Asserts that a value is finite.
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
 * Asserts that a value is finite and non-negative.
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
 * Asserts that a value is finite and strictly positive.
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
