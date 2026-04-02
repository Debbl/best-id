# best-id playground

Interactive Next.js playground for the `best-id` package.

## What it does

- Generate multiple IDs in a batch
- Parse arbitrary IDs line by line
- Inspect prefix, suffix, and UUID output
- Demonstrate the current package source directly from the repo root

## Stack

- Next.js App Router
- Tailwind CSS v4
- shadcn-style UI components
- motion
- next-themes

## Deploy

- The app is exported as static files into `out/`.
- Cloudflare Pages reads `wrangler.jsonc` and serves that directory.
- The production custom domain is `https://best-id.aiwan.run`.
