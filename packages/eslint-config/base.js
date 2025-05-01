import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { rules as customRules } from "./rules/index.js";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", "coverage/**"],
  },
  {
    plugins: {
      "@repo": {
        rules: customRules,
      },
    },
    rules: {
      "@repo/prefer-optional-syntax": "warn",
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "warn",
        {
          "groups": [
            // Node.js builtins and third-party packages
            ["^\\u0000", "^node:", "^@(?!repo|/)", "^[a-z]"],
            // Empty line
            ["^"],
            // Internal packages (@repo/ prefixed and absolute imports from the project)
            ["^@repo", "^@/", "^app/", "^borrow/", "^bridge/", "^components/", "^config/", "^constants/", "^earn/", "^features/", "^hooks/", "^icons/", "^logos/", "^pool/", "^swap/", "^testing/", "^utils/"],
            // Empty line
            ["^"],
            // Relative imports
            ["^\\."]
          ]
        }
      ],
      "simple-import-sort/exports": "warn"
    },
  },
];
