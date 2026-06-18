// Resolves the active backend profile from deploy_config.json so e2e assertions
// validate against the configured endpoint rather than a hard-coded domain.
// Mirrors the resolution in scripts/config.mjs.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const deployConfigPath = fileURLToPath(new URL("../deploy_config.json", import.meta.url));
const deployConfig = JSON.parse(readFileSync(deployConfigPath, "utf-8"));

const active: string = deployConfig.active;
const profile = deployConfig.profiles[active];
if (!profile) {
  throw new Error(`deploy_config.json: unknown active profile "${active}"`);
}

export const graphqlEndpoint: string = profile.graphqlEndpoint;

// The app is often hosted on a different origin than the GraphQL API (e.g.
// app.crystord.com vs crystord.aleutheris.com/api), so the app origin must NOT
// be derived from the GraphQL host. Mirror scripts/config.mjs precedence:
// PUBLIC_APP_URL env override (CI/production pins it via deploy.yml) → the
// profile's explicit appUrl → the GraphQL origin (legacy co-located fallback).
export const appOrigin: string = new URL(
  process.env.PUBLIC_APP_URL || profile.appUrl || graphqlEndpoint,
).origin;

// The app resolves the sign-in link from PUBLIC_APP_SIGN_IN_URL when set
// (CI/production pins it to the real app domain via deploy.yml, independent of
// whichever profile is committed), falling back to the active profile's app
// origin (the value scripts/config.mjs bakes into .env locally). Mirror that
// same precedence so the assertion matches whatever the build actually rendered.
export const signInUrl = process.env.PUBLIC_APP_SIGN_IN_URL || `${appOrigin}/sign-in`;
