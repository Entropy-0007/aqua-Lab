/**
 * Renders a static retort stand (burette stand) with mount coordinates for future burette placement.
 */

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { Vector3D } from '../../types/physics.types';
import { SCENE_RENDER_COLORS } from '../../constants/colors.constants';
import { BENCH_SURFACE_Y } from './WorkBench';

/** Represents props for EquipmentStand. */
export interface EquipmentStandProps {}

/** Stand base center X position in meters. */
const STAND_BASE_X_M = 0.55;
/** Stand base center Z position in meters. */
const STAND_BASE_Z_M = -0.16;
/** Base plate width in meters. */
const BASE_WIDTH_M = 0.2;
/** Base plate depth in meters. */
const BASE_DEPTH_M = 0.16;
/** Base plate thickness in meters. */
const BASE_THICKNESS_M = 0.02;
/** Vertical rod height in meters (60 cm). */
const ROD_HEIGHT_M = 0.6;
/** Vertical rod radius in meters (8 mm diameter). */
const ROD_RADIUS_M = 0.004;
/** Clamp bar length in meters. */
const CLAMP_LENGTH_M = 0.12;
/** Clamp bar thickness in meters. */
const CLAMP_THICKNESS_M = 0.012;
/** Upper clamp height above bench surface in meters. */
const UPPER_CLAMP_OFFSET_Y_M = 0.45;
/** Lower clamp height above bench surface in meters. */
const LOWER_CLAMP_OFFSET_Y_M = 0.32;
/** Burette mount offset from rod on X axis in meters. */
const BURETTE_MOUNT_OFFSET_X_M = 0.03;

/** Burette snap mount point in world coordinates for future burette mesh placement. */
export const BURETTE_MOUNT_POSITION: Vector3D = {
  x: STAND_BASE_X_M + BURETTE_MOUNT_OFFSET_X_M,
  y: BENCH_SURFACE_Y + UPPER_CLAMP_OFFSET_Y_M,
  z: STAND_BASE_Z_M,
};

/** Renders a static equipment stand assembly for burette mounting. */
export const EquipmentStand: React.FC<EquipmentStandProps> = () => {
  const clampMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const clampGeometry = useMemo(
    () => new THREE.BoxGeometry(CLAMP_LENGTH_M, CLAMP_THICKNESS_M, CLAMP_THICKNESS_M),
    [],
  );

  useLayoutEffect(() => {
    if (!clampMeshRef.current) {
      return;
    }

    const matrix = new THREE.Matrix4();
    const clampPositions: [number, number, number][] = [
      [STAND_BASE_X_M + CLAMP_LENGTH_M / 2, BENCH_SURFACE_Y + LOWER_CLAMP_OFFSET_Y_M, STAND_BASE_Z_M],
      [STAND_BASE_X_M + CLAMP_LENGTH_M / 2, BENCH_SURFACE_Y + UPPER_CLAMP_OFFSET_Y_M, STAND_BASE_Z_M],
    ];

    for (let index = 0; index < clampPositions.length; index += 1) {
      matrix.makeTranslation(...clampPositions[index]);
      clampMeshRef.current.setMatrixAt(index, matrix);
    }
    clampMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group name="equipment-stand">
      <mesh
        position={[STAND_BASE_X_M, BENCH_SURFACE_Y + BASE_THICKNESS_M / 2, STAND_BASE_Z_M]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[BASE_WIDTH_M, BASE_THICKNESS_M, BASE_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.stand.castIronBase}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      <mesh
        position={[STAND_BASE_X_M, BENCH_SURFACE_Y + BASE_THICKNESS_M + ROD_HEIGHT_M / 2, STAND_BASE_Z_M]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[ROD_RADIUS_M, ROD_RADIUS_M, ROD_HEIGHT_M, 24]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.stand.paintedMetal}
          roughness={0.35}
          metalness={0.7}
        />
      </mesh>

      <instancedMesh ref={clampMeshRef} args={[clampGeometry, undefined, 2]} castShadow receiveShadow>
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.stand.clampMetal}
          roughness={0.2}
          metalness={0.85}
        />
      </instancedMesh>
    </group>
  );
};

