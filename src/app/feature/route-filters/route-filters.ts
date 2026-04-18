import { ChangeDetectionStrategy, Component } from '@angular/core';
import {Checkbox} from 'primeng/checkbox';
import {Slider} from 'primeng/slider';
import {FormsModule} from '@angular/forms';
import {InputNumber} from 'primeng/inputnumber';

@Component({
  selector: 'app-route-filters',
  imports: [
    Checkbox,
    Slider,
    FormsModule,
    InputNumber
  ],
  templateUrl: './route-filters.html',
  styleUrl: './route-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteFilters {
  protected readonly transportOptions = [
    { id: 'air', label: 'Авиа', icon: '✈', count: 84, checked: true },
    { id: 'train', label: 'Ж/д', icon: '🚆', count: 112, checked: true },
    { id: 'bus', label: 'Автобус', icon: '🚌', count: 51, checked: false },
  ];

  protected readonly stopOptions = [
    { id: 'direct', label: 'Прямые', count: 63, checked: true },
    { id: 'one-stop', label: '1 пересадка', count: 98, checked: true },
    { id: 'two-plus', label: '2+ пересадки', count: 86, checked: false },
  ];

  protected readonly departureOptions = [
    { id: 'morning', label: 'Утро 06:00-12:00', checked: true },
    { id: 'day', label: 'День 12:00-18:00', checked: true },
    { id: 'evening', label: 'Вечер 18:00-00:00', checked: false },
    { id: 'night', label: 'Ночь 00:00-06:00', checked: false },
  ];

  protected rangeValues: number[] = [2400, 15000];

  protected readonly checkboxPt = {
    root: { class: 'route-filters__checkbox' },
    input: { class: 'route-filters__checkbox-input' },
    box: { class: 'route-filters__checkbox-box' },
    icon: { class: 'route-filters__checkbox-icon' },
  };

  protected readonly sliderPt = {
    root: { class: 'route-filters__slider' },
    range: { class: 'route-filters__slider-range' },
    handle: { class: 'route-filters__slider-handle' },
    startHandler: { class: 'route-filters__slider-handle' },
    endHandler: { class: 'route-filters__slider-handle' },
  };

  protected readonly priceInputPt = {
    root: { class: 'route-filters__price-input' },
    pcInputText: {
      root: { class: 'route-filters__price-input-control' },
    },
  };

  protected updateRangeValue(index: 0 | 1, value: number | null): void {
    if (value === null) {
      return;
    }

    const nextValue = Math.max(2400, Math.min(15000, value));
    const [minValue, maxValue] = this.rangeValues;

    if (index === 0) {
      this.rangeValues = [Math.min(nextValue, maxValue), maxValue];
      return;
    }

    this.rangeValues = [minValue, Math.max(nextValue, minValue)];
  }

}
