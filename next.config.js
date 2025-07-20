/** @type {import('next').NextConfig} */
const nextConfig = {
  // パフォーマンス最適化設定
  poweredByHeader: false,
  compress: true,
  
  // 実験的機能
  experimental: {
    // optimizeCss: true, // critterモジュール依存のため無効化
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  // 画像最適化設定
  images: {
    domains: ['localhost', 'supabase.co', 'your-supabase-url.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1年
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // バンドル分析
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      )
      return config
    },
  }),

  // Webpack最適化
  webpack: (config, { dev, isServer }) => {
    // プロダクションビルドでのTreeShaking強化
    if (!dev && !isServer) {
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    // 音声ファイルの処理
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/sounds/',
          outputPath: 'static/sounds/',
        },
      },
    })

    return config
  },

  // 静的ファイルの最適化とキャッシュ設定
  async headers() {
    return [
      {
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        source: '/img/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      // セキュリティヘッダー
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // リダイレクト設定
  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/profile/settings',
        permanent: true,
      },
    ];
  },

  // 環境変数の最適化
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;