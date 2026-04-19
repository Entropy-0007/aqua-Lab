/**
 * Renders all glassware instances from global state as scene objects.
 */

import React, { useMemo } from 'react';

import { useStore } from '../../state/store';
import type { GlasswareInstance } from '../../types/glassware.types';
import { GlasswareObject } from './GlasswareObject';

/** Represents props for GlasswareRenderer. */
export interface GlasswareRendererProps {}

/** Renders mapped glassware objects from Zustand glassware slice state. */
export const GlasswareRenderer: React.FC<GlasswareRendererProps> = () => {
  const instances = useStore((state) => state.instances);

  const instanceList = useMemo<GlasswareInstance[]>(
    () => Array.from(instances.values()),
    [instances],
  );

  if (instanceList.length === 0) {
    return <group name="glassware-renderer-empty" />;
  }

  return (
    <group name="glassware-renderer">
      {instanceList.map((instance) => (
        <GlasswareObject key={instance.id} instance={instance} />
      ))}
    </group>
  );
};

