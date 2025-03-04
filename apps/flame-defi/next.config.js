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
    const redirects = [
      {
        source: "/.well-known/walletconnect.txt",
        destination,
        permanent: true,
      },
    ];

    // If EARN feature is disabled, redirect all earn pages to home
    if (process.env.NEXT_PUBLIC_FEATURE_EARN_ENABLED !== "true") {
      redirects.push(
        {
          source: "/earn",
          destination: "/",
          permanent: false,
        },
        {
          source: "/earn/:path*",
          destination: "/",
          permanent: false,
        }
      );
    }

    return redirects;
  },
};

export default nextConfig;
