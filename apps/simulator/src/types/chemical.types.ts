/**
 * Defines chemical entities, indicators, and reaction-related domain types for the simulator.
 */

import type { Milligrams, Milliliters, Moles, MolesPerLiter } from './units.types';

declare const milligramsPerMoleBrand: unique symbol;

/** Represents molar mass in milligrams per mole. */
export type MilligramsPerMole = Milligrams & {
  readonly [milligramsPerMoleBrand]: 'MilligramsPerMole';
};

/** Enumerates all supported chemical identities used in the simulation domain. */
export enum ChemicalId {
  EDTA_DISODIUM = 'EDTA_DISODIUM',
  ERIOCHROME_BLACK_T = 'ERIOCHROME_BLACK_T',
  CALCIUM_CHLORIDE = 'CALCIUM_CHLORIDE',
  MAGNESIUM_SULFATE = 'MAGNESIUM_SULFATE',
  AMMONIA_BUFFER = 'AMMONIA_BUFFER',
  SAMPLE_WATER = 'SAMPLE_WATER',
  DISTILLED_WATER = 'DISTILLED_WATER',
}

/** Describes indicator color response properties around endpoint conditions. */
export interface IndicatorBehavior {
  readonly colorBelowEndpoint: string;
  readonly colorAtEndpoint: string;
  readonly transitionpH: Readonly<{
    readonly min: number;
    readonly max: number;
  }>;
  readonly transitionMetalConcentrationThreshold: MolesPerLiter;
}

/** Represents a chemical species and its solution-relevant properties. */
export interface Chemical {
  readonly id: ChemicalId;
  readonly name: string;
  readonly formula: string;
  readonly molarMass: MilligramsPerMole;
  readonly colorHex: string;
  readonly concentration: MolesPerLiter | null;
  readonly isIndicator: boolean;
  readonly indicatorBehavior: IndicatorBehavior | null;
}

/** Represents a liquid solution composition and observable condition. */
export interface Solution {
  readonly chemicals: Map<ChemicalId, Moles>;
  readonly solventVolume: Milliliters;
  readonly currentColorHex: string;
  readonly ph: number;
  readonly isMixed: boolean;
  readonly isContaminated: boolean;
}

/** Represents a reaction definition with stoichiometric participants and constraints. */
export interface ChemicalReaction {
  readonly id: string;
  readonly reactants: Map<ChemicalId, Moles>;
  readonly products: Map<ChemicalId, Moles>;
  readonly conditions: Readonly<Record<string, string | number | boolean>>;
  readonly isReversible: boolean;
}

/** Represents the endpoint progression state during a titration process. */
export type EndpointStatus = 'not-reached' | 'approaching' | 'reached' | 'overshot';
