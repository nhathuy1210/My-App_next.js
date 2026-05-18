/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Cho phép tất cả https domains tạm thời
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;