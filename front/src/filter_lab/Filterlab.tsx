import React, { useMemo, useState } from 'react';
import { filterDefinitions } from './config/filters';
import { buildBackendPayload } from './config/backend';
import { filterRegistry } from './motor/createFilter';
import type { FilterValues, PeriodValue } from './type/filters';

function Filterlab() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const handleFilterChange = (
    id: string,
    value: string | PeriodValue
  ) => {
    setFilterValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const backendPayload = useMemo(
    () => buildBackendPayload(filterDefinitions, filterValues),
    [filterValues]
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Filter Lab 🧪🐧
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filterDefinitions.map((config) => {
          const FilterComponent = filterRegistry[config.type];

          return (
            <FilterComponent
              key={config.id}
              {...config}
              value={filterValues[config.id] as never}
              onChange={handleFilterChange as never}
            />
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Valores Atuais dos Filtros:
        </h2>

        <pre className="bg-gray-50 p-4 rounded-md text-gray-900 overflow-auto">
          {JSON.stringify(filterValues, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Payload para Backend:
        </h2>

        <pre className="bg-gray-50 p-4 rounded-md text-gray-900 overflow-auto">
          {JSON.stringify(backendPayload, null, 2)}
        </pre>
      </div>

      <p className="mt-8 text-gray-600 text-sm">
        (Agora sim o pinguim nada sem bater na pedra 🐧)
      </p>
    </div>
  );
}

export default Filterlab;