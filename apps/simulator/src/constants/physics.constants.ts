/**
 * Defines physical constants and calibration values for fluid behavior in the simulator.
 */

import type { Milliliters } from '../types/units.types';

/** Standard gravitational acceleration near Earth's surface used in introductory physics labs. */
const STANDARD_GRAVITATIONAL_ACCELERATION_MS2 = 9.81;
/** Density of pure water at approximately 20 C in laboratory reference tables. */
const REFERENCE_WATER_DENSITY_KG_PER_L = 1.0;
/** Dynamic viscosity of water at 20 C from standard fluid-property datasets. */
const REFERENCE_WATER_VISCOSITY_MPAS = 1.002;
/** Surface tension of water at 20 C in N/m from physical chemistry references. */
const REFERENCE_SURFACE_TENSION_N_PER_M = 0.0728;

/** Approximate transfer volume where drops become visually discrete instead of continuous stream flow. */
const DISCRETE_DROP_THRESHOLD_ML = 0.03 as Milliliters;

/** Stopcock opening angle for near-closed controlled dripping. */
const STOPCOCK_ANGLE_5_DEGREES = 5;
/** Stopcock opening angle for slow dispense mode. */
const STOPCOCK_ANGLE_15_DEGREES = 15;
/** Stopcock opening angle for moderate dispense mode. */
const STOPCOCK_ANGLE_30_DEGREES = 30;
/** Stopcock opening angle for medium-fast dispense mode. */
const STOPCOCK_ANGLE_45_DEGREES = 45;
/** Stopcock opening angle for fast dispense mode. */
const STOPCOCK_ANGLE_60_DEGREES = 60;
/** Stopcock opening angle for fully open flow. */
const STOPCOCK_ANGLE_90_DEGREES = 90;

/** Approximate burette discharge rate at 5 deg opening under gravity head in mL/s. */
const FLOW_RATE_AT_5_DEGREES_ML_PER_S = 0.12;
/** Approximate burette discharge rate at 15 deg opening under gravity head in mL/s. */
const FLOW_RATE_AT_15_DEGREES_ML_PER_S = 0.35;
/** Approximate burette discharge rate at 30 deg opening under gravity head in mL/s. */
const FLOW_RATE_AT_30_DEGREES_ML_PER_S = 0.85;
/** Approximate burette discharge rate at 45 deg opening under gravity head in mL/s. */
const FLOW_RATE_AT_45_DEGREES_ML_PER_S = 1.45;
/** Approximate burette discharge rate at 60 deg opening under gravity head in mL/s. */
const FLOW_RATE_AT_60_DEGREES_ML_PER_S = 2.1;
/** Approximate burette discharge rate at 90 deg opening under gravity head in mL/s. */
const FLOW_RATE_AT_90_DEGREES_ML_PER_S = 3.2;

/** Concave meniscus depth ratio relative to inner diameter for water in clean glass. */
const WATER_IN_GLASS_MENISCUS_DEPTH_RATIO = 0.5;

/** Typical upward velocity for a ~1 mm radius air bubble in water-like fluid. */
const REFERENCE_AIR_BUBBLE_RISE_VELOCITY_MM_PER_S = 3.5;

/** Empirical shake count for homogeneous indicator distribution in conical flask titration practice. */
const MINIMUM_SWIRL_ACTIONS_FOR_HOMOGENEITY = 6;

/** Reference temperature for viscosity coefficient approximation. */
const VISCOSITY_REFERENCE_TEMPERATURE_C = 20;
/** Approximate relative viscosity change per +1 C near room temperature for water. */
const VISCOSITY_RELATIVE_CHANGE_PER_CELSIUS = -0.022;
/** Lower safety clamp for ratio-based viscosity scaling under warm conditions. */
const VISCOSITY_RATIO_MIN = 0.55;
/** Upper safety clamp for ratio-based viscosity scaling under cool conditions. */
const VISCOSITY_RATIO_MAX = 1.45;

