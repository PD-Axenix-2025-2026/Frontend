import { computed, inject, Injectable, signal } from '@angular/core';
import {
  SearchCreateRequest,
  SearchesApiService,
  SearchFilters,
  SearchResultsResponse,
  SearchSortOption,
  SearchStatus,
} from '../../core/api';
import { Subscription, timer } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class SearchStateService {

  private readonly searchApi = inject(SearchesApiService);
  private pollSubscription: Subscription | null = null;
  private pollDelayMs: number = 2000;

  searchId = signal<string | null>(null);
  status = signal<SearchStatus | 'idle'>('idle');
  isLoading = signal<boolean>(false);
  isPolling = signal<boolean>(false);
  error = signal<string | null>(null);
  results = signal<SearchResultsResponse | null>(null);

  items = computed(() => this.results()?.items ?? []);
  facets = computed(() => this.results()?.facets ?? null);
  meta = computed(() => this.results()?.meta ?? null);

  lastUpdate = signal(0);
  sort = signal<SearchSortOption>('best');
  filters = signal<SearchFilters>({});

  startSearch(payload: SearchCreateRequest): void {
    this.resetSearchState();
    this.isLoading.set(true);

    this.searchApi.createSearch(payload).subscribe({
      next: response => {
        this.searchId.set(response.search_id);
        this.status.set(response.status);
        this.pollDelayMs = response.poll_after_ms;
        this.isLoading.set(false);

        this.scheduleResultsLoad(response.search_id, response.poll_after_ms);
      },
      error: error => {
        this.isLoading.set(false);
        this.error.set(this.getErrorMessage(error));
      }
    });
  }

  private loadResults(searchId: string): void {
    this.isPolling.set(true);

    const filters = this.filters();

    this.searchApi.getSearchResults(searchId, {
      last_update: this.lastUpdate(),
      sort: this.sort(),
      max_price: filters.maxPrice,
      max_transfers: filters.maxTransfers,
      max_duration_minutes: filters.maxDurationMinutes,
      transport_types: filters.transportTypes,
      limit: 20,
      offset: 0
    }).subscribe({
      next: response => {
        this.results.set(response);
        this.status.set(response.status);
        this.lastUpdate.set(response.last_update);
        this.isPolling.set(false);

        if (response.error_message) {
          this.error.set(response.error_message);
        }

        if (!response.is_complete && response.status != "failed") {
          this.scheduleResultsLoad(searchId, this.pollDelayMs)
        }
      },
      error: error => {
        this.isPolling.set(false);
        this.error.set(this.getErrorMessage(error));
      }
    });
  }

  updateSort(sort: SearchSortOption): void {
    if (this.sort() === sort) return;

    this.sort.set(sort);
    this.reloadCurrentResults();
  }

  private reloadCurrentResults(): void {
    const searchId = this.searchId();
    if (!searchId) return;

    this.pollSubscription?.unsubscribe();
    this.loadResults(searchId);
  }

  private scheduleResultsLoad(searchId: string, delayMs: number): void {
    this.pollSubscription?.unsubscribe();

    this.pollSubscription = timer(delayMs).subscribe(() => {
      this.loadResults(searchId);
    });
  }

  private resetSearchState(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = null;

    this.searchId.set(null);
    this.status.set("idle");
    this.isLoading.set(false);
    this.isPolling.set(false);
    this.error.set(null);
    this.results.set(null);
    this.lastUpdate.set(0);
  }

  private getErrorMessage(error: unknown): string {

    if (error instanceof Error) {
      return error.message;
    }
    return "Не удалось выполнить поиск";
  }
}
