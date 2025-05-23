import { RuleTester } from "eslint";

import preferOptionalSyntax from "./prefer-optional-syntax.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: await import("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("prefer-optional-syntax", preferOptionalSyntax, {
  valid: [
    // Valid optional property syntax
    {
      code: `
        interface TestInterface {
          prop?: string;
        }
      `,
    },
    // Valid required property
    {
      code: `
        interface TestInterface {
          prop: string;
        }
      `,
    },
    // Union without undefined
    {
      code: `
        interface TestInterface {
          prop: string | number;
        }
      `,
    },
  ],

  invalid: [
    // Basic union with undefined
    {
      code: `
        interface TestInterface {
          prop: string | undefined;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          prop?: string
        }
      `,
    },
    // Multiple types with undefined
    {
      code: `
        interface TestInterface {
          prop: string | number | undefined;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          prop?: string | number
        }
      `,
    },
    // Function parameter with union type (the scenario that's not currently fixed)
    {
      code: `
        interface TestInterface {
          setStatus: (status: TransactionStatus | undefined) => void;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          setStatus: (status?: TransactionStatus) => void
        }
      `,
    },
    // Function with multiple parameters where one has union with undefined
    {
      code: `
        interface TestInterface {
          update: (id: string, value: number | undefined) => void;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          update: (id: string, value?: number) => void
        }
      `,
    },
  ],
});
