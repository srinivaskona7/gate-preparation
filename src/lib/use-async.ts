import { useEffect, useState } from 'react';

export type AsyncState<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; error: Error };

/** Runs `load` whenever `key` changes and drops results that arrive for a stale key. */
export function useAsync<T>(load: () => Promise<T>, key: string): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T> & { key?: string }>({ status: 'loading' });
  useEffect(() => {
    let live = true;
    setState({ status: 'loading', key });
    load().then(
      (data) => live && setState({ status: 'ready', data, key }),
      (error: unknown) => live && setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)), key }),
    );
    return () => {
      live = false;
    };
    // `load` is recreated every render; `key` is the identity of what it loads.
  }, [key]);
  return state.key === key ? state : { status: 'loading' };
}
