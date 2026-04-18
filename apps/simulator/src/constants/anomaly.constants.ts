/**
 * Defines anomaly occurrence configuration and parallax error reference data for experiments.
 */

import type { AnomalyType } from '../types/anomaly.types';
import { AnomalyType as AnomalyTypeEnum } from '../types/anomaly.types';
import type { Milliliters } from '../types/units.types';

/** Represents student-facing difficulty in identifying an anomaly during workflow execution. */
type StudentDetectionDifficulty = 'easy' | 'medium' | 'hard';

/** Represents static anomaly generation settings applied per trial. */
interface AnomalyConfig {
  readonly baseOccurrenceProbability: number;
  readonly triggerCondition: string;
  readonly volumeErrorRangeMl: readonly [Milliliters, Milliliters];
  readonly isAutomaticallyTriggered: boolean;
  readonly studentDetectionDifficulty: StudentDetectionDifficulty;
}

/** Base probability when burette pre-inspection is skipped before titration starts. */
const AIR_BUBBLE_BASE_PROBABILITY = 0.25;
/** Lower bound of typical air-bubble induced burette error. */
const AIR_BUBBLE_ERROR_MIN_ML = 0.05 as Milliliters;
/** Upper bound of typical air-bubble induced burette error. */
const AIR_BUBBLE_ERROR_MAX_ML = 0.5 as Milliliters;
/** Fixed error range tuple for air-bubble anomaly modeling. */
const AIR_BUBBLE_ERROR_RANGE_ML = Object.freeze([AIR_BUBBLE_ERROR_MIN_ML, AIR_BUBBLE_ERROR_MAX_ML] as const);

/** Base probability for noticeable parallax when meniscus is read off eye-level. */
const PARALLAX_BASE_PROBABILITY = 0.35;
/** Lower bound of practical parallax-induced reading error in controlled labs. */
const PARALLAX_ERROR_MIN_ML = 0.02 as Milliliters;
/** Upper bound of practical parallax-induced reading error in controlled labs. */
const PARALLAX_ERROR_MAX_ML = 0.5 as Milliliters;
/** Fixed error range tuple for parallax anomaly modeling. */
const PARALLAX_ERROR_RANGE_ML = Object.freeze([PARALLAX_ERROR_MIN_ML, PARALLAX_ERROR_MAX_ML] as const);

/** Base probability of contamination when rinsing protocol is omitted or incomplete. */
const CONTAMINATION_BASE_PROBABILITY = 0.2;
/** Lower contamination-induced volume bias from residual droplets. */
const CONTAMINATION_ERROR_MIN_ML = 0.03 as Milliliters;
/** Upper contamination-induced volume bias from residual droplets. */
const CONTAMINATION_ERROR_MAX_ML = 0.4 as Milliliters;
/** Fixed error range tuple for contamination anomaly modeling. */
const CONTAMINATION_ERROR_RANGE_ML = Object.freeze([
  CONTAMINATION_ERROR_MIN_ML,
  CONTAMINATION_ERROR_MAX_ML,
] as const);

/** Base probability for overfilled pipette transfer when meniscus alignment is rushed. */
const OVERFILLED_PIPETTE_BASE_PROBABILITY = 0.12;
/** Lower bound pipette overfill transfer bias. */
const OVERFILLED_PIPETTE_ERROR_MIN_ML = 0.02 as Milliliters;
/** Upper bound pipette overfill transfer bias. */
const OVERFILLED_PIPETTE_ERROR_MAX_ML = 0.25 as Milliliters;
/** Fixed error range tuple for overfilled-pipette anomaly modeling. */
const OVERFILLED_PIPETTE_ERROR_RANGE_ML = Object.freeze([
  OVERFILLED_PIPETTE_ERROR_MIN_ML,
  OVERFILLED_PIPETTE_ERROR_MAX_ML,
] as const);

/** Base probability for indicator overdose during manual drop-counting. */
const INDICATOR_OVERDOSE_BASE_PROBABILITY = 0.1;
/** Indicator overdose primarily changes color response rather than delivered volume. */
const INDICATOR_OVERDOSE_ERROR_MIN_ML = 0 as Milliliters;
/** Indicator overdose primarily changes color response rather than delivered volume. */
const INDICATOR_OVERDOSE_ERROR_MAX_ML = 0.02 as Milliliters;
/** Fixed error range tuple for indicator-overdose anomaly modeling. */
const INDICATOR_OVERDOSE_ERROR_RANGE_ML = Object.freeze([
  INDICATOR_OVERDOSE_ERROR_MIN_ML,
  INDICATOR_OVERDOSE_ERROR_MAX_ML,
] as const);

