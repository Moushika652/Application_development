import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api requests to the Express backend
    proxy: { '/api': 'http://localhost:5000' },
  },
});
