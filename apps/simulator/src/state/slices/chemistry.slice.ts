/**
 * Defines chemistry-tracking state and intent actions for endpoint and reaction metadata.
 */

import type { StateCreator } from 'zustand';

import type { ChemicalReaction, EndpointStatus } from '../../types/chemical.types';
import type { Milliliters, MolesPerLiter } from '../../types/units.types';
import type { RootStore } from '../store';

/** Represents chemistry-specific state fields tracked during simulation runtime. */
export interface ChemistrySliceState {
  endpointStatus: EndpointStatus;
  solutionColorByGlasswareId: Map<string, string>;
  activeReactions: ChemicalReaction[];
  titrantConsumedMl: Milliliters;
  metalIonConcentrationByGlasswareId: Map<string, MolesPerLiter>;
}

/** Represents all mutation intents for chemistry-tracking state. */
export interface ChemistrySliceActions {
  /** Updates the current endpoint progression classification. */
  updateEndpointStatus: (status: EndpointStatus) => void;
  /** Accumulates dispensed titrant volume into running chemistry totals. */
  recordTitrantDispensed: (volume: Milliliters) => void;
  /** Sets the current rendered solution color for a specific glassware instance. */
  updateSolutionColor: (glasswareId: string, colorHex: string) => void;
  /** Tracks latest metal-ion concentration estimate for a specific glassware instance. */
  setMetalIonConcentration: (glasswareId: string, concentration: MolesPerLiter) => void;
  /** Resets this slice to initial chemistry-tracking defaults. */
  resetChemistryState: () => void;
}

/** Represents the complete chemistry slice contract. */
export type ChemistrySlice = ChemistrySliceState & ChemistrySliceActions;

/** Zero-valued branded milliliter constant for safe initialization. */
const ZERO_MILLILITERS = 0 as Milliliters;

/** Creates initial state fields for chemistry slice defaults. */
const createInitialChemistrySliceState = (): ChemistrySliceState => ({
  endpointStatus: 'not-reached',
  solutionColorByGlasswareId: new Map<string, string>(),
  activeReactions: [],
  titrantConsumedMl: ZERO_MILLILITERS,
  metalIonConcentrationByGlasswareId: new Map<string, MolesPerLiter>(),
});

/** Creates the chemistry slice with typed state, reducers, and reset support. */
export const createChemistrySlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  ChemistrySlice
> = (set) => ({
  ...createInitialChemistrySliceState(),

  updateEndpointStatus: (status) => {
    set(
      (state) => {
        state.endpointStatus = status;
      },
      false,
      'chemistry/updateEndpointStatus',
    );
  },

  recordTitrantDispensed: (volume) => {
    set(
      (state) => {
        const numericVolume = Number(volume);
        if (!Number.isFinite(numericVolume) || numericVolume < 0) {
          throw new Error('Titrant volume must be finite and non-negative.');
        }

        state.titrantConsumedMl = (Number(state.titrantConsumedMl) + numericVolume) as Milliliters;
      },
      false,
      'chemistry/recordTitrantDispensed',
    );
  },

  updateSolutionColor: (glasswareId, colorHex) => {
    set(
      (state) => {
        state.solutionColorByGlasswareId.set(glasswareId, colorHex);
      },
      false,
      'chemistry/updateSolutionColor',
    );
  },

  setMetalIonConcentration: (glasswareId, concentration) => {
    set(
      (state) => {
        state.metalIonConcentrationByGlasswareId.set(glasswareId, concentration);
      },
      false,
      'chemistry/setMetalIonConcentration',
    );
  },

  resetChemistryState: () => {
    set(
      (state) => {
        const initial = createInitialChemistrySliceState();
        state.endpointStatus = initial.endpointStatus;
        state.solutionColorByGlasswareId = initial.solutionColorByGlasswareId;
        state.activeReactions = initial.activeReactions;
        state.titrantConsumedMl = initial.titrantConsumedMl;
        state.metalIonConcentrationByGlasswareId = initial.metalIonConcentrationByGlasswareId;
      },
      false,
      'chemistry/resetChemistryState',
    );
  },
});

