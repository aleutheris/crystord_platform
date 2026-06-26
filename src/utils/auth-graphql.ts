export type AuthResult =
  | { ok: true; token: string }
  | { ok: false; message: string };

type GqlResponse<T> = {
  data?: T | null;
  errors?: Array<{ message: string }>;
};

const SIGN_IN = `query($email:String!,$password:String!){signin(email:$email,password:$password)}`;
// Verify-first signup (BI-260065): beginSignup emails a single-use code, completeSignup verifies it
// and creates the already-verified account. username is required by the backend (String!).
const BEGIN_SIGNUP = `mutation($email:String!){beginSignup(email:$email)}`;
const COMPLETE_SIGNUP = `mutation($email:String!,$code:String!,$password:String!,$username:String!){completeSignup(email:$email,code:$code,password:$password,username:$username)}`;
const SIGN_IN_GOOGLE = `query($idToken:String!){signinGoogle(idToken:$idToken)}`;

async function gqlPost<T>(
  url: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<GqlResponse<T>> {
  const body: Record<string, unknown> = { query };
  if (variables !== undefined) body.variables = variables;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<GqlResponse<T>>;
}

export async function gqlSignIn(
  url: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const res = await gqlPost<{ signin: string | null }>(url, SIGN_IN, { email, password });
  if (res.errors?.length) return { ok: false, message: res.errors[0].message };
  const token = res.data?.signin;
  if (token) return { ok: true, token };
  return { ok: false, message: "Sign-in failed. Please check your credentials." };
}

export type BeginSignupResult = { ok: true } | { ok: false; message: string };

/**
 * Step 1 of verify-first signup: ask the backend to email a verification code.
 * The backend always reports success (anti-enumeration — it never reveals whether the email is
 * already registered or was throttled), so ok:true does not imply a code was actually sent.
 */
export async function gqlBeginSignup(url: string, email: string): Promise<BeginSignupResult> {
  const res = await gqlPost<{ beginSignup: boolean }>(url, BEGIN_SIGNUP, { email });
  if (res.errors?.length) return { ok: false, message: res.errors[0].message };
  return { ok: true };
}

/**
 * Step 2 of verify-first signup: verify the emailed code and create the account.
 * username is required by the backend. Returns a session token on success.
 */
export async function gqlCompleteSignup(
  url: string,
  email: string,
  code: string,
  password: string,
  username: string
): Promise<AuthResult> {
  const res = await gqlPost<{ completeSignup: string | null }>(url, COMPLETE_SIGNUP, {
    email,
    code,
    password,
    username,
  });
  if (res.errors?.length) return { ok: false, message: res.errors[0].message };
  const token = res.data?.completeSignup;
  if (token) return { ok: true, token };
  return { ok: false, message: "Sign-up failed. Please try again." };
}

/**
 * Map a backend auth error code (returned verbatim in GraphQL `errors[0].message`) to user-facing
 * copy. Unknown messages pass through unchanged so a genuinely unexpected error is never hidden.
 */
export function friendlyAuthError(raw: string): string {
  const msg = (raw || "").trim();
  const code = msg.split(":")[0].trim();
  const detail = msg.includes(":") ? msg.slice(msg.indexOf(":") + 1).trim() : "";
  switch (code) {
    case "AUTH-RATE-LIMITED":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "SIGNUP-INVALID-OR-EXPIRED-CODE":
      return "That code is incorrect or has expired. Request a new code and try again.";
    case "SIGNUP-ACCOUNT-ALREADY-EXISTS":
      return "An account already exists for this email. Please sign in instead.";
    case "USER-ALREADY-EXISTS":
      return "That username is already taken. Please choose another.";
    case "USER-INVALID-USERNAME":
      return detail ? `Username: ${detail}.` : "That username isn't allowed.";
    case "PASSWORD-TOO-COMMON":
      return "That password is too common. Please choose a less common one.";
    case "PASSWORD-TOO-SHORT":
    case "PASSWORD-TOO-LONG":
      return detail ? `Password ${detail}.` : "Please choose a different password.";
    case "AUTH-GOOGLE-NOT-LINKED":
      return "This account isn't linked to Google. Sign in with your email and password, then link Google from your account settings.";
    default:
      return msg || "Something went wrong. Please try again.";
  }
}

export async function gqlSignInGoogle(
  url: string,
  idToken: string
): Promise<AuthResult> {
  const res = await gqlPost<{ signinGoogle: string | null }>(url, SIGN_IN_GOOGLE, { idToken });
  if (res.errors?.length) return { ok: false, message: res.errors[0].message };
  const token = res.data?.signinGoogle;
  if (token) return { ok: true, token };
  return { ok: false, message: "Google sign-in failed. Please try again." };
}
