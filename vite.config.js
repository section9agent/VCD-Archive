import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, 'Components'),
      '@/api': path.resolve(__dirname, 'src/api'),
      '@/utils': path.resolve(__dirname, 'utils.js'),
      '@/lib': path.resolve(__dirname, 'lib'),
    },
  },
  server: {
    port: 5173,
  },
});
