# Contributing to HA Fridge Card

Thanks for helping.

## Setup

```sh
npm install
```

## Build and checks

```sh
npm run typecheck
npm run build   # src/ -> dist/
```

Commit the rebuilt bundle in `dist/` together with the `src/` change.

## Pull requests

- Branch from `dev` and open the PR against `dev` (`main` only receives releases).
- One topic per PR; use conventional commit titles (`feat:`, `fix:`, `chore:`, `docs:`).
- Releases: bump `version` in `package.json`, then push a matching `vX.Y.Z` tag on `main`; the workflow opens a draft release with the bundle attached.
