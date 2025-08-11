import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance Configuration:
  // - Set DISABLE_SOURCE_MAPS=true in .env.local to disable source maps if you experience performance issues
  // - The default 'eval-cheap-module-source-map' provides good debugging with better performance than 'eval-source-map'
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@heroicons/react', 'framer-motion', 'recharts'],
  },

  // Enable Turbopack (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable emotion if you use it
    emotion: false,
  },

  // Image optimization
  images: {
    // Disable image optimization in development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
    // Optimize image formats
    formats: ['image/webp', 'image/avif'],
  },

  // Transpile packages for better compatibility
  transpilePackages: ['framer-motion'],

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Fix for framer-motion export * issue in Next.js 15
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Add specific module resolution for framer-motion
    config.module.rules.push({
      test: /node_modules\/framer-motion/,
      type: 'javascript/auto',
    });

    // Configure module resolution to handle ESM properly
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };

    // Development optimizations
    if (dev) {
      // Use fast source maps in development for better performance
      // If you experience performance issues, you can set this to false
      config.devtool = process.env.DISABLE_SOURCE_MAPS === 'true' 
        ? false 
        : 'eval-cheap-module-source-map';

      // Optimize module resolution
      config.resolve.modules = ['node_modules'];

      // Exclude heavy packages from bundle analysis
      config.externals = config.externals || [];
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = (context, request, callback) => {
          if (request.includes('fsevents') || request.includes('chokidar')) {
            return callback(null, 'commonjs ' + request);
          }
          return originalExternals(context, request, callback);
        };
      }
    }

    // Production optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };

      // Optimize chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Optimize static generation
  generateEtags: false,

  // Enable compression
  compress: true,

  // Optimize headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
