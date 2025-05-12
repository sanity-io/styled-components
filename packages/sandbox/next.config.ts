import type { NextConfig } from 'next';

const config: NextConfig = {
  compiler: { styledComponents: true },
  experimental: { viewTransition: true },
  env: {
    SC_DISABLE_SPEEDY: 'false',
  },
};

export default config;
