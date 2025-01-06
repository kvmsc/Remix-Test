export interface DateConfig {
  disabledDates: DateRule[];
  disabledDays: DayRule[];
}

export interface DateRule {
  startDate: string;
  endDate?: string;
  identifier: string;
}

// ENHANCEMENT: Can add date overrides here further down the line
export interface DayRule {
  day: number;
  disabled: boolean;
  identifier: string;
}
