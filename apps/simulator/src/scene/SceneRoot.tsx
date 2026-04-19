/**
 * Defines the root R3F scene canvas and static environment composition order.
 */

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Html, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

import { CameraController } from './cameras/CameraController';
import { EquipmentStand } from './environment/EquipmentStand';
import { LabLighting } from './environment/LabLighting';
import { LabRoom } from './environment/LabRoom';
import { WorkBench } from './environment/WorkBench';

/** Represents props for SceneRoot. */
export interface SceneRootProps {}

/** Represents props for LabLoadingScreen fallback placeholder. */
export interface LabLoadingScreenProps {}

/** Renders a minimal loading placeholder while scene assets/components suspend. */
export const LabLoadingScreen: React.FC<LabLoadingScreenProps> = () => (
  <Html center>{'Loading lab environment...'}</Html>
);

/** Renders the root static 3D scene foundation for the simulator. */
const SceneRoot: React.FC<SceneRootProps> = () => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 2], fov: 50, near: 0.01, far: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <Suspense fallback={<LabLoadingScreen />}>
        <Environment preset="city" background={false} />
        <LabLighting />
        <LabRoom />
        <WorkBench />
        <EquipmentStand />
        <CameraController controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          minDistance={0.3}
          maxDistance={3}
          maxPolarAngle={THREE.MathUtils.degToRad(85)}
        />
      </Suspense>
    </Canvas>
  );
};

export default SceneRoot;

