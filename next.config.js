/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Cloudflare Pages
  output: 'standalone',
  
  // Disable cache for Cloudflare Pages deployment
  experimental: {
    // Allow larger request body size (default is 1MB)
    serverComponentsExternalPackages: [],
    // Disable cache to reduce build size
    cacheHandler: undefined,
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

  // Headers for audio optimization
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
    optimizePackageImports: ['react-h5-audio-player'],
  },

  // Webpack optimization for media files and Cloudflare Pages
  webpack: (config, { isServer }) => {
    // Optimize for Cloudflare Pages - reduce bundle size
    if (!isServer) {
      config.optimization.splitChunks = {
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
};

module.exports = nextConfig;
