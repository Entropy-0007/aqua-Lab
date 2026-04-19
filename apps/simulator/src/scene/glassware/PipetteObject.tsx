/**
 * Renders a procedural volumetric pipette mesh with internal liquid sync support.
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { SCENE_RENDER_COLORS } from '../../constants/colors.constants';
import type { GlasswareInstance } from '../../types/glassware.types';
import { GlassMaterial } from './materials/GlassMaterial';
import { useGlasswareLiquidSync } from './hooks/useGlasswareLiquidSync';

/** Represents props for PipetteObject. */
export interface PipetteObjectProps {
  instance: GlasswareInstance;
}

/** Pipette wall thickness in meters. */
const PIPETTE_WALL_THICKNESS_M = 0.0012;
/** Pipette bulb radius multiplier relative to stem radius. */
const BULB_RADIUS_FACTOR = 2.3;
/** Pipette tip radius in meters. */
const TIP_RADIUS_M = 0.0007;

/** Renders one procedural pipette with glass and liquid meshes. */
export const PipetteObject: React.FC<PipetteObjectProps> = ({ instance }) => {
  const liquidRef = useRef<THREE.Mesh | null>(null);

  const spec = instance.spec;
  const heightM = spec.heightMm / 1000;
  const stemRadiusM = spec.innerRadiusMm / 1000;
  const outerStemRadiusM = stemRadiusM + PIPETTE_WALL_THICKNESS_M;

  const profile = useMemo<THREE.Vector2[]>(
    () => [
      new THREE.Vector2(TIP_RADIUS_M, 0),
      new THREE.Vector2(outerStemRadiusM * 0.75, heightM * 0.12),
      new THREE.Vector2(outerStemRadiusM, heightM * 0.2),
      new THREE.Vector2(outerStemRadiusM * BULB_RADIUS_FACTOR, heightM * 0.5),
      new THREE.Vector2(outerStemRadiusM, heightM * 0.76),
      new THREE.Vector2(outerStemRadiusM, heightM),
    ],
    [heightM, outerStemRadiusM],
  );

  useGlasswareLiquidSync(instance.id, liquidRef);

  return (
    <group name="pipette-object">
      <mesh castShadow receiveShadow position={[0, heightM / 2, 0]}>
        <latheGeometry args={[profile, 48]} />
        <GlassMaterial dirty={instance.isDirty} />
      </mesh>

      <mesh ref={liquidRef} position={[0, 0.001, 0]} visible={false}>
        <cylinderGeometry args={[stemRadiusM * 0.75, stemRadiusM * 0.75, 1, 20]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.glassware.liquidFallback}
          transparent
          opacity={0.7}
          roughness={0.25}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

