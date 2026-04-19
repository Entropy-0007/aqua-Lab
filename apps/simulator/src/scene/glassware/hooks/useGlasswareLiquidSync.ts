/**
 * Synchronizes liquid mesh scale/position/color with global glassware and chemistry state every frame.
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { calculateSurfaceHeight } from '@aqua-lab/physics-engine';

import { SCENE_RENDER_COLORS } from '../../../constants/colors.constants';
import { useStore } from '../../../state/store';
import type { GlasswareState } from '../../../types/glassware.types';

/** Represents minimum non-zero Y scale to keep liquid mesh numerically stable. */
const MIN_LIQUID_SCALE_Y = 0.0001;
/** Millimeters per meter conversion factor. */
const MILLIMETERS_PER_METER = 1000;
/** Physics-engine volume parameter type. */
type EngineVolume = Parameters<typeof calculateSurfaceHeight>[0];
/** Physics-engine glassware specification parameter type. */
type EngineGlasswareSpec = Parameters<typeof calculateSurfaceHeight>[1];

/**
 * Synchronizes one liquid mesh against the current store state for a given glassware id.
 *
 * @param glasswareId - Target glassware identifier.
 * @param liquidMeshRef - Mesh ref for liquid geometry to scale and recolor.
 * @returns Nothing.
 */
export function useGlasswareLiquidSync(
  glasswareId: string,
  liquidMeshRef: React.RefObject<THREE.Mesh | null>,
): void {
  useFrame(() => {
    const liquidMesh = liquidMeshRef.current;
    if (!liquidMesh) {
      return;
    }

    const state = useStore.getState();
    const instance = state.instances.get(glasswareId);
    if (!instance) {
      liquidMesh.visible = false;
      return;
    }

    const currentVolume = getCurrentVolumeFromState(instance.state, Number(instance.spec.maxCapacity));
    if (currentVolume <= 0) {
      liquidMesh.visible = false;
      liquidMesh.scale.y = MIN_LIQUID_SCALE_Y;
      liquidMesh.position.y = 0;
      return;
    }

    const surfaceHeightMm = calculateSurfaceHeight(
      currentVolume as unknown as EngineVolume,
      instance.spec as unknown as EngineGlasswareSpec,
    );
    const surfaceHeightM = Math.max(0, Math.min(instance.spec.heightMm, surfaceHeightMm)) / MILLIMETERS_PER_METER;

    liquidMesh.visible = true;
    liquidMesh.scale.y = Math.max(MIN_LIQUID_SCALE_Y, surfaceHeightM);
    liquidMesh.position.y = surfaceHeightM / 2;

    const chemistryColor = state.solutionColorByGlasswareId.get(glasswareId);
    const fallbackStateColor = getStateSolutionColor(instance.state);
    const nextColor =
      chemistryColor ??
      fallbackStateColor ??
      SCENE_RENDER_COLORS.glassware.liquidFallback;

    applyMaterialColor(liquidMesh.material, nextColor);
  });
}

/**
 * Reads current liquid volume from discriminated glassware state.
 *
 * @param state - Glassware operational state.
 * @param maxCapacityMl - Maximum capacity fallback in mL.
 * @returns Current volume in mL as number.
 */
function getCurrentVolumeFromState(state: GlasswareState, maxCapacityMl: number): number {
  switch (state.status) {
    case 'empty':
      return 0;
    case 'filling':
      return Number(state.currentVolume);
    case 'dispensing':
      return Number(state.currentVolume);
    case 'full':
      return Math.min(maxCapacityMl, Number(state.solution.solventVolume));
    default:
      return 0;
  }
}

/**
 * Extracts current solution color from glassware state where available.
 *
 * @param state - Glassware operational state.
 * @returns Hex color string if present, otherwise null.
 */
function getStateSolutionColor(state: GlasswareState): string | null {
  if (state.status === 'empty') {
    return null;
  }

  return state.solution.currentColorHex;
}

/**
 * Applies a color to supported material instances on a mesh.
 *
 * @param material - Mesh material reference.
 * @param color - Hex color string to apply.
 * @returns Nothing.
 */
function applyMaterialColor(material: THREE.Material | THREE.Material[], color: string): void {
  if (Array.isArray(material)) {
    for (let index = 0; index < material.length; index += 1) {
      applyColorToOneMaterial(material[index], color);
    }
    return;
  }

  applyColorToOneMaterial(material, color);
}

/**
 * Applies color to one material when it supports `color`.
 *
 * @param material - Material instance.
 * @param color - Hex color string.
 * @returns Nothing.
 */
function applyColorToOneMaterial(material: THREE.Material, color: string): void {
  if ('color' in material && material.color instanceof THREE.Color) {
    material.color.set(color);
  }
}
