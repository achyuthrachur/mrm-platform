import type { NextConfig } from 'next';
import { resolve } from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Silence workspace-root inference warning in corporate environments
  outputFileTracingRoot: resolve(process.cwd()),
};

export default nextConfig;
