/**
 * Renders a procedural conical flask with volume marks, liquid fill, and foam animation.
 */

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

import { FOAM_PARTICLE_COLOR, SCENE_RENDER_COLORS } from '../../constants/colors.constants';
import type { GlasswareInstance } from '../../types/glassware.types';
import { GlassMaterial } from './materials/GlassMaterial';
import { useGlasswareLiquidSync } from './hooks/useGlasswareLiquidSync';

/** Represents props for ConicalFlaskObject. */
export interface ConicalFlaskObjectProps {
  instance: GlasswareInstance;
}

/** Flask glass wall thickness in meters. */
const FLASK_WALL_THICKNESS_M = 0.0018;
/** Volume marks rendered for conical flask body. */
const FLASK_VOLUME_MARKS_ML = [25, 50, 100, 150, 200, 250] as const;
/** Flask graduation tick width in meters. */
const MARK_WIDTH_M = 0.012;
/** Flask graduation tick height in meters. */
const MARK_HEIGHT_M = 0.0008;
/** Flask graduation tick depth in meters. */
const MARK_DEPTH_M = 0.001;
/** Flask label font size in meters. */
const MARK_LABEL_FONT_SIZE_M = 0.014;
/** Neck foam radius in meters. */
const FOAM_RADIUS_M = 0.004;

/** Renders procedural Erlenmeyer flask geometry and liquid/foam overlays. */
export const ConicalFlaskObject: React.FC<ConicalFlaskObjectProps> = ({ instance }) => {
  const liquidRef = useRef<THREE.Mesh | null>(null);
  const markMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const foamRefs = useRef<Array<THREE.Mesh | null>>([]);

  const spec = instance.spec;
  const bodyHeightM = spec.heightMm / 1000;
  const baseRadiusM = spec.innerRadiusMm / 1000;
  const neckRadiusM = (spec.neckRadiusMm ?? spec.innerRadiusMm * 0.32) / 1000;
  const maxCapacity = Number(spec.maxCapacity);

  const lathePoints = useMemo<THREE.Vector2[]>(
    () => [
      new THREE.Vector2(baseRadiusM + FLASK_WALL_THICKNESS_M, 0),
      new THREE.Vector2(baseRadiusM * 0.9 + FLASK_WALL_THICKNESS_M, bodyHeightM * 0.16),
      new THREE.Vector2(baseRadiusM * 0.72 + FLASK_WALL_THICKNESS_M, bodyHeightM * 0.33),
      new THREE.Vector2(baseRadiusM * 0.52 + FLASK_WALL_THICKNESS_M, bodyHeightM * 0.5),
      new THREE.Vector2(baseRadiusM * 0.34 + FLASK_WALL_THICKNESS_M, bodyHeightM * 0.7),
      new THREE.Vector2(neckRadiusM + FLASK_WALL_THICKNESS_M, bodyHeightM * 0.86),
      new THREE.Vector2(neckRadiusM + FLASK_WALL_THICKNESS_M, bodyHeightM),
    ],
    [baseRadiusM, bodyHeightM, neckRadiusM],
  );

  const foamCount = useMemo(() => {
    const hash = hashString(instance.id);
    return 3 + (hash % 6);
  }, [instance.id]);

  const isMixingInProgress = useMemo(() => {
    if (instance.state.status === 'empty') {
      return false;
    }
    return !instance.state.solution.isMixed;
  }, [instance.state]);

  useLayoutEffect(() => {
    if (!markMeshRef.current) {
      return;
    }

    const matrix = new THREE.Matrix4();
    for (let index = 0; index < FLASK_VOLUME_MARKS_ML.length; index += 1) {
      const value = FLASK_VOLUME_MARKS_ML[index];
      const t = THREE.MathUtils.clamp(value / maxCapacity, 0, 1);
      const y = t * (bodyHeightM * 0.82);
      const radiusAtY = THREE.MathUtils.lerp(baseRadiusM, neckRadiusM, t * 0.8);
      matrix.makeTranslation(radiusAtY * 0.72, y, 0);
      matrix.makeRotationY(Math.PI / 2).premultiply(matrix);
      markMeshRef.current.setMatrixAt(index, matrix);
    }
    markMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [baseRadiusM, bodyHeightM, maxCapacity, neckRadiusM]);

  useGlasswareLiquidSync(instance.id, liquidRef);

  useFrame((state: RootState) => {
    if (!isMixingInProgress) {
      return;
    }

    const time = state.clock.elapsedTime;
    for (let index = 0; index < foamCount; index += 1) {
      const mesh = foamRefs.current[index];
      if (!mesh) {
        continue;
      }

      const seed = (hashString(instance.id) + index * 17) % 1000;
      const phase = (time * 0.4 + seed * 0.01) % 1;
      const rise = phase * (bodyHeightM * 0.28);
      mesh.position.y = bodyHeightM * 0.72 + rise;
      mesh.position.x = Math.sin(time * 0.9 + index) * (neckRadiusM * 0.35);
      mesh.position.z = Math.cos(time * 0.8 + index * 1.4) * (neckRadiusM * 0.35);
    }
  });

  return (
    <group name="conical-flask-object">
      <mesh castShadow receiveShadow position={[0, bodyHeightM / 2, 0]}>
        <latheGeometry args={[lathePoints, 56]} />
        <GlassMaterial dirty={instance.isDirty} />
      </mesh>

      <instancedMesh
        ref={markMeshRef}
        args={[undefined, undefined, FLASK_VOLUME_MARKS_ML.length]}
        renderOrder={2}
      >
        <boxGeometry args={[MARK_WIDTH_M, MARK_HEIGHT_M, MARK_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.glassware.markings}
          roughness={0.72}
          metalness={0.02}
        />
      </instancedMesh>

      {FLASK_VOLUME_MARKS_ML.map((mark) => {
        const t = THREE.MathUtils.clamp(mark / maxCapacity, 0, 1);
        const y = t * (bodyHeightM * 0.82);
        const radiusAtY = THREE.MathUtils.lerp(baseRadiusM, neckRadiusM, t * 0.8);
        return (
          <Text
            key={`flask-mark-${mark}`}
            position={[radiusAtY * 0.74 + 0.006, y, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            fontSize={MARK_LABEL_FONT_SIZE_M}
            color={SCENE_RENDER_COLORS.glassware.markings}
            anchorX="left"
            anchorY="middle"
          >
            {`${mark}`}
          </Text>
        );
      })}

      <mesh ref={liquidRef} position={[0, 0.001, 0]} visible={false}>
        <cylinderGeometry args={[baseRadiusM * 0.92, baseRadiusM * 0.98, 1, 32]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.glassware.liquidFallback}
          transparent
          opacity={0.72}
          roughness={0.2}
          metalness={0}
        />
      </mesh>

      {isMixingInProgress &&
        Array.from({ length: foamCount }, (_, index) => (
          <mesh
            key={`foam-${index}`}
            ref={(mesh) => {
              foamRefs.current[index] = mesh;
            }}
            position={[0, bodyHeightM * 0.72, 0]}
          >
            <sphereGeometry args={[FOAM_RADIUS_M, 10, 10]} />
            <meshStandardMaterial
              color={FOAM_PARTICLE_COLOR}
              transparent
              opacity={0.7}
              roughness={0.5}
              metalness={0}
            />
          </mesh>
        ))}
    </group>
  );
};

/**
 * Creates a deterministic positive integer hash.
 *
 * @param text - Input text.
 * @returns Positive hash value.
 */
function hashString(text: string): number {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}
