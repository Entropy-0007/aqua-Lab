/**
 * Defines laboratory glassware specifications, runtime instances, and state variants.
 */

import type { Solution } from './chemical.types';
import type { UUID, Vector3D } from './physics.types';
import type { Milliliters, Percentage } from './units.types';

/** Enumerates all supported laboratory vessels and transfer tools. */
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

/** Represents physical construction material categories for glassware items. */
export enum GlasswareMaterial {
  BOROSILICATE_GLASS = 'BOROSILICATE_GLASS',
  PLASTIC = 'PLASTIC',
}

/** Defines immutable design specifications for a glassware model. */
export interface GlasswareSpec {
  readonly id: GlasswareId;
  readonly displayName: string;
  readonly maxCapacity: Milliliters;
  readonly graduationInterval: Milliliters;
  readonly innerRadiusMm: number;
  readonly heightMm: number;
  readonly neckRadiusMm: number | null;
  readonly material: GlasswareMaterial;
}

/** Represents mutually exclusive operational states for a glassware instance. */
export type GlasswareState =
  | {
      readonly status: 'empty';
    }
  | {
      readonly status: 'filling';
      readonly solution: Solution;
      readonly currentVolume: Milliliters;
    }
  | {
      readonly status: 'full';
      readonly solution: Solution;
    }
  | {
      readonly status: 'dispensing';
      readonly solution: Solution;
      readonly currentVolume: Milliliters;
      readonly flowRateMlPerSecond: number;
    };

/** Represents a concrete glassware object placed in the simulation world. */
export interface GlasswareInstance {
  readonly id: UUID;
  readonly spec: GlasswareSpec;
  readonly state: GlasswareState;
  readonly position: Vector3D;
  readonly rotation: Vector3D;
  readonly isDirty: boolean;
  readonly hasAirBubble: boolean;
  readonly isSelected: boolean;
  readonly labelText: string;
}

/** Represents the valve position and resulting outflow characteristics of a burette. */
export interface StopcockState {
  readonly isOpen: boolean;
  readonly openingAngle: number;
  readonly flowRate: number;
}

/** Represents a burette specialization with measurement and drainage metadata. */
export interface BuretteInstance extends GlasswareInstance {
  readonly stopcock: StopcockState;
  readonly drainedVolume: Milliliters;
  readonly initialVolume: Milliliters;
  readonly lastReadingError: Percentage;
}
