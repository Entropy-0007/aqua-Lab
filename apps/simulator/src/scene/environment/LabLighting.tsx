/**
 * Renders realistic fluorescent-inspired laboratory lighting for static scene illumination.
 */

import React, { useEffect } from 'react';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

import { SCENE_RENDER_COLORS } from '../../constants/colors.constants';
import { BURETTE_MOUNT_POSITION } from './EquipmentStand';

/** Represents props for LabLighting. */
export interface LabLightingProps {}

/** Ceiling fixture height in meters. */
const FIXTURE_HEIGHT_Y_M = 2.7;
/** Fluorescent tube visual length in meters. */
const FLUORESCENT_TUBE_LENGTH_M = 1.2;
/** Fluorescent tube visual width in meters. */
const FLUORESCENT_TUBE_WIDTH_M = 0.08;
/** Left fluorescent tube X position in meters. */
const TUBE_LEFT_X_M = -0.45;
/** Right fluorescent tube X position in meters. */
const TUBE_RIGHT_X_M = 0.45;
/** Fluorescent tube Z position in meters. */
const TUBE_Z_M = 0;
/** Rect area light intensity calibrated for clear bench illumination without overexposure. */
const FLUORESCENT_INTENSITY = 8;
/** Ambient fill intensity for diffuse room bounce. */
const AMBIENT_INTENSITY = 0.3;
/** Point fill intensity for soft secondary shading. */
const POINT_FILL_INTENSITY = 18;
/** Point fill distance attenuation radius in meters. */
const POINT_FILL_DISTANCE_M = 5;
/** Spot light intensity for meniscus emphasis. */
const MENISCUS_SPOT_INTENSITY = 26;
/** Spot light cone angle in radians. */
const MENISCUS_SPOT_ANGLE_RAD = 0.28;
/** Spot light penumbra softness. */
const MENISCUS_SPOT_PENUMBRA = 0.45;
/** Spot light decay exponent. */
const MENISCUS_SPOT_DECAY = 2;
/** Spot light source position in meters. */
const MENISCUS_SPOT_POSITION: readonly [number, number, number] = [0.25, 2.5, 0.15];

/** Renders static PBR-friendly laboratory lighting fixtures and fill lights. */
export const LabLighting: React.FC<LabLightingProps> = () => {
  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

  return (
    <group name="lab-lighting">
      <ambientLight color={SCENE_RENDER_COLORS.lighting.ambientFill} intensity={AMBIENT_INTENSITY} />

      <rectAreaLight
        position={[TUBE_LEFT_X_M, FIXTURE_HEIGHT_Y_M, TUBE_Z_M]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={FLUORESCENT_TUBE_LENGTH_M}
        height={FLUORESCENT_TUBE_WIDTH_M}
        intensity={FLUORESCENT_INTENSITY}
        color={SCENE_RENDER_COLORS.lighting.fluorescentTube}
      />
      <rectAreaLight
        position={[TUBE_RIGHT_X_M, FIXTURE_HEIGHT_Y_M, TUBE_Z_M]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={FLUORESCENT_TUBE_LENGTH_M}
        height={FLUORESCENT_TUBE_WIDTH_M}
        intensity={FLUORESCENT_INTENSITY}
        color={SCENE_RENDER_COLORS.lighting.fluorescentTube}
      />

      <pointLight
        castShadow
        position={[0, 1.9, 0.95]}
        intensity={POINT_FILL_INTENSITY}
        distance={POINT_FILL_DISTANCE_M}
        decay={2}
        color={SCENE_RENDER_COLORS.lighting.fluorescentTube}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <spotLight
        castShadow
        position={MENISCUS_SPOT_POSITION}
        target-position={[
          BURETTE_MOUNT_POSITION.x,
          BURETTE_MOUNT_POSITION.y,
          BURETTE_MOUNT_POSITION.z,
        ]}
        intensity={MENISCUS_SPOT_INTENSITY}
        angle={MENISCUS_SPOT_ANGLE_RAD}
        penumbra={MENISCUS_SPOT_PENUMBRA}
        decay={MENISCUS_SPOT_DECAY}
        distance={4}
        color={SCENE_RENDER_COLORS.lighting.meniscusSpot}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
};

