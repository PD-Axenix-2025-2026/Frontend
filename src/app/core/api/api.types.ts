export type LocationType = 'city' | 'airport' | 'railway_station' | 'bus_station';
export type TransportType = 'plane' | 'train' | 'bus';
export type SearchStatus = 'pending' | 'partial' | 'complete' | 'failed';
export type SearchSortOption = 'best' | 'price' | 'duration';


export type UUID = string;
export type ISODate = string;
export type ISODateTime = string;

export interface LocationAutocompleteItem {
  id: UUID;
  type: LocationType;
  label: string;
  city_label: string | null;
  code: string | null;
  country_code: string | null;
}

export interface LocationAutocompleteResponse {
  items: LocationAutocompleteItem[];
}

export interface SearchLocationReference {
  id: UUID;
  type: LocationType;
}

export interface PassengerCountsRequest {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchPreferencesRequest {
  sort?: SearchSortOption;
  max_transfers?: number | null;
  max_price?: number | null;
  max_duration_minutes?: number | null;
}

export interface SearchCreateRequest {
  origin: SearchLocationReference;
  destination: SearchLocationReference;
  date: ISODate;
  passengers?: PassengerCountsRequest;
  transport_types?: TransportType[];
  preferences?: SearchPreferencesRequest;
}

export interface SearchCreateResponse {
  search_id: UUID;
  status: SearchStatus;
  results_url: string;
  poll_after_ms: number;
  expires_at: ISODateTime;
}

export interface MoneyResponse {
  amount: number;
  currency: string;
}

export interface RouteSummaryResponse {
  departure_at: ISODateTime;
  arrival_at: ISODateTime;
  duration_minutes: number;
  transfers: number;
  total_price: MoneyResponse | null;
}

export interface RouteSegmentResponse {
  segment_id: UUID;
  transport_type: TransportType;
  carrier: string;
  carrier_code: string | null;
  segment_code: string | null;
  origin_id: UUID;
  origin_code: string | null;
  origin_label: string;
  destination_id: UUID;
  destination_code: string | null;
  destination_label: string;
  departure_at: ISODateTime;
  arrival_at: ISODateTime;
  duration_minutes: number;
  price: MoneyResponse | null;
  available_seats: number | null;
  source_system: string | null;
  source_record_id: string | null;
  valid_from: ISODateTime;
  valid_to: ISODateTime | null;
}

export interface RouteBookingResponse {
  available: boolean;
  refresh_required: boolean;
}

export interface RouteListItemResponse {
  route_id: UUID;
  summary: RouteSummaryResponse;
  segments: RouteSegmentResponse[];
  labels: string[];
  booking: RouteBookingResponse;
}

export interface PriceRangeResponse {
  min: number | null;
  max: number | null;
}

export interface DurationRangeResponse {
  min: number | null;
  max: number | null;
}

export interface TransportTypeFacetResponse {
  value: TransportType;
  count: number;
}

export interface TransferFacetResponse {
  value: number;
  count: number;
}

export interface SearchResultsMetaResponse {
  total_found: number;
  currency: string;
  stale_after_sec: number;
}

export interface SearchResultsFacetsResponse {
  transport_types: TransportTypeFacetResponse[];
  transfers: TransferFacetResponse[];
  price: PriceRangeResponse;
  duration_minutes: DurationRangeResponse;
}

export interface SearchResultsResponse {
  search_id: UUID;
  status: SearchStatus;
  is_complete: boolean;
  last_update: number;
  meta: SearchResultsMetaResponse;
  facets: SearchResultsFacetsResponse;
  items: RouteListItemResponse[];
  error_message?: string | null;
}
