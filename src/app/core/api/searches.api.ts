import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from './api.config';
import {
  SearchCreateRequest,
  SearchCreateResponse,
  SearchResultsResponse,
  SearchSortOption,
  TransportType,
} from './api.types';
import { setParam, toCsv } from './http-params';

type Query = {
  last_update?: number;
  sort?: SearchSortOption;
  max_price?: number | null;
  max_transfers?: number | null;
  max_duration_minutes?: number | null;
  transport_types?: TransportType[];
  limit?: number;
  offset?: number;
}

@Injectable({providedIn: 'root'})
export class SearchesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  createSearch(payload: SearchCreateRequest) {
    return this.http.post<SearchCreateResponse>(`${this.baseUrl}/searches`, payload);
  }

  getSearchResults(searchId: string, query: Query) {
    let params = new HttpParams();
    params = setParam(params, 'last_update', query.last_update);
    params = setParam(params, 'sort', query.sort);
    params = setParam(params, 'max_price', query.max_price ?? undefined);
    params = setParam(params, 'max_transfers', query.max_transfers ?? undefined);
    params = setParam(params, 'max_duration_minutes', query.max_duration_minutes ?? undefined);
    params = setParam(params, 'transport_types', toCsv(query.transport_types));
    params = setParam(params, 'limit', query.limit);
    params = setParam(params, 'offset', query.offset);

    return this.http.get<SearchResultsResponse>(`${this.baseUrl}/searches/${searchId}/results`, {params});
  }
}
