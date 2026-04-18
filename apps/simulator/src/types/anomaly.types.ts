/**
 * Defines anomaly and experimental error domain types for titration simulation.
 */

import type { UUID } from './physics.types';
import type { Milliliters, Seconds } from './units.types';

/** Enumerates all anomaly categories that can affect experiment fidelity. */
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

/** Represents an observed or simulated anomaly event within a trial session. */
export interface Anomaly {
  readonly id: UUID;
  readonly type: AnomalyType;
  readonly severity: 'minor' | 'moderate' | 'critical';
  readonly triggeredAt: Seconds;
  readonly affectedGlasswareId: string | null;
  readonly volumeErrorIntroduced: Milliliters | null;
  readonly isDetectable: boolean;
  readonly description: string;
}

/** Represents volumetric reading deviation caused by observer parallax angle. */
export interface ParallaxError {
  readonly readingAngleDegrees: number;
  readonly apparentVolume: Milliliters;
  readonly trueVolume: Milliliters;
  readonly error: Milliliters;
}

