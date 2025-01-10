"use client";

/**
 * Environment variables
 */
export const ENV = {
  NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
  // FIXME - should be renamed to NEXT_PUBLIC_COSMOS_CHAINS,
  //  but requires updates to envars in Vercel. note for self to update.
  NEXT_PUBLIC_IBC_CHAINS: process.env.NEXT_PUBLIC_IBC_CHAINS,
  NEXT_PUBLIC_EVM_CHAINS: process.env.NEXT_PUBLIC_EVM_CHAINS,
  NEXT_PUBLIC_BRAND_URL: process.env.NEXT_PUBLIC_BRAND_URL,
  NEXT_PUBLIC_BRIDGE_URL: process.env.NEXT_PUBLIC_BRIDGE_URL,
  NEXT_PUBLIC_SWAP_URL: process.env.NEXT_PUBLIC_SWAP_URL,
  NEXT_PUBLIC_POOL_URL: process.env.NEXT_PUBLIC_POOL_URL,
  NEXT_PUBLIC_FEEDBACK_FORM_URL: process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL,
  NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
};

/**
 * Get environment variable
 *
 * @param {string} key - key of environment variable
 * @returns {string} value of environment variable
 * @throws {Error} if environment variable is not set
 */
export const getEnvVariable = (key: keyof typeof ENV): string => {
  const value = ENV[key];
  if (value === undefined) {
    throw new Error(`${key} not set`);
  }
  return value;
};
