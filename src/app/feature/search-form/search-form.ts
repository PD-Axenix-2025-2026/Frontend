import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map, of, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {DatePicker} from 'primeng/datepicker';
import { InputMaskDirective } from 'primeng/inputmask';
import { LocationsApiService } from '../../core/api';
import {
  LocationAutocompleteItem,
  SearchCreateRequest,
} from '../../core/api';
import { differentLocationsValidator } from './search-form.validators';

const DEFAULT_SEARCH_MAX_TRANSFERS = 1;

@Component({
  selector: 'app-search-form',
  imports: [
    AutoComplete,
    Button,
    FloatLabel,
    DatePicker,
    NgOptimizedImage,
    InputMaskDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './search-form.html',
  styleUrl: './search-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchForm implements OnInit {
  readonly searchSubmitted = output<SearchCreateRequest>();

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly locationApi = inject(LocationsApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly originQuery$ = new Subject<string>();
  private readonly destinationQuery$ = new Subject<string>();

  public searchForm: FormGroup;
  public minDate: Date | undefined;
  public originSuggestions: LocationAutocompleteItem[] = [];
  public destinationSuggestions: LocationAutocompleteItem[] = [];

  constructor() {
    this.searchForm = this.fb.group(
      {
        origin: new FormControl<LocationAutocompleteItem | null>(null, [Validators.required]),
        destination: new FormControl<LocationAutocompleteItem | null>(null, [Validators.required]),
        date: new FormControl<Date | null>(null, [Validators.required]),
      },
      {
        validators: [differentLocationsValidator()],
      },
    );
  }

  ngOnInit() {
    this.minDate = new Date();

    this.bindSuggestions(this.originQuery$, items => {
      this.originSuggestions = items;
    });

    this.bindSuggestions(this.destinationQuery$, (items) => {
      this.destinationSuggestions = items;
    });
  }

  searchOrigins(event: AutoCompleteCompleteEvent) {
      this.originQuery$.next(event.query);
  }

  searchDestinations(event: AutoCompleteCompleteEvent) {
      this.destinationQuery$.next(event.query);
  }

  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { origin, destination, date } = this.searchForm.getRawValue();

    if (!origin || !destination || !date) return;

    const payload: SearchCreateRequest = {
      origin: {
        id: origin.id,
        type: origin.type,
      },
      destination: {
        id: destination.id,
        type: destination.type,
      },
      date: this.toIsoDate(date),
      preferences: {
        max_transfers: DEFAULT_SEARCH_MAX_TRANSFERS,
      },
    };
    this.searchSubmitted.emit(payload);
  }

  private bindSuggestions(
    query$: Subject<string>,
    apply: (items: LocationAutocompleteItem[]) => void
  ): void {
    query$.pipe(
      map(query => query.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          return of([])
        }
        return this.locationApi.listLocations({
          prefix: query,
          types: ["city"],
          limit: 10
        }).pipe(
          map(response => response.items),
          catchError(() => of([]))
        )
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(locations => {
      this.cdr.markForCheck();
      apply(locations);
    })
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  protected hasFormError(errorKey: string): boolean {
    return (
      !!this.searchForm.errors?.[errorKey] && (this.searchForm.touched || this.searchForm.dirty)
    );
  }

  protected isInvalid(controlName: 'origin' | 'destination' | 'date'): boolean {
    const control = this.searchForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected readonly fromPt = {
    root: { class: 'search-control' },
    pcInputText: {
      root: {
        class: 'search-control__input',
        placeholder: 'Москва (MOW)',
      },
    },
    overlay: { class: 'search-control__overlay' },
    loader: { class: 'search-control__loader' },
  };

  protected readonly toPt = {
    root: { class: 'search-control' },
    pcInputText: {
      root: {
        class: 'search-control__input',
        placeholder: 'Санкт-Петербург (LED)',
      },
    },
    overlay: { class: 'search-control__overlay' },
    loader: { class: 'search-control__loader' },
  };

  protected readonly datePt = {
    root: { class: 'search-control search-control--date' },
    pcInputText: {
      root: {
        class: 'search-control__input search-control__input--date',
        placeholder: '25.03.2026',
      },
    },
    dropdown: { class: 'search-datepicker__dropdown' },
    dropdownIcon: { class: 'search-datepicker__dropdown-icon' },
    inputIconContainer: { class: 'search-datepicker__input-icon-container' },
    inputIcon: { class: 'search-datepicker__input-icon' },
    panel: { class: 'search-control__overlay search-datepicker__panel' },
    calendarContainer: { class: 'search-datepicker__calendar-container' },
    calendar: { class: 'search-datepicker__calendar' },
    header: { class: 'search-datepicker__header' },
    title: { class: 'search-datepicker__title' },
    selectMonth: { class: 'search-datepicker__select search-datepicker__select--month' },
    selectYear: { class: 'search-datepicker__select search-datepicker__select--year' },
    pcPrevButton: {
      root: { class: 'search-datepicker__nav-button search-datepicker__nav-button--prev' },
    },
    pcNextButton: {
      root: { class: 'search-datepicker__nav-button search-datepicker__nav-button--next' },
    },
    dayView: { class: 'search-datepicker__day-view' },
    table: { class: 'search-datepicker__table' },
    tableHeader: { class: 'search-datepicker__table-header' },
    tableHeaderRow: { class: 'search-datepicker__table-header-row' },
    weekHeader: { class: 'search-datepicker__week-header' },
    weekHeaderLabel: { class: 'search-datepicker__week-header-label' },
    tableHeaderCell: { class: 'search-datepicker__table-header-cell' },
    weekDayCell: { class: 'search-datepicker__weekday-cell' },
    weekDay: { class: 'search-datepicker__weekday' },
    tableBody: { class: 'search-datepicker__table-body' },
    tableBodyRow: { class: 'search-datepicker__table-body-row' },
    weekNumber: { class: 'search-datepicker__week-number' },
    weekLabelContainer: { class: 'search-datepicker__week-label-container' },
    dayCell: { class: 'search-datepicker__day-cell' },
    day: { class: 'search-datepicker__day' },
    monthView: { class: 'search-datepicker__month-view' },
    month: { class: 'search-datepicker__month' },
    yearView: { class: 'search-datepicker__year-view' },
    year: { class: 'search-datepicker__year' },
    buttonbar: { class: 'search-datepicker__buttonbar' },
    pcTodayButton: {
      root: { class: 'search-datepicker__action search-datepicker__action--today' },
    },
    pcClearButton: {
      root: { class: 'search-datepicker__action search-datepicker__action--clear' },
    },
  };

  protected readonly buttonPt = {
    root: { class: 'search-submit' },
    label: { class: 'search-submit__label' },
  };
}
