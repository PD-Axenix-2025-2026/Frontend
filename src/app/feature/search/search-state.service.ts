import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  SearchCreateRequest,
  SearchesApiService,
  SearchFilters,
  SearchResultsFacetsResponse,
  SearchResultsResponse,
  SearchSortOption,
  SearchStatus,
} from '../../core/api';
import { EMPTY, Subject, Subscription, catchError, switchMap, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const DEFAULT_FILTERS: SearchFilters = {
  maxTransfers: 0,
};

@Injectable({
  providedIn: 'root',
})
export class SearchStateService {
  private readonly searchApi = inject(SearchesApiService);
  private readonly destroyRef = inject(DestroyRef);

  private pollSubscription: Subscription | null = null;
  private pollDelayMs: number = 2000;
  private readonly reloadResults$ = new Subject<string>();

  searchId = signal<string | null>(null);
  status = signal<SearchStatus | 'idle'>('idle');
  isLoading = signal(false);
  isPolling = signal(false);
  error = signal<string | null>(null);
  results = signal<SearchResultsResponse | null>(null);
  baseFacets = signal<SearchResultsFacetsResponse | null>(null);

  items = computed(() => this.results()?.items ?? []);
  facets = computed(() => this.results()?.facets ?? null);
  meta = computed(() => this.results()?.meta ?? null);

  lastUpdate = signal(0);
  sort = signal<SearchSortOption>('best');
  filters = signal<SearchFilters>(DEFAULT_FILTERS);

  constructor() {
    this.reloadResults$
      .pipe(
        tap(() => {
          this.pollSubscription?.unsubscribe();
          this.isPolling.set(true);
        }),
        switchMap((searchId) => {
          const filters = this.filters();

          return this.searchApi
            .getSearchResults(searchId, {
              last_update: this.lastUpdate(),
              sort: this.sort(),
              max_price: filters.maxPrice,
              max_transfers: filters.maxTransfers,
              max_duration_minutes: filters.maxDurationMinutes,
              transport_types: filters.transportTypes,
              limit: 20,
              offset: 0,
            })
            .pipe(
              catchError((error) => {
                this.isPolling.set(false);
                this.error.set(this.getErrorMessage(error));
                return EMPTY;
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.results.set(response);
        this.status.set(response.status);
        this.lastUpdate.set(response.last_update);
        this.isPolling.set(false);

        if (!hasActiveFilters(this.filters()) || this.baseFacets() === null) {
          this.baseFacets.set(response.facets);
        }

        if (response.error_message) {
          this.error.set(response.error_message);
        } else {
          this.error.set(null);
        }

        const currentSearchId = this.searchId();
        if (!response.is_complete && response.status !== 'failed' && currentSearchId) {
          this.scheduleResultsLoad(currentSearchId, this.pollDelayMs);
        }
      });
  }

  startSearch(payload: SearchCreateRequest): void {
    this.resetSearchState();
    this.isLoading.set(true);

    this.searchApi.createSearch(payload).subscribe({
      next: (response) => {
        this.searchId.set(response.search_id);
        this.status.set(response.status);
        this.pollDelayMs = response.poll_after_ms;
        this.isLoading.set(false);

        this.scheduleResultsLoad(response.search_id, response.poll_after_ms);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.error.set(this.getErrorMessage(error));
      },
    });
  }

  updateSort(sort: SearchSortOption): void {
    if (this.sort() === sort) return;

    this.sort.set(sort);
    this.reloadCurrentResults();
  }

  updateFilters(filters: SearchFilters): void {
    this.filters.set(filters);
    this.reloadCurrentResults();
  }

  private reloadCurrentResults(): void {
    const searchId = this.searchId();
    if (!searchId) return;

    this.reloadResults$.next(searchId);
  }

  private scheduleResultsLoad(searchId: string, delayMs: number): void {
    this.pollSubscription?.unsubscribe();

    this.pollSubscription = timer(delayMs).subscribe(() => {
      this.reloadResults$.next(searchId);
    });
  }

  private resetSearchState(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = null;

    this.searchId.set(null);
    this.status.set('idle');
    this.isLoading.set(false);
    this.isPolling.set(false);
    this.error.set(null);
    this.results.set(null);
    this.baseFacets.set(null);
    this.lastUpdate.set(0);
    this.filters.set(DEFAULT_FILTERS);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Не удалось выполнить поиск';
  }
}

function hasActiveFilters(filters: SearchFilters): boolean {
  return Boolean(
    filters.transportTypes?.length ||
    filters.maxPrice !== undefined ||
    filters.maxTransfers !== undefined ||
    filters.maxDurationMinutes !== undefined,
  );
}
