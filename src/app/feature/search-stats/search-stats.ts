import {Component, signal} from '@angular/core';
import {SearchStatItem} from './search-stats.model';

@Component({
  selector: 'app-search-stats',
  imports: [],
  templateUrl: './search-stats.html',
  styleUrl: './search-stats.css',
})
export class SearchStats {

  protected readonly stats = signal<SearchStatItem[]>([
    { id: 0, value: '247', label: 'маршрутов найдено' },
    { id: 1, value: '3', label: 'вида транспорта' },
    { id: 2, value: '1ч 40м', label: 'мин. время в пути' },
    { id: 3, value: '2 400₽', label: 'мин. стоимость' },
  ]);
}
