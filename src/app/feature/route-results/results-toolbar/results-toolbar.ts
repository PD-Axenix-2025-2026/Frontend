import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-results-toolbar',
  imports: [],
  templateUrl: './results-toolbar.html',
  styleUrl: './results-toolbar.css',
})
export class ResultsToolbar {
  protected readonly sortOptions = [
    { id: 'price', icon: '₽', label: 'Стоимость' },
    { id: 'duration', icon: '⏱', label: 'Время' },
    { id: 'stops', icon: '↔', label: 'Пересадки' },
  ];

  protected readonly activeSort = signal('price');

  protected selectSort(sortId: string): void {
    this.activeSort.set(sortId);
  }
}
