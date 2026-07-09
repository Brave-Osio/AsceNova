import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  unitLabel?: string;
}

/**
 * Wraps Recharts so feature components never import recharts directly —
 * if we ever swap charting libraries, this is the only file that changes.
 */
export default function SimpleLineChart({ data, unitLabel }: SimpleLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} />
        <YAxis stroke="#6b7280" fontSize={11} tickLine={false} width={36} />
        <Tooltip
          formatter={(value) => [`${value ?? ''}${unitLabel ?? ''}`, '']}
          contentStyle={{ background: '#14161d', border: '1px solid rgba(255,255,255,0.1)' }}
          labelStyle={{ color: '#e5e7eb' }}
        />
        <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
