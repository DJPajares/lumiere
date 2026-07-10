# @lumiere/dashboard-ui

Dashboard-only shadcn/ui components for Lumiere. Public invitation code must not import this package
or its Base UI dependency.

## Foundation

- CLI: `shadcn` 4.13.0, resolved with `pnpm dlx shadcn@latest --version` on 2026-07-10.
- Registry package: `shadcn` 4.13.0 (recorded in `pnpm-lock.yaml`).
- Primitive package: `@base-ui/react` 1.6.0 (recorded in `pnpm-lock.yaml`).
- Base preset: `pnpm dlx shadcn@latest init --base base --preset nova` materializes the
  `base-nova` style used by both workspace configs.
- Required primitives were reviewed with `shadcn add --dry-run` before installation; no existing
  component files were overwritten.

Run future component operations from `apps/dashboard`. The CLI reads both `components.json` files
and routes primitives into this package while keeping dashboard feature compositions in the app.

```sh
pnpm dlx shadcn@latest add <component> --dry-run --cwd apps/dashboard
pnpm dlx shadcn@latest add <component> --diff --cwd apps/dashboard
pnpm dlx shadcn@latest add <component> --cwd apps/dashboard
```

Stable imports are available under `@lumiere/dashboard-ui/components/*`,
`@lumiere/dashboard-ui/hooks/*`, `@lumiere/dashboard-ui/lib/*`, and
`@lumiere/dashboard-ui/globals.css`.
