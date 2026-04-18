/**
 * Combines all Zustand slices into the root simulator store with middleware and typed selectors.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Anomaly } from '../types/anomaly.types';
import type { EndpointStatus } from '../types/chemical.types';
import type { GlasswareInstance } from '../types/glassware.types';
import type { ExperimentRecord, SimulationPhase } from '../types/simulation.types';
import type { CameraMode } from './slices/ui.slice';
import { createAnomalySlice } from './slices/anomaly.slice';
import type { AnomalySliceActions, AnomalySliceState } from './slices/anomaly.slice';
import { createChemistrySlice } from './slices/chemistry.slice';
import type { ChemistrySliceActions, ChemistrySliceState } from './slices/chemistry.slice';
import { createGlasswareSlice } from './slices/glassware.slice';
import type { GlasswareSliceActions, GlasswareSliceState } from './slices/glassware.slice';
import { createSimulationSlice } from './slices/simulation.slice';
import type { SimulationSliceActions, SimulationSliceState } from './slices/simulation.slice';
import { createUISlice } from './slices/ui.slice';
import type { UISliceActions, UISliceState } from './slices/ui.slice';

/** Represents the combined root state fields from all registered slices. */
export type RootState = SimulationSliceState &
  GlasswareSliceState &
  ChemistrySliceState &
  AnomalySliceState &
  UISliceState;

/** Represents the combined root action set from all registered slices. */
export type RootActions = SimulationSliceActions &
  GlasswareSliceActions &
  ChemistrySliceActions &
  AnomalySliceActions &
  UISliceActions;

/** Represents the complete root store contract including state and action members. */
export type RootStore = RootState & RootActions;

/** Root Zustand store hook with typed state/actions and middleware-enabled mutation semantics. */
export const useStore = create<RootStore>()(
  devtools(
    immer((...args) => ({
      ...createSimulationSlice(...args),
      ...createGlasswareSlice(...args),
      ...createChemistrySlice(...args),
      ...createAnomalySlice(...args),
      ...createUISlice(...args),
    })),
    {
      name: 'aqua-lab-store',
    },
  ),
);

/** Selects the current simulation phase from root state. */
export const useSimulationPhase = (): SimulationPhase => useStore((state) => state.phase);

/** Selects the currently selected glassware instance, or null when no selection exists. */
export const useSelectedGlassware = (): GlasswareInstance | null =>
  useStore((state) => {
    if (state.selectedId === null) {
      return null;
    }

    return state.instances.get(state.selectedId) ?? null;
  });

/** Selects the current in-progress trial, or null when no trial is active. */
export const useCurrentTrial = (): ExperimentRecord | null => useStore((state) => state.currentTrial);

/** Selects the latest endpoint status classification from chemistry tracking state. */
export const useEndpointStatus = (): EndpointStatus => useStore((state) => state.endpointStatus);

/** Selects all currently active anomalies from anomaly tracking state. */
export const useActiveAnomalies = (): Anomaly[] => useStore((state) => state.activeAnomalies);

/** Selects current camera mode from UI interaction state. */
export const useCameraMode = (): CameraMode => useStore((state) => state.cameraMode);