/** Base probability for temperature drift from ideal calibration conditions. */
const TEMPERATURE_VARIATION_BASE_PROBABILITY = 0.15;
/** Lower bound for temperature-driven apparent volume deviation. */
const TEMPERATURE_VARIATION_ERROR_MIN_ML = 0.01 as Milliliters;
/** Upper bound for temperature-driven apparent volume deviation. */
const TEMPERATURE_VARIATION_ERROR_MAX_ML = 0.18 as Milliliters;
/** Fixed error range tuple for temperature-variation anomaly modeling. */
const TEMPERATURE_VARIATION_ERROR_RANGE_ML = Object.freeze([
  TEMPERATURE_VARIATION_ERROR_MIN_ML,
  TEMPERATURE_VARIATION_ERROR_MAX_ML,
] as const);

/** Base probability for incomplete mixing before endpoint assessment. */
const INCOMPLETE_MIXING_BASE_PROBABILITY = 0.18;
/** Lower bound for incomplete-mixing endpoint interpretation bias. */
const INCOMPLETE_MIXING_ERROR_MIN_ML = 0.02 as Milliliters;
/** Upper bound for incomplete-mixing endpoint interpretation bias. */
const INCOMPLETE_MIXING_ERROR_MAX_ML = 0.3 as Milliliters;
/** Fixed error range tuple for incomplete-mixing anomaly modeling. */
const INCOMPLETE_MIXING_ERROR_RANGE_ML = Object.freeze([
  INCOMPLETE_MIXING_ERROR_MIN_ML,
  INCOMPLETE_MIXING_ERROR_MAX_ML,
] as const);

/** Base probability for overshooting endpoint due to delayed stopcock closure. */
const ENDPOINT_OVERSHOT_BASE_PROBABILITY = 0.22;
/** Lower bound for overshoot excess volume. */
const ENDPOINT_OVERSHOT_ERROR_MIN_ML = 0.05 as Milliliters;
/** Upper bound for overshoot excess volume. */
const ENDPOINT_OVERSHOT_ERROR_MAX_ML = 0.7 as Milliliters;
/** Fixed error range tuple for endpoint-overshot anomaly modeling. */
const ENDPOINT_OVERSHOT_ERROR_RANGE_ML = Object.freeze([
  ENDPOINT_OVERSHOT_ERROR_MIN_ML,
  ENDPOINT_OVERSHOT_ERROR_MAX_ML,
] as const);

/** Flat-angle parallax reference error for camera or eye position misalignment. */
const PARALLAX_FLAT_ANGLE_ERROR_ML = 0.2 as Milliliters;
/** Steep-angle parallax reference error for strong off-axis observation. */
const PARALLAX_STEEP_ANGLE_ERROR_ML = 0.5 as Milliliters;

/** Lookup key for slight viewing-angle deviation from horizontal meniscus plane. */
const PARALLAX_LOOKUP_10_DEGREES = '10_DEGREES';
/** Lookup key for moderate viewing-angle deviation from horizontal meniscus plane. */
const PARALLAX_LOOKUP_20_DEGREES = '20_DEGREES';
/** Lookup key for strong viewing-angle deviation from horizontal meniscus plane. */
const PARALLAX_LOOKUP_30_DEGREES = '30_DEGREES';
/** Lookup key for severe viewing-angle deviation from horizontal meniscus plane. */
const PARALLAX_LOOKUP_45_DEGREES = '45_DEGREES';

/** Parallax lookup error at 10 degrees view offset. */
const PARALLAX_ERROR_10_DEGREES_ML = 0.08 as Milliliters;
/** Parallax lookup error at 20 degrees view offset. */
const PARALLAX_ERROR_20_DEGREES_ML = 0.16 as Milliliters;
/** Parallax lookup error at 30 degrees view offset. */
const PARALLAX_ERROR_30_DEGREES_ML = 0.3 as Milliliters;
/** Parallax lookup error at 45 degrees view offset. */
const PARALLAX_ERROR_45_DEGREES_ML = PARALLAX_STEEP_ANGLE_ERROR_ML;

