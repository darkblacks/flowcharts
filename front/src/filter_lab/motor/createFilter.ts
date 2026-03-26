import ListFilter from '../type/list';
import DateFilter from '../type/date';
import PeriodFilter from '../type/period';

export const filterRegistry = {
  list: ListFilter,
  date: DateFilter,
  period: PeriodFilter,
} as const;