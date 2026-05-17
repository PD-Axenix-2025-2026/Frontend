import { RouteListItemResponse, TransportType } from '../../../core/api';
import { RouteCardItem, RouteCardSegment } from './route-card';

export function mapRouteToCard(route: RouteListItemResponse): RouteCardItem {
  const firstSegment = route.segments[0];
  const lastSegment = route.segments[route.segments.length - 1];
  const totalPrice = route.summary.total_price;

  return {
    id: route.route_id,
    isBest: route.labels.includes('best'),
    badge: route.labels.includes('best') ? 'ОПИМАЛЬНЫЙ' : undefined,
    departureTime: formatTime(route.summary.departure_at),
    departurePlace: firstSegment.origin_label ?? '',
    duration: formatDuration(route.summary.duration_minutes),
    stops: formatTransfers(route.summary.transfers),
    arrivalTime: formatTime(route.summary.arrival_at),
    arrivalPlace: lastSegment.destination_label ?? '',
    price: totalPrice
      ? formatMoney(totalPrice.amount, totalPrice.currency)
      : 'Уточняется',
    priceLabel: totalPrice ? 'за 1 пассажира' : 'требует уточнения',
    segments: route.segments.map(mapSegment),
  };
}

function mapSegment(segment: RouteListItemResponse['segments'][number]): RouteCardSegment {
  return {
    id: segment.segment_id,
    icon: transportIcon(segment.transport_type),
    route: `${segment.origin_code ?? segment.origin_label} → ${segment.destination_code ?? segment.destination_label}`,
    detail: [segment.carrier, segment.segment_code, formatDuration(segment.duration_minutes)]
      .filter(Boolean)
      .join(' '),
  };
}

function transportIcon(type: TransportType) {
  switch (type) {
    case 'plane':
      return 'plane.svg';
    case 'train':
      return 'train.svg';
    case 'bus':
      return 'bus.svg';
  }
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours === 0) return `0${restMinutes}мин`;
  if (restMinutes === 0) return `${hours}ч`;

  return `${hours}ч ${restMinutes}мин`;
}

function formatTransfers(transfers: number): string {
  switch (transfers) {
    case 0:
      return 'Прямой';
    case 1:
      return '1 пересадка';
    default:
      return `${transfers} пересадки`;
  }
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
