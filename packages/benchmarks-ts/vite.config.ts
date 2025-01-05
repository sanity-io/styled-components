import react from '@vitejs/plugin-react';
// import { createRequire } from 'module';

import { defineConfig } from 'vite';

// const require = createRequire(import.meta.url);

// const reactStrictDomPreset = require('react-strict-dom/babel-preset');

// https://vite.dev/config/
export default defineConfig({
  define: {
    __VERSION__: JSON.stringify('benchmark'),
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-react-native-web',
          ['styled-jsx/babel', { optimizeForSpeed: true }],
        ],
        // presets: [[reactStrictDomPreset, { debug: true, dev: true }]],
      },
      // babel: { configFile: true },
      // include: ['node_modules/react-strict-dom/*.js'],
    }),
  ],
});
