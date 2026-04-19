/**
 * Declares standalone chemistry-domain interfaces consumed by the pure calculation engine.
 */

import type { Milliliters, Moles, MolesPerLiter, Seconds } from './units.types';

/** Enumerates chemical identifiers used by this library. */
export enum ChemicalId {
  EDTA_DISODIUM = 'EDTA_DISODIUM',
  ERIOCHROME_BLACK_T = 'ERIOCHROME_BLACK_T',
  CALCIUM_CHLORIDE = 'CALCIUM_CHLORIDE',
  MAGNESIUM_SULFATE = 'MAGNESIUM_SULFATE',
  AMMONIA_BUFFER = 'AMMONIA_BUFFER',
  SAMPLE_WATER = 'SAMPLE_WATER',
  DISTILLED_WATER = 'DISTILLED_WATER',
}

/** Describes indicator color response around endpoint conditions. */
export interface IndicatorBehavior {
  colorBelowEndpoint: string;
  colorAtEndpoint: string;
  transitionpH: Readonly<{
    min: number;
    max: number;
  }>;
  transitionMetalConcentrationThreshold: MolesPerLiter;
}

/** Represents a chemical species available to the simulation. */
export interface Chemical {
  id: ChemicalId;
  name: string;
  formula: string;
  molarMass: number;
  colorHex: string;
  concentration: MolesPerLiter | null;
  isIndicator: boolean;
  indicatorBehavior: IndicatorBehavior | null;
}

/** Represents solution composition and observable state. */
export interface Solution {
  chemicals: Map<ChemicalId, Moles>;
  solventVolume: Milliliters;
  currentColorHex: string;
  ph: number;
  isMixed: boolean;
  isContaminated: boolean;
}

/** Represents a reaction definition with participants and conditions. */
export interface ChemicalReaction {
  id: string;
  reactants: Map<ChemicalId, Moles>;
  products: Map<ChemicalId, Moles>;
  conditions: Readonly<Record<string, string | number | boolean>>;
  isReversible: boolean;
}

/** Represents endpoint progression state during titration. */
export type EndpointStatus = 'not-reached' | 'approaching' | 'reached' | 'overshot';

/** Enumerates anomaly categories that can affect measurement quality. */
export enum AnomalyType {
  AIR_BUBBLE_IN_BURETTE = 'AIR_BUBBLE_IN_BURETTE',
  PARALLAX_ERROR = 'PARALLAX_ERROR',
  CONTAMINATED_GLASSWARE = 'CONTAMINATED_GLASSWARE',
  OVERFILLED_PIPETTE = 'OVERFILLED_PIPETTE',
  INDICATOR_OVERDOSE = 'INDICATOR_OVERDOSE',
  TEMPERATURE_VARIATION = 'TEMPERATURE_VARIATION',
  INCOMPLETE_MIXING = 'INCOMPLETE_MIXING',
  ENDPOINT_OVERSHOT = 'ENDPOINT_OVERSHOT',
}

/** Represents an anomaly instance with possible introduced volumetric error. */
export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: 'minor' | 'moderate' | 'critical';
  triggeredAt: Seconds;
  affectedGlasswareId: string | null;
  volumeErrorIntroduced: Milliliters | null;
  isDetectable: boolean;
  description: string;
}

/** Represents volumetric reading deviation caused by parallax. */
export interface ParallaxError {
  readingAngleDegrees: number;
  apparentVolume: Milliliters;
  trueVolume: Milliliters;
  error: Milliliters;
}

/** Enumerates glassware identifiers for measurement uncertainty handling. */
export enum GlasswareId {
  BURETTE = 'BURETTE',
  CONICAL_FLASK = 'CONICAL_FLASK',
  PIPETTE = 'PIPETTE',
  VOLUMETRIC_FLASK = 'VOLUMETRIC_FLASK',
  BEAKER_250ML = 'BEAKER_250ML',
  BEAKER_100ML = 'BEAKER_100ML',
  MEASURING_CYLINDER = 'MEASURING_CYLINDER',
  WASH_BOTTLE = 'WASH_BOTTLE',
}

/** Enumerates material classes used for laboratory vessels. */
export enum GlasswareMaterial {
  BOROSILICATE_GLASS = 'BOROSILICATE_GLASS',
  PLASTIC = 'PLASTIC',
}

/** Represents geometric and calibration specs for a glassware instrument. */
export interface GlasswareSpec {
  id: GlasswareId;
  displayName: string;
  maxCapacity: Milliliters;
  graduationInterval: Milliliters;
  innerRadiusMm: number;
  heightMm: number;
  neckRadiusMm: number | null;
  material: GlasswareMaterial;
}

