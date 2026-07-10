import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mono text-[11px] text-primary mb-2">SIGNAL LOST · 404</div>
        <h1 className="text-5xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          No such coordinate
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The bridge has no channel at this address. Return to the Command Center to re-orient.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary glow-primary transition-colors hover:bg-primary/20"
          >
            Return to Bridge
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mono text-[11px] text-danger mb-2">SUBSYSTEM FAULT</div>
        <h1 className="text-2xl font-semibold tracking-tight">The bridge encountered a fault</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reasoning surface halted. Reinitialize the channel or return to the bridge.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
          >
            Reinitialize
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
          >
            Bridge
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atlas Sanctum — Command Bridge for a Living Intelligence System" },
      {
        name: "description",
        content:
          "Atlas Sanctum is a command bridge for planetary coordination — observe global systems, orchestrate specialized AI agents, explore reasoning, and steer missions with human oversight.",
      },
      { name: "author", content: "Atlas Sanctum" },
      { property: "og:title", content: "Atlas Sanctum — Command Bridge" },
      {
        property: "og:description",
        content:
          "Observe · Understand · Decide · Coordinate · Learn. A living intelligence bridge for Earth-scale coordination.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b1418" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
