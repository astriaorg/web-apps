"use client";

import {
  faro,
  getWebInstrumentations,
  initializeFaro,
} from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

import { getEnvVariable, getOptionalEnvVariable } from "../../config";

export function Observability() {
  // skip if already initialized
  if (faro.api) {
    return null;
  }

  try {
    const faroUrl = getOptionalEnvVariable("NEXT_PUBLIC_FARO_URL");
    if (!faroUrl) {
      console.warn(
        "Skipping Faro initialization: NEXT_PUBLIC_FARO_URL is not set",
      );
      return null;
    }
    initializeFaro({
      url: faroUrl,
      app: {
        name: getEnvVariable("NEXT_PUBLIC_FARO_APP_NAME", "flame-defi-local"),
        namespace:
          getOptionalEnvVariable("NEXT_PUBLIC_FARO_APP_NAMESPACE") ?? undefined,
        version: getEnvVariable("VERCEL_DEPLOYMENT_ID", "local"),
        environment: getEnvVariable("NEXT_PUBLIC_ENV"),
      },

      instrumentations: [
        // Mandatory, omits default instrumentations otherwise.
        ...getWebInstrumentations(),

        // Tracing package to get end-to-end visibility for HTTP requests.
        new TracingInstrumentation(),
      ],
    });
  } catch (error) {
    console.error("Could not initialize Faro", error);
    return null;
  }
  return null;
}
