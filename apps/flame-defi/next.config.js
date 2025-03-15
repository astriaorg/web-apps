import FaroSourceMapUploaderPlugin from "@grafana/faro-webpack-plugin";

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
  webpack: (config) => {
    // NOTE - fixes issue when building. see: https://github.com/WalletConnect/walletconnect-monorepo/issues/4466
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // uploads source maps to grafana so we can have deobfuscated stack traces
    if (process.env.GRAFANA_SOURCE_MAP_UPLOADER_API_KEY) {
      config.plugins.push(new FaroSourceMapUploaderPlugin({
        appName: process.env.NEXT_PUBLIC_FARO_APP_NAME,
        endpoint: process.env.GRAFANA_SOURCE_MAP_UPLOADER_ENDPOINT,
        appId: process.env.GRAFANA_SOURCE_MAP_UPLOADER_APP_ID,
        stackId: process.env.GRAFANA_SOURCE_MAP_UPLOADER_STACK_ID,
        apiKey: process.env.GRAFANA_SOURCE_MAP_UPLOADER_API_KEY,
        gzipContents: true,
      }))
    }

    return config;
  },
  async redirects() {
    const destination = `/well-known-${process.env.NEXT_PUBLIC_ENV ?? "develop"}/walletconnect.txt`;
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
