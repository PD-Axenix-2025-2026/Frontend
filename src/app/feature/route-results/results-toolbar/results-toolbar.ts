import { Component, input, output } from '@angular/core';
import { SearchSortOption } from '../../../core/api';

@Component({
  selector: 'app-results-toolbar',
  imports: [],
  templateUrl: './results-toolbar.html',
  styleUrl: './results-toolbar.css',
})
export class ResultsToolbar {
  readonly activeSort = input.required<SearchSortOption>();
  readonly totalFound = input(0);
  readonly shownCount = input(0);

  readonly sortChanged = output<SearchSortOption>();

  protected readonly sortOptions: Array<{ id: SearchSortOption; icon: string; label: string }> = [
    { id: 'best', icon: '★', label: 'Оптимальный' },
    { id: 'price', icon: '₽', label: 'Стоимость' },
    { id: 'duration', icon: '⏱', label: 'Время' },
  ];

  protected selectSort(sortId: SearchSortOption): void {
    if (sortId !== this.activeSort()) {
      this.sortChanged.emit(sortId);
    }
  }
}
