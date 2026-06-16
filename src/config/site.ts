export const siteConfig = {
  productName: "Crystord",
  appSignInUrl: import.meta.env.PUBLIC_APP_SIGN_IN_URL || "https://app.crystord.com/sign-in",
  appSignUpUrl: import.meta.env.PUBLIC_APP_SIGN_UP_URL || "https://app.crystord.com/sign-up",
  appDemoUrl: import.meta.env.PUBLIC_APP_DEMO_URL || "https://app.crystord.com/demo",
  appUrl: import.meta.env.PUBLIC_APP_URL || "https://app.crystord.com",
  graphqlUrl: import.meta.env.PUBLIC_GRAPHQL_URL || "https://app.crystord.com/graphql",
  googleClientId: import.meta.env.PUBLIC_GOOGLE_CLIENT_ID || "",
  youtubeUrl: "https://www.youtube.com/@crystord",
  newsletterUrl: import.meta.env.PUBLIC_NEWSLETTER_URL || "https://crystord.com/newsletter",
  contactEmail: "info@aleutheris.com",
  addonMarketplaceUrl: "https://workspace.google.com/marketplace/app/crystord/186388621973"
};

export const mainNav: Array<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/google-addon", label: "Google Add-on" },
  { href: "/contact", label: "Contact" },
];

export const signInLink = {
  href: siteConfig.appSignInUrl,
  label: "Sign In",
};

export const footerNav: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/support", label: "Support" },
];
