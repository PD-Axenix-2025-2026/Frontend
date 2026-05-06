import { SearchFilters, TransportType } from '../../core/api';

export function normalizeFilters(filters: SearchFilters): SearchFilters {
  return {
    transportTypes: normalizeTransportTypes(filters.transportTypes),
    maxPrice: filters.maxPrice ?? undefined,
    maxTransfers: filters.maxTransfers ?? undefined,
    maxDurationMinutes: filters.maxDurationMinutes ?? undefined,
  };
}

function normalizeTransportTypes(value?: TransportType[]) : TransportType[] | undefined {
  return value && value.length > 0 ? ([...value].sort() as TransportType[]) : undefined;
}

export function hasActiveFilters(filters: SearchFilters): boolean {
  return Boolean(
    filters.transportTypes?.length ||
    filters.maxPrice !== undefined ||
    filters.maxTransfers !== undefined ||
    filters.maxDurationMinutes !== undefined,
  );
}

export function isSameFilters(a: SearchFilters, b: SearchFilters): boolean {
  return (
    (a.maxPrice ?? undefined) === (b.maxPrice ?? undefined) &&
    (a.maxTransfers ?? undefined) === (b.maxTransfers ?? undefined) &&
    (a.maxDurationMinutes ?? undefined) === (b.maxDurationMinutes ?? undefined) &&
    (a.transportTypes?.join(',') ?? '') === (b.transportTypes?.join(',') ?? '')
  );
}
