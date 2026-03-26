import type { DateFilterConfig } from './filters';

interface Props extends DateFilterConfig {
  value?: string;
  onChange: (id: string, value: string) => void;
}

export function DateFilter({
  id,
  title,
  minDate,
  maxDate,
  value = '',
  onChange,
}: Props) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <label
        htmlFor={`date-filter-${id}`}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {title}
      </label>

      <input
        type="date"
        id={`date-filter-${id}`}
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        min={minDate}
        max={maxDate}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
      />
    </div>
  );
}

export default DateFilter;