/**
 * Renders generic cylindrical vessels procedurally from GlasswareSpec properties.
 */

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

import { SCENE_RENDER_COLORS } from '../../constants/colors.constants';
import type { GlasswareInstance } from '../../types/glassware.types';
import { GlassMaterial } from './materials/GlassMaterial';
import { useGlasswareLiquidSync } from './hooks/useGlasswareLiquidSync';

/** Represents props for GenericVesselObject. */
export interface GenericVesselObjectProps {
  instance: GlasswareInstance;
}

/** Vessel wall thickness in meters. */
const VESSEL_WALL_THICKNESS_M = 0.0016;
/** Graduation mark width in meters. */
const MARK_WIDTH_M = 0.01;
/** Graduation mark height in meters. */
const MARK_HEIGHT_M = 0.0008;
/** Graduation mark depth in meters. */
const MARK_DEPTH_M = 0.001;
/** Label font size in meters. */
const LABEL_FONT_SIZE_M = 0.02;

/** Renders a generic cylindrical vessel with marks and synced liquid fill. */
export const GenericVesselObject: React.FC<GenericVesselObjectProps> = ({ instance }) => {
  const liquidRef = useRef<THREE.Mesh | null>(null);
  const markMeshRef = useRef<THREE.InstancedMesh | null>(null);

  const spec = instance.spec;
  const heightM = spec.heightMm / 1000;
  const innerRadiusM = spec.innerRadiusMm / 1000;
  const outerRadiusM = innerRadiusM + VESSEL_WALL_THICKNESS_M;
  const maxCapacity = Number(spec.maxCapacity);
  const graduationInterval = Number(spec.graduationInterval);

  const markVolumes = useMemo<number[]>(() => {
    if (graduationInterval <= 0) {
      return [];
    }

    const marks: number[] = [];
    for (let value = graduationInterval; value <= maxCapacity + 1e-6; value += graduationInterval) {
      marks.push(value);
    }
    return marks;
  }, [graduationInterval, maxCapacity]);

  useLayoutEffect(() => {
    if (!markMeshRef.current) {
      return;
    }

    const matrix = new THREE.Matrix4();
    for (let index = 0; index < markVolumes.length; index += 1) {
      const t = THREE.MathUtils.clamp(markVolumes[index] / maxCapacity, 0, 1);
      const y = t * heightM;
      matrix.makeTranslation(outerRadiusM + MARK_DEPTH_M / 2, y, 0);
      markMeshRef.current.setMatrixAt(index, matrix);
    }
    markMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [heightM, markVolumes, maxCapacity, outerRadiusM]);

  useGlasswareLiquidSync(instance.id, liquidRef);

  return (
    <group name="generic-vessel-object">
      <mesh castShadow receiveShadow position={[0, heightM / 2, 0]}>
        <cylinderGeometry args={[outerRadiusM, outerRadiusM, heightM, 40, 1, true]} />
        <GlassMaterial dirty={instance.isDirty} />
      </mesh>

      {markVolumes.length > 0 && (
        <instancedMesh
          ref={markMeshRef}
          args={[undefined, undefined, markVolumes.length]}
          renderOrder={2}
        >
          <boxGeometry args={[MARK_DEPTH_M, MARK_HEIGHT_M, MARK_WIDTH_M]} />
          <meshStandardMaterial
            color={SCENE_RENDER_COLORS.glassware.markings}
            roughness={0.7}
            metalness={0.04}
          />
        </instancedMesh>
      )}

      <mesh ref={liquidRef} position={[0, 0.001, 0]} visible={false}>
        <cylinderGeometry args={[innerRadiusM * 0.96, innerRadiusM * 0.96, 1, 32]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.glassware.liquidFallback}
          transparent
          opacity={0.7}
          roughness={0.22}
          metalness={0}
        />
      </mesh>

      <Text
        position={[outerRadiusM + 0.03, heightM * 0.58, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={LABEL_FONT_SIZE_M}
        color={SCENE_RENDER_COLORS.glassware.markings}
        anchorX="left"
        anchorY="middle"
      >
        {spec.displayName}
      </Text>
    </group>
  );
};

