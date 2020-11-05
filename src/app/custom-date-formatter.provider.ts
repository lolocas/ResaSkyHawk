import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {

  //public weekViewTitle({ date, locale }: DateFormatterParams): string {
  //  return formatDate(date, 'Nov 1 - Nov 7, 2020 yyyy', locale);
  //}

  public weekViewColumnSubHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'dd MMM', locale);
  }

  public weekViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale);
  }

  public dayViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale);
  }

  public dayViewTitle({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'EEE dd MMM yyyy', locale);
  }
}
