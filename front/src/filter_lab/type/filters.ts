export type FilterType = 'list' | 'date' | 'period';

export interface PeriodFilterConfig extends BaseFilterConfig {
  type: 'period';
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultStartMonth?: string;
  defaultEndMonth?: string;
  minDate?: string;
  maxDate?: string;
  minMonth?: string;
  maxMonth?: string;
  defaultMode?: PeriodMode;
  allowClear?: boolean;
}

export type FilterValue = string | PeriodValue;

export interface BaseFilterConfig {
  id: string;
  type: FilterType;
  title: string;
  backendKey?: string;
}

export interface ListFilterConfig extends BaseFilterConfig {
  type: 'list';
  options: { label: string; value: string }[];
  placeholder?: string;
}

export interface DateFilterConfig extends BaseFilterConfig {
  type: 'date';
  minDate?: string;
  maxDate?: string;
}

export interface PeriodFilterConfig extends BaseFilterConfig {
  type: 'period';
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultStartMonth?: string;
  defaultEndMonth?: string;
  minDate?: string;
  maxDate?: string;
  minMonth?: string;
  maxMonth?: string;
  defaultMode?: PeriodMode;
  allowClear?: boolean;
}

export type FilterConfig =
  | ListFilterConfig
  | DateFilterConfig
  | PeriodFilterConfig;

export type FilterValues = Record<string, FilterValue>;

export interface CommonFilterProps {
  id: string;
  title: string;
  onChange: (id: string, value: FilterValue) => void;
  value?: FilterValue;
}