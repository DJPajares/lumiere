export default {
  "*.{json,yml,yaml,md,ts,tsx}": "prettier --write --ignore-unknown",
  "*.{ts,tsx}": () => "pnpm typecheck",
};
