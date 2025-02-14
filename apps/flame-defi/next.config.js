/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.morpho.org",
      },
    ],
  },
  // NOTE - fixes issue when building. see: https://github.com/WalletConnect/walletconnect-monorepo/issues/4466
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  async redirects() {
    const destination = `/well-known-${process.env.NEXT_ENV ?? "develop"}/walletconnect.txt`;
    return [
      {
        source: "/.well-known/walletconnect.txt",
        destination,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
