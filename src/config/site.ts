export const siteConfig = {
  productName: "Crystord",
  appSignInUrl: import.meta.env.PUBLIC_APP_SIGN_IN_URL || "https://app.crystord.com/sign-in",
  youtubeUrl: "https://www.youtube.com/@crystord",
  contactEmail: "hello@crystord.com"
};

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/google-addon", label: "Google Add-on" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" }
];
