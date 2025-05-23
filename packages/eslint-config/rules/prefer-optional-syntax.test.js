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
    // Array of unions with undefined (should NOT be converted - different semantics)
    {
      code: `
        interface TestInterface {
          items: (string | undefined)[];
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
    // Function type that is itself optional (union with undefined at function level)
    {
      code: `
        interface TestInterface {
          update: ((id: string, value: number | undefined) => void) | undefined;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
        {
          message: "Consider using optional syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          update?: (id: string, value?: number) => void
        }
      `,
    },
    // Method syntax (now fixable!)
    {
      code: `
        interface TestInterface {
          method(value: string | undefined): void;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          method(value?: string): void
        }
      `,
    },
    // Function that returns a function with optional parameter (now fixable!)
    {
      code: `
        interface TestInterface {
          createHandler: () => (value: string | undefined) => void;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          createHandler: () => (value?: string) => void
        }
      `,
    },
    // Multiple parameters with unions containing undefined
    {
      code: `
        interface TestInterface {
          update: (id: string | undefined, value: number | undefined) => void;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          update: (id?: string, value?: number) => void
        }
      `,
    },
    // Union with null AND undefined (should convert to optional but keep null)
    {
      code: `
        interface TestInterface {
          handler: (value: string | null | undefined) => void;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          handler: (value?: string | null) => void
        }
      `,
    },
    // Readonly property with union containing undefined
    {
      code: `
        interface TestInterface {
          readonly config: string | undefined;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          readonly config?: string
        }
      `,
    },
    // Generic type parameter with undefined
    {
      code: `
        interface TestInterface<T> {
          handler: (value: T | undefined) => void;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface<T> {
          handler: (value?: T) => void
        }
      `,
    },
    // Complex case: readonly method with nested function return and multiple union parameters
    {
      code: `
        interface TestInterface {
          readonly createProcessor: (config: string | undefined) => (data: number | undefined, callback: ((error: Error | undefined) => void) | undefined) => Promise<string>;
        }
      `,
      errors: [
        {
          message: "Use optional property syntax (prop?: type) instead of union with undefined",
        },
        {
          message: "Consider using optional syntax (prop?: type) instead of union with undefined",
        },
      ],
      output: `
        interface TestInterface {
          readonly createProcessor: (config?: string) => (data?: number, callback?: (error?: Error) => void) => Promise<string>
        }
      `,
    },
  ],
});
