/**
 * Boots the simulator React application and mounts the static 3D scene root.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

import SceneRoot from './scene/SceneRoot';

/** Represents props for App. */
export interface AppProps {}

/** Renders the top-level simulator app shell. */
export const App: React.FC<AppProps> = () => {
  return <SceneRoot />;
};

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container element with id "root" was not found.');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

