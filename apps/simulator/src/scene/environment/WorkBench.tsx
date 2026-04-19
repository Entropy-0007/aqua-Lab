/**
 * Renders a static laboratory work bench with PBR materials and instanced repeated parts.
 */

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { SCENE_RENDER_COLORS } from '../../constants/colors.constants';

/** Represents props for WorkBench. */
export interface WorkBenchProps {}

/** Bench width in meters. */
const BENCH_WIDTH_M = 2;
/** Bench depth in meters. */
const BENCH_DEPTH_M = 0.8;
/** Bench total height in meters. */
const BENCH_HEIGHT_M = 0.9;
/** Bench top slab thickness in meters. */
const BENCH_TOP_THICKNESS_M = 0.04;
/** Frame leg square profile width in meters. */
const LEG_SIZE_M = 0.04;
/** Storage door panel thickness in meters. */
const DOOR_THICKNESS_M = 0.02;
/** Storage door panel height in meters. */
const DOOR_HEIGHT_M = 0.55;
/** Storage door panel width in meters. */
const DOOR_WIDTH_M = 0.46;
/** Under-bench shelf rail thickness in meters. */
const FRAME_RAIL_THICKNESS_M = 0.03;

/** Bench top surface world Y coordinate for equipment placement. */
export const BENCH_SURFACE_Y = BENCH_HEIGHT_M;

/** Renders the static lab bench environment geometry. */
export const WorkBench: React.FC<WorkBenchProps> = () => {
  const legMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const doorMeshRef = useRef<THREE.InstancedMesh | null>(null);

  const legGeometry = useMemo(
    () => new THREE.BoxGeometry(LEG_SIZE_M, BENCH_HEIGHT_M - BENCH_TOP_THICKNESS_M, LEG_SIZE_M),
    [],
  );
  const doorGeometry = useMemo(
    () => new THREE.BoxGeometry(DOOR_WIDTH_M, DOOR_HEIGHT_M, DOOR_THICKNESS_M),
    [],
  );

  useLayoutEffect(() => {
    if (legMeshRef.current) {
      const halfWidth = BENCH_WIDTH_M / 2 - LEG_SIZE_M / 2;
      const halfDepth = BENCH_DEPTH_M / 2 - LEG_SIZE_M / 2;
      const legY = (BENCH_HEIGHT_M - BENCH_TOP_THICKNESS_M) / 2;
      const positions: [number, number, number][] = [
        [-halfWidth, legY, -halfDepth],
        [halfWidth, legY, -halfDepth],
        [-halfWidth, legY, halfDepth],
        [halfWidth, legY, halfDepth],
      ];

      const matrix = new THREE.Matrix4();
      for (let index = 0; index < positions.length; index += 1) {
        matrix.makeTranslation(...positions[index]);
        legMeshRef.current.setMatrixAt(index, matrix);
      }
      legMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (doorMeshRef.current) {
      const doorY = DOOR_HEIGHT_M / 2;
      const doorZ = BENCH_DEPTH_M / 2 - DOOR_THICKNESS_M / 2;
      const doorGap = 0.03;
      const leftX = -DOOR_WIDTH_M / 2 - doorGap / 2;
      const rightX = DOOR_WIDTH_M / 2 + doorGap / 2;
      const positions: [number, number, number][] = [
        [leftX, doorY, doorZ],
        [rightX, doorY, doorZ],
      ];

      const matrix = new THREE.Matrix4();
      for (let index = 0; index < positions.length; index += 1) {
        matrix.makeTranslation(...positions[index]);
        doorMeshRef.current.setMatrixAt(index, matrix);
      }
      doorMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <group name="work-bench">
      <mesh position={[0, BENCH_HEIGHT_M - BENCH_TOP_THICKNESS_M / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BENCH_WIDTH_M, BENCH_TOP_THICKNESS_M, BENCH_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.bench.epoxySurface}
          roughness={0.15}
          metalness={0.05}
        />
      </mesh>

      <instancedMesh ref={legMeshRef} args={[legGeometry, undefined, 4]} castShadow receiveShadow>
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.bench.stainlessFrame}
          roughness={0.2}
          metalness={0.85}
        />
      </instancedMesh>

      <mesh
        position={[0, BENCH_HEIGHT_M - BENCH_TOP_THICKNESS_M - FRAME_RAIL_THICKNESS_M / 2, -BENCH_DEPTH_M / 2 + LEG_SIZE_M / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[BENCH_WIDTH_M - LEG_SIZE_M, FRAME_RAIL_THICKNESS_M, FRAME_RAIL_THICKNESS_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.bench.stainlessFrame}
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      <mesh
        position={[0, BENCH_HEIGHT_M - BENCH_TOP_THICKNESS_M - FRAME_RAIL_THICKNESS_M / 2, BENCH_DEPTH_M / 2 - LEG_SIZE_M / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[BENCH_WIDTH_M - LEG_SIZE_M, FRAME_RAIL_THICKNESS_M, FRAME_RAIL_THICKNESS_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.bench.stainlessFrame}
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      <instancedMesh ref={doorMeshRef} args={[doorGeometry, undefined, 2]} castShadow receiveShadow>
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.bench.storagePanel}
          roughness={0.45}
          metalness={0.1}
        />
      </instancedMesh>
    </group>
  );
};

