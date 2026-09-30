import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface BarPoint {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarPoint[];
  /** Tooltip noun, e.g. "new users". */
  unitLabel?: string;
  height?: number;
}

const PALETTES = {
  dark: { axis: '#6b6680', grid: 'rgba(255,255,255,0.06)', tooltipBg: '#1e1929', tooltipBorder: 'rgba(255,255,255,0.08)', tooltipText: '#f5f3fa', bar: '#7c5cfc' },
  light: { axis: '#8a8499', grid: 'rgba(23,19,31,0.08)', tooltipBg: '#ffffff', tooltipBorder: 'rgba(23,19,31,0.1)', tooltipText: '#17131f', bar: '#7c5cfc' },
};

/** Sibling of SimpleLineChart — same theme-palette approach, same "feature code never imports recharts" rule. */
export default function SimpleBarChart({ data, unitLabel, height = 180 }: SimpleBarChartProps) {
  const { theme } = useTheme();
  const palette = PALETTES[theme];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={palette.grid} vertical={false} />
        <XAxis dataKey="label" stroke={palette.axis} fontSize={11} tickLine={false} interval="preserveStartEnd" minTickGap={16} />
        <YAxis stroke={palette.axis} fontSize={11} tickLine={false} width={28} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: palette.grid }}
          formatter={(value) => [`${value ?? ''}${unitLabel ? ` ${unitLabel}` : ''}`, '']}
          contentStyle={{ background: palette.tooltipBg, border: `1px solid ${palette.tooltipBorder}`, borderRadius: 8 }}
          labelStyle={{ color: palette.tooltipText }}
          itemStyle={{ color: palette.tooltipText }}
        />
        <Bar dataKey="value" fill={palette.bar} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
