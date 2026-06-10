export type AuthResult =
  | { ok: true; token: string }
  | { ok: false; message: string };

type GqlResponse<T> = {
  data?: T | null;
  errors?: Array<{ message: string }>;
};

const SIGN_IN = `query($email:String!,$password:String!){signin(email:$email,password:$password)}`;
const SIGN_UP = `mutation($email:String!,$password:String!,$username:String){signup(email:$email,password:$password,username:$username)}`;
const SIGN_IN_GOOGLE = `query($idToken:String!){signinGoogle(idToken:$idToken)}`;
const GET_CLIENT_ID = `{getGoogleClientID}`;

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

export async function gqlSignUp(
  url: string,
  email: string,
  password: string,
  username?: string
): Promise<AuthResult> {
  const vars: Record<string, unknown> = { email, password };
  if (username !== undefined) vars.username = username;
  const res = await gqlPost<{ signup: string | null }>(url, SIGN_UP, vars);
  if (res.errors?.length) return { ok: false, message: res.errors[0].message };
  const token = res.data?.signup;
  if (token) return { ok: true, token };
  return { ok: false, message: "Sign-up failed. Please try again." };
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

export async function getGoogleClientId(url: string): Promise<string> {
  const res = await gqlPost<{ getGoogleClientID: string | null }>(url, GET_CLIENT_ID);
  if (res.errors?.length) throw new Error(res.errors[0].message);
  const clientId = res.data?.getGoogleClientID;
  if (clientId) return clientId;
  throw new Error("Failed to retrieve Google client ID.");
}
