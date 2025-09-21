/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes configuration for large file uploads
  experimental: {
    // Allow larger request body size (default is 1MB)
    serverComponentsExternalPackages: [],
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

  // Webpack optimization for media files
  webpack: (config, { isServer }) => {
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
