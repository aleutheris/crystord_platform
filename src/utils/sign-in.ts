export type SignInResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; message: string };

export async function submitSignIn(
  authUrl: string,
  email: string,
  password: string
): Promise<SignInResult> {
  const res = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    return { ok: true, redirectUrl: new URL(authUrl).origin };
  }

  const data: { message?: string } = await res.json().catch(() => ({}));
  return {
    ok: false,
    message: data.message ?? "Sign-in failed. Please check your credentials.",
  };
}
