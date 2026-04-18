/**
 * Defines glassware-instance state and intent actions for scene-level equipment management.
 */

import type { StateCreator } from 'zustand';

import { UserAction } from '../../types/simulation.types';
import type { UserActionLogEntry } from '../../types/simulation.types';
import type { Solution } from '../../types/chemical.types';
import type { GlasswareInstance, GlasswareSpec, GlasswareState } from '../../types/glassware.types';
import type { Vector3D } from '../../types/physics.types';
import type { Milliliters, Moles } from '../../types/units.types';
import type { RootStore } from '../store';

/** Represents state fields for all instantiated glassware objects in the current scene. */
export interface GlasswareSliceState {
  instances: Map<string, GlasswareInstance>;
  selectedId: string | null;
}

/** Represents all mutation intents for glassware lifecycle and vessel content state. */
export interface GlasswareSliceActions {
  /** Creates and adds a new glassware instance at the provided world position. */
  addGlasswareToScene: (spec: GlasswareSpec, position: Vector3D) => string;
  /** Removes an existing glassware instance by UUID. */
  removeGlasswareFromScene: (id: string) => void;
  /** Sets the currently selected glassware UUID, or clears selection with null. */
  selectGlassware: (id: string | null) => void;
  /** Replaces the operational state for a given glassware instance with capacity validation. */
  updateGlasswareState: (id: string, state: GlasswareState) => void;
  /** Updates world-space position for a specific glassware instance. */
  updateGlasswarePosition: (id: string, position: Vector3D) => void;
  /** Marks a glassware instance as dirty. */
  markGlasswAreDirty: (id: string) => void;
  /** Marks a glassware instance as clean if a rinse action has been logged. */
  markGlasswareClean: (id: string) => void;
  /** Toggles air-bubble presence for a specific glassware instance. */
  setAirBubble: (id: string, hasAirBubble: boolean) => void;
  /** Adds solution volume into a glassware vessel with merge and overflow handling. */
  addSolutionToGlassware: (id: string, solution: Solution, volume: Milliliters) => void;
  /** Removes solution volume from a glassware vessel with underflow protection. */
  removeSolutionFromGlassware: (id: string, volume: Milliliters) => void;
  /** Resets this slice to its initial empty scene state. */
  resetGlasswareState: () => void;
}

/** Represents the complete glassware slice contract. */
export type GlasswareSlice = GlasswareSliceState & GlasswareSliceActions;

/** Zero-valued milliliters constant for branded volume initialization and comparisons. */
const ZERO_MILLILITERS = 0 as Milliliters;

/** Creates initial state fields for glassware slice defaults. */
const createInitialGlasswareSliceState = (): GlasswareSliceState => ({
  instances: new Map<string, GlasswareInstance>(),
  selectedId: null,
});

