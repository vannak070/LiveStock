import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../api/client';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

// Generic "fetch one endpoint, track loading/error, support pull-to-refresh"
// hook used by every report screen.
export function useApiData<T>(endpoint: string, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null, refreshing: false });

  const load = useCallback(async (isRefresh = false) => {
    setState(s => ({ ...s, loading: !isRefresh, refreshing: isRefresh, error: null }));
    try {
      const data = await apiFetch<T>(endpoint);
      setState({ data, loading: false, error: null, refreshing: false });
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        refreshing: false,
        error: err instanceof ApiError ? err.message : 'Something went wrong loading this report.'
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, ...deps]);

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    refresh: () => load(true),
    reload: () => load(false)
  };
}

// Fetches several endpoints together (most report screens need 2-4 real
// endpoints combined, e.g. stock + weight + batches for the Dashboard).
export function useApiDataMulti<T extends Record<string, string>>(endpoints: T) {
  type Result = { [K in keyof T]: unknown };
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    setLoading(!isRefresh);
    setRefreshing(isRefresh);
    setError(null);
    try {
      const keys = Object.keys(endpoints) as (keyof T)[];
      const results = await Promise.all(keys.map(k => apiFetch(endpoints[k])));
      const combined = {} as Result;
      keys.forEach((k, i) => { combined[k] = results[i]; });
      setData(combined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong loading this report.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(endpoints)]);

  useEffect(() => {
    load(false);
  }, [load]);

  return { data, loading, error, refreshing, refresh: () => load(true), reload: () => load(false) };
}
