type GsiLib = {
  accounts: {
    id: {
      initialize(cfg: {
        client_id: string;
        callback(response: { credential: string }): void;
      }): void;
      renderButton(parent: HTMLElement, cfg: object): void;
    };
  };
};

function gsi(): GsiLib | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).google as GsiLib | undefined;
}

export function loadGsi(): Promise<void> {
  if (gsi() !== undefined) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In library"));
    document.head.appendChild(script);
  });
}

export function initGoogleButton(
  clientId: string,
  container: HTMLElement,
  onIdToken: (idToken: string) => void
): void {
  gsi()!.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => onIdToken(response.credential),
  });
  gsi()!.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    width: container.offsetWidth || 360,
  });
}
