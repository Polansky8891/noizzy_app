import { useMemo } from "react";
import SelectField from "./SelectField";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
const daysInMonth = (month, year) => {
  const idx = MONTHS.indexOf(month);
  if (idx < 0) return 31;
  return [31, (isLeap(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][idx];
};

export default function BirthDateField({ value, onChange, className = "" }) {
  const { day = 1, month = "January", year = 1988 } = value || {};

  // años descendentes (p.ej. 1900 → año actual)
  const YEARS = useMemo(() => {
    const max = new Date().getFullYear();
    const min = 1900;
    const list = [];
    for (let y = max; y >= min; y--) list.push(String(y));
    return list;
  }, []);

  const maxDays = daysInMonth(month, Number(year) || 2000);
  const DAYS = useMemo(() => Array.from({ length: maxDays }, (_, i) => String(i + 1)), [maxDays]);

  // normaliza día si cambian mes/año
  const safeDay = Math.min(Number(day) || 1, maxDays);

  const set = (patch) => onChange?.({ day: safeDay, month, year, ...patch });

  return (
    <div className={className}>
      <label className="text-xs flex justify-start font-medium text-[#0A84FF] mb-1">
        Birth date
      </label>
      <div className="grid grid-cols-3 gap-2">
        <SelectField
          value={String(safeDay)}
          onChange={(v) => set({ day: Number(v) })}
          options={DAYS}
        />
        <SelectField
          value={month}
          onChange={(v) => set({ month: v })}
          options={MONTHS}
        />
        <SelectField
          value={String(year)}
          onChange={(v) => set({ year: Number(v) })}
          options={YEARS}
        />
      </div>
    </div>
  );
}
