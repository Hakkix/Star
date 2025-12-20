/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimize for production
  poweredByHeader: false,

  // Required for Three.js and R3F
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // Webpack configuration for better Three.js support
  webpack: (config, { isServer }) => {
    // Handle shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader'],
    });

    // Fix for modules that need browser-specific features
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },

  // Enable HTTPS in development (required for sensor access on iOS)
  // Note: In local dev, you may need to run: `mkcert localhost`
  experimental: {
    // Add any experimental features here if needed
  },
};

export default nextConfig;
