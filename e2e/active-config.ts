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
export const appOrigin: string = new URL(graphqlEndpoint).origin;
export const signInUrl = `${appOrigin}/sign-in`;
