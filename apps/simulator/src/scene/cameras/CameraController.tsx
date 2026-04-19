/**
 * Manages smooth camera transitions between predefined lab-view modes.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

import { useCameraMode } from '../../state/store';
import type { CameraMode } from '../../state/slices/ui.slice';
import { BENCH_SURFACE_Y } from '../environment/WorkBench';
import { BURETTE_MOUNT_POSITION } from '../environment/EquipmentStand';

/** Represents props for CameraController. */
export interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

/** Camera transition lerp factor per frame for smooth movement. */
const CAMERA_LERP_FACTOR = 0.05;
/** Flask opening reference point on bench in meters. */
const FLASK_OPENING_TARGET = new THREE.Vector3(0.1, BENCH_SURFACE_Y + 0.12, 0.05);
/** Bench center target for overview framing. */
const BENCH_CENTER_TARGET = new THREE.Vector3(0, BENCH_SURFACE_Y - 0.02, 0);
/** Burette meniscus target point for zoom framing. */
const BURETTE_MENISCUS_TARGET = new THREE.Vector3(
  BURETTE_MOUNT_POSITION.x,
  BURETTE_MOUNT_POSITION.y + 0.24,
  BURETTE_MOUNT_POSITION.z,
);

/** Represents a camera preset with position and look target vectors. */
interface CameraPreset {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/** Resolves camera presets by camera mode. */
const createCameraPresets = (): Record<Exclude<CameraMode, 'orbit'>, CameraPreset> => ({
  overview: {
    position: new THREE.Vector3(0, 1.5, 2),
    target: BENCH_CENTER_TARGET.clone(),
  },
  'burette-zoom': {
    position: new THREE.Vector3(0.05, 1.1, 0.4),
    target: BURETTE_MENISCUS_TARGET.clone(),
  },
  'flask-zoom': {
    position: new THREE.Vector3(0.1, 0.95, 0.45),
    target: FLASK_OPENING_TARGET.clone(),
  },
});

/** Controls camera interpolation based on ui.slice cameraMode state. */
export const CameraController: React.FC<CameraControllerProps> = ({ controlsRef }) => {
  const cameraMode = useCameraMode();
  const { camera } = useThree();
  const presets = useMemo(createCameraPresets, []);

  const currentPositionRef = useRef(new THREE.Vector3());
  const currentTargetRef = useRef(BENCH_CENTER_TARGET.clone());
  const desiredPositionRef = useRef(new THREE.Vector3());
  const desiredTargetRef = useRef(BENCH_CENTER_TARGET.clone());
  const orbitPositionRef = useRef(new THREE.Vector3(0, 1.5, 2));
  const orbitTargetRef = useRef(BENCH_CENTER_TARGET.clone());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      currentPositionRef.current.copy(camera.position);
      desiredPositionRef.current.copy(camera.position);
      desiredTargetRef.current.copy(BENCH_CENTER_TARGET);
      initializedRef.current = true;
    }
  }, [camera]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }

    if (cameraMode === 'orbit') {
      desiredPositionRef.current.copy(orbitPositionRef.current);
      desiredTargetRef.current.copy(orbitTargetRef.current);
      return;
    }

    const preset = presets[cameraMode];
    desiredPositionRef.current.copy(preset.position);
    desiredTargetRef.current.copy(preset.target);
  }, [cameraMode, presets]);

  useFrame(() => {
    const controls = controlsRef.current;

    if (cameraMode === 'orbit') {
      if (controls) {
        controls.enabled = true;
        controls.update();
        orbitTargetRef.current.copy(controls.target);
      }

      orbitPositionRef.current.copy(camera.position);
      currentPositionRef.current.copy(camera.position);
      currentTargetRef.current.copy(orbitTargetRef.current);
      return;
    }

    if (controls) {
      controls.enabled = false;
    }

    currentPositionRef.current.lerp(desiredPositionRef.current, CAMERA_LERP_FACTOR);
    currentTargetRef.current.lerp(desiredTargetRef.current, CAMERA_LERP_FACTOR);

    camera.position.copy(currentPositionRef.current);
    camera.lookAt(currentTargetRef.current);
  });

  return null;
};

