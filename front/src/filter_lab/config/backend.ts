import type { FilterConfig, FilterValues } from '../types/filters';

export function buildBackendPayload(
  filters: FilterConfig[],
  values: FilterValues
) {
  const payload: Record<string, unknown> = {};

  for (const filter of filters) {
    const rawValue = values[filter.id];
    const backendKey = filter.backendKey ?? filter.id;

    payload[backendKey] = rawValue ?? null;
  }

  return payload;
}