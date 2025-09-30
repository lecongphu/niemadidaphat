/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Cloudflare Pages
  output: 'standalone',
  
  // External packages for server components
  serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
  
  // Optimize for Cloudflare Pages deployment
  experimental: {
    // Enable SWC minification for smaller bundles
    swcMinify: true,
    // Optimize CSS
    optimizeCss: true,
  },
  
  // Generate stable build ID for static assets
  generateBuildId: async () => {
    return 'build-' + process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'static';
  },
  
  // Asset prefix for Cloudflare Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Enable cache for better performance
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Webpack configuration for Cloudflare Pages
  webpack: (config, { isServer, dev }) => {
    // Restore normal cache behavior
    // config.cache = false; // Commented out to restore cache
    
    // Optimize for Cloudflare Pages - moderate chunk splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
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
  // Image optimization for Cloudflare R2
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
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
