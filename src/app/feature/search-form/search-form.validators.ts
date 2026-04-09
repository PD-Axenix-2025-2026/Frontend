import { LocationAutocompleteItem } from '../../core/api/api.types';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


type SearchFormValue = {
  origin: LocationAutocompleteItem | null;
  destination: LocationAutocompleteItem | null;
  date: Date | null;
}

export function differentLocationsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formValue = control.value as SearchFormValue;
    const origin = formValue.origin;
    const destination = formValue.destination;

    if (!origin || !destination) return null;

    return origin.id === destination.id
    ? { sameLocations: true }
      : null;
  };
}
