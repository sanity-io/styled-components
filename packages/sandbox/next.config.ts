import type { NextConfig } from 'next';

const config: NextConfig = {
  compiler: { styledComponents: true },
  experimental: { viewTransition: true },
};

export default config;
