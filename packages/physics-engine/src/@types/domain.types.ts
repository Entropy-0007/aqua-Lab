/**
 * Declares standalone domain interfaces consumed by the pure liquid physics engine.
 */

import type { Milliliters, Moles, Seconds } from './units.types';

/** Enumerates chemical identifiers used for liquid particles and solutions. */
export enum ChemicalId {
  EDTA_DISODIUM = 'EDTA_DISODIUM',
  ERIOCHROME_BLACK_T = 'ERIOCHROME_BLACK_T',
  CALCIUM_CHLORIDE = 'CALCIUM_CHLORIDE',
  MAGNESIUM_SULFATE = 'MAGNESIUM_SULFATE',
  AMMONIA_BUFFER = 'AMMONIA_BUFFER',
  SAMPLE_WATER = 'SAMPLE_WATER',
  DISTILLED_WATER = 'DISTILLED_WATER',
}

/** Represents Cartesian 3D coordinates and velocities in millimeter-space. */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/** Represents a liquid particle used for droplet and splash simulation. */
export interface LiquidParticle {
  id: string;
  position: Vector3D;
  velocity: Vector3D;
  radius: number;
  chemical: ChemicalId;
  opacity: number;
  isDroplet: boolean;
}

/** Represents a solution with dissolved chemical moles and visual state metadata. */
export interface Solution {
  chemicals: Map<ChemicalId, Moles>;
  solventVolume: Milliliters;
  currentColorHex: string;
  ph: number;
  isMixed: boolean;
  isContaminated: boolean;
}

/** Enumerates supported glassware identities for geometry and reading functions. */
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

/** Enumerates supported glassware material classes. */
export enum GlasswareMaterial {
  BOROSILICATE_GLASS = 'BOROSILICATE_GLASS',
  PLASTIC = 'PLASTIC',
}

/** Represents geometric and calibration properties of laboratory glassware. */
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

/** Represents an air bubble in liquid with vertical motion state. */
export interface AirBubble {
  id: string;
  position: Vector3D;
  radiusMm: number;
  riseVelocity: number;
  hasPopped: boolean;
}

/** Represents anomaly categories for optional simulation coupling. */
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

/** Represents anomaly records with optional volume error metadata. */
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

