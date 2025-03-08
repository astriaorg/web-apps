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
    initializeFaro({
      url: getEnvVariable("NEXT_PUBLIC_FARO_URL"),
      app: {
        name: getEnvVariable("NEXT_PUBLIC_FARO_APP_NAME", "flame-defi-local"),
        // use the vercel branch url if a namespace isn't set, like for preview deployments
        namespace:
          getOptionalEnvVariable("NEXT_PUBLIC_FARO_APP_NAMESPACE") ??
          getOptionalEnvVariable("VERCEL_BRANCH_URL") ??
          undefined,
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
