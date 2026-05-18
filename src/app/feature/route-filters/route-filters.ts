import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Checkbox } from 'primeng/checkbox';
import { RadioButton } from 'primeng/radiobutton';
import { Slider } from 'primeng/slider';
import { InputNumber } from 'primeng/inputnumber';
import { SearchFilters, SearchResultsFacetsResponse, TransportType } from '../../core/api';

type RouteFiltersFormValue = {
  transportTypes: {
    plane: boolean;
    train: boolean;
    bus: boolean;
  };
  maxTransfers: number | null;
  maxPrice: number | null;
  maxDurationMinutes: number | null;
};

type TransferOption = {
  value: number | null;
  label: string;
  count?: number;
  icon?: string;
};

const TRANSPORT_META: Array<{ value: TransportType; label: string; icon: string }> = [
  { value: 'plane', label: 'Самолёт', icon: 'plane.svg' },
  { value: 'train', label: 'Поезд', icon: 'train.svg' },
  { value: 'bus', label: 'Автобус', icon: 'bus.svg' },
];

const DEFAULT_MAX_TRANSFERS = 3;
const DIRECT_MAX_TRANSFERS = 0;
const WITH_TRANSFERS_MAX_TRANSFERS = 3;


@Component({
  selector: 'app-route-filters',
  imports: [Checkbox, RadioButton, Slider, InputNumber, ReactiveFormsModule],
  templateUrl: './route-filters.html',
  styleUrl: './route-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteFilters {
  private readonly fb = inject(FormBuilder);

  readonly filters = input<SearchFilters | null>(null);
  readonly baseFacets = input<SearchResultsFacetsResponse | null>(null);
  readonly currentFacets = input<SearchResultsFacetsResponse | null>(null);

  readonly filtersChanged = output<SearchFilters>();

  readonly form = this.fb.group({
    transportTypes: this.fb.group({
      plane: this.fb.nonNullable.control(false),
      train: this.fb.nonNullable.control(false),
      bus: this.fb.nonNullable.control(false),
    }),
    maxTransfers: this.fb.control<number | null>(null),
    maxPrice: this.fb.control<number | null>(null),
    maxDurationMinutes: this.fb.control<number | null>(null),
  });

  protected readonly transportOptions = computed(() => {
    const facets = this.baseFacets()?.transport_types ?? [];
    const counts = new Map(facets.map((item) => [item.value, item.count]));

    return TRANSPORT_META.map((option) => ({
      ...option,
      count: counts.get(option.value) ?? 0,
    }));
  });

  protected readonly transferOptions = computed<TransferOption[]>(() => {
    const facets = this.baseFacets()?.transfers ?? [];
    const directRoutesCount = facets.find((item) => item.value === DIRECT_MAX_TRANSFERS)?.count ?? 0;
    const allRoutesCount = facets
      .filter((item) => item.value >= DIRECT_MAX_TRANSFERS)
      .reduce((sum, item) => sum + item.count, 0);

    return [
      {
        value: DIRECT_MAX_TRANSFERS,
        label: 'Без пересадок',
        count: directRoutesCount,
      },
      {
        value: WITH_TRANSFERS_MAX_TRANSFERS,
        label: 'Любые пересадки',
        count: allRoutesCount,
      },
    ];
  });

  protected readonly maxPriceLimit = computed(() => {
    return this.baseFacets()?.price.max ?? 0;
  });

  protected readonly maxDurationLimit = computed(() => {
    return this.baseFacets()?.duration_minutes.max ?? 0;
  });

  protected readonly checkboxPt = {
    root: { class: 'route-filters__checkbox' },
    box: { class: 'route-filters__checkbox-box' },
    input: { class: 'route-filters__checkbox-input' },
    icon: { class: 'route-filters__checkbox-icon' },
  };

  protected readonly radioPt = {
    root: { class: 'route-filters__radio' },
    box: { class: 'route-filters__radio-box' },
    input: { class: 'route-filters__radio-input' },
    icon: { class: 'route-filters__radio-icon' },
  };

  protected readonly priceInputPt = {
    root: { class: 'route-filters__price-input' },
    pcInputText: {
      root: { class: 'route-filters__price-input-control' },
    },
  };

  protected readonly sliderPt = {
    root: { class: 'route-filters__slider' },
    range: { class: 'route-filters__slider-range' },
    handle: { class: 'route-filters__slider-handle' },
  };

  constructor() {
    effect(() => {
      const filters = this.filters();

      this.form.patchValue(
        {
          transportTypes: {
            plane: filters?.transportTypes?.includes('plane') ?? false,
            train: filters?.transportTypes?.includes('train') ?? false,
            bus: filters?.transportTypes?.includes('bus') ?? false,
          },
          maxTransfers: filters?.maxTransfers ?? DEFAULT_MAX_TRANSFERS,
          maxPrice: filters?.maxPrice ?? this.baseFacets()?.price.max ?? null,
          maxDurationMinutes: filters?.maxDurationMinutes ?? this.baseFacets()?.duration_minutes.max ?? null,
        },
        { emitEvent: false },
      );
    });

    this.form.valueChanges
      .pipe(
        debounceTime(250),
        map(() => toSearchFilters(this.form.getRawValue())),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((filters) => this.filtersChanged.emit(filters));
  }

  protected resetFilters(): void {
    this.form.patchValue({
      transportTypes: {
        plane: false,
        train: false,
        bus: false,
      },
      maxTransfers: DEFAULT_MAX_TRANSFERS,
      maxPrice: this.baseFacets()?.price.max ?? null,
      maxDurationMinutes: this.baseFacets()?.duration_minutes.max ?? null,
    });
  }

  protected hasBaseFacets(): boolean {
    return this.baseFacets() !== null;
  }
}

function toSearchFilters(value: RouteFiltersFormValue): SearchFilters {
  const transportTypes = (Object.entries(value.transportTypes) as Array<[TransportType, boolean]>)
    .filter(([, checked]) => checked)
    .map(([type]) => type);

  return {
    transportTypes: transportTypes.length > 0 ? transportTypes : undefined,
    maxTransfers: value.maxTransfers,
    maxPrice: value.maxPrice ?? undefined,
    maxDurationMinutes: value.maxDurationMinutes ?? undefined,
  };
}
