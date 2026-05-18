import { SearchFilters, TransportType } from '../../core/api';

const DEFAULT_MAX_TRANSFERS = 3;

export function normalizeFilters(filters: SearchFilters): SearchFilters {
  const maxTransfers = normalizeMaxTransfers(filters.maxTransfers);

  return {
    transportTypes: normalizeTransportTypes(filters.transportTypes),
    maxPrice: filters.maxPrice ?? undefined,
    ...(maxTransfers !== undefined ? { maxTransfers } : {}),
    maxDurationMinutes: filters.maxDurationMinutes ?? undefined,
  };
}

function normalizeTransportTypes(value?: TransportType[]) : TransportType[] | undefined {
  return value && value.length > 0 ? ([...value].sort() as TransportType[]) : undefined;
}

export function hasActiveFilters(filters: SearchFilters): boolean {
  const normalized = normalizeFilters(filters);

  return Boolean(
    normalized.transportTypes?.length ||
    normalized.maxPrice !== undefined ||
    normalized.maxTransfers !== undefined ||
    normalized.maxDurationMinutes !== undefined,
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

function normalizeMaxTransfers(value?: number | null): number | undefined {
  if (value == null || value === DEFAULT_MAX_TRANSFERS) {
    return undefined;
  }

  return value;
}
