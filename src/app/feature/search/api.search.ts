import { TransportType } from '../../core/api';

export interface SearchFilters {
  transportTypes?: TransportType[];
  maxPrice?: number | null;
  maxTransfers?: number | null;
  maxDurationMinutes?: number | null;
}
