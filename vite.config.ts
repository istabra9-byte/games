import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Universal relative base path for GitHub Pages & Netlify deployment
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss()
  ],
});
