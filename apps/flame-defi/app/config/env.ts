"use client";

/**
 * Environment variables
 */
export const ENV = {
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  // networks list
  NEXT_PUBLIC_NETWORK_LIST_OPTIONS:
    process.env.NEXT_PUBLIC_NETWORK_LIST_OPTIONS,
  // links, api urls
  NEXT_PUBLIC_BRAND_URL: process.env.NEXT_PUBLIC_BRAND_URL,
  NEXT_PUBLIC_BRIDGE_URL: process.env.NEXT_PUBLIC_BRIDGE_URL,
  NEXT_PUBLIC_SWAP_URL: process.env.NEXT_PUBLIC_SWAP_URL,
  NEXT_PUBLIC_POOL_URL: process.env.NEXT_PUBLIC_POOL_URL,
  NEXT_PUBLIC_EARN_API_URL: process.env.NEXT_PUBLIC_EARN_API_URL,
  NEXT_PUBLIC_FEEDBACK_FORM_URL: process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL,
  NEXT_PUBLIC_SWAP_QUOTE_API_URL: process.env.NEXT_PUBLIC_SWAP_QUOTE_API_URL,
  // Google Analytics
  NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  // walletconnect
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  // Feature flags
  NEXT_PUBLIC_FEATURE_EARN_ENABLED:
    process.env.NEXT_PUBLIC_FEATURE_EARN_ENABLED,
  NEXT_PUBLIC_FEATURE_POOL_ENABLED:
    process.env.NEXT_PUBLIC_FEATURE_POOL_ENABLED,
  // observability
  NEXT_PUBLIC_FARO_URL: process.env.NEXT_PUBLIC_FARO_URL,
  NEXT_PUBLIC_FARO_APP_NAME: process.env.NEXT_PUBLIC_FARO_APP_NAME,
  NEXT_PUBLIC_FARO_APP_NAMESPACE: process.env.NEXT_PUBLIC_FARO_APP_NAMESPACE,
  VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID,
};

/**
 * Get environment variable
 *
 * @param {string} key - key of environment variable
 * @param {string} [defaultValue] - optional default value if environment variable is not set
 * @returns {string} value of environment variable or defaultValue if provided
 * @throws {Error} if environment variable is not set and no defaultValue is provided
 */
export const getEnvVariable = (
  key: keyof typeof ENV,
  defaultValue?: string,
): string => {
  const value = ENV[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`${key} not set`);
  }
  return value;
};

/**
 * Get optional environment variable
 *
 * @param {string} key - key of environment variable
 * @returns {string | null} value of environment variable or null if not set
 */
export const getOptionalEnvVariable = (
  key: keyof typeof ENV,
): string | null => {
  const value = ENV[key];
  return value || null;
};
