import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  /** Big number in the hole, e.g. the total. */
  centerValue: string;
  centerLabel: string;
}

const TOOLTIP = {
  dark: { bg: '#1e1929', border: 'rgba(255,255,255,0.08)', text: '#f5f3fa' },
  light: { bg: '#ffffff', border: 'rgba(23,19,31,0.1)', text: '#17131f' },
};

/**
 * Doughnut with a legend (label + count + share) rendered as plain HTML
 * beside it, so the numbers stay readable without hovering and inherit the
 * app's theme tokens. Only the SVG itself needs explicit theme colors.
 */
export default function DonutChart({ data, centerValue, centerLabel }: DonutChartProps) {
  const { theme } = useTheme();
  const tooltip = TOOLTIP[theme];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const visible = data.filter((d) => d.value > 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-40 w-40 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visible.length > 0 ? visible : [{ label: 'None', value: 1, color: 'rgba(138,132,153,0.3)' }]}
              dataKey="value"
              nameKey="label"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={visible.length > 1 ? 3 : 0}
              stroke="none"
            >
              {(visible.length > 0 ? visible : [{ color: 'rgba(138,132,153,0.3)' }]).map((slice, i) => (
                <Cell key={i} fill={slice.color} />
              ))}
            </Pie>
            {visible.length > 0 && (
              <Tooltip
                contentStyle={{ background: tooltip.bg, border: `1px solid ${tooltip.border}`, borderRadius: 8 }}
                itemStyle={{ color: tooltip.text }}
                labelStyle={{ color: tooltip.text }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black leading-none text-brand-text">{centerValue}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-text-muted">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-brand-text-secondary">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="font-bold text-brand-text">
              {d.value}
              <span className="ml-1.5 text-xs font-medium text-brand-text-muted">
                {total > 0 ? `${Math.round((d.value / total) * 100)}%` : '0%'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