/** Aggregated anomaly generation settings for all supported anomaly categories. */
export const ANOMALY_CONFIGS: Readonly<Record<AnomalyType, AnomalyConfig>> = Object.freeze({
  [AnomalyTypeEnum.AIR_BUBBLE_IN_BURETTE]: Object.freeze({
    baseOccurrenceProbability: AIR_BUBBLE_BASE_PROBABILITY,
    triggerCondition: 'Burette tip is not inspected and pre-drained before titration.',
    volumeErrorRangeMl: AIR_BUBBLE_ERROR_RANGE_ML,
    isAutomaticallyTriggered: false,
    studentDetectionDifficulty: 'medium',
  }),
  [AnomalyTypeEnum.PARALLAX_ERROR]: Object.freeze({
    baseOccurrenceProbability: PARALLAX_BASE_PROBABILITY,
    triggerCondition: 'Meniscus is read with eye line above or below calibration marks.',
    volumeErrorRangeMl: PARALLAX_ERROR_RANGE_ML,
    isAutomaticallyTriggered: false,
    studentDetectionDifficulty: 'hard',
  }),
  [AnomalyTypeEnum.CONTAMINATED_GLASSWARE]: Object.freeze({
    baseOccurrenceProbability: CONTAMINATION_BASE_PROBABILITY,
    triggerCondition: 'Glassware is reused without adequate rinsing between trials.',
    volumeErrorRangeMl: CONTAMINATION_ERROR_RANGE_ML,
    isAutomaticallyTriggered: true,
    studentDetectionDifficulty: 'medium',
  }),
  [AnomalyTypeEnum.OVERFILLED_PIPETTE]: Object.freeze({
    baseOccurrenceProbability: OVERFILLED_PIPETTE_BASE_PROBABILITY,
    triggerCondition: 'Pipette meniscus exceeds calibration mark during sample transfer.',
    volumeErrorRangeMl: OVERFILLED_PIPETTE_ERROR_RANGE_ML,
    isAutomaticallyTriggered: false,
    studentDetectionDifficulty: 'easy',
  }),
  [AnomalyTypeEnum.INDICATOR_OVERDOSE]: Object.freeze({
    baseOccurrenceProbability: INDICATOR_OVERDOSE_BASE_PROBABILITY,
    triggerCondition: 'Indicator drops exceed recommended amount for endpoint visibility.',
    volumeErrorRangeMl: INDICATOR_OVERDOSE_ERROR_RANGE_ML,
    isAutomaticallyTriggered: false,
    studentDetectionDifficulty: 'easy',
  }),
  [AnomalyTypeEnum.TEMPERATURE_VARIATION]: Object.freeze({
    baseOccurrenceProbability: TEMPERATURE_VARIATION_BASE_PROBABILITY,
    triggerCondition: 'Ambient temperature drifts away from room-temperature calibration.',
    volumeErrorRangeMl: TEMPERATURE_VARIATION_ERROR_RANGE_ML,
    isAutomaticallyTriggered: true,
    studentDetectionDifficulty: 'hard',
  }),
  [AnomalyTypeEnum.INCOMPLETE_MIXING]: Object.freeze({
    baseOccurrenceProbability: INCOMPLETE_MIXING_BASE_PROBABILITY,
    triggerCondition: 'Flask is not swirled sufficiently before endpoint judgment.',
    volumeErrorRangeMl: INCOMPLETE_MIXING_ERROR_RANGE_ML,
    isAutomaticallyTriggered: false,
    studentDetectionDifficulty: 'medium',
  }),
  [AnomalyTypeEnum.ENDPOINT_OVERSHOT]: Object.freeze({
    baseOccurrenceProbability: ENDPOINT_OVERSHOT_BASE_PROBABILITY,
    triggerCondition: 'Stopcock closure is delayed after first persistent endpoint color change.',
    volumeErrorRangeMl: ENDPOINT_OVERSHOT_ERROR_RANGE_ML,
    isAutomaticallyTriggered: false,
    studentDetectionDifficulty: 'easy',
  }),
}) satisfies Record<AnomalyType, AnomalyConfig>;

/** Camera-angle to volume-error references used by parallax training overlays and validation tooling. */
export const PARALLAX_CONFIG: Readonly<{
  readonly cameraAngleToErrorLookupTable: Readonly<Record<string, Milliliters>>;
  readonly errorAtFlatAngle: Milliliters;
  readonly errorAtSteepAngle: Milliliters;
}> = Object.freeze({
  cameraAngleToErrorLookupTable: Object.freeze({
    [PARALLAX_LOOKUP_10_DEGREES]: PARALLAX_ERROR_10_DEGREES_ML,
    [PARALLAX_LOOKUP_20_DEGREES]: PARALLAX_ERROR_20_DEGREES_ML,
    [PARALLAX_LOOKUP_30_DEGREES]: PARALLAX_ERROR_30_DEGREES_ML,
    [PARALLAX_LOOKUP_45_DEGREES]: PARALLAX_ERROR_45_DEGREES_ML,
  }),
  errorAtFlatAngle: PARALLAX_FLAT_ANGLE_ERROR_ML,
  errorAtSteepAngle: PARALLAX_STEEP_ANGLE_ERROR_ML,
});
