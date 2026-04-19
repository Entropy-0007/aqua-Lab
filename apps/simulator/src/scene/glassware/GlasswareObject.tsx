/**
 * Renders one glassware instance and delegates vessel-specific mesh construction.
 */

import React from 'react';

import { SCENE_RENDER_COLORS } from '../../constants/colors.constants';
import { GlasswareId } from '../../types/glassware.types';
import type { GlasswareInstance } from '../../types/glassware.types';
import { BuretteObject } from './BuretteObject';
import { ConicalFlaskObject } from './ConicalFlaskObject';
import { GenericVesselObject } from './GenericVesselObject';
import { PipetteObject } from './PipetteObject';

/** Represents props for GlasswareObject. */
export interface GlasswareObjectProps {
  instance: GlasswareInstance;
}

/** Selection glow radial padding around vessel in meters. */
const SELECTION_GLOW_RADIUS_PADDING_M = 0.004;
/** Selection glow height padding around vessel in meters. */
const SELECTION_GLOW_HEIGHT_PADDING_M = 0.008;
/** Selection glow opacity value. */
const SELECTION_GLOW_OPACITY = 0.14;
/** Dirty film overlay opacity. */
const DIRTY_FILM_OPACITY = 0.1;

/** Renders a glassware instance wrapper with overlays and type-specific object renderer. */
export const GlasswareObject: React.FC<GlasswareObjectProps> = ({ instance }) => {
  const radiusM = instance.spec.innerRadiusMm / 1000;
  const heightM = instance.spec.heightMm / 1000;

  return (
    <group
      name={`glassware-${instance.spec.id.toLowerCase()}`}
      position={[instance.position.x, instance.position.y, instance.position.z]}
      rotation={[instance.rotation.x, instance.rotation.y, instance.rotation.z]}
    >
      {renderSpecializedObject(instance)}

      {instance.isSelected && (
        <mesh position={[0, heightM / 2, 0]}>
          <cylinderGeometry
            args={[
              radiusM + SELECTION_GLOW_RADIUS_PADDING_M,
              radiusM + SELECTION_GLOW_RADIUS_PADDING_M,
              heightM + SELECTION_GLOW_HEIGHT_PADDING_M,
              32,
              1,
              true,
            ]}
          />
          <meshStandardMaterial
            color={SCENE_RENDER_COLORS.glassware.selectedEmissive}
            emissive={SCENE_RENDER_COLORS.glassware.selectedEmissive}
            emissiveIntensity={0.55}
            transparent
            opacity={SELECTION_GLOW_OPACITY}
            depthWrite={false}
          />
        </mesh>
      )}

      {instance.isDirty && (
        <mesh position={[0, heightM / 2, 0]}>
          <cylinderGeometry args={[radiusM + 0.001, radiusM + 0.001, heightM, 24, 1, true]} />
          <meshStandardMaterial
            color={SCENE_RENDER_COLORS.glassware.dirtyFilm}
            transparent
            opacity={DIRTY_FILM_OPACITY}
            roughness={0.95}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

/**
 * Delegates rendering to the vessel-specific mesh component by glassware id.
 *
 * @param instance - Glassware instance to render.
 * @returns Specialized glassware component.
 */
function renderSpecializedObject(instance: GlasswareInstance): React.ReactElement {
  switch (instance.spec.id) {
    case GlasswareId.BURETTE:
      return <BuretteObject instance={instance} />;
    case GlasswareId.CONICAL_FLASK:
      return <ConicalFlaskObject instance={instance} />;
    case GlasswareId.PIPETTE:
      return <PipetteObject instance={instance} />;
    default:
      return <GenericVesselObject instance={instance} />;
  }
}

