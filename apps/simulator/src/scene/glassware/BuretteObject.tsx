/**
 * Renders a procedurally generated burette with graduations, stopcock, and liquid column.
 */

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

import { SCENE_RENDER_COLORS } from '../../constants/colors.constants';
import type { BuretteInstance, GlasswareInstance } from '../../types/glassware.types';
import { GlassMaterial } from './materials/GlassMaterial';
import { useGlasswareLiquidSync } from './hooks/useGlasswareLiquidSync';

/** Represents props for BuretteObject. */
export interface BuretteObjectProps {
  instance: GlasswareInstance;
}

/** Burette glass wall thickness in meters. */
const BURETTE_WALL_THICKNESS_M = 0.0015;
/** Stopcock body width in meters. */
const STOPCOCK_WIDTH_M = 0.028;
/** Stopcock body height in meters. */
const STOPCOCK_HEIGHT_M = 0.012;
/** Stopcock body depth in meters. */
const STOPCOCK_DEPTH_M = 0.016;
/** Burette tip length in meters. */
const TIP_LENGTH_M = 0.08;
/** Burette tip top radius in meters. */
const TIP_TOP_RADIUS_M = 0.0024;
/** Burette tip bottom radius in meters (1 mm opening diameter). */
const TIP_BOTTOM_RADIUS_M = 0.0005;
/** Graduation label font size in meters. */
const LABEL_FONT_SIZE_M = 0.015;
/** Graduation 0.1 mL tick width in meters. */
const MINOR_TICK_WIDTH_M = 0.0007;
/** Graduation 0.1 mL tick height in meters. */
const MINOR_TICK_HEIGHT_M = 0.0005;
/** Graduation 0.1 mL tick depth in meters. */
const MINOR_TICK_DEPTH_M = 0.004;
/** Graduation 1 mL tick width in meters. */
const MAJOR_TICK_WIDTH_M = 0.0011;
/** Graduation 1 mL tick height in meters. */
const MAJOR_TICK_HEIGHT_M = 0.00055;
/** Graduation 1 mL tick depth in meters. */
const MAJOR_TICK_DEPTH_M = 0.006;
/** Z offset for ticks/labels so they sit on glass surface. */
const TICK_SURFACE_OFFSET_M = 0.0004;
/** Air bubble radius in meters. */
const AIR_BUBBLE_RADIUS_M = 0.002;

