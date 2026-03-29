import { Component, input } from '@angular/core';

export interface RouteCardSegment {
  id: string;
  icon: string;
  route: string;
  detail: string;
}

export interface RouteCardItem {
  id: string;
  isBest?: boolean;
  badge?: string;
  departureTime: string;
  departurePlace: string;
  duration: string;
  stops: string;
  arrivalTime: string;
  arrivalPlace: string;
  price: string;
  priceLabel: string;
  segments: RouteCardSegment[];
}

@Component({
  selector: 'app-route-card',
  imports: [],
  templateUrl: './route-card.html',
  styleUrl: './route-card.css',
})
export class RouteCard {
  readonly item = input.required<RouteCardItem>();
}
