import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {DatePicker} from 'primeng/datepicker';
import {NgOptimizedImage} from '@angular/common';
import { SearchesApiService } from '../../core/api/searches.api';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  MaxLengthValidator, ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LocationsApiService } from '../../core/api/locations.api';
import { InputMaskDirective } from 'primeng/inputmask';
import {
  LocationAutocompleteItem,
  LocationType,
  SearchCreateRequest,
} from '../../core/api/api.types';
import { debounceTime } from 'rxjs';

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
  encapsulation: ViewEncapsulation.None,
})
export class SearchForm implements OnInit {
  private readonly locationApi = inject(LocationsApiService);
  private readonly fb = inject(FormBuilder);
  public searchForm: FormGroup;

  public minDate: Date | undefined;
  public originSuggestions: LocationAutocompleteItem[] = [];
  public destinationSuggestions: LocationAutocompleteItem[] = [];

  constructor() {
    this.searchForm = this.fb.group({
      origin: new FormControl<LocationAutocompleteItem | null>(null, [Validators.required]),
      destination: new FormControl<LocationAutocompleteItem | null>(null, [Validators.required]),
      date: new FormControl<Date | null>(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.minDate = new Date();
  }

  searchOrigins(event: AutoCompleteCompleteEvent) {
    this.loadSuggestions(event.query, (items) => {
      this.originSuggestions = items;
    });
  }

  searchDestinations(event: AutoCompleteCompleteEvent) {
    this.loadSuggestions(event.query, (items) => {
      this.destinationSuggestions = items;
    });
  }

  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAsTouched();
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
    };
    console.log(payload);
  }

  private loadSuggestions(query: string, apply: (items: LocationAutocompleteItem[]) => void): void {
    const normalized = query.trim();

    if (normalized.length < 2) {
      apply([]);
      return;
    }

    this.locationApi
      .listLocations({
        prefix: normalized,
        types: ['city'],
        limit: 10,
      }).subscribe({
        next: (response) => apply(response.items),
        error: () => apply([]),
      });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
