/**
 * Provides a reusable physically based glass material for procedural glassware meshes.
 */

import React from 'react';

import { SCENE_RENDER_COLORS } from '../../../constants/colors.constants';

/** Represents props for GlassMaterial. */
export interface GlassMaterialProps {
  dirty?: boolean;
}

/** Clean glass transmission coefficient. */
const CLEAN_TRANSMISSION = 0.95;
/** Dirty glass transmission coefficient. */
const DIRTY_TRANSMISSION = 0.78;
/** Physical thickness in millimeters for refraction approximation. */
const GLASS_THICKNESS_MM = 3;
/** Surface roughness for polished borosilicate glass. */
const GLASS_ROUGHNESS = 0.05;
/** Index of refraction for borosilicate glass. */
const GLASS_IOR = 1.52;
/** Environment map response for reflective highlights. */
const GLASS_ENV_MAP_INTENSITY = 1;

/** Returns a configured MeshPhysicalMaterial for photorealistic glass rendering. */
export const GlassMaterial: React.FC<GlassMaterialProps> = ({ dirty = false }) => {
  return (
    <meshPhysicalMaterial
      transmission={dirty ? DIRTY_TRANSMISSION : CLEAN_TRANSMISSION}
      thickness={GLASS_THICKNESS_MM}
      roughness={GLASS_ROUGHNESS}
      ior={GLASS_IOR}
      color={dirty ? SCENE_RENDER_COLORS.glassware.dirtyGlassTint : SCENE_RENDER_COLORS.glassware.cleanGlass}
      envMapIntensity={GLASS_ENV_MAP_INTENSITY}
      metalness={0}
      transparent
      opacity={1}
    />
  );
};

