import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { MaintenanceGate } from "@/components/MaintenanceGate";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google", content: "notranslate" },
      { title: "MozFlow — Investimentos 24/24" },
      { name: "description", content: "Invista, levante e ganhe a cada hora. Plataforma de investimentos rápidos, segura e sem limites." },
      { property: "og:title", content: "MozFlow — Investimentos 24/24" },
      { property: "og:description", content: "Invista, levante e ganhe a cada hora. Plataforma de investimentos rápidos, segura e sem limites." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "MozFlow — Investimentos 24/24" },
      { name: "twitter:description", content: "Invista, levante e ganhe a cada hora. Plataforma de investimentos rápidos, segura e sem limites." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/daf86fdc-c1c9-4b11-a9f0-c0db2ed3b2e2/id-preview-ba0a6df9--8f74588b-c27a-41d6-b662-6ed659524f9d.lovable.app-1777440071001.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/daf86fdc-c1c9-4b11-a9f0-c0db2ed3b2e2/id-preview-ba0a6df9--8f74588b-c27a-41d6-b662-6ed659524f9d.lovable.app-1777440071001.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" translate="no" className="notranslate">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <MaintenanceGate>
        <Outlet />
      </MaintenanceGate>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}
