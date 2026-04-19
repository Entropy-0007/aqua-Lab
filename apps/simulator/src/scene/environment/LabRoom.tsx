/**
 * Renders static laboratory room geometry including shell, floor, and ceiling surfaces.
 */

import React from 'react';
import * as THREE from 'three';

import { SCENE_RENDER_COLORS } from '../../constants/colors.constants';

/** Represents props for LabRoom. */
export interface LabRoomProps {}

/** Room width in meters. */
const ROOM_WIDTH_M = 6;
/** Room depth in meters. */
const ROOM_DEPTH_M = 4;
/** Room height in meters. */
const ROOM_HEIGHT_M = 3;
/** Thin floor slab thickness in meters. */
const FLOOR_THICKNESS_M = 0.05;
/** Thin ceiling slab thickness in meters. */
const CEILING_THICKNESS_M = 0.05;

/** Placeholder floor texture map slot for Stage 14 asset integration. */
const FLOOR_TEXTURE_MAP: THREE.Texture | null = null;
/** Placeholder wall texture map slot for Stage 14 asset integration. */
const WALL_TEXTURE_MAP: THREE.Texture | null = null;
/** Placeholder ceiling texture map slot for Stage 14 asset integration. */
const CEILING_TEXTURE_MAP: THREE.Texture | null = null;

/** Renders the enclosing room shell with physically based surfaces. */
export const LabRoom: React.FC<LabRoomProps> = () => {
  return (
    <group name="lab-room">
      <mesh position={[0, ROOM_HEIGHT_M / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH_M, ROOM_HEIGHT_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.room.wallPaint}
          roughness={0.9}
          metalness={0}
          side={THREE.BackSide}
          map={WALL_TEXTURE_MAP ?? undefined}
        />
      </mesh>

      <mesh position={[0, FLOOR_THICKNESS_M / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH_M, FLOOR_THICKNESS_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.room.floorTile}
          roughness={0.2}
          metalness={0}
          map={FLOOR_TEXTURE_MAP ?? undefined}
        />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT_M - CEILING_THICKNESS_M / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH_M, CEILING_THICKNESS_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial
          color={SCENE_RENDER_COLORS.room.ceilingTile}
          roughness={1}
          metalness={0}
          map={CEILING_TEXTURE_MAP ?? undefined}
        />
      </mesh>

      {/* Stage 14 texture UV wiring guidance:
          1) For walls, compute uv = [x / ROOM_WIDTH_M, y / ROOM_HEIGHT_M] on inner faces.
          2) For floor/ceiling tiling, use uv = [x / tileSizeM, z / tileSizeM].
          3) Supply repeat-wrapped maps and set texture.repeat per physical tile dimensions. */}
    </group>
  );
};

