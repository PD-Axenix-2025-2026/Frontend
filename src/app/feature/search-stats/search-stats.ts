import { Component, computed, input, output } from '@angular/core';
import { SearchStatItem } from './search-stats.model';
import { RouteListItemResponse } from '../../core/api';

@Component({
  selector: 'app-search-stats',
  imports: [],
  templateUrl: './search-stats.html',
  styleUrl: './search-stats.css',
})
export class SearchStats {
  readonly items = input<RouteListItemResponse[]>([]);
  readonly totalFound = input(0);

  readonly routeSelected = output<string>();

  protected stats = computed<SearchStatItem[]>(() => {
    const items = this.items();
    if (items.length === 0) return [];

    const pricedItems = items.filter((item) => item.summary.total_price !== null);
    const cheapest = pricedItems.length > 0
      ? minBy(pricedItems, (item) => item.summary.total_price?.amount ?? Number.POSITIVE_INFINITY)
      : null;

    const fastest = minBy(items, (i) => i.summary.duration_minutes);

    const earliest = items.reduce((best, curr) =>
      new Date(curr.summary.departure_at) < new Date(best.summary.departure_at) ? curr : best,
    );

    const latest = items.reduce((best, curr) =>
      new Date(curr.summary.departure_at) > new Date(best.summary.departure_at) ? curr : best,
    );

    const stats: SearchStatItem[] = [];

    if (cheapest?.summary.total_price) {
      stats.push({
        id: 'cheapest',
        value: formatMoney(
          cheapest.summary.total_price.amount,
          cheapest.summary.total_price.currency,
        ),
        label: 'самый дешевый',
        routeId: cheapest.route_id,
      });
    }

    stats.push(
      {
        id: 'fastest',
        value: formatDuration(fastest.summary.duration_minutes),
        label: 'самый быстрый',
        routeId: fastest.route_id,
      },
      {
        id: 'earliest',
        value: formatTime(earliest.summary.departure_at),
        label: 'самый ранний',
        routeId: earliest.route_id,
      },
      {
        id: 'latest',
        value: formatTime(latest.summary.departure_at),
        label: 'самый поздний',
        routeId: latest.route_id,
      },
    );

    return stats;
  });

  protected onStatClick(item: SearchStatItem): void {
    if (!item.routeId) return;
    this.routeSelected.emit(item.routeId);
  }
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours === 0) return `${restMinutes}м`;
  if (restMinutes === 0) return `${hours}ч`;

  return `${hours}ч ${restMinutes}м`;
}

function minBy<T>(items: T[], selector: (item: T) => number): T {
  return items.reduce((best, current) => (selector(current) < selector(best) ? current : best));
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
