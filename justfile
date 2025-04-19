# recipes for the flame defi app
mod flame-defi 'apps/flame-defi'

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
lint:
  npm run lint
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
