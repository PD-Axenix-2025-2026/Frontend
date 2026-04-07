import { HttpParams } from '@angular/common/http';


export function setParam(
  params: HttpParams,
  key: string,
  value: string | number | null | undefined
): HttpParams {
  return value === null || value === undefined || value === ''
    ? params
    : params.set(key, String(value));
}

export function toCsv(values: string[] | undefined): string | undefined {
  return values && values.length > 0 ? values.join(',') : undefined;
}
