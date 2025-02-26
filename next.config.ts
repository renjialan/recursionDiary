import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // New format requires configuration object
      bodySizeLimit: '2mb', // Set appropriate limit
      allowedOrigins: [
        'localhost:3000',
        // Add your production domain here
      ],
    },
  },
}

export default nextConfig