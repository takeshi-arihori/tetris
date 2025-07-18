/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // React 19 features
  },
  // 画像最適化設定
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // 音声ファイル等の静的ファイル配信設定
  async headers() {
    return [
      {
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
        ],
      },
    ];
  },
};

export default nextConfig;