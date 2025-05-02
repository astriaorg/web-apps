# recipes for the flame defi app
mod flame-defi 'apps/flame-defi'
mod e2e-tests 'apps/flame-defi/e2e-tests'

_default:
  @just --list

# lint markdown files
lint-md:
  docker run --rm -v $PWD:/workdir davidanson/markdownlint-cli2:v0.8.1 \
    "**/*.md" \
    "#node_modules" \
    "#**/node_modules" \
    "#.ai" "#CLAUDE.md" \
    "#**/*/codebase.md"

# format ts, md, and json with prettier
format:
  npm run format
alias f := format

check-types:
  npm run check-types
alias ct := check-types

# lint everything
# Usage: just lint [--fix] (add --fix to auto-fix issues)
lint fix="":
  {{ if fix == "--fix" { "npm run lint:fix" } else { "npm run lint" } }}
  just lint-md
alias l := lint

# run all tests
test:
  npm run test
alias t := test

# run in dev mode with turbo
run:
  npm run dev
alias r := run

# build with turbo
build:
  npm run build
alias b := build

# run all commands to ensure successful build in ci
# Usage: just prepush [--all] (add --all to include e2e tests)
prepush all="":
  just format
  just lint --fix
  just check-types
  just lint
  just test
  {{ if all == "--all" { "just e2e-tests run-e2e-tests" } else { "" } }}
