import { Component, computed, DestroyRef, DOCUMENT, inject, signal } from '@angular/core';
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
import { fromEvent } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [Header, Hero, SearchForm, SearchStats, RouteFilters, ResultsToolbar, RouteCard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly searchState = inject(SearchStateService);

  protected activeCardId = signal<string | null>(null);
  protected showScrollToTop = signal(false);
  protected readonly routeCards = computed(() => this.searchState.items().map(mapRouteToCard));
  protected readonly hasCards = computed(() => this.routeCards().length > 0);
  protected readonly hasResultsResponse = computed(() => this.searchState.results() !== null);
  protected readonly shouldShowLoadingResultsState = computed(() => {
    const results = this.searchState.results();
    if (results === null) {
      return (
        this.searchState.isLoading() ||
        this.searchState.isPolling() ||
        this.searchState.searchId() !== null
      );
    }

    return (
      !results.is_complete &&
      !this.searchState.error() &&
      this.routeCards().length === 0
    );
  });
  protected readonly shouldShowResultsLayout = computed(() => {
    if (this.shouldShowLoadingResultsState()) {
      return false;
    }

    return this.hasResultsResponse();
  });
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
  protected readonly canLoadMore = computed(() => this.searchState.canLoadMore());

  constructor() {
    const win = this.document.defaultView;
    if (!win) return;

    fromEvent(win, 'scroll')
      .pipe(
        map(() => win.scrollY > 640),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((visible) => this.showScrollToTop.set(visible));
  }

  onSearchSubmitted(payload: SearchCreateRequest) {
    this.searchState.startSearch(payload);
  }

  onSortChanged(sort: SearchSortOption) {
    this.searchState.updateSort(sort);
  }

  onFiltersChanged(filters: SearchFilters) {
    this.searchState.updateFilters(filters);
  }

  onLoadMore() {
    this.searchState.loadMore();
  }

  onScrollToResultsTop() {
    const element = this.document.getElementById(this.resultsTopAnchorId());
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onStatRouteSelected(routeId: string) {
    this.activeCardId.set(routeId);

    const element = this.document.getElementById(this.routeAnchorId(routeId));
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => this.activeCardId.set(null), 3000);
  }

  protected routeAnchorId(routeId: string): string {
    return `route-card-${routeId}`;
  }

  protected resultsTopAnchorId(): string {
    return 'search-results-top';
  }
}
