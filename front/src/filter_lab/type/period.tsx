import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarRange,
  ChevronDown,
  Eraser,
  BetweenHorizonalEnd,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { PeriodFilterConfig, PeriodValue, PeriodMode } from './filters';

interface Props extends PeriodFilterConfig {
  value?: PeriodValue;
  onChange: (id: string, value: PeriodValue) => void;
}

function normalizeMonthStart(monthValue: string) {
  return monthValue ? `${monthValue}-01` : '';
}

function normalizeMonthEnd(monthValue: string) {
  if (!monthValue) return '';

  const [yearStr, monthStr] = monthValue.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();

  return `${monthValue}-${String(lastDay).padStart(2, '0')}`;
}

function clampMonth(value: string, min?: string, max?: string) {
  if (!value) return value;
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
}

function clampDate(value: string, min?: string, max?: string) {
  if (!value) return value;
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
}

function formatDateBR(date: string) {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function formatMonthBR(monthValue: string) {
  if (!monthValue) return '';

  const [yearStr, monthStr] = monthValue.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function PeriodFilter({
  id,
  title,
  defaultStartDate = '',
  defaultEndDate = '',
  defaultStartMonth = '',
  defaultEndMonth = '',
  minDate,
  maxDate,
  minMonth,
  maxMonth,
  defaultMode = 'date-range',
  allowClear = true,
  value,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const current: PeriodValue = {
    mode: value?.mode ?? defaultMode,
    startDate: value?.startDate ?? defaultStartDate,
    endDate: value?.endDate ?? defaultEndDate,
    startMonth: value?.startMonth ?? defaultStartMonth,
    endMonth: value?.endMonth ?? defaultEndMonth,
  };

  const emit = (partial: Partial<PeriodValue>) => {
    const next: PeriodValue = {
      ...current,
      ...partial,
    };

    if (next.mode === 'month-range') {
      next.startMonth = clampMonth(next.startMonth, minMonth, maxMonth);
      next.endMonth = clampMonth(next.endMonth, minMonth, maxMonth);

      if (next.startMonth && next.endMonth && next.endMonth < next.startMonth) {
        next.endMonth = next.startMonth;
      }

      next.startDate = normalizeMonthStart(next.startMonth);
      next.endDate = normalizeMonthEnd(next.endMonth);
    }

    if (next.mode === 'date-range') {
      next.startDate = clampDate(next.startDate, minDate, maxDate);
      next.endDate = clampDate(next.endDate, minDate, maxDate);

      if (next.startDate && next.endDate && next.endDate < next.startDate) {
        next.endDate = next.startDate;
      }

      next.startMonth = next.startDate ? next.startDate.slice(0, 7) : '';
      next.endMonth = next.endDate ? next.endDate.slice(0, 7) : '';
    }

    onChange(id, next);
  };

  const handleModeChange = (mode: PeriodMode) => {
    if (mode === current.mode) return;

    if (mode === 'month-range') {
      const startMonth =
        current.startMonth || (current.startDate ? current.startDate.slice(0, 7) : '');
      const endMonth =
        current.endMonth || (current.endDate ? current.endDate.slice(0, 7) : '');

      emit({
        mode,
        startMonth,
        endMonth,
      });
      return;
    }

    emit({
      mode,
      startDate: current.startDate || normalizeMonthStart(current.startMonth),
      endDate: current.endDate || normalizeMonthEnd(current.endMonth),
    });
  };

  const handleClear = () => {
    onChange(id, {
      mode: defaultMode,
      startDate: '',
      endDate: '',
      startMonth: '',
      endMonth: '',
    });
  };

  const compactLabel = useMemo(() => {
    if (current.mode === 'month-range') {
      if (current.startMonth && current.endMonth) {
        return `${formatMonthBR(current.startMonth)} → ${formatMonthBR(current.endMonth)}`;
      }
      if (current.startMonth) return `A partir de ${formatMonthBR(current.startMonth)}`;
      if (current.endMonth) return `Até ${formatMonthBR(current.endMonth)}`;
      return 'Nenhum mês selecionado';
    }

    if (current.startDate && current.endDate) {
      return `${formatDateBR(current.startDate)} → ${formatDateBR(current.endDate)}`;
    }
    if (current.startDate) return `A partir de ${formatDateBR(current.startDate)}`;
    if (current.endDate) return `Até ${formatDateBR(current.endDate)}`;
    return 'Nenhuma data selecionada';
  }, [current]);

  const modeLabel = current.mode === 'date-range' ? 'Data a data' : 'Por mês';
  const ModeIcon = current.mode === 'date-range' ? CalendarRange : CalendarDays;

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              <BetweenHorizonalEnd className="h-3.5 w-3.5" />
              Período
            </div>
          </div>

          <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <ModeIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="shrink-0">{modeLabel}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">{compactLabel}</span>
          </div>
        </div>

        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 pb-4 pt-4">
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                <button
                  type="button"
                  onClick={() => handleModeChange('date-range')}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    current.mode === 'date-range'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Data a data
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('month-range')}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    current.mode === 'month-range'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Por mês
                </button>
              </div>

              {current.mode === 'date-range' ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Data inicial
                    </label>
                    <input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={current.startDate}
                      onChange={(e) => emit({ startDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Data final
                    </label>
                    <input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={current.endDate}
                      onChange={(e) => emit({ endDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Mês inicial
                    </label>
                    <input
                      type="month"
                      min={minMonth}
                      max={maxMonth}
                      value={current.startMonth}
                      onChange={(e) => emit({ startMonth: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Mês final
                    </label>
                    <input
                      type="month"
                      min={minMonth}
                      max={maxMonth}
                      value={current.endMonth}
                      onChange={(e) => emit({ endMonth: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </div>
                </div>
              )}

              {allowClear && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Eraser className="h-4 w-4" />
                    Limpar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PeriodFilter;