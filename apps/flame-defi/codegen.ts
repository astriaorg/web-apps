import type { CodegenConfig } from "@graphql-codegen/cli";

const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const earnAPIConfig: CodegenConfig = {
  documents: ["app/earn/**/*.ts", "!app/earn/generated/gql/**/*"],
  generates: {
    "./app/earn/generated/gql/": {
      schema: process.env.NEXT_PUBLIC_EARN_API_URL,
      preset: "client",
    },
  },
};

const config: CodegenConfig = {
  overwrite: true,
  documents: [...(earnAPIConfig.documents as string[])],
  generates: {
    ...earnAPIConfig.generates,
  },
};

export default config;
