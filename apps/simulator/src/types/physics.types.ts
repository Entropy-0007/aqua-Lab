/**
 * Defines liquid and particle-level physics domain types used by the simulator.
 */

import type { ChemicalId } from './chemical.types';

/** Represents a UUID string identifier. */
export type UUID = string;

/** Represents a 3D vector for position, velocity, or rotation values. */
export interface Vector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Represents a simulated liquid particle with chemical attribution and visual properties. */
export interface LiquidParticle {
  readonly id: UUID;
  readonly position: Vector3D;
  readonly velocity: Vector3D;
  readonly radius: number;
  readonly chemical: ChemicalId;
  readonly opacity: number;
  readonly isDroplet: boolean;
}

/** Represents an active or inactive stream of liquid between glassware entities. */
export interface LiquidStream {
  readonly sourceGlasswareId: UUID;
  readonly targetGlasswareId: UUID | null;
  readonly particles: readonly LiquidParticle[];
  readonly isActive: boolean;
  readonly flowRateMlPerSecond: number;
}

/** Represents the fluid surface state inside a glassware vessel. */
export interface FluidSurface {
  readonly glasswareId: UUID;
  readonly surfaceHeightMm: number;
  readonly meniscusDepthMm: number;
  readonly foamParticles: readonly LiquidParticle[];
}

/** Represents an air bubble moving within a liquid body. */
export interface AirBubble {
  readonly id: UUID;
  readonly position: Vector3D;
  readonly radiusMm: number;
  readonly riseVelocity: number;
  readonly hasPopped: boolean;
}

