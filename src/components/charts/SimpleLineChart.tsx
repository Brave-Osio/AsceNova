import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  unitLabel?: string;
}

/**
 * Recharts renders to inline SVG attributes/styles, which can't reference
 * our CSS custom properties reliably — so this hard-codes both palettes
 * and picks one via useTheme() instead of relying on the CSS cascade like
 * the rest of the app does.
 */
const PALETTES = {
  dark: { axis: '#6b6680', tooltipBg: '#1e1929', tooltipBorder: 'rgba(255,255,255,0.08)', tooltipText: '#f5f3fa', line: '#7c5cfc' },
  light: { axis: '#8a8499', tooltipBg: '#ffffff', tooltipBorder: 'rgba(23,19,31,0.1)', tooltipText: '#17131f', line: '#7c5cfc' },
};

/**
 * Wraps Recharts so feature components never import recharts directly —
 * if we ever swap charting libraries, this is the only file that changes.
 */
export default function SimpleLineChart({ data, unitLabel }: SimpleLineChartProps) {
  const { theme } = useTheme();
  const palette = PALETTES[theme];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis dataKey="label" stroke={palette.axis} fontSize={11} tickLine={false} />
        <YAxis stroke={palette.axis} fontSize={11} tickLine={false} width={36} />
        <Tooltip
          formatter={(value) => [`${value ?? ''}${unitLabel ?? ''}`, '']}
          contentStyle={{ background: palette.tooltipBg, border: `1px solid ${palette.tooltipBorder}`, borderRadius: 8 }}
          labelStyle={{ color: palette.tooltipText }}
        />
        <Line type="monotone" dataKey="value" stroke={palette.line} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
