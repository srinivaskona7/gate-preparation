import { RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Button } from '@/ui/button';
import { DocTitle } from '@/ui/page-header';
import { EmptyState, Skeleton } from '@/ui/primitives';

/** After a redeploy the old page asks for chunks whose hashed names no longer exist. */
const isStaleChunk = (e: unknown) =>
  e instanceof Error && /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(e.message);

export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  const stale = isStaleChunk(error);
  return (
    <div className="mx-auto max-w-xl py-16">
      <DocTitle>Something went wrong</DocTitle>
      <EmptyState title={stale ? 'A newer version of the site is available' : 'This page failed to load'}>
        <p>
          {stale
            ? 'The site was updated while this tab was open. Reload to fetch the new version.'
            : error instanceof Error
              ? error.message
              : 'An unexpected error stopped the page from rendering.'}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw /> Reload
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Dashboard</Link>
          </Button>
        </div>
      </EmptyState>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16">
      <DocTitle>Page not found</DocTitle>
      <EmptyState title="No page at this address">
        <p>The link may be from an older version of the site. Search with ⌘K or start from the dashboard.</p>
        <div className="mt-5 flex justify-center">
          <Button variant="primary" asChild>
            <Link to="/">Go to the dashboard</Link>
          </Button>
        </div>
      </EmptyState>
    </div>
  );
}

/** Shown while the first page's chunk loads, before the shell exists. */
export function PageLoading() {
  return (
    <div className="mx-auto grid max-w-5xl gap-4 p-8" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}
