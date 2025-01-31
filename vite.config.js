import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
export default defineConfig({
  build: {
    target: 'esnext', // Support modern JavaScript features and WASM
  },
  plugins: [
    nodePolyfills(),
  ],
});
