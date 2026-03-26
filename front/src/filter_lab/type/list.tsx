import type { ListFilterConfig } from './filters';

interface Props extends ListFilterConfig {
  value?: string;
  onChange: (id: string, value: string) => void;
}

function ListFilter({
  id,
  title,
  options,
  placeholder = 'Selecione',
  value = '',
  onChange,
}: Props) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <label
        htmlFor={`list-filter-${id}`}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {title}
      </label>

      <select
        id={`list-filter-${id}`}
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ListFilter;