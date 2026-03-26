import type { FilterConfig } from '../type/filters';

export const filterDefinitions: FilterConfig[] = [
  {
    id: 'category',
    backendKey: 'category',
    type: 'list',
    title: 'Selecione a Categoria',
    options: [
      { label: 'Eletrônicos', value: 'electronics' },
      { label: 'Roupas', value: 'clothing' },
      { label: 'Alimentos', value: 'food' },
    ],
    placeholder: 'Escolha uma categoria',
  },
  {
    id: 'startDate',
    backendKey: 'start_date',
    type: 'date',
    title: 'Data de Início',
    minDate: '2023-01-01',
    maxDate: '2024-12-31',
  },
  {
    id: 'salesPeriod',
    backendKey: 'sales_period',
    type: 'period',
    title: 'Período de Vendas',
    defaultStartDate: '2024-03-01',
    defaultEndDate: '2024-03-31',
  },
];