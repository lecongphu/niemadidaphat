/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Cloudflare Pages
  output: 'standalone',
  
  // External packages for server components
  serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
  
  // Optimize for Cloudflare Pages deployment
  experimental: {
    // Disable cache to reduce build size
    cacheHandler: undefined,
    // Enable SWC minification for smaller bundles
    swcMinify: true,
    // Optimize turbo for smaller builds
    turbo: {
      rules: {},
    },
    // Disable build cache to reduce size
    buildCache: false,
    // Optimize CSS
    optimizeCss: true,
  },
  
  // Generate stable build ID for static assets
  generateBuildId: async () => {
    return 'build-' + process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'static';
  },
  
  // Asset prefix for Cloudflare Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Webpack configuration for Cloudflare Pages
  webpack: (config, { isServer, dev }) => {
    // Completely disable cache for Cloudflare Pages
    config.cache = false;
    
    // Optimize for Cloudflare Pages - aggressive chunk splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000, // Keep chunks under 244KB (25MB/100 chunks)
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              enforce: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              maxSize: 244000,
              enforce: true,
            },
            // Split large libraries separately
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 20,
              maxSize: 244000,
            },
            aws: {
              test: /[\\/]node_modules[\\/]@aws-sdk[\\/]/,
              name: 'aws',
              chunks: 'all',
              priority: 20,
              maxSize: 244000,
            },
          },
        },
        // Enable tree shaking
        usedExports: true,
        sideEffects: false,
      };
    }

    // Audio file handling
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a|webm|mp4)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    // Image file handling
    config.module.rules.push({
      test: /\.(jpg|jpeg|png|webp|gif)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/images/',
          outputPath: 'static/images/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    return config;
  },
  // Image optimization for Bunny CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.b-cdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.storage.bunnycdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.niemadidaphat.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Headers for audio optimization and static assets
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/upload/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Optimize bundle size
  experimental: {
    optimizePackageImports: ['react-h5-audio-player', '@supabase/supabase-js', '@aws-sdk/client-s3'],
    // Disable static optimization for smaller builds
    staticGenerationRetryCount: 1,
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Compression
  compress: true,
  
  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
