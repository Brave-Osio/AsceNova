import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { fonts } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  unitLabel?: string;
  height?: number;
}

const PAD = { top: 12, right: 12, bottom: 24, left: 40 };
const Y_TICKS = 4;

/** RN counterpart of the web's recharts-backed SimpleLineChart: tap a point to see its value. */
export default function SimpleLineChart({ data, unitLabel, height = 220 }: SimpleLineChartProps) {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const geometry = useMemo(() => {
    if (width === 0 || data.length === 0) return null;
    const values = data.map((d) => d.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const span = max - min;
    min -= span * 0.1;
    max += span * 0.1;
    const innerW = width - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * innerH;
    const points = data.map((d, i) => ({ x: x(i), y: y(d.value) }));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const ticks = Array.from({ length: Y_TICKS }, (_, i) => {
      const v = min + ((max - min) * i) / (Y_TICKS - 1);
      return { v, y: y(v) };
    });
    const labelStep = Math.max(1, Math.ceil(data.length / 5));
    return { points, path, ticks, labelStep };
  }, [data, width, height]);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const sel = selected !== null && geometry ? geometry.points[selected] : null;
  const selData = selected !== null ? data[selected] : null;

  return (
    <View onLayout={onLayout} style={{ height }}>
      {geometry && (
        <Svg width={width} height={height}>
          {geometry.ticks.map((t) => (
            <SvgText
              key={t.y}
              x={PAD.left - 6}
              y={t.y + 4}
              fontSize={11}
              fontFamily={fonts.regular}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {Math.round(t.v)}
            </SvgText>
          ))}
          {data.map((d, i) =>
            i % geometry.labelStep === 0 ? (
              <SvgText
                key={`${d.label}-${i}`}
                x={geometry.points[i].x}
                y={height - 6}
                fontSize={11}
                fontFamily={fonts.regular}
                fill={colors.textMuted}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            ) : null,
          )}
          <Path d={geometry.path} stroke={colors.primary} strokeWidth={2} fill="none" strokeLinejoin="round" />
          {geometry.points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={selected === i ? 5 : 3}
              fill={colors.primary}
              onPress={() => setSelected(selected === i ? null : i)}
            />
          ))}
          {geometry.points.map((p, i) => (
            <Circle key={`hit-${i}`} cx={p.x} cy={p.y} r={14} fill="transparent" onPress={() => setSelected(selected === i ? null : i)} />
          ))}
          {sel && <Line x1={sel.x} x2={sel.x} y1={PAD.top} y2={height - PAD.bottom} stroke={colors.border} strokeWidth={1} />}
        </Svg>
      )}
      {sel && selData && (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
              left: Math.min(Math.max(sel.x - 40, 0), Math.max(width - 80, 0)),
            },
          ]}
        >
          <Text style={[styles.tooltipLabel, { color: colors.textMuted }]}>{selData.label}</Text>
          <Text style={[styles.tooltipValue, { color: colors.textPrimary }]}>
            {selData.value}
            {unitLabel ?? ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: 0,
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  tooltipLabel: { fontFamily: fonts.regular, fontSize: 11 },
  tooltipValue: { fontFamily: fonts.bold, fontSize: 13 },
});
