# Astria Web Apps

This monorepo contains web applications and UI components for the Astria
ecosystem.

## What's inside?

### Apps

- `flame-defi`: A Next.js app for interacting with Flame DeFi - an EVM built
  on the Astria sequencer

### Packages

- `@repo/ui`: A React component library shared across applications
- `@repo/eslint-config`: ESLint configurations (includes `eslint-config-next`
  and `eslint-config-prettier`)
- `@repo/typescript-config`: TypeScript configurations used throughout the
  monorepo
- `@repo/flame-types`: Common types used across the Flame DeFi application

Each package/app is built with TypeScript.

### Utilities

This repository uses Turborepo and includes the following development tools:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Just](https://just.systems/man/en/) for task automation

## Development

### Build

To build all apps and packages:

```shell
npm run build
```

### Develop

To run all apps:

```shell
npm run dev
```

Or use Just to run specific tasks (see the justfile):

```shell
just <task-name>
```

## Useful Links

Learn more about the tools used in this repository:

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
