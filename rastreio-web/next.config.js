import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const supabasePath = require.resolve('@supabase/supabase-js/dist/index.mjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose',
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@supabase/supabase-js': supabasePath,
    };
    return config;
  },
};

export default nextConfig;
