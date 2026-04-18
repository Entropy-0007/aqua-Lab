/**
 * Configures Vite for the simulator app with React support and path aliases.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = path.resolve(__dirname, 'src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(srcPath, 'core'),
      '@engine': path.resolve(srcPath, 'engine'),
      '@scene': path.resolve(srcPath, 'scene'),
      '@state': path.resolve(srcPath, 'state'),
      '@ui': path.resolve(srcPath, 'ui'),
      '@hooks': path.resolve(srcPath, 'hooks'),
      '@utils': path.resolve(srcPath, 'utils'),
      '@types': path.resolve(srcPath, 'types'),
      '@constants': path.resolve(srcPath, 'constants'),
    },
  },
});