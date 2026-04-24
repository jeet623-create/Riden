import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  // Webhook body parsing is done manually inside the route
  // so we don't need to tweak body size limits here.
};

export default config;