/** Renders a full procedural burette assembly. */
export const BuretteObject: React.FC<BuretteObjectProps> = ({ instance }) => {
  const liquidRef = useRef<THREE.Mesh | null>(null);
  const minorTickRef = useRef<THREE.InstancedMesh | null>(null);
  const majorTickRef = useRef<THREE.InstancedMesh | null>(null);

  const spec = instance.spec;
  const bodyHeightM = spec.heightMm / 1000;
  const innerRadiusM = spec.innerRadiusMm / 1000;
  const outerRadiusM = innerRadiusM + BURETTE_WALL_THICKNESS_M;
  const maxCapacity = Number(spec.maxCapacity);
  const graduationInterval = Number(spec.graduationInterval);

  const lathePoints = useMemo<THREE.Vector2[]>(
    () => [
      new THREE.Vector2(outerRadiusM * 0.96, 0),
      new THREE.Vector2(outerRadiusM, bodyHeightM * 0.05),
      new THREE.Vector2(outerRadiusM, bodyHeightM * 0.94),
      new THREE.Vector2(outerRadiusM * 1.06, bodyHeightM),
    ],
    [bodyHeightM, outerRadiusM],
  );

  const minorTickVolumes = useMemo<number[]>(() => {
    if (graduationInterval <= 0) {
      return [];
    }

    const ticks: number[] = [];
    for (let value = 0; value <= maxCapacity + 1e-6; value += graduationInterval) {
      if (Math.abs(value - Math.round(value)) > 1e-6) {
        ticks.push(Number(value.toFixed(4)));
      }
    }
    return ticks;
  }, [graduationInterval, maxCapacity]);

  const majorTickVolumes = useMemo<number[]>(() => {
    const ticks: number[] = [];
    for (let value = 0; value <= maxCapacity + 1e-6; value += 1) {
      ticks.push(value);
    }
    return ticks;
  }, [maxCapacity]);

  const majorLabelVolumes = useMemo<number[]>(() => {
    const labels: number[] = [];
    for (let value = 0; value <= maxCapacity + 1e-6; value += 5) {
      labels.push(value);
    }
    return labels;
  }, [maxCapacity]);

  useLayoutEffect(() => {
    if (minorTickRef.current) {
      const matrix = new THREE.Matrix4();
      for (let index = 0; index < minorTickVolumes.length; index += 1) {
        const y = convertVolumeToBuretteY(minorTickVolumes[index], maxCapacity, bodyHeightM);
        matrix.makeTranslation(0, y, innerRadiusM + TICK_SURFACE_OFFSET_M);
        minorTickRef.current.setMatrixAt(index, matrix);
      }
      minorTickRef.current.instanceMatrix.needsUpdate = true;
    }

    if (majorTickRef.current) {
      const matrix = new THREE.Matrix4();
      for (let index = 0; index < majorTickVolumes.length; index += 1) {
        const y = convertVolumeToBuretteY(majorTickVolumes[index], maxCapacity, bodyHeightM);
        matrix.makeTranslation(0, y, innerRadiusM + TICK_SURFACE_OFFSET_M);
        majorTickRef.current.setMatrixAt(index, matrix);
      }
      majorTickRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [bodyHeightM, innerRadiusM, majorTickVolumes, maxCapacity, minorTickVolumes]);

  useGlasswareLiquidSync(instance.id, liquidRef);

  const stopcockAngle = getBuretteOpeningAngle(instance);

  return (
    <group name="burette-object">
      <mesh castShadow receiveShadow position={[0, bodyHeightM / 2, 0]}>
        <latheGeometry args={[lathePoints, 48]} />
        <GlassMaterial dirty={instance.isDirty} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, -TIP_LENGTH_M / 2, 0]}>
        <cylinderGeometry args={[TIP_TOP_RADIUS_M, TIP_BOTTOM_RADIUS_M, TIP_LENGTH_M, 24]} />
        <GlassMaterial dirty={instance.isDirty} />
      </mesh>

      <mesh
        castShadow
        receiveShadow
        position={[outerRadiusM + STOPCOCK_WIDTH_M / 2, 0.01, 0]}
        rotation={[0, 0, THREE.MathUtils.degToRad(stopcockAngle)]}
      >
        <boxGeometry args={[STOPCOCK_WIDTH_M, STOPCOCK_HEIGHT_M, STOPCOCK_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.stand.clampMetal}
          roughness={0.26}
          metalness={0.82}
        />
      </mesh>

      <instancedMesh
        ref={minorTickRef}
        args={[undefined, undefined, minorTickVolumes.length]}
        renderOrder={2}
      >
        <boxGeometry args={[MINOR_TICK_WIDTH_M, MINOR_TICK_HEIGHT_M, MINOR_TICK_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.glassware.markings}
          roughness={0.65}
          metalness={0.05}
        />
      </instancedMesh>

      <instancedMesh
        ref={majorTickRef}
        args={[undefined, undefined, majorTickVolumes.length]}
        renderOrder={2}
      >
        <boxGeometry args={[MAJOR_TICK_WIDTH_M, MAJOR_TICK_HEIGHT_M, MAJOR_TICK_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.glassware.markings}
          roughness={0.65}
          metalness={0.05}
        />
      </instancedMesh>

      {majorLabelVolumes.map((mark) => (
        <Text
          key={`burette-label-${mark}`}
          position={[
            outerRadiusM + 0.012,
            convertVolumeToBuretteY(mark, maxCapacity, bodyHeightM),
            0,
          ]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={LABEL_FONT_SIZE_M}
          color={SCENE_RENDER_COLORS.glassware.markings}
          anchorX="left"
          anchorY="middle"
        >
          {String(mark)}
        </Text>
      ))}

      <mesh ref={liquidRef} position={[0, 0.001, 0]} visible={false} castShadow={false} receiveShadow={false}>
        <planeGeometry args={[innerRadiusM * 1.7, 1, 1, 1]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.glassware.liquidFallback}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          roughness={0.25}
          metalness={0}
        />
      </mesh>

      {instance.hasAirBubble && (
        <mesh position={[0, bodyHeightM * 0.35, 0]}>
          <sphereGeometry args={[AIR_BUBBLE_RADIUS_M, 18, 18]} />
          <meshPhysicalMaterial
            color={SCENE_RENDER_COLORS.glassware.cleanGlass}
            transmission={0.92}
            roughness={0.02}
            ior={1.33}
            thickness={0.6}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
};

/**
 * Extracts burette stopcock opening angle when the instance carries burette-specific data.
 *
 * @param instance - Generic glassware instance.
 * @returns Stopcock opening angle in degrees.
 */
function getBuretteOpeningAngle(instance: GlasswareInstance): number {
  const candidate = instance as Partial<BuretteInstance>;
  if (candidate.stopcock && Number.isFinite(candidate.stopcock.openingAngle)) {
    return candidate.stopcock.openingAngle;
  }

  return 0;
}

/**
 * Maps a burette volume mark to world-space Y location.
 * Burette scale direction is top (0 mL) to bottom (max mL).
 *
 * @param volumeMl - Mark volume in mL.
 * @param maxCapacityMl - Total burette capacity in mL.
 * @param heightM - Burette body height in meters.
 * @returns Relative Y coordinate in meters.
 */
function convertVolumeToBuretteY(volumeMl: number, maxCapacityMl: number, heightM: number): number {
  if (maxCapacityMl <= 0) {
    return 0;
  }

  const t = THREE.MathUtils.clamp(volumeMl / maxCapacityMl, 0, 1);
  return heightM / 2 - t * heightM;
}