/** Creates a UUID string for new instance identities. */
const createUuid = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `glassware-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Returns the current contained volume for a given glassware operational state. */
const getVolumeFromState = (state: GlasswareState, fullVolume: Milliliters): Milliliters => {
  if (state.status === 'empty') {
    return ZERO_MILLILITERS;
  }

  if (state.status === 'full') {
    return fullVolume;
  }

  return state.currentVolume;
};

/** Returns the solution payload currently associated with the provided glassware state. */
const getSolutionFromState = (state: GlasswareState): Solution | null => {
  if (state.status === 'empty') {
    return null;
  }

  return state.solution;
};

/** Validates that a provided volume is finite and non-negative. */
const assertValidVolume = (volume: Milliliters, messagePrefix: string): void => {
  const numericVolume = Number(volume);
  if (!Number.isFinite(numericVolume) || numericVolume < 0) {
    throw new Error(`${messagePrefix}: volume must be finite and non-negative.`);
  }
};

/** Ensures state volume constraints satisfy the maximum vessel capacity. */
const validateStateAgainstCapacity = (state: GlasswareState, maxCapacity: Milliliters): void => {
  const volume = getVolumeFromState(state, maxCapacity);
  const numericVolume = Number(volume);
  const numericCapacity = Number(maxCapacity);

  if (numericVolume < 0 || numericVolume > numericCapacity) {
    throw new Error('Glassware state volume violates capacity constraints.');
  }
};

/** Merges chemical maps from two solutions by summing moles per chemical identifier. */
const mergeChemicalMoles = (left: Map<unknown, Moles>, right: Map<unknown, Moles>): Map<unknown, Moles> => {
  const merged = new Map<unknown, Moles>(left);

  for (const [chemicalId, moles] of right.entries()) {
    const previous = merged.get(chemicalId);
    const sum = (Number(previous ?? (0 as Moles)) + Number(moles)) as Moles;
    merged.set(chemicalId, sum);
  }

  return merged;
};

/** Creates a merged solution representation based on existing and incoming solution payloads. */
const mergeSolutions = (
  existing: Solution | null,
  incoming: Solution,
  resultingVolume: Milliliters,
): Solution => {
  if (existing === null) {
    return {
      ...incoming,
      solventVolume: resultingVolume,
    };
  }

  const existingVolume = Number(existing.solventVolume);
  const incomingVolume = Number(incoming.solventVolume);
  const totalSourceVolume = existingVolume + incomingVolume;

  const weightedPh =
    totalSourceVolume <= 0
      ? incoming.ph
      : (existing.ph * existingVolume + incoming.ph * incomingVolume) / totalSourceVolume;

  return {
    chemicals: mergeChemicalMoles(
      existing.chemicals as Map<unknown, Moles>,
      incoming.chemicals as Map<unknown, Moles>,
    ) as Solution['chemicals'],
    solventVolume: resultingVolume,
    currentColorHex: incoming.currentColorHex,
    ph: weightedPh,
    isMixed: existing.isMixed && incoming.isMixed,
    isContaminated: existing.isContaminated || incoming.isContaminated,
  };
};

/** Creates the glassware slice with typed state, reducers, and reset support. */
export const createGlasswareSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  GlasswareSlice
> = (set, get) => ({
  ...createInitialGlasswareSliceState(),

  addGlasswareToScene: (spec, position) => {
    const id = createUuid();

    set(
      (state) => {
        const instance: GlasswareInstance = {
          id,
          spec,
          state: { status: 'empty' },
          position,
          rotation: { x: 0, y: 0, z: 0 },
          isDirty: false,
          hasAirBubble: false,
          isSelected: false,
          labelText: spec.displayName,
        };

        state.instances.set(id, instance);
      },
      false,
      'glassware/addGlasswareToScene',
    );

    return id;
  },

  removeGlasswareFromScene: (id) => {
    set(
      (state) => {
        if (!state.instances.has(id)) {
          throw new Error(`Cannot remove glassware: ${id} was not found.`);
        }

        state.instances.delete(id);
        if (state.selectedId === id) {
          state.selectedId = null;
        }
      },
      false,
      'glassware/removeGlasswareFromScene',
    );
  },

  selectGlassware: (id) => {
    set(
      (state) => {
        if (id !== null && !state.instances.has(id)) {
          throw new Error(`Cannot select glassware: ${id} was not found.`);
        }

        state.selectedId = id;

        for (const [instanceId, instance] of state.instances.entries()) {
          state.instances.set(instanceId, {
            ...instance,
            isSelected: instanceId === id,
          });
        }
      },
      false,
      'glassware/selectGlassware',
    );
  },

  updateGlasswareState: (id, nextState) => {
    set(
      (state) => {
        const instance = state.instances.get(id);
        if (!instance) {
          throw new Error(`Cannot update glassware state: ${id} was not found.`);
        }

        validateStateAgainstCapacity(nextState, instance.spec.maxCapacity);

        state.instances.set(id, {
          ...instance,
          state: nextState,
        });
      },
      false,
      'glassware/updateGlasswareState',
    );
  },

  updateGlasswarePosition: (id, position) => {
    set(
      (state) => {
        const instance = state.instances.get(id);
        if (!instance) {
          throw new Error(`Cannot update glassware position: ${id} was not found.`);
        }

        state.instances.set(id, {
          ...instance,
          position,
        });
      },
      false,
      'glassware/updateGlasswarePosition',
    );
  },

  markGlasswAreDirty: (id) => {
    set(
      (state) => {
        const instance = state.instances.get(id);
        if (!instance) {
          throw new Error(`Cannot mark glassware dirty: ${id} was not found.`);
        }

        state.instances.set(id, {
          ...instance,
          isDirty: true,
        });
      },
      false,
      'glassware/markGlasswAreDirty',
    );
  },

  markGlasswareClean: (id) => {
    set(
      (state) => {
        const instance = state.instances.get(id);
        if (!instance) {
          throw new Error(`Cannot mark glassware clean: ${id} was not found.`);
        }

        const wasRinsed = state.userActionLog.some(
          (entry: UserActionLogEntry) =>
            entry.action === UserAction.RINSE_GLASSWARE &&
            entry.payload.glasswareId === id,
        );

        if (!wasRinsed) {
          throw new Error('Cannot mark glassware clean before a rinse action is recorded.');
        }

        state.instances.set(id, {
          ...instance,
          isDirty: false,
        });
      },
      false,
      'glassware/markGlasswareClean',
    );
  },

  setAirBubble: (id, hasAirBubble) => {
    set(
      (state) => {
        const instance = state.instances.get(id);
        if (!instance) {
          throw new Error(`Cannot set air bubble state: ${id} was not found.`);
        }

        state.instances.set(id, {
          ...instance,
          hasAirBubble,
        });
      },
      false,
      'glassware/setAirBubble',
    );
  },

  addSolutionToGlassware: (id, incomingSolution, volume) => {
    set(
      (state) => {
        assertValidVolume(volume, 'Cannot add solution');

        const instance = state.instances.get(id);
        if (!instance) {
          throw new Error(`Cannot add solution: ${id} was not found.`);
        }

        const maxCapacity = Number(instance.spec.maxCapacity);
        const currentVolume = Number(getVolumeFromState(instance.state, instance.spec.maxCapacity));
        const nextRawVolume = currentVolume + Number(volume);
        const clampedVolume = Math.max(0, Math.min(nextRawVolume, maxCapacity)) as Milliliters;

        const mergedSolution = mergeSolutions(
          getSolutionFromState(instance.state),
          incomingSolution,
          clampedVolume,
        );

        const nextStatus: GlasswareState =
          Number(clampedVolume) === 0
            ? { status: 'empty' }
            : Number(clampedVolume) >= maxCapacity
              ? {
                  status: 'full',
                  solution: mergedSolution,
                }
              : {
                  status: 'filling',
                  solution: mergedSolution,
                  currentVolume: clampedVolume,
                };

        state.instances.set(id, {
          ...instance,
          state: nextStatus,
        });
      },
      false,
      'glassware/addSolutionToGlassware',
    );
  },

  removeSolutionFromGlassware: (id, volume) => {
    set(
      (state) => {
        assertValidVolume(volume, 'Cannot remove solution');

        const instance = state.instances.get(id);
        if (!instance) {
          throw new Error(`Cannot remove solution: ${id} was not found.`);
        }

        if (instance.state.status === 'empty') {
          return;
        }

        const currentVolume = Number(getVolumeFromState(instance.state, instance.spec.maxCapacity));
        const nextVolume = Math.max(0, currentVolume - Number(volume)) as Milliliters;

        if (Number(nextVolume) <= 0) {
          state.instances.set(id, {
            ...instance,
            state: { status: 'empty' },
          });
          return;
        }

        const existingSolution = getSolutionFromState(instance.state);
        const nextSolution: Solution =
          existingSolution === null
            ? {
                chemicals: new Map(),
                solventVolume: nextVolume,
                currentColorHex: '#FFFFFF',
                ph: 7,
                isMixed: false,
                isContaminated: false,
              }
            : {
                ...existingSolution,
                solventVolume: nextVolume,
              };

        state.instances.set(id, {
          ...instance,
          state: {
            status: Number(nextVolume) >= Number(instance.spec.maxCapacity) ? 'full' : 'dispensing',
            solution: nextSolution,
            ...(Number(nextVolume) >= Number(instance.spec.maxCapacity)
              ? {}
              : { currentVolume: nextVolume, flowRateMlPerSecond: 0 }),
          } as GlasswareState,
        });
      },
      false,
      'glassware/removeSolutionFromGlassware',
    );
  },

  resetGlasswareState: () => {
    set(
      (state) => {
        const initial = createInitialGlasswareSliceState();
        state.instances = initial.instances;
        state.selectedId = initial.selectedId;
      },
      false,
      'glassware/resetGlasswareState',
    );
  },
});
