import { Component, computed, inject } from '@angular/core';
import { Header } from './shared/layout/header/header';
import { Hero } from './shared/ui/hero/hero';
import { SearchForm } from './feature/search-form/search-form';
import { SearchStats } from './feature/search-stats/search-stats';
import { RouteFilters } from './feature/route-filters/route-filters';
import { ResultsToolbar } from './feature/route-results/results-toolbar/results-toolbar';
import { RouteCard } from './feature/route-results/route-card/route-card';
import { SearchCreateRequest, SearchFilters, SearchSortOption } from './core/api';
import { SearchStateService } from './feature/search/search-state.service';
import { mapRouteToCard } from './feature/route-results/route-card/route-card.mapper';

@Component({
  selector: 'app-root',
  imports: [Header, Hero, SearchForm, SearchStats, RouteFilters, ResultsToolbar, RouteCard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly searchState = inject(SearchStateService);

  protected readonly routeCards = computed(() => this.searchState.items().map(mapRouteToCard));
  protected readonly hasCards = computed(() => this.routeCards().length > 0);
  protected readonly hasResultsResponse = computed(() => this.searchState.results() !== null);
  protected readonly hasSearchStarted = computed(
    () =>
      this.searchState.searchId() !== null ||
      this.searchState.isLoading() ||
      this.searchState.isPolling() ||
      this.searchState.results() !== null,
  );

  protected readonly totalFound = computed(() => this.searchState.meta()?.total_found ?? 0);
  protected readonly shownCount = computed(() => this.searchState.items().length);
  protected readonly activeSort = computed(() => this.searchState.sort());

  onSearchSubmitted(payload: SearchCreateRequest) {
    this.searchState.startSearch(payload);
  }

  onSortChanged(sort: SearchSortOption) {
    this.searchState.updateSort(sort);
  }

  onFiltersChanged(filters: SearchFilters) {
    this.searchState.updateFilters(filters);
  }
}
