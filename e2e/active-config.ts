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

// The app resolves the sign-in link from PUBLIC_APP_SIGN_IN_URL when set
// (CI/production pins it to the real app domain via deploy.yml, independent of
// whichever profile is committed), falling back to the active profile's origin
// (the value scripts/config.mjs bakes into .env locally). Mirror that same
// precedence so the assertion matches whatever the build actually rendered,
// rather than assuming the sign-in host always equals the GraphQL host.
export const signInUrl = process.env.PUBLIC_APP_SIGN_IN_URL || `${appOrigin}/sign-in`;
