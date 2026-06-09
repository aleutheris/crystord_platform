export const siteConfig = {
  productName: "Crystord",
  appSignInUrl: import.meta.env.PUBLIC_APP_SIGN_IN_URL || "https://app.crystord.com/sign-in",
  appSignUpUrl: import.meta.env.PUBLIC_APP_SIGN_UP_URL || "https://app.crystord.com/sign-up",
  appDemoUrl: import.meta.env.PUBLIC_APP_DEMO_URL || "https://app.crystord.com/demo",
  youtubeUrl: "https://www.youtube.com/@crystord",
  newsletterUrl: import.meta.env.PUBLIC_NEWSLETTER_URL || "https://crystord.com/newsletter",
  contactEmail: "hello@crystord.com",
  addonMarketplaceUrl: "https://workspace.google.com/marketplace/app/crystord/186388621973"
};

export const mainNav: Array<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/google-addon", label: "Google Add-on" },
  { href: "/contact", label: "Contact" },
];

export const signInLink = {
  href: siteConfig.appSignInUrl,
  label: "Sign in to Crystord App",
};

export const footerNav: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/google-addon", label: "Google Add-on" },
  { href: "/google-addon/support", label: "Support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: siteConfig.youtubeUrl, label: "YouTube", external: true },
];