/** Maps supported stopcock opening angles to approximate flow rates in mL/s. */
type StopcockFlowRateTable = Readonly<
  Record<
    | typeof STOPCOCK_ANGLE_5_DEGREES
    | typeof STOPCOCK_ANGLE_15_DEGREES
    | typeof STOPCOCK_ANGLE_30_DEGREES
    | typeof STOPCOCK_ANGLE_45_DEGREES
    | typeof STOPCOCK_ANGLE_60_DEGREES
    | typeof STOPCOCK_ANGLE_90_DEGREES,
    number
  >
>;

/** Encapsulates viscosity response coefficients relative to temperature change from 20 C. */
interface TemperatureEffectOnViscosityConfig {
  readonly referenceTemperatureCelsius: number;
  readonly relativeChangePerDegreeCelsius: number;
  readonly minimumRelativeViscosityRatio: number;
  readonly maximumRelativeViscosityRatio: number;
}

/** Gravitational acceleration constant used for all fluid and particle motion models. */
export const GRAVITY_MS2 = STANDARD_GRAVITATIONAL_ACCELERATION_MS2;

/** Reference water density used by mass-volume conversion logic in simulation subsystems. */
export const WATER_DENSITY_KG_PER_L = REFERENCE_WATER_DENSITY_KG_PER_L;

/** Reference water viscosity used for dampening and flow heuristics at room temperature. */
export const WATER_VISCOSITY_MPAS = REFERENCE_WATER_VISCOSITY_MPAS;

/** Surface tension constant used for droplet cohesion and meniscus behavior tuning. */
export const SURFACE_TENSION_N_PER_M = REFERENCE_SURFACE_TENSION_N_PER_M;

/** Minimum transfer volume for discrete droplet behavior instead of continuous stream behavior. */
export const DROP_FORMATION_THRESHOLD_ML: Milliliters = DISCRETE_DROP_THRESHOLD_ML;

/** Stopcock-angle lookup table for practical burette flow-rate approximation in mL/s. */
export const FLOW_RATES: StopcockFlowRateTable = Object.freeze({
  [STOPCOCK_ANGLE_5_DEGREES]: FLOW_RATE_AT_5_DEGREES_ML_PER_S,
  [STOPCOCK_ANGLE_15_DEGREES]: FLOW_RATE_AT_15_DEGREES_ML_PER_S,
  [STOPCOCK_ANGLE_30_DEGREES]: FLOW_RATE_AT_30_DEGREES_ML_PER_S,
  [STOPCOCK_ANGLE_45_DEGREES]: FLOW_RATE_AT_45_DEGREES_ML_PER_S,
  [STOPCOCK_ANGLE_60_DEGREES]: FLOW_RATE_AT_60_DEGREES_ML_PER_S,
  [STOPCOCK_ANGLE_90_DEGREES]: FLOW_RATE_AT_90_DEGREES_ML_PER_S,
});

/** Ratio for concave meniscus depth to tube inner diameter for water in glass apparatus. */
export const MENISCUS_DEPTH_RATIO = WATER_IN_GLASS_MENISCUS_DEPTH_RATIO;

/** Baseline vertical rise velocity used for simulated small air bubbles in aqueous media. */
export const AIR_BUBBLE_RISE_VELOCITY_MM_PER_S = REFERENCE_AIR_BUBBLE_RISE_VELOCITY_MM_PER_S;

/** Minimum swirl actions required before a solution is considered visually homogeneous. */
export const MIXING_REQUIRED_SHAKES = MINIMUM_SWIRL_ACTIONS_FOR_HOMOGENEITY;

/** Coefficients describing temperature-driven viscosity change around room-temperature conditions. */
export const TEMPERATURE_EFFECT_ON_VISCOSITY: Readonly<TemperatureEffectOnViscosityConfig> =
  Object.freeze({
    referenceTemperatureCelsius: VISCOSITY_REFERENCE_TEMPERATURE_C,
    relativeChangePerDegreeCelsius: VISCOSITY_RELATIVE_CHANGE_PER_CELSIUS,
    minimumRelativeViscosityRatio: VISCOSITY_RATIO_MIN,
    maximumRelativeViscosityRatio: VISCOSITY_RATIO_MAX,
  });
