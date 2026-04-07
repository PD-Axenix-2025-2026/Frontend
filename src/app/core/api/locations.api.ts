import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from './api.config';
import { LocationAutocompleteResponse, LocationType } from './api.types';
import { Observable } from 'rxjs';
import { setParam, toCsv } from './http-params';

type Params = {
  prefix: string;
  types?: LocationType[];
  limit?: number;
}

@Injectable({providedIn: 'root'})
export class LocationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  listLocations(params: Params): Observable<LocationAutocompleteResponse> {
    let httpParams = new HttpParams().set('prefix', params.prefix.trim());

    httpParams = setParam(httpParams, 'types', toCsv(params.types));
    httpParams = setParam(httpParams, 'limit', params.limit);

    return this.http.get<LocationAutocompleteResponse> (
      `${this.baseUrl}/locations`,
      {params: httpParams});
  }
}
