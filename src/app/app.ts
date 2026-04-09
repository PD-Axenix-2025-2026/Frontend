import { Component, inject, signal } from '@angular/core';
import {Header} from './shared/layout/header/header';
import {Hero} from './shared/ui/hero/hero';
import {SearchForm} from './feature/search-form/search-form';
import {SearchStats} from './feature/search-stats/search-stats';
import {RouteFilters} from './feature/route-filters/route-filters';
import {ResultsToolbar} from './feature/route-results/results-toolbar/results-toolbar';
import {RouteCard, RouteCardItem} from './feature/route-results/route-card/route-card';
import { SearchesApiService } from './core/api';
import { SearchCreateRequest } from './core/api';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Hero,
    SearchForm,
    SearchStats,
    RouteFilters,
    ResultsToolbar,
    RouteCard
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private readonly searchApi = inject(SearchesApiService);

  onSearchSubmitted(payload: SearchCreateRequest) {
    this.searchApi.createSearch(payload).subscribe();
  }

  protected readonly routeCards = signal<RouteCardItem[]>([
    {
      id: 'route-1',
      isBest: true,
      badge: 'ОПТИМАЛЬНЫЙ',
      departureTime: '07:45',
      departurePlace: 'Москва · Шереметьево',
      duration: '1ч 40м',
      stops: 'Прямой',
      arrivalTime: '09:25',
      arrivalPlace: 'Санкт-Петербург · Пулково',
      price: '3 800 ₽',
      priceLabel: 'за 1 пассажира',
      segments: [
        {
          id: 'segment-1',
          icon: '✈',
          route: 'MOW → LED',
          detail: 'Аэрофлот · SU 32 · Эконом',
        },
      ],
    },
    {
      id: 'route-2',
      departureTime: '08:20',
      departurePlace: 'Москва · Ленинградский вокзал',
      duration: '4ч 05м',
      stops: 'Прямой',
      arrivalTime: '12:25',
      arrivalPlace: 'Санкт-Петербург · Московский вокзал',
      price: '2 400 ₽',
      priceLabel: 'за 1 пассажира',
      segments: [
        {
          id: 'segment-2',
          icon: '🚆',
          route: 'MOW → LED',
          detail: 'Сапсан · 754А · Эконом+',
        },
      ],
    },
    {
      id: 'route-3',
      departureTime: '10:10',
      departurePlace: 'Москва · Домодедово',
      duration: '3ч 45м',
      stops: '1 пересадка',
      arrivalTime: '13:55',
      arrivalPlace: 'Санкт-Петербург · Пулково',
      price: '3 200 ₽',
      priceLabel: 'за 1 пассажира',
      segments: [
        {
          id: 'segment-3',
          icon: '✈',
          route: 'DME → KZN',
          detail: 'S7 · S7 1041 · Эконом',
        },
        {
          id: 'segment-4',
          icon: '✈',
          route: 'KZN → LED',
          detail: 'S7 · S7 2015 · Эконом',
        },
      ],
    },
  ]);
}
